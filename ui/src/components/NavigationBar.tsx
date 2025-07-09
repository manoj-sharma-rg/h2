import React, { useState } from 'react';
import { AppBar, Toolbar, Tabs, Tab, Box, Select, MenuItem, InputLabel, FormControl, useMediaQuery, useTheme, IconButton, Menu, Avatar, Typography } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SchemaIcon from '@mui/icons-material/Schema';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TestIcon from '@mui/icons-material/Science';
import AccountCircle from '@mui/icons-material/AccountCircle';

const navConfig = {
  dev: [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'PMS Wizard', path: '/pms-wizard', icon: <BuildIcon /> },
    { label: 'PMS Registration', path: '/pms-registration', icon: <AssignmentIcon /> },
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

  // User menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{
      background: 'linear-gradient(90deg, #a8c0ff 0%, #b8a9c9 100%)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Logo and App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Placeholder for logo */}
          <Box sx={{ 
            width: 40, 
            height: 40, 
            background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mr: 1,
            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
          }}>
            <Typography variant="h6" color="white" fontWeight={700} sx={{ fontSize: 20 }}>
              P
            </Typography>
          </Box>
          <Typography variant="h6" color="white" fontWeight={700} sx={{ 
            letterSpacing: 1, 
            mr: 2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            PMS Platform
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="role-select-label" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={e => setRole(e.target.value as 'dev' | 'qa')}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)'
                },
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              }}
            >
              <MenuItem value="dev">Developer</MenuItem>
              <MenuItem value="qa">QA</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* Navigation Tabs */}
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
        {/* User/Account Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <IconButton size="large" edge="end" color="inherit" onClick={handleMenu}>
            <AccountCircle fontSize="large" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar; 