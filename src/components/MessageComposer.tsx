import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import { Message } from '../types';

interface MessageComposerProps {
  onSendMessage: (message: Message) => void;
  recipientCount: number;
  listName?: string;
}

const VARIABLE_REGEX = /\{(\w+)\}/g;

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  recipientCount,
  listName
}) => {
  const [messageText, setMessageText] = useState('');
  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [newVariable, setNewVariable] = useState('');

  const handleAddVariable = () => {
    if (newVariable.trim()) {
      setVariables({
        ...variables,
        [newVariable.trim()]: '',
      });
      setNewVariable('');
    }
  };

  const handleRemoveVariable = (key: string) => {
    const newVariables = { ...variables };
    delete newVariables[key];
    setVariables(newVariables);
  };

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage({
        text: messageText,
        variables,
      });
    }
  };

  const highlightedPreview = useMemo(() => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const text = messageText;
    text.replace(VARIABLE_REGEX, (match, p1, offset) => {
      // push preceding text
      if (offset > lastIndex) {
        parts.push(text.slice(lastIndex, offset));
      }
      const isKnownVar = p1 === 'nom' || Object.keys(variables).includes(p1);
      parts.push(
        <span key={offset} style={{ color: isKnownVar ? '#25D366' : '#d32f2f', fontWeight: 600 }}>
          {match}
        </span>
      );
      lastIndex = offset + match.length;
      return match;
    });
    // push remaining
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }, [messageText, variables]);

  return (
    <Box component={Paper} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {listName?`Liste: ${listName}`:`Composer le message`} ({recipientCount} destinataires)
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Variables personnalisées
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            placeholder="Nom de la variable"
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
          />
          <Button variant="outlined" onClick={handleAddVariable}>
            Ajouter
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.keys(variables).map((key) => (
            <Chip
              key={key}
              label={key}
              onDelete={() => handleRemoveVariable(key)}
            />
          ))}
        </Box>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        placeholder="Écrivez votre message ici... Utilisez {variable} pour les variables personnalisées"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        sx={{ mb: 2 }}
      />

      {Object.keys(variables).length > 0 && (
        <Box sx={{ mb: 2 }}>
          {Object.keys(variables).map((key) => (
            <TextField
              key={key}
              fullWidth
              size="small"
              label={`Valeur pour ${key}`}
              value={variables[key]}
              onChange={(e) =>
                setVariables({ ...variables, [key]: e.target.value })
              }
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Aperçu du message
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography component="div">
            {highlightedPreview}
          </Typography>
        </Paper>
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSend}
        disabled={!messageText.trim() || recipientCount === 0}
      >
        Envoyer le message
      </Button>
    </Box>
  );
};

export default MessageComposer; 