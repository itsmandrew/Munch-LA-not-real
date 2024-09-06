'use client';
import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { postData, getConvosForUser } from '../api/api';
import ChatBox from '../chatbot/chatbot';
import Sidebar from '../sidebar/sidebar';

const ChatPage = ({session}) => {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [sessionId, setSessionId] = useState('1');

    useEffect(() => {
        // Fetch user's conversations from the backend once the session is available
        if (session) {
            const fetchConversations = async () => {
                try {
                    // Fetch conversations based on user ID from the session
                    console.log('before')
                    const response = await getConvosForUser('get_user_messages', { user_id: session['user']['email']});
                    console.log('res', response);
                } catch (error) {
                    console.error('Error fetching conversations:', error);
                }
            };
            fetchConversations();
        }
    }, [session]); // Dependency on session to re-run when session changes

    const onSelectConversation = (index) => {
        const selectedConversation = conversations[index];
        setMessages(selectedConversation.messages);
    };

    const onSend = async (input) => {
        if (input.trim()) {
            const userMessage = { text: input.trim(), sender: 'user' };
            const newMessages = [...messages, userMessage];
            setMessages(newMessages);

            try {
                const response = await postData('message', { user_id: session['user']['email'], user_message: input, session_id: sessionId });
                const systemMessage = { text: response.input, sender: 'system' };

                setMessages([...newMessages, systemMessage]);
            } catch (error) {
                console.error('Error posting data:', error);
            }
        }
    };

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex' }}>
            {/* Sidebar Component */}
            <Sidebar session={session}></Sidebar>

            <Grid container sx={{ flex: 1, height: '100%' }}>
                <Grid item xs={12} sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff' }}>
                        <ChatBox messages={messages} onSend={onSend} />
                    </div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatPage;