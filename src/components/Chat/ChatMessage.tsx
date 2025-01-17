import React from 'react';
import { Box, Typography } from '@mui/material';

interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: string;
  isBot?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp, isBot = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        mb: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          backgroundColor: isBot ? '#f0f0f0' : '#1976d2',
          borderRadius: '12px',
          padding: '12px 16px',
          position: 'relative',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: isBot ? '#000' : '#fff',
            fontWeight: 'bold',
            mb: 0.5,
          }}
        >
          {sender}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isBot ? '#000' : '#fff',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isBot ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            display: 'block',
            mt: 0.5,
          }}
        >
          {timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
