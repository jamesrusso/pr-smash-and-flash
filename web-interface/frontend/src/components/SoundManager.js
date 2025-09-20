import React, { useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  Delete,
  PlayArrow,
  CloudUpload,
  AudioFile
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

function SoundManager({ sounds, onUpload, onDelete, onPlay }) {
  const onDrop = useCallback((acceptedFiles) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.m4a']
    },
    multiple: true
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Sounds
          </Typography>
          <Paper
            {...getRootProps()}
            elevation={isDragActive ? 8 : 2}
            sx={{
              p: 4,
              mt: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'rgba(123, 44, 191, 0.1)' : 'background.paper',
              border: '3px dashed',
              borderColor: isDragActive ? 'secondary.main' : 'primary.main',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'secondary.main',
                backgroundColor: 'rgba(255, 214, 10, 0.05)',
              }
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: isDragActive ? 'secondary.main' : 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
              {isDragActive
                ? 'Drop your audio files here'
                : 'Drag & drop audio files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select files
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              {['.mp3', '.wav', '.ogg', '.flac', '.m4a'].map((ext) => (
                <Chip
                  key={ext}
                  label={ext}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sound Library ({sounds.length} files)
          </Typography>
          {sounds.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AudioFile sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                No sounds uploaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload audio files using the drop zone above
              </Typography>
            </Box>
          ) : (
            <List>
              {sounds.map((sound) => (
                <ListItem
                  key={sound.name}
                  divider
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <AudioFile sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={sound.name}
                    secondary={formatFileSize(sound.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => onPlay(sound.name)}
                      sx={{
                        mr: 1,
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(123, 44, 191, 0.1)',
                        }
                      }}
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => onDelete(sound.name)}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 214, 10, 0.1)',
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default SoundManager;