'use client';

import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import SidebarActions from './sidebar_action';
import ChatLog from './chatlog/chat_log';

// Sidebar component that contains the sidebar actions and chat log
const Sidebar = ({ conversations, session, onSelectConversation, handleNewChat }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Function to toggle sidebar open or closed
  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle value of isOpen between true and false when clicked
  };


  // Function to delete conversation when delete button is pressed
  const handleDeleteChat = (index) => {
    const updatedConversations = conversations.filter((_, i) => i !== index); // Remove the conversation at the specified index
    setConversations(updatedConversations); // Update the conversations array with the filtered list
  };

  return (
    <Box
      sx={{
        width: isOpen ? 240 : 60,
        transition: 'width 0.3s',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* SidebarActions contains the logo, collapse button, and new chat button */}
      <SidebarActions
        isOpen={isOpen} // Pass the isOpen state to control the appearance of the sidebar actions
        toggleSidebar={toggleSidebar}  // Pass the toggleSidebar function to control collapsing/expanding
        handleNewChat={handleNewChat}  // Pass the handleNewChat function to add new conversations
      />

      {/* ChatLog contains the list of conversations */}
      <ChatLog 
        isOpen={isOpen} // Pass the isOpen state to control the visibility and layout of the chat log
        conversations={conversations}  // Pass the conversations array to display the list of conversations
        // handleDeleteChat={handleDeleteChat}  // Pass the handleDeleteChat function to allow deleting conversations
        onSelectConversation={onSelectConversation}  // Pass the handler to ChatLog
      />
    </Box>
  );
};

export default Sidebar;
