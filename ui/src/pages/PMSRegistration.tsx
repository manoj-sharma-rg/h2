import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, IconButton, TextField, Button, Alert, CircularProgress, Box, ListItemSecondaryAction, Stack, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const API_BASE = 'http://localhost:8000/api/v1';

const PMSRegistration = () => {
  const [pmsList, setPmsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCombinedAvailRate, setEditCombinedAvailRate] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchPMSList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/pms`);
      if (!res.ok) throw new Error('Failed to fetch PMS list');
      const data = await res.json();
      setPmsList(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPMSList();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete PMS '${code}'?`)) return;
    setDeleting(code);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/pms/${code}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete PMS');
      setDeleteSuccess(`PMS '${code}' deleted.`);
      await fetchPMSList();
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (pms: any) => {
    setEditing(pms.code);
    setEditName(pms.name || '');
    setEditDesc(pms.description || '');
    setEditCombinedAvailRate(!!pms.combined_avail_rate);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditName('');
    setEditDesc('');
    setEditCombinedAvailRate(false);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleSaveEdit = async (code: string) => {
    setSavingEdit(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDesc);
      formData.append('combined_avail_rate', String(editCombinedAvailRate));
      const res = await fetch(`${API_BASE}/pms/${code}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update PMS');
      setEditSuccess('PMS updated successfully!');
      await fetchPMSList();
      setTimeout(() => handleCancelEdit(), 1000);
    } catch (err: any) {
      setEditError(err.message || 'Unknown error');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 400 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 600, mt: 2 }}>
        <CardContent>
          <Typography variant="h5" color="primary" fontWeight={700} gutterBottom align="center">
            Registered PMSs
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>}
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>{editSuccess}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <List>
              {Array.isArray(pmsList) && pmsList.length === 0 && (
                <ListItem>
                  <ListItemText primary="No PMSs registered." />
                </ListItem>
              )}
              {Array.isArray(pmsList) && pmsList.map((pms: any) => (
                <ListItem key={pms.code || pms.name} alignItems="flex-start" sx={{ py: 1 }}>
                  {editing === pms.code ? (
                    <Stack direction="column" spacing={1} sx={{ width: '100%' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                        <TextField
                          label="Name"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          size="small"
                          required
                          disabled={savingEdit}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Description"
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          size="small"
                          disabled={savingEdit}
                          sx={{ flex: 2 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <Checkbox
                            checked={editCombinedAvailRate}
                            onChange={e => setEditCombinedAvailRate(e.target.checked)}
                            disabled={savingEdit}
                            size="small"
                          />
                          <Typography variant="body2">Combined Avail+Rate</Typography>
                        </Box>
                        <IconButton color="primary" onClick={() => handleSaveEdit(pms.code)} disabled={savingEdit} sx={{ ml: 1 }}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={handleCancelEdit} disabled={savingEdit}>
                          <CancelIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  ) : (
                    <>
                      <ListItemText
                        primary={<Typography variant="subtitle1" fontWeight={600}>{pms.name} <Typography component="span" variant="body2" color="text.secondary">({pms.code})</Typography></Typography>}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">{pms.description}</Typography>
                            {pms.combined_avail_rate && (
                              <Typography variant="caption" color="primary" sx={{ ml: 1 }}>[Combined Avail+Rate]</Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" color="primary" onClick={() => handleEdit(pms)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" color="error" onClick={() => handleDelete(pms.code)} disabled={deleting === pms.code}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PMSRegistration; 