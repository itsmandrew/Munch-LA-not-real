'use client';

import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import SidebarActions from './sidebar_action';
import ChatLog from './chatlog/chat_log';

// Sidebar component that contains the sidebar actions and chat log
const Sidebar = ({ onSelectConversation }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [conversations, setConversations] = useState([]);

  // Function to toggle sidebar open or closed
  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle value of isOpen between true and false when clicked
  };

  // Function to add new conversation when the "New Chat" button is pressed
  const handleNewChat = () => {
    const newConversation = `Conversation ${conversations.length + 1}`; // Create new conversation name based on current number of convos
    setConversations([...conversations, newConversation]); // Add the new conversation to the conversations array
  };

  // Function to delete conversation when delete button is pressed
  const handleDeleteChat = (index) => {
    const updatedConversations = conversations.filter((_, i) => i !== index); // Remove the conversation at the specified index
    setConversations(updatedConversations); // Update the conversations array with the filtered list
  };

  return (
    <Box
      sx={{
        display: 'flex',  // Flexbox layout to stack child elements vertically
        flexDirection: 'column',  // Stack children vertically
        height: '100vh',  // Make the sidebar take up the full height of the viewport
        width: isOpen ? '15%' : '5%',  // Adjust the width based on whether the sidebar is open or collapsed
        backgroundColor: '#333',  // Set the background color to dark gray
        color: 'white',  // Set the text color to white
        transition: 'width 0.3s ease',  // Smooth transition when changing the width
        position: 'fixed',  // Fix the sidebar to the left side of the screen
        top: 0,  // Align the sidebar with the top of the viewport
        left: 0,  // Align the sidebar with the left edge of the viewport
        zIndex: 2,  // Ensure the sidebar is above other elements
        overflow: 'hidden',  // Hide any overflowing content
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
        handleDeleteChat={handleDeleteChat}  // Pass the handleDeleteChat function to allow deleting conversations
        onSelectConversation={onSelectConversation}  // Pass the handler to ChatLog
      />
    </Box>
  );
};

export default Sidebar;
