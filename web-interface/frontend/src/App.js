import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  Snackbar,
  IconButton,
  Avatar
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import SoundManager from './components/SoundManager';
import ControlPanel from './components/ControlPanel';
import getTheme from './theme';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') !== null
      ? localStorage.getItem('darkMode') === 'true'
      : true // Default to dark mode
  );
  const [currentTab, setCurrentTab] = useState(0);
  const [sounds, setSounds] = useState([]);
  const [status, setStatus] = useState({
    light_on: false,
    is_playing: false,
    audio_files_count: 0
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const theme = getTheme(darkMode);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchSounds();
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchSounds = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sounds`);
      setSounds(response.data);
    } catch (error) {
      showNotification('Failed to fetch sounds', 'error');
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleUpload = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post(`${API_URL}/api/upload`, formData);
        showNotification(`Uploaded ${file.name}`, 'success');
      } catch (error) {
        showNotification(`Failed to upload ${file.name}`, 'error');
      }
    }
    fetchSounds();
  };

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`${API_URL}/api/sounds/${filename}`);
      showNotification(`Deleted ${filename}`, 'success');
      fetchSounds();
    } catch (error) {
      showNotification(`Failed to delete ${filename}`, 'error');
    }
  };

  const handlePlay = async (filename) => {
    try {
      await axios.post(`${API_URL}/api/play/${filename}`);
      showNotification(`Playing ${filename}`, 'info');
    } catch (error) {
      showNotification(`Failed to play ${filename}`, 'error');
    }
  };

  const handleRandomPlay = async () => {
    try {
      await axios.post(`${API_URL}/api/trigger/random`);
      showNotification('Playing random sound', 'info');
    } catch (error) {
      showNotification('Failed to play random sound', 'error');
    }
  };

  const handleStop = async () => {
    try {
      await axios.post(`${API_URL}/api/stop`);
      showNotification('Playback stopped', 'info');
    } catch (error) {
      showNotification('Failed to stop playback', 'error');
    }
  };

  const handleLightToggle = async () => {
    try {
      await axios.post(`${API_URL}/api/light/toggle`);
      showNotification(status.light_on ? 'Light turned off' : 'Light turned on', 'info');
    } catch (error) {
      showNotification('Failed to toggle light', 'error');
    }
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Avatar
            src="/logo.jpg"
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              border: '2px solid #FFD60A'
            }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Smash & Flash Controller
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: status.is_playing ? 'secondary.main' : 'transparent',
            color: status.is_playing ? 'black' : 'white',
            px: status.is_playing ? 2 : 0,
            py: status.is_playing ? 0.5 : 0,
            borderRadius: 20,
            transition: 'all 0.3s ease',
            mr: 2
          }}>
            <Typography variant="body2" fontWeight={600}>
              {status.is_playing ? '🔊 Playing' : '🔇 Ready'}
            </Typography>
          </Box>
          <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: '#FFD60A' }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {status.is_playing && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              backgroundColor: 'rgba(255, 214, 10, 0.1)',
              color: theme.palette.text.primary,
              '& .MuiAlert-icon': {
                color: '#FFD60A'
              }
            }}
          >
            Audio is currently playing...
          </Alert>
        )}

        <Box sx={{ borderBottom: 2, borderColor: 'primary.main', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, v) => setCurrentTab(v)}
            textColor="primary"
            indicatorColor="secondary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
              },
            }}
          >
            <Tab label="Control Panel" />
            <Tab label="Sound Manager" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <ControlPanel
            sounds={sounds}
            status={status}
            onPlay={handlePlay}
            onRandomPlay={handleRandomPlay}
            onStop={handleStop}
            onLightToggle={handleLightToggle}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <SoundManager
            sounds={sounds}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onPlay={handlePlay}
          />
        </TabPanel>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;