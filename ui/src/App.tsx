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
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f4f6fa', paper: '#fff' },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavigationBar />
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
