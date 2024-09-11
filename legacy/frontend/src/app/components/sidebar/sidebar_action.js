// SidebarActions.js
import React from 'react';
import { Box, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

// SidebarActions component that contains the toggle button and new chat button
const SidebarActions = ({ isOpen, toggleSidebar, handleNewChat }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #444',
      }}
    >
      {/* Sidebar toggle button */}
      <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <Typography
        variant="h6"
        sx={{ flexGrow: 1, textAlign: 'center', display: isOpen ? 'block' : 'none' }}
      >
        MunchLA
      </Typography>
      
      {/* Add new chat button if the sidebar is open */}
      {isOpen && (
        <IconButton onClick={handleNewChat} sx={{ color: 'white' }}>
          <ChatIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default SidebarActions;
