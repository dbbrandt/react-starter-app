import React, { useState } from 'react';
import { Typography, Button, FormControlLabel, Radio } from '@mui/material';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [option1, setOption1] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="settings-overlay" onClick={handleClose}>
      <div className="settings-modal">
        <Typography variant="h5" className="settings-title">Settings</Typography>
        
        <div className="settings-content">
          <FormControlLabel
            control={
              <Radio
                checked={option1}
                onChange={(e) => setOption1(e.target.checked)}
              />
            }
            label="Option 1"
          />
        </div>

        <div className="settings-actions">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onClose}
            className="logout-button"
          >
            Log Out
          </Button>
        </div>

        <div className="settings-footer">
          <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
            Terms of Use
          </a>
        </div>
      </div>
    </div>
  );
};

export default Settings;
