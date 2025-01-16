import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Details from './pages/Details';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar onSettingsClick={() => setSettingsOpen(true)} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '56px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/details" element={<Details />} />
          </Routes>
        </Box>
        {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
