import React from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import { Home, Book, Settings as SettingsIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

interface NavBarProps {
  onSettingsClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSettingsClick }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="fixed" sx={{ backgroundColor: 'white' }}>
      <Toolbar sx={{ padding: 0, minHeight: '72px !important' }}>
        <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              width: '33.33%', 
              textAlign: 'center',
              color: isActive('/') ? '#000' : '#666',
            }} 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Home />
            <Typography variant="caption">
              Home
            </Typography>
          </Box>
          
          <Box 
            component={Link} 
            to="/details" 
            sx={{ 
              width: '33.33%', 
              textAlign: 'center',
              color: isActive('/details') ? '#000' : '#666',
            }} 
            className={`nav-link ${isActive('/details') ? 'active' : ''}`}
          >
            <Book />
            <Typography variant="caption">
              Details
            </Typography>
          </Box>

          <IconButton
            className="settings-button"
            onClick={onSettingsClick}
            size="large"
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
