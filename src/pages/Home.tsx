import React from 'react';
import { Box, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 120px)',
      }}
    >
      <Typography variant="h2">Home</Typography>
    </Box>
  );
};

export default Home;
