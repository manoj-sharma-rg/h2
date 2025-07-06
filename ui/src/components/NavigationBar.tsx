import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
  const [role, setRole] = useState<'dev' | 'qa'>('dev');

  return (
    <nav className="nav-bar">
      <div style={{ marginBottom: 8 }}>
        <label>User Role: </label>
        <select value={role} onChange={e => setRole(e.target.value as 'dev' | 'qa')}>
          <option value="dev">dev</option>
          <option value="qa">qa</option>
        </select>
      </div>
      <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Dashboard
      </NavLink>
      {role === 'dev' && (
        <>
          <NavLink to="/pms-wizard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            PMS Wizard
          </NavLink>
          <NavLink to="/pms-registration" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            PMS Registration
          </NavLink>
          <NavLink to="/mappings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Mappings
          </NavLink>
          <NavLink to="/schemas" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Schemas
          </NavLink>
        </>
      )}
      {role === 'qa' && (
        <>
          <NavLink to="/test-harness" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Test Harness
          </NavLink>
          <NavLink to="/tests" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Tests
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default NavigationBar; 