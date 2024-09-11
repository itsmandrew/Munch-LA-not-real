import React from 'react';
import { Box, Container, Typography, Grid, TextField, Button, Paper } from '@mui/material';

const chat_intro = () => {
    return (
        <Container maxWidth="lg" style={{ marginTop: '30px', textAlign: 'center' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <img src="/path/to/logo.png" alt="Logo" style={{ width: '100px' }} />
                <Typography variant="h4">MunchWorld</Typography>
            </Box>
            
            <Grid container spacing={2} justifyContent="center" mb={4}>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                        {/* Content for each card */}
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                        {/* Content for each card */}
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                        {/* Content for each card */}
                    </Paper>
                </Grid>
            </Grid>

            <Box mt={4}>
                <TextField 
                    variant="outlined" 
                    fullWidth 
                    placeholder="Enter Prompt Here" 
                    InputProps={{ style: { borderRadius: '5px' } }}
                />
            </Box>
        </Container>
    );
};

export default chat_intro;