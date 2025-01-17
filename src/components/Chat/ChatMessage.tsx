import React from 'react';
import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

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
        
        {isBot ? (
          <Box sx={{ 
            '& .markdown-content': { 
              color: '#000',
              '& pre': {
                backgroundColor: '#e0e0e0',
                padding: '8px',
                borderRadius: '4px',
                overflowX: 'auto',
              },
              '& code': {
                backgroundColor: '#e0e0e0',
                padding: '2px 4px',
                borderRadius: '4px',
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                marginTop: '8px',
                marginBottom: '8px',
              },
              '& ul, & ol': {
                marginLeft: '20px',
              },
              '& p': {
                marginBottom: '8px',
              },
              '& a': {
                color: '#1976d2',
                textDecoration: 'underline',
              },
            } 
          }}>
            <ReactMarkdown className="markdown-content">{message}</ReactMarkdown>
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: '#fff',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </Typography>
        )}
        
        <Typography
          variant="caption"
          sx={{
            color: isBot ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)',
            display: 'block',
            mt: 0.5,
            textAlign: 'right',
          }}
        >
          {timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
