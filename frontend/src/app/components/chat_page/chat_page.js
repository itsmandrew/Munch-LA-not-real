'use client';
import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { postData, getSessions, getConversation, getNewSession } from '../api/api';
import ChatBox from '../chatbot/chatbot';
import Sidebar from '../sidebar/sidebar';

const ChatPage = ({session}) => {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [sessionId, setSessionId] = useState('');
    console.log('convos', conversations);

    useEffect(() => {
        // Fetch user's conversations from the backend once the session is available
        if (session) {
            const fetchConversations = async () => {
                try {
                    // Fetch conversations based on user ID from the session
                    console.log('before')
                    const response = await getSessions('get_user_sessions', { user_id: session['user']['email']});
                    console.log(response)
                    setConversations(response['sessions'])
                } catch (error) {
                    console.error('Error fetching conversations:', error);
                }
            };
            fetchConversations();
        }
    }, []); // Dependency on session to re-run when session changes

    const onSend = async (input) => {
        if (input.trim()) {
            const userMessage = { message_type: 'human_no_prompt', content: input.trim() };
            const newMessages = [...messages, userMessage];
            console.log('here', newMessages);
            setMessages(newMessages);

            try {
                const response = await postData('message', { user_id: session['user']['email'], user_message: input, session_id: sessionId });
                const systemMessage = { message_type: response['message_type'], content: response['content'] };

                setMessages([...newMessages, systemMessage]);
            } catch (error) {
                console.error('Error posting data:', error);
            }
        }
    };

    const onSelectConversation = async (session_id) => {
        try {
            const response = await getConversation('get_conversation', { user_id: session['user']['email'], session_id: String(session_id) });
            console.log('convo', response['conversation']);
            setSessionId(session_id);
            setMessages(response['conversation'])
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const handleNewChat = async () => {
        try {
            const response = await getNewSession('get_new_session', { user_id: session['user']['email'] });
            setSessionId(response['new_session']);
            setConversations([...conversations, response['new_session']])
            setMessages([]);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex' }}>
            {/* Sidebar Component */}
            <Sidebar conversations = {conversations} session={session} onSelectConversation={onSelectConversation} handleNewChat={handleNewChat}></Sidebar>

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