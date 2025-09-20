import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import {
  PlayArrow,
  Shuffle,
  Stop,
  Lightbulb,
  LightbulbOutlined,
  MusicNote,
  LibraryMusic
} from '@mui/icons-material';

function ControlPanel({
  sounds,
  status,
  onPlay,
  onRandomPlay,
  onStop,
  onLightToggle
}) {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              background: 'linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%)',
              border: '1px solid',
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight={700} color="primary">
              Quick Controls
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={status.is_playing ? <Stop /> : <Shuffle />}
              onClick={status.is_playing ? onStop : onRandomPlay}
              color={status.is_playing ? 'secondary' : 'primary'}
              sx={{
                mt: 2,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                transition: 'all 0.3s ease',
              }}
            >
              {status.is_playing ? 'Stop Playing' : 'Play Random Sound'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={status.light_on ? <Lightbulb /> : <LightbulbOutlined />}
              onClick={onLightToggle}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderWidth: 2,
                borderColor: status.light_on ? 'secondary.main' : 'primary.main',
                color: status.light_on ? 'secondary.main' : 'primary.main',
                backgroundColor: status.light_on ? 'rgba(255, 214, 10, 0.1)' : 'transparent',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'secondary.main',
                  backgroundColor: 'rgba(255, 214, 10, 0.15)',
                },
              }}
            >
              {status.light_on ? 'Turn Light Off' : 'Turn Light On'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 214, 10, 0.1) 0%, rgba(255, 195, 0, 0.1) 100%)',
              border: '1px solid',
              borderColor: 'secondary.main',
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight={700} color="secondary.dark">
              System Status
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Chip
                label={status.is_playing ? 'Playing Audio' : 'Ready'}
                color={status.is_playing ? 'primary' : 'default'}
                icon={<MusicNote />}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: 600,
                  py: 2.5,
                }}
              />
              <Chip
                label={`Light: ${status.light_on ? 'ON' : 'OFF'}`}
                color={status.light_on ? 'secondary' : 'default'}
                icon={status.light_on ? <Lightbulb /> : <LightbulbOutlined />}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: 600,
                  py: 2.5,
                }}
              />
              <Chip
                label={`${status.audio_files_count} sound files available`}
                variant="outlined"
                icon={<LibraryMusic />}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: 600,
                  py: 2.5,
                  borderWidth: 2,
                  borderColor: 'primary.main',
                }}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              background: 'linear-gradient(180deg, rgba(13, 13, 13, 0.02) 0%, rgba(123, 44, 191, 0.05) 100%)',
              borderTop: '3px solid',
              borderImage: 'linear-gradient(90deg, #7B2CBF 0%, #FFD60A 100%) 1',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700} color="primary">
                Quick Sound Selection
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {sounds.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography color="text.secondary" align="center">
                      No sounds uploaded yet. Go to Sound Manager to upload files.
                    </Typography>
                  </Grid>
                ) : (
                  sounds.map((sound) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={sound.name}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PlayArrow />}
                        onClick={() => onPlay(sound.name)}
                        disabled={status.is_playing}
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          py: 1.5,
                          borderColor: 'primary.main',
                          borderWidth: 2,
                          fontWeight: 600,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: 'secondary.main',
                            backgroundColor: 'rgba(255, 214, 10, 0.1)',
                          },
                        }}
                      >
                        {sound.name.replace(/\.[^/.]+$/, '')}
                      </Button>
                    </Grid>
                  ))
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ControlPanel;