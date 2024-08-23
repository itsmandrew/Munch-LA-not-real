// ChatLog.js
import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

// List of chat conversations in sidebar
const ChatLog = ({ isOpen, conversations }) => {
  return (
    <List
      sx={{
        flexGrow: 1,
        overflowY: isOpen ? 'auto' : 'hidden',
        paddingTop: 0,
        visibility: isOpen ? 'visible' : 'hidden',
      }}
    >
      {conversations.map((conversation, index) => (
        <ListItem
          button
          key={index}
          sx={{
            justifyContent: 'center', // Center the text horizontally
            paddingLeft: isOpen ? '16px' : '8px',
          }}
        >
          <ListItemText
            primary={conversation}
            sx={{
              textAlign: 'center', // Center the text within the ListItemText component
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ChatLog;