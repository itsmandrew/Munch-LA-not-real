// ChatLog.js
'use client';

import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

const ChatLog = ({ isOpen, conversations }) => {
  return (
    <List sx={{ flexGrow: 1, overflowY: 'auto', paddingTop: 0 }}>
      {conversations.map((conversation, index) => (
        <ListItem
          button
          key={index}
          sx={{
            justifyContent: isOpen ? 'initial' : 'center',
            paddingLeft: isOpen ? '16px' : '8px',
          }}
        >
          <ListItemText
            primary={conversation}
            sx={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s ease' }}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ChatLog;
