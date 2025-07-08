import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Button, Box, CircularProgress, Avatar } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SchemaIcon from '@mui/icons-material/Schema';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TestIcon from '@mui/icons-material/Science';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api/v1';

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
  const [stats, setStats] = useState({ pms: 0, mappings: 0, schemas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [pmsRes, mappingsRes, schemasRes] = await Promise.all([
          fetch(`${API_BASE}/pms`),
          fetch(`${API_BASE}/mappings`),
          fetch(`${API_BASE}/schemas`),
        ]);
        const pmsData = await pmsRes.json();
        const mappingsData = await mappingsRes.json();
        const schemasData = await schemasRes.json();
        setStats({
          pms: Array.isArray(pmsData) ? pmsData.length : 0,
          mappings: Array.isArray(mappingsData.mappings) ? mappingsData.mappings.length : 0,
          schemas: Array.isArray(schemasData.schemas) ? schemasData.schemas.length : 0,
        });
      } catch {
        setStats({ pms: 0, mappings: 0, schemas: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Registered PMSs',
      value: stats.pms,
      icon: <GroupIcon fontSize="large" />, color: 'primary.main',
    },
    {
      label: 'Mappings',
      value: stats.mappings,
      icon: <ListAltIcon fontSize="large" />, color: 'secondary.main',
    },
    {
      label: 'Schemas',
      value: stats.schemas,
      icon: <SchemaIcon fontSize="large" />, color: 'success.main',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 400 }}>
      <Grid container spacing={3} sx={{ mb: 3, width: '100%', maxWidth: 900 }} justifyContent="center">
        {statCards.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card elevation={2} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56, mr: 2 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {loading || stat.value === null ? <CircularProgress size={28} /> : stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
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