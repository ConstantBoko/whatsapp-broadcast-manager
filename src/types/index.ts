export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  selected: boolean;
}

export interface BroadcastList {
  id: string;
  name: string;
  contacts: Contact[];
}

export interface Message {
  text: string;
  variables: {
    [key: string]: string;
  };
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
} 