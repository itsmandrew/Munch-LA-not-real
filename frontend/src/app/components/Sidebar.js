'use client';

import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import SidebarActions from './SidebarActions';
import ChatLog from './ChatLog';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [conversations, setConversations] = useState([]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewChat = () => {
    const newConversation = `Conversation ${conversations.length + 1}`;
    setConversations([...conversations, newConversation]);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: isOpen ? '15%' : '5%',
        backgroundColor: '#333',
        color: 'white',
        transition: 'width 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {/* SidebarActions contains the logo, collapse button, and new chat button */}
      <SidebarActions
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        handleNewChat={handleNewChat}
      />

      {/* ChatLog contains the list of conversations */}
      <ChatLog 
        isOpen={isOpen} 
        conversations={conversations} />
    </Box>
  );
};

export default Sidebar;
