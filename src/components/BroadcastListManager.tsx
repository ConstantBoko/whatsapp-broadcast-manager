import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { BroadcastList } from '../types';

interface BroadcastListManagerProps {
  lists: BroadcastList[];
  onCreateList: (name: string) => void;
  onDeleteList: (id: string) => void;
  onEditList: (list: BroadcastList) => void;
  onSelectList: (list: BroadcastList) => void;
}

const BroadcastListManager: React.FC<BroadcastListManagerProps> = ({
  lists,
  onCreateList,
  onDeleteList,
  onEditList,
  onSelectList,
}) => {
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<BroadcastList | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
    }
  };

  const handleEditList = (list: BroadcastList) => {
    setEditingList(list);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingList) {
      onEditList(editingList);
      setIsDialogOpen(false);
      setEditingList(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nom de la nouvelle liste"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleCreateList}
          disabled={!newListName.trim()}
        >
          Créer
        </Button>
      </Box>

      <List>
        {lists.map((list) => (
          <ListItem
            key={list.id}
            secondaryAction={
              <Box>
                <IconButton onClick={() => handleEditList(list)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDeleteList(list.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
            onClick={() => onSelectList(list)}
            button
          >
            <ListItemText
              primary={list.name}
              secondary={`${list.contacts.length} contacts`}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Modifier la liste</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom de la liste"
            value={editingList?.name || ''}
            onChange={(e) =>
              setEditingList(
                editingList ? { ...editingList, name: e.target.value } : null
              )
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BroadcastListManager; 