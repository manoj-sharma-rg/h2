import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
  return (
    <nav className="nav-bar">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Dashboard
      </NavLink>
      <NavLink to="/mappings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Mappings
      </NavLink>
      <NavLink to="/schemas" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Schemas
      </NavLink>
      <NavLink to="/pms-registration" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        PMS Registration
      </NavLink>
      <NavLink to="/test-harness" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Test Harness
      </NavLink>
    </nav>
  );
};

export default NavigationBar; 