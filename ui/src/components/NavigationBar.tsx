import React, { useState } from 'react';
import { AppBar, Toolbar, Tabs, Tab, Box, Select, MenuItem, InputLabel, FormControl, useMediaQuery, useTheme } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SchemaIcon from '@mui/icons-material/Schema';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TestIcon from '@mui/icons-material/Science';

const navConfig = {
  dev: [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'PMS Wizard', path: '/pms-wizard', icon: <BuildIcon /> },
    { label: 'PMS', path: '/pms-registration', icon: <AssignmentIcon /> },
    { label: 'Mappings', path: '/mappings', icon: <ListAltIcon /> },
    { label: 'Schemas', path: '/schemas', icon: <SchemaIcon /> },
  ],
  qa: [
    { label: 'Test Harness', path: '/test-harness', icon: <VpnKeyIcon /> },
    { label: 'Tests', path: '/tests', icon: <TestIcon /> },
  ]
};

const NavigationBar = () => {
  const [role, setRole] = useState<'dev' | 'qa'>('dev');
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navItems = navConfig[role];
  const currentTab = navItems.findIndex(item => location.pathname === item.path);

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 100, mr: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={e => setRole(e.target.value as 'dev' | 'qa')}
            >
              <MenuItem value="dev">Developer</MenuItem>
              <MenuItem value="qa">QA</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Tabs
          value={currentTab === -1 ? false : currentTab}
          onChange={(_, idx) => navItems[idx] && navigate(navItems[idx].path)}
          textColor="primary"
          indicatorColor="primary"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{ minHeight: 48 }}
        >
          {navItems.map((item, idx) => (
            <Tab
              key={item.path}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              component={NavLink}
              to={item.path}
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar; 