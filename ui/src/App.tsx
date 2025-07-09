import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container, Toolbar } from '@mui/material';
import './App.css';
import NavigationBar from './components/NavigationBar';
import Dashboard from './pages/Dashboard';
import Mappings from './pages/Mappings';
import Schemas from './pages/Schemas';
import PMSRegistration from './pages/PMSRegistration';
import PMSIntegrationWizard from './pages/PMSWizard';
import TestHarness from './pages/TestHarness';
import Tests from './pages/Tests';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff'
    },
    secondary: { 
      main: '#ff6b35',
      light: '#ff8a65',
      dark: '#e64a19',
      contrastText: '#ffffff'
    },
    success: { 
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c'
    },
    warning: { 
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00'
    },
    error: { 
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f'
    },
    info: { 
      main: '#00bcd4',
      light: '#4dd0e1',
      dark: '#0097a7'
    },
    background: { 
      default: 'linear-gradient(135deg, #a8c0ff 0%, #b8a9c9 100%)',
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d'
    }
  },
  shape: { 
    borderRadius: 16 
  },
  typography: { 
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #2196f3, #ff6b35)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    h2: {
      fontWeight: 600,
      color: '#2c3e50'
    },
    h3: {
      fontWeight: 600,
      color: '#34495e'
    },
    h4: {
      fontWeight: 500,
      color: '#34495e'
    },
    h5: {
      fontWeight: 500,
      color: '#34495e'
    },
    h6: {
      fontWeight: 500,
      color: '#34495e'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        },
        contained: {
          background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976d2, #00bcd4)'
          }
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: 600,
          '&.Mui-selected': {
            color: '#ffffff'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2196f3'
            }
          }
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavigationBar />
        <Toolbar />
        <Container maxWidth="lg" sx={{ 
          py: 4, 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #a8c0ff 0%, #b8a9c9 100%)',
          backgroundAttachment: 'fixed'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pms-wizard" element={<PMSIntegrationWizard />} />
            <Route path="/mappings" element={<Mappings />} />
            <Route path="/schemas" element={<Schemas />} />
            <Route path="/pms-registration" element={<PMSRegistration />} />
            <Route path="/test-harness" element={<TestHarness />} />
            <Route path="/tests" element={<Tests />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
