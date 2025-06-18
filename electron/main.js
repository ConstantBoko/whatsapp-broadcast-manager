const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let mainWindow;
let whatsappClient;
let currentQr = null;
let isWhatsAppInitializing = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function initWhatsApp() {
  /*
  // Force clean session to prevent hangs from corrupted cache
  const fs = require('fs');
  const sessionPath = path.join(app.getPath('userData'), 'wwebjs_auth');
  if (fs.existsSync(sessionPath)) {
    try {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to remove session path:', e);
    }
  }
  */
  
  if (mainWindow) mainWindow.webContents.send('status-update', "Initialisation du client WhatsApp...");

  const puppeteerOptions = {
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  if (app.isPackaged) {
    const possibleChromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    const fs = require('fs');
    for (const chromePath of possibleChromePaths) {
      if (fs.existsSync(chromePath)) {
        puppeteerOptions.executablePath = chromePath;
        break;
      }
    }
  }

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(app.getPath('userData'), 'wwebjs_auth')
    }),
    puppeteer: puppeteerOptions
  });

  whatsappClient.on('qr', (qr) => {
    currentQr = qr;
    qrcode.generate(qr, { small: true });
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('whatsapp-qr', qr);
    }
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready!');
    if (mainWindow) mainWindow.webContents.send('status-update', 'WhatsApp est connecté !');
    mainWindow.webContents.send('whatsapp-ready');
  });

  if (mainWindow) mainWindow.webContents.send('status-update', "Démarrage de l'instance WhatsApp-Web...");
  whatsappClient.initialize().catch((error) => {
    console.error('Failed to initialize WhatsApp client:', error);
    if (mainWindow) mainWindow.webContents.send('status-update', `Erreur: ${error.message}`);
  });
}

ipcMain.handle('get-contacts', async () => {
  try {
    const contacts = await whatsappClient.getContacts();
    return contacts.filter(contact => contact.isMyContact);
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
});

ipcMain.handle('send-message', async (event, { phone, message }) => {
  try {
    const chatId = phone.replace('+', '') + '@c.us';
    await whatsappClient.sendMessage(chatId, message);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
});

ipcMain.handle('logout', async () => {
  try {
    if (whatsappClient) {
      await whatsappClient.logout();
      await whatsappClient.destroy();
      whatsappClient = null;
    }
    const fs = require('fs');
    const sessionPath = path.join(app.getPath('userData'), 'wwebjs_auth');
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }
    isWhatsAppInitializing = false; 
    initWhatsApp();
    return true;
  } catch (err) {
    console.error('Logout error', err);
    throw err;
  }
});

ipcMain.handle('get-groups', async () => {
  try {
    const chats = await whatsappClient.getChats();
    const groups = chats.filter(c => c.isGroup);
    const result=[];
    for(const g of groups){
      try{ await g.fetchParticipants?.(); }catch{}
      result.push({
        id: g.id._serialized,
        name: g.name,
        size: g.participants?.length||0,
        participants: (g.participants||[]).map(p=>({
          id: p.id?._serialized||'',
          number: p.id?.user||'',
          name: p.name || p.pushname || p.id?.user||'',
        })).filter(p=>p.number)
      });
    }
    return result;
  } catch (err) {
    console.error('get-groups error', err);
    throw err;
  }
});

ipcMain.on('renderer-ready', () => {
  if (!isWhatsAppInitializing) {
    isWhatsAppInitializing = true;
    initWhatsApp();
  }
  
  if (currentQr) {
    mainWindow.webContents.send('whatsapp-qr', currentQr);
  }
  if (whatsappClient && whatsappClient.info?.wid) {
    mainWindow.webContents.send('whatsapp-ready');
  }
}); 