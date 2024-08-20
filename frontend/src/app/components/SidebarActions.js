// import React, { useState } from 'react';
// import { Box, IconButton, List, ListItem, ListItemText, Typography, Button } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
// import CloseIcon from '@mui/icons-material/Close';
// import ChatIcon from '@mui/icons-material/Chat';

// const SidebarActions = () => {
//   const [isOpen, setIsOpen] = useState(true);

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <Box
//       sx={{
//         width: isSidebarActionsOpen ? '250px' : '60px',
//         height: '100vh',
//         backgroundColor: '#333',
//         color: 'white',
//         padding: '10px',
//         transition: 'width 0.3s ease',
//         overflowX: 'hidden',
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: isSidebarActionsOpen ? 'flex-start' : 'center',
//       }}
//     >
//       {/* Logo and Toggle Button */}
//       <Box
//         sx={{
//           width: '100%',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '20px',
//         }}
//       >
//         <Typography variant="h6" noWrap sx={{ display: isSidebarActionsOpen ? 'block' : 'none' }}>
//           LOGO
//         </Typography>
//         <IconButton
//           onClick={handleToggleSidebarActions}
//           sx={{
//             color: 'white',
//             marginLeft: isSidebarActionsOpen ? 'auto' : 0,
//           }}
//         >
//           {isSidebarActionsOpen ? <CloseIcon /> : <MenuIcon />}
//         </IconButton>
//       </Box>

//       {/* New Chat Button */}
//       <Button
//         variant="contained"
//         color="primary"
//         startIcon={<ChatIcon />}
//         sx={{
//           width: '100%',
//           display: isSidebarActionsOpen ? 'flex' : 'none',
//           marginBottom: '20px',
//         }}
//         onClick={() => alert('Start a new chat!')}
//       >
//         New Chat
//       </Button>

//       {/* Sidebar Toggle Button */}
//       <IconButton
//         onClick={toggleSidebar}
//         sx={{
//           color: 'white',
//           marginLeft: isSidebarActionsOpen ? 'auto' : 0,
//           display: isSidebarActionsOpen ? 'block' : 'none',
//         }}
//       >
//         {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
//       </IconButton>
//     </Box>
//   );
// };

// export default SidebarActions;


// SidebarActions.js
import React from 'react';
import { Box, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

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
      <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <Typography
        variant="h6"
        sx={{ flexGrow: 1, textAlign: 'center', display: isOpen ? 'block' : 'none' }}
      >
        MunchLA
      </Typography>

      <IconButton onClick={handleNewChat} sx={{ color: 'white' }}>
        <ChatIcon />
      </IconButton>
    </Box>
  );
};

export default SidebarActions;
