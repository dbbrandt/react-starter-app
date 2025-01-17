import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from './ChatMessage';
import { generateChatResponse } from '../../services/openai';

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
  isBot: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hi, I\'m ChatGPT-4! How can I help you today? 😊',
      sender: 'ChatGPT',
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      isBot: true,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim() && !isLoading) {
      const currentTime = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      const userMessage: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'You',
        timestamp: currentTime,
        isBot: false,
      };

      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsLoading(true);

      try {
        const response = await generateChatResponse(newMessage);
        const botMessage: Message = {
          id: messages.length + 2,
          text: response,
          sender: 'ChatGPT',
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          isBot: true,
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: messages.length + 2,
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'ChatGPT',
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          isBot: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '75%',
        height: 'calc(100vh - 120px)',
        margin: '20px auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 0',
          backgroundColor: '#fff',
        }}
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            sender={message.sender}
            timestamp={message.timestamp}
            isBot={message.isBot}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box
        sx={{
          p: 2,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          disabled={isLoading}
          sx={{
            backgroundColor: '#fff',
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!newMessage.trim() || isLoading}
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            '&.Mui-disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatInterface;
