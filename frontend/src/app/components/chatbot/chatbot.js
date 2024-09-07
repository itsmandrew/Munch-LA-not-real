'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import Markdown from 'react-markdown'
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

const ChatBox = ({ messages, onSend }) => {
  const [input, setInput] = useState(''); // State to manage the text input
  const chatEndRef = useRef(null);  // Create a reference to the end of the chat list for scrolling
  // creates a reference to a DOM element (in this case, the dummy div at the end of the chat list). 
  // This allows us to programmatically control the scrolling behavior.

  // Function to handle sending a new message
  const handleSend = () => {
    if (input.trim()) {  // Check if input is not empty or just whitespace
      onSend(input.trim());  // Call the onSend function passed as a prop with the trimmed input
      setInput('');  // Clear the input field after sending the message
    }
  };

  // useEffect to automatically scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {  // Check if the chatEndRef is defined
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });  // Smoothly scroll to the bottom of the chat so latest chat is available
    }
  }, [messages]);  // Run this effect whenever the 'messages' array changes

  return (
    <Paper elevation={2} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
      {/* Chat messages container */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '8px', backgroundColor: '#ffffff', maxHeight: '100vh' }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index} // Unique key for each message based on its index
              sx={{
                justifyContent: msg.message_type === 'human_no_prompt' ? 'flex-end' : 'flex-start', // Align message to the right for user, left for system
                textAlign: msg.message_type === 'human_no_prompt' ? 'right' : 'left',  // Align text inside the message box
              }}
            >
              <Box
                sx={{
                  maxWidth: '60%',  // Limit the message box width to 75% of the container
                  background: msg.message_type === 'human_no_prompt' ? '#000000' : '#efeeee',  // Black background for user messages, light gray for system
                  color: msg.message_type === 'human_no_prompt' ? '#fff' : '#000',  // White text for user messages, black text for system
                  borderRadius: '8px',  // Rounded corners for the message box
                  padding: '8px',  // Padding inside the message box
                }}
              >
                <Box sx={{ whiteSpace: 'pre-wrap', padding: '8px', borderRadius: '8px'}}>
                  <Markdown
                    components={{
                      ol: ({ ...props }) => (
                        <ol {...props} style={{ paddingLeft: '1.5rem', margin: 0 }} />
                      ),
                      ul: ({ ...props }) => (
                        <ul {...props} style={{ paddingLeft: '1.5rem', margin: 0 }} />
                      ),
                    }}
                  >
                    {msg.content}
                  </Markdown>
                </Box>
              </Box>
            </ListItem>
          ))}
          {/* This is a dummy div to scroll to, ensuring we always reach the bottom */}
          <div ref={chatEndRef}></div>
        </List>
      </Box>
      {/* Input and send button container */}
      <Box sx={{ display: 'flex', paddingLeft: '1vw', paddingRight: '1vw', paddingBottom: '1vw', gap: '1vw' }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={input} // Bind the input state to this TextField
          onChange={(e) => setInput(e.target.value)} // Update input state on change
          onKeyPress={(e) => {
            if (e.key === 'Enter') {  // Check if the Enter key is pressed
              handleSend();  // Call handleSend when Enter is pressed
            }
          }}
        />
        <IconButton onClick={handleSend}> {/* Send button triggers handleSend on click */}
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBox;