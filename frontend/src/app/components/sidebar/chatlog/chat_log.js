// ChatLog.js
import React from 'react';
import { List, ListItem, ListItemText, IconButton, Box} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// List of chat conversations in sidebar
const ChatLog = ({ isOpen, conversations, handleDeleteChat }) => {
  return (
    // Render a list to display conversations
    <List
      sx={{
        flexGrow: 1,                   // Make the list take up all available vertical space
        overflowY: isOpen ? 'auto' : 'hidden',  // Allow vertical scrolling if the sidebar is open; hide the scrollbar if collapsed
        paddingTop: 0,                 // Remove any padding at the top of the list
        visibility: isOpen ? 'visible' : 'hidden',  // Hide the list if the sidebar is collapsed
      }}
    >
      {conversations.map((conversation, index) => (
        // Render each conversation as a list item
        <ListItem
          key={index}  // Unique key for each list item, based on its index
          sx={{
            justifyContent: 'space-between',  // Distribute space between the conversation text and the delete button
            paddingLeft: isOpen ? '16px' : '8px',  // Adjust padding based on whether the sidebar is open or collapsed
            ':hover .delete-button': {
              visibility: 'visible',  // Show the delete button when the list item is hovered
            }
          }}
        >
          {/* Display the conversation text */}
          <ListItemText
            primary={conversation}  // Set the text to the current conversation
            sx={{ 
              textAlign: 'center',
              opacity: isOpen ? 1 : 0,  // Make the text invisible if the sidebar is collapsed
              transition: 'opacity 0.3s ease'  // Smooth transition for the opacity change
            }}
          />
          
          {/* Box wrapping the delete button, initially hidden */}
          <Box
            className="delete-button"  // Class used for targeting in hover CSS
            sx={{
              visibility: 'hidden',  // Initially hide the delete button
            }}
          >
            {/* Delete button with trash icon */}
            <IconButton onClick={() => handleDeleteChat(index)} sx={{ color: 'white' }}>
              <DeleteIcon />  {/* Trash can icon from Material-UI */}
            </IconButton>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ChatLog;