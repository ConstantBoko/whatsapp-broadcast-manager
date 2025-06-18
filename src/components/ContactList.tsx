import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox, 
  TextField,
  Box,
  Typography,
  Button
} from '@mui/material';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onContactSelect,
  searchQuery,
  onSearchChange,
  onToggleSelectAll,
  allSelected,
}) => {
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
        <Button size="small" onClick={onToggleSelectAll}>{allSelected? 'Tout décocher':'Tout sélectionner'}</Button>
      </Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher un contact..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {filteredContacts.length} contacts trouvés
      </Typography>

      <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        {filteredContacts.map((contact) => (
          <ListItem
            key={contact.id}
            dense
            button
            onClick={() => onContactSelect(contact)}
          >
            <Checkbox
              edge="start"
              checked={contact.selected}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText
              primary={contact.name}
              secondary={contact.phoneNumber}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ContactList; 