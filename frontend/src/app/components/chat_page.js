'use client';
import React, { useState, useEffect } from 'react';
import ChatBox from './chatbot';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box'
import { Typography } from '@mui/material';
import { postData } from './api/api';
import { Button } from '@mui/material'
import { Shizuru } from 'next/font/google';

// General style object for the buttons
const buttonStyles = {
    width: '100%',
    height: 'auto', 
    // border: 'none',
    // backgroundColor: 'transparent', 
    color: 'rgba(0, 0, 0, 0.7)', 
    // borderRadius: '10px',
    '&:hover': {
      border: '1px solid rgba(0, 0, 0, 0.7)', 
      backgroundColor: 'rgba(0, 0, 0, 0.05)', 
      color: 'rgba(0, 0, 0, 0.9)',
    },
  };

const ChatPage = ({session}) => {
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState('1');
    console.log('session', session);
    const buttons = [];
    for (let i = 1; i <= 50; i++) {
        buttons.push(
            <Button key={i} sx={buttonStyles} variant='text' size='large'>
                Convo {i}
            </Button>
        );
    }

    const onSend = async (input) => {
        if (input.trim()) {
        const userMessage = { text: input.trim(), sender: 'user' };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        try {
            // Call postData with user_message and session_id
            const response = await postData('message', { user_message: input, session_id: sessionId });
            const systemMessage = { text: response.input, sender: 'system' };

            // Update session ID if needed
            // setSessionId(response.new_session_id); // Uncomment if session_id is updated

            // Add system message after receiving response
            setMessages([...newMessages, systemMessage]);
        } catch (error) {
            console.error('Error posting data:', error);
            // Optionally handle error (e.g., show error message)
        }
        }
    };


    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Box>
                <Typography>Hello, {session['user']['name']}</Typography>
                <img src={session['user']['image']} alt="Profile Picture" style={{ borderRadius: '50%' }} />
            </Box>
            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={12} md={2} sx={{ backgroundColor: '#d3d3d3', padding: '8px', maxHeight: '100%'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%'}}>
                        {buttons}
                    </Box>
                </Grid>

                <Grid item xs={12} md={10} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                    <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff' }}>
                        <ChatBox messages={messages} onSend={onSend} />
                    </div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatPage;

