import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavigationBar from './components/NavigationBar';
import Dashboard from './pages/Dashboard';
import Mappings from './pages/Mappings';
import Schemas from './pages/Schemas';
import PMSRegistration from './pages/PMSRegistration';
import PMSIntegrationWizard from './pages/PMSWizard';
import TestHarness from './pages/TestHarness';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">PMS Integration Platform</h1>
          <NavigationBar />
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pms-wizard" element={<PMSIntegrationWizard />} />
            <Route path="/mappings" element={<Mappings />} />
            <Route path="/schemas" element={<Schemas />} />
            <Route path="/pms-registration" element={<PMSRegistration />} />
            <Route path="/test-harness" element={<TestHarness />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
