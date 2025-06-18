# WhatsApp Broadcast Manager

A desktop application built with Electron and React that allows you to manage WhatsApp broadcast lists and send messages to multiple contacts efficiently.

## Features

- 🔐 **Secure WhatsApp Connection**: Connect to WhatsApp Web securely using QR code authentication
- 📱 **Contact Management**: Import and manage your WhatsApp contacts
- 👥 **Group Management**: View and manage WhatsApp groups with participant lists
- 📝 **Message Composer**: Create and send broadcast messages to multiple recipients
- 🖥️ **Desktop App**: Native desktop experience with Electron
- 🔄 **Real-time Updates**: Live status updates and QR code display


## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Chrome (required for WhatsApp Web connection)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/ConstantBoko/whatsapp-broadcast-manager.git
cd whatsapp-broadcast-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Building for Production

#### Build portable executable:
```bash
npm run dist:portable
```

#### Build installer:
```bash
npm run dist
```

The built files will be available in the `dist` folder.

## Usage

1. **Launch the application**
2. **Scan QR Code**: Use your phone's WhatsApp to scan the QR code displayed in the app
3. **Wait for Connection**: The app will connect to WhatsApp Web
4. **Manage Contacts**: Import and organize your contacts
5. **Create Messages**: Use the message composer to create broadcast messages
6. **Send Messages**: Select recipients and send your broadcast messages

## Technology Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Electron, Node.js
- **WhatsApp Integration**: whatsapp-web.js
- **Build Tools**: electron-builder, react-scripts

## Project Structure

```
├── electron/           # Electron main process
│   └── main.js        # Main Electron application
├── src/               # React application source
│   ├── components/    # React components
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main React component
├── public/            # Public assets
└── build/             # Built React app (generated)
```

## Development

### Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm run electron` - Start Electron app
- `npm run dev` - Start both React and Electron in development mode
- `npm run dist` - Build production executable
- `npm run dist:portable` - Build portable executable

### Key Components

- **BroadcastListManager**: Manages broadcast lists and recipients
- **ContactList**: Displays and manages WhatsApp contacts
- **MessageComposer**: Interface for creating broadcast messages
- **QRCodeDisplay**: Shows WhatsApp Web QR code for authentication

## Configuration

The application uses Electron's `userData` directory to store:
- WhatsApp Web authentication session
- Application settings
- Contact cache

## Troubleshooting

### Common Issues

1. **Puppeteer Chrome Error**: Make sure Google Chrome is installed on your system
2. **WhatsApp Connection Issues**: Try logging out and reconnecting
3. **Build Issues**: Clear `node_modules` and reinstall dependencies

### System Requirements

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.13 or later  
- **Linux**: Ubuntu 18.04 or later

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is not affiliated with WhatsApp Inc. It uses the unofficial WhatsApp Web API through whatsapp-web.js. Use at your own risk and ensure compliance with WhatsApp's Terms of Service.

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/yourusername/whatsapp-broadcast-manager/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your system and the issue

---

**Note**: This application requires WhatsApp Web to function and needs Google Chrome installed on your system. 