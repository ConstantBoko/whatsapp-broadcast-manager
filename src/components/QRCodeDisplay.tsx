import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import QRCode from 'qrcode.react';

interface QRCodeDisplayProps {
  qrCode: string | null;
  isReady: boolean;
  statusMessage: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode, isReady, statusMessage }) => {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      {isReady ? (
        <Typography variant="h6" color="success.main">
          WhatsApp est connecté !
        </Typography>
      ) : qrCode ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Scannez le QR code avec WhatsApp
          </Typography>
          <Box sx={{ display: 'inline-block', p: 2, bgcolor: 'white' }}>
            <QRCode value={qrCode} size={256} level="H" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Ouvrez WhatsApp sur votre téléphone, allez dans Paramètres &gt; WhatsApp Web/Desktop et scannez le code
          </Typography>
        </Box>
      ) : (
        <Typography variant="h6" color="text.secondary">
          {statusMessage}
        </Typography>
      )}
    </Paper>
  );
};

export default QRCodeDisplay; 