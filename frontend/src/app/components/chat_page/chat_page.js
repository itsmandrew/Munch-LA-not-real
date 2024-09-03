'use client';
import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { postData } from '../../api/api';
import ChatBox from '../chatbot/chatbot';
import Sidebar from '../sidebar/sidebar';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([
        { id: 1, name: 'Conversation 1', messages: [] },
        { id: 2, name: 'Conversation 2', messages: [] },
        // Add more conversations as needed
    ]);
    const [sessionId, setSessionId] = useState('1');

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
                const response = await postData('message', { user_message: input, session_id: sessionId });
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
            <Sidebar/> 

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



// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Box, Grid, Button, Typography } from '@mui/material';
// import { postData } from '../../api/api';

// import ChatBox from '../chatbot/chatbot';
// import Sidebar from '../sidebar/sidebar';

// // General style object for the buttons
// const buttonStyles = {
//     width: '100%',
//     height: 'auto', 
//     // border: 'none',
//     // backgroundColor: 'transparent', 
//     color: 'rgba(0, 0, 0, 0.7)', 
//     // borderRadius: '10px',
//     '&:hover': {
//       border: '1px solid rgba(0, 0, 0, 0.7)', 
//       backgroundColor: 'rgba(0, 0, 0, 0.05)', 
//       color: 'rgba(0, 0, 0, 0.9)',
//     },
//   };

// const ChatPage = () => {
//     const [messages, setMessages] = useState([]);
//     const [sessionId, setSessionId] = useState('1');
//     const buttons = [];
//     for (let i = 1; i <= 50; i++) {
//         buttons.push(
//             <Button key={i} sx={buttonStyles} variant='text' size='large'>
//                 Convo {i}
//             </Button>
//         );
//     }

//     const onSend = async (input) => {
//         if (input.trim()) {
//         const userMessage = { text: input.trim(), sender: 'user' };
//         const newMessages = [...messages, userMessage];
//         setMessages(newMessages);

//         try {
//             // Call postData with user_message and session_id
//             const response = await postData('message', { user_message: input, session_id: sessionId });
//             const systemMessage = { text: response.input, sender: 'system' };

//             // Update session ID if needed
//             // setSessionId(response.new_session_id); // Uncomment if session_id is updated

//             // Add system message after receiving response
//             setMessages([...newMessages, systemMessage]);
//         } catch (error) {
//             console.error('Error posting data:', error);
//             // Optionally handle error (e.g., show error message)
//         }
//         }
//     };


//     return (
//         <Box sx={{ height: '100%', width: '100%' }}>
//             <Grid container sx={{ height: '100%' }}>
//                 <Grid item xs={12} md={2} sx={{ padding: '8px', maxHeight: '100%'}}>
//                     <Sidebar></Sidebar>
//                     {/* <Box sx={{display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%'}}>
//                         {buttons}
//                     </Box> */}
//                 </Grid>


//                 <Grid item xs={12} md={10} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
//                     <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff' }}>
//                         <ChatBox messages={messages} onSend={onSend} />
//                         {/* add a switch statement here that switches to chat_intro */}
//                         {/* if messages array is empty then render <ChatIntro></ChatIntro>
//                         else render <ChatBox messages={messages} onSend={onSend} /> */}
//                         {/* if first chat sent then render <ChatBox messages={messages} onSend={onSend} />
//                         else render <ChatIntro></ChatIntro>*/}
//                     </div>
//                     {/* messaging chat area */}
                    
//                 </Grid>
//             </Grid>
//         </Box>
//     );
// };

// export default ChatPage;


/////////////////////////////////////


// ChatPage.js