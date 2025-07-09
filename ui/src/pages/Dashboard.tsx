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
  { label: 'PMS Wizard', path: '/pms-wizard', icon: <BuildIcon fontSize="small" /> },
  { label: 'Mappings', path: '/mappings', icon: <ListAltIcon fontSize="small" /> },
  { label: 'Schemas', path: '/schemas', icon: <SchemaIcon fontSize="small" /> },
  { label: 'PMS Registration', path: '/pms-registration', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Test Harness', path: '/test-harness', icon: <VpnKeyIcon fontSize="small" /> },
  { label: 'Tests', path: '/tests', icon: <TestIcon fontSize="small" /> },
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
      icon: <GroupIcon fontSize="medium" />, 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff'
    },
    {
      label: 'Mappings',
      value: stats.mappings,
      icon: <ListAltIcon fontSize="medium" />, 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#ffffff'
    },
    {
      label: 'Schemas',
      value: stats.schemas,
      icon: <SchemaIcon fontSize="medium" />, 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#ffffff'
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 400 }}>
      <Grid container spacing={3} sx={{ mb: 4, width: '100%', maxWidth: 900 }} justifyContent="center">
        {statCards.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card elevation={8} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 3,
              background: stat.gradient,
              color: stat.color,
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 48, 
                height: 48, 
                mr: 3,
                backdropFilter: 'blur(10px)'
              }}>
                {React.cloneElement(stat.icon, { fontSize: 'medium' })}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {loading || stat.value === null ? <CircularProgress size={32} sx={{ color: '#ffffff' }} /> : stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card elevation={8} sx={{ 
        maxWidth: 700, 
        width: '100%', 
        p: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 4
      }}>
        <CardContent>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            textAlign: 'center',
            mb: 2,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to the PMS Integration Platform
          </Typography>
          <Typography variant="h6" sx={{ 
            textAlign: 'center', 
            mb: 4,
            color: '#7f8c8d',
            fontWeight: 400
          }}>
            Use the quick links below to get started with PMS integration, mapping, schema management, and testing.
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {quickLinks.map((link, index) => (
              <Grid item xs={12} sm={6} md={4} key={link.path}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={link.icon}
                  onClick={() => navigate(link.path)}
                  sx={{ 
                    minHeight: 56, 
                    fontWeight: 600,
                    fontSize: '1rem',
                    background: `linear-gradient(45deg, ${index % 3 === 0 ? '#667eea' : index % 3 === 1 ? '#f093fb' : '#4facfe'}, ${index % 3 === 0 ? '#764ba2' : index % 3 === 1 ? '#f5576c' : '#00f2fe'})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${index % 3 === 0 ? '#5a6fd8' : index % 3 === 1 ? '#e085e8' : '#45a0f0'}, ${index % 3 === 0 ? '#6a4190' : index % 3 === 1 ? '#e04a5a' : '#00d4e0'})`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
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