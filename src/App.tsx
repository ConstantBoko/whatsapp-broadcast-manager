import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import ContactList from './components/ContactList';
import BroadcastListManager from './components/BroadcastListManager';
import MessageComposer from './components/MessageComposer';
import QRCodeDisplay from './components/QRCodeDisplay';
import GroupImportDialog from './components/GroupImportDialog';
import { Contact, BroadcastList, Message, SnackbarState } from './types';

const { ipcRenderer } = window.require('electron');

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#25D366',
    },
    secondary: {
      main: '#128C7E',
    },
  },
});

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [broadcastLists, setBroadcastLists] = useState<BroadcastList[]>([]);
  const [selectedList, setSelectedList] = useState<BroadcastList | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isWhatsAppReady, setIsWhatsAppReady] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });
  const [selectedCount, setSelectedCount] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [allSelected,setAllSelected]=useState(false);
  const [statusMessage, setStatusMessage] = useState('En attente du client Electron...');

  const loadContacts = useCallback(async () => {
    try {
      const fetchedContacts: { id: { _serialized: string }, name: string, number: string, pushname: string, isMyContact: boolean }[] = await ipcRenderer.invoke('get-contacts');
      const map = new Map<string, Contact>();
      fetchedContacts.forEach(contact => {
        const phone = contact.id._serialized.replace(/@c\.us$/, '');
        if (contact.isMyContact && !map.has(phone) && isValidPhone(phone)) {
          map.set(phone, {
            id: contact.id._serialized,
            name: contact.name || contact.pushname || phone,
            phoneNumber: phone,
            selected: false,
          });
        }
      });
      setContacts(Array.from(map.values()));
      setSelectedCount(0);
      setAllSelected(false);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, []);

  useEffect(() => {
    ipcRenderer.send('renderer-ready');

    const qrListener = (_event: any, qr: string) => setQrCode(qr);
    ipcRenderer.on('whatsapp-qr', qrListener);

    const readyListener = () => {
      setIsWhatsAppReady(true);
      loadContacts();
    };
    ipcRenderer.on('whatsapp-ready', readyListener);

    const statusListener = (_event: any, message: string) => setStatusMessage(message);
    ipcRenderer.on('status-update', statusListener);

    return () => {
      ipcRenderer.removeListener('whatsapp-qr', qrListener);
      ipcRenderer.removeListener('whatsapp-ready', readyListener);
      ipcRenderer.removeListener('status-update', statusListener);
    };
  }, [loadContacts]);

  useEffect(() => {
    const savedLists = localStorage.getItem('broadcastLists');
    if (savedLists) {
      try { setBroadcastLists(JSON.parse(savedLists)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('broadcastLists', JSON.stringify(broadcastLists));
  }, [broadcastLists]);

  const isValidPhone = (num:string)=>/^\d{6,}$/.test(num);

  const handleContactSelect = (contact: Contact) => {
    const updatedContacts=contacts.map((c)=> c.id===contact.id ? {...c,selected:!c.selected}:c);
    setContacts(updatedContacts);
    setSelectedCount(prev=> contact.selected?prev-1:prev+1);
    if(selectedList){
      const inList = selectedList.contacts.some(c=>c.id===contact.id);
      let newContactsInList;
      if(inList){
        newContactsInList = selectedList.contacts.filter(c=>c.id!==contact.id);
      }else{
        newContactsInList = [...selectedList.contacts, contact];
      }
      const updatedList={...selectedList,contacts:newContactsInList};
      setSelectedList(updatedList);
      setBroadcastLists(broadcastLists.map(l=> l.id===updatedList.id?updatedList:l));
    }
    setAllSelected(false);
  };

  const handleCreateList = (name: string) => {
    const newList: BroadcastList = {
      id: Date.now().toString(),
      name,
      contacts: contacts.filter((contact) => contact.selected),
    };
    setBroadcastLists([...broadcastLists, newList]);
    setContacts(contacts.map((c) => ({ ...c, selected: false })));
    setSelectedCount(0);
  };

  const handleDeleteList = (id: string) => {
    setBroadcastLists(broadcastLists.filter((list) => list.id !== id));
    if (selectedList?.id === id) {
      setSelectedList(null);
    }
  };

  const handleEditList = (updatedList: BroadcastList) => {
    setBroadcastLists(
      broadcastLists.map((list) =>
        list.id === updatedList.id ? updatedList : list
      )
    );
    if (selectedList?.id === updatedList.id) {
      setSelectedList(updatedList);
    }
  };

  const applyVariables = (text:string, recipient:Contact, customVars:{[k:string]:string}) => {
    let result = text;
    // Variable nom -> contact name
    result = result.replace(/\{nom\}/gi, recipient.name || '');
    Object.entries(customVars).forEach(([key,value])=>{
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return result;
  };

  const handleSendMessage = async (message: Message) => {
    if (!selectedList) return;

    const recipients = selectedList.contacts;
    for (const recipient of recipients) {
      try {
        const personalizedMessage = applyVariables(message.text, recipient, message.variables || {});
        await ipcRenderer.invoke('send-message', {
          phone: recipient.phoneNumber,
          message: personalizedMessage,
        });
      } catch (error) {
        console.error(`Error sending message to ${recipient.phoneNumber}:`, error);
        setSnackbar({open:true,message:`Erreur lors de l'envoi à ${recipient.name}`,severity:'error'});
      }
    }
    setSnackbar({open:true,message:'Message envoyé avec succès',severity:'success'});
  };

  const handleLogout = async () => {
    try {
      await ipcRenderer.invoke('logout');
      setIsWhatsAppReady(false);
      setQrCode(null);
      setContacts([]);
      setSelectedList(null);
      setSnackbar({open:true,message:'Déconnecté avec succès',severity:'success'});
    } catch (err) {
      console.error(err);
      setSnackbar({open:true,message:'Erreur lors de la déconnexion',severity:'error'});
    }
  };

  const applyListSelection = (list: BroadcastList|null) => {
    if (!list) {
      setContacts(contacts.map(c=>({...c,selected:false})));
      setSelectedCount(0);
      return;
    }
    const idSet=new Set(list.contacts.map(c=>c.id));
    const updated=contacts.map(c=>({...c,selected:idSet.has(c.id)}));
    setContacts(updated);
    setSelectedCount(list.contacts.length);
  };

  const handleSelectList = (list: BroadcastList|null)=>{
    setSelectedList(list);
    applyListSelection(list);
  };

  const handleGroupImport = ({ destListId, newListName, contacts }: { destListId: string | null; newListName?: string; contacts: Contact[] }) => {
    if (destListId) {
      setBroadcastLists(prev => prev.map(l => l.id === destListId ? { ...l, contacts: deduplicate([...l.contacts, ...contacts]) } : l));
    } else {
      const newList: BroadcastList = { id: Date.now().toString(), name: newListName || 'Nouvelle liste', contacts };
      setBroadcastLists(prev => [...prev, newList]);
    }
    setSnackbar({ open: true, message: `${contacts.length} contact(s) importé(s)`, severity: 'success' });
  };

  const deduplicate = (arr: Contact[]) => {
    const map = new Map<string, Contact>();
    arr.forEach(c => {
      if (!map.has(c.phoneNumber)) {
        map.set(c.phoneNumber, c);
      }
    });
    return Array.from(map.values());
  };

  const toggleSelectAll=()=>{
    const newVal = !allSelected;
    setAllSelected(newVal);
    setContacts(contacts.map(c=>({...c,selected:newVal})));
    setSelectedCount(newVal?contacts.length:0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>WhatsApp Broadcast Manager</Typography>
          {isWhatsAppReady && (
            <Button color="secondary" variant="outlined" onClick={handleLogout}>Se déconnecter</Button>
          )}
        </Box>

        {!isWhatsAppReady && (
          <Box sx={{ mb: 4 }}>
            <QRCodeDisplay qrCode={qrCode} isReady={isWhatsAppReady} statusMessage={statusMessage} />
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Contacts {selectedCount > 0 && `(${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''})`}
              </Typography>
              <ContactList
                contacts={contacts}
                onContactSelect={handleContactSelect}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onToggleSelectAll={toggleSelectAll}
                allSelected={allSelected}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Listes de diffusion
              </Typography>
              <Button size="small" variant="outlined" sx={{ mb: 1 }} onClick={() => setImportOpen(true)}>Importer depuis un groupe</Button>
              <BroadcastListManager
                lists={broadcastLists}
                onCreateList={handleCreateList}
                onDeleteList={handleDeleteList}
                onEditList={handleEditList}
                onSelectList={handleSelectList}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <MessageComposer
              onSendMessage={handleSendMessage}
              recipientCount={selectedList?.contacts.length || 0}
              listName={selectedList?.name}
            />
          </Grid>
        </Grid>

        <GroupImportDialog open={importOpen} onClose={() => setImportOpen(false)} broadcastLists={broadcastLists} onImport={handleGroupImport} />

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={()=>setSnackbar({...snackbar,open:false})} anchorOrigin={{vertical:'top',horizontal:'center'}}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: 400, fontSize:'1.1rem', py:2 }} onClose={()=>setSnackbar({...snackbar,open:false})}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default App; 