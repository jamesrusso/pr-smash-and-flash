import { createTheme } from '@mui/material/styles';

const getTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#7B2CBF',  // Purple
      light: '#9D4EDD',
      dark: '#5A189A',
    },
    secondary: {
      main: '#FFD60A',  // Yellow
      light: '#FFEA00',
      dark: '#FFC300',
    },
    background: {
      default: darkMode ? '#0D0D0D' : '#FAFAFA',
      paper: darkMode ? '#1A1A1A' : '#FFFFFF',
    },
    text: {
      primary: darkMode ? '#FFFFFF' : '#0D0D0D',
      secondary: darkMode ? '#B0B0B0' : '#4A4A4A',
    },
    warning: {
      main: '#FFD60A',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #7B2CBF 30%, #9D4EDD 90%)',
          boxShadow: '0 3px 5px 2px rgba(123, 44, 191, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5A189A 30%, #7B2CBF 90%)',
          },
        },
        containedSecondary: {
          color: '#0D0D0D',
          '&:hover': {
            backgroundColor: '#FFC300',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #7B2CBF 0%, #5A189A 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          background: 'linear-gradient(45deg, #7B2CBF 30%, #9D4EDD 90%)',
        },
        colorSecondary: {
          backgroundColor: '#FFD60A',
          color: '#0D0D0D',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: darkMode
            ? 'linear-gradient(rgba(123, 44, 191, 0.05), rgba(123, 44, 191, 0.05))'
            : 'linear-gradient(rgba(255, 214, 10, 0.03), rgba(255, 214, 10, 0.03))',
        },
      },
    },
  },
});

export default getTheme;