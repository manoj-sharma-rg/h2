import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Alert, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, Stack, Checkbox } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
  const [search, setSearch] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPms, setEditingPms] = useState<any>(null);

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
    setEditingPms(pms);
    setEditName(pms.name || '');
    setEditDesc(pms.description || '');
    setEditCombinedAvailRate(!!pms.combined_avail_rate);
    setEditError(null);
    setEditSuccess(null);
    setEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingPms(null);
    setEditName('');
    setEditDesc('');
    setEditCombinedAvailRate(false);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPms) return;
    setSavingEdit(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDesc);
      formData.append('combined_avail_rate', String(editCombinedAvailRate));
      const res = await fetch(`${API_BASE}/pms/${editingPms.code}`, {
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

  // Filtered results
  const filteredPmsList = pmsList.filter((pms: any) => 
    pms.name?.toLowerCase().includes(search.toLowerCase()) ||
    pms.code?.toLowerCase().includes(search.toLowerCase()) ||
    pms.description?.toLowerCase().includes(search.toLowerCase())
  );

  // DataGrid columns
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'PMS Name', 
      flex: 1, 
      sortable: true, 
      filterable: true,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({params.row.code})
          </Typography>
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 2, 
      sortable: true, 
      filterable: true 
    },
    { 
      field: 'combined_avail_rate', 
      headerName: 'Combined Avail+Rate', 
      width: 150, 
      sortable: true, 
      filterable: true,
      renderCell: (params: any) => (
        params.row.combined_avail_rate ? (
          <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
            ✓ Yes
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No
          </Typography>
        )
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <IconButton 
            color="primary" 
            onClick={() => handleEdit(params.row)} 
            size="small"
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            onClick={() => handleDelete(params.row.code)} 
            disabled={deleting === params.row.code}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  // Prepare rows for DataGrid
  const rows = filteredPmsList.map((pms: any) => ({
    id: pms.code || pms.name,
    ...pms
  }));

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 400 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 600, mt: 2 }}>
        <CardContent>
          <Typography variant="h5" color="primary" fontWeight={700} gutterBottom align="center">
            Registered PMSs
          </Typography>
          <TextField
            label="Search PMS"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            placeholder="Search by name, code, or description..."
          />
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
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              initialState={{ pagination: { pageSize: 10 } }}
              disableSelectionOnClick
              sx={{ background: '#fafbfc', borderRadius: 2, mb: 2 }}
            />
          )}

          {/* Edit PMS Dialog */}
          <Dialog open={editDialogOpen} onClose={handleCancelEdit} fullWidth maxWidth="sm">
            <DialogTitle>Edit PMS: {editingPms?.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    fullWidth
                    required
                    disabled={savingEdit}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={savingEdit}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={editCombinedAvailRate}
                      onChange={e => setEditCombinedAvailRate(e.target.checked)}
                      disabled={savingEdit}
                    />
                    <Typography variant="body2">Combined Availability + Rate Messages</Typography>
                  </Box>
                </Grid>
              </Grid>
              {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
              {editSuccess && <Alert severity="success" sx={{ mt: 2 }}>{editSuccess}</Alert>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit} color="secondary" startIcon={<CancelIcon />} disabled={savingEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} color="primary" variant="contained" startIcon={<SaveIcon />} disabled={savingEdit}>
                {savingEdit ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PMSRegistration; 