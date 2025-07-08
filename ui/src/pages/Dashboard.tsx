import React from 'react';
import { Card, CardContent, Typography, Grid, Button, Box } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SchemaIcon from '@mui/icons-material/Schema';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TestIcon from '@mui/icons-material/Science';
import { useNavigate } from 'react-router-dom';

const quickLinks = [
  { label: 'PMS Wizard', path: '/pms-wizard', icon: <BuildIcon /> },
  { label: 'Mappings', path: '/mappings', icon: <ListAltIcon /> },
  { label: 'Schemas', path: '/schemas', icon: <SchemaIcon /> },
  { label: 'PMS Registration', path: '/pms-registration', icon: <AssignmentIcon /> },
  { label: 'Test Harness', path: '/test-harness', icon: <VpnKeyIcon /> },
  { label: 'Tests', path: '/tests', icon: <TestIcon /> },
];

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <Card elevation={4} sx={{ maxWidth: 600, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h4" color="primary" fontWeight={700} gutterBottom align="center">
            Welcome to the PMS Integration Platform
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Use the quick links below to get started with PMS integration, mapping, schema management, and testing.
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {quickLinks.map(link => (
              <Grid item xs={12} sm={6} md={4} key={link.path}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={link.icon}
                  onClick={() => navigate(link.path)}
                  sx={{ minHeight: 48, fontWeight: 500 }}
                >
                  {link.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard; 