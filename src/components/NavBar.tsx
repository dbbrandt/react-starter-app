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
      <Toolbar sx={{ padding: 0, minHeight: '56px !important' }}>
        <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              width: '40%', 
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
              width: '40%', 
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

          <Box 
            sx={{ 
              width: '20%', 
              textAlign: 'center',
            }} 
            className="nav-link"
          >
            <IconButton 
              onClick={onSettingsClick}
              sx={{ 
                color: '#666',
                padding: 0,
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SettingsIcon />
                <Typography variant="caption">
                  Settings
                </Typography>
              </Box>
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
