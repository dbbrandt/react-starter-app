import React from 'react';
import { Box } from '@mui/material';
import ChatInterface from '../components/Chat/ChatInterface';

const Home: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 72px)', // Account for navbar height
        backgroundColor: '#f5f5f5',
        paddingTop: '20px',
      }}
    >
      <ChatInterface />
    </Box>
  );
};

export default Home;
