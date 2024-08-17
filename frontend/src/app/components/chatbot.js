'use client';
import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input.trim(), sender: 'user' }];
      setMessages(newMessages);
      setInput('');

      // Simulate a response from the "system"
      setTimeout(() => {
        setMessages([...newMessages, { text: 'This is a response', sender: 'system' }]);
      }, 1000);
    }
  };

  const [input, setInput] = useState('');

  return (
    <Paper elevation={3} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{ flexGrow: 1, overflowY: 'auto', padding: '8px', backgroundColor: '#f5f5f5' }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                textAlign: msg.sender === 'user' ? 'right' : 'left',
              }}
            >
              <Box
                sx={{
                  maxWidth: '75%',
                  backgroundColor: msg.sender === 'user' ? '#2196f3' : '#e0e0e0',
                  color: msg.sender === 'user' ? '#fff' : '#000',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex', padding: '8px' }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          sx={{ marginLeft: '8px' }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;
