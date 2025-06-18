import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { Contact, BroadcastList } from '../types';

const { ipcRenderer } = window.require('electron');

interface Participant {
  id: string;
  number: string;
  name: string;
}
interface Group {
  id: string;
  name: string;
  size: number;
  participants: Participant[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  broadcastLists: BroadcastList[];
  onImport: (params: { destListId: string | null; newListName?: string; contacts: Contact[] }) => void;
}

const GroupImportDialog: React.FC<Props> = ({ open, onClose, broadcastLists, onImport }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [destId, setDestId] = useState<string>('');
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (open) {
      ipcRenderer.invoke('get-groups').then((data: Group[]) => setGroups(data));
    }
  }, [open]);

  const toggleParticipant = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (!selectedGroup) return;
    if (selectedIds.size === selectedGroup.participants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectedGroup.participants.map(p => p.id)));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) return;
    const contacts: Contact[] = selectedGroup!.participants
      .filter(p => selectedIds.has(p.id))
      .map(p => ({ id: p.id, name: p.name || p.number, phoneNumber: p.number, selected: false }));
    onImport({ destListId: destId || null, newListName: newListName.trim() || undefined, contacts });
    // reset
    setSelectedIds(new Set());
    setSelectedGroup(null);
    setDestId('');
    setNewListName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Importer des contacts depuis un groupe</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Liste des groupes */}
          <Box sx={{ width: '40%', borderRight: '1px solid #ddd', maxHeight: 400, overflow: 'auto' }}>
            <List>
              {groups.map((g) => (
                <ListItem key={g.id} button selected={selectedGroup?.id === g.id} onClick={() => { setSelectedGroup(g); setSelectedIds(new Set()); }}>
                  <ListItemText primary={g.name} secondary={`${g.size} membres`} />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Participants du groupe */}
          <Box sx={{ flexGrow: 1, maxHeight: 400, overflow: 'auto' }}>
            {selectedGroup ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{selectedGroup.name}</Typography>
                  <Button size="small" onClick={toggleAll}>{selectedIds.size === selectedGroup.participants.length ? 'Tout décocher' : 'Tout sélectionner'}</Button>
                </Box>
                <List>
                  {selectedGroup.participants.map((p) => (
                    <ListItem key={p.id} dense button onClick={() => toggleParticipant(p.id)}>
                      <Checkbox edge="start" checked={selectedIds.has(p.id)} tabIndex={-1} disableRipple />
                      <ListItemText primary={p.name || p.number} secondary={p.number} />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Typography>Sélectionnez un groupe pour voir ses membres.</Typography>
            )}
          </Box>
        </Box>

        {/* Destination */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="dest-label">Ajouter à</InputLabel>
            <Select labelId="dest-label" value={destId} label="Ajouter à" onChange={(e) => setDestId(e.target.value)}>
              {broadcastLists.map((l) => (
                <MenuItem value={l.id} key={l.id}>{l.name}</MenuItem>
              ))}
              <MenuItem value="">➕ Créer une nouvelle liste</MenuItem>
            </Select>
          </FormControl>
          {destId === '' && (
            <TextField fullWidth label="Nom de la nouvelle liste" value={newListName} onChange={(e)=>setNewListName(e.target.value)} />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" disabled={selectedIds.size===0 || (destId==='' && !newListName.trim())} onClick={handleConfirm}>Importer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupImportDialog; 