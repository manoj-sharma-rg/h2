import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, TextField, Button, Alert, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';

const API_BASE = 'http://localhost:8000/api/v1';

const Schemas = () => {
  const [schemas, setSchemas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const uploadCodeRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  const fetchSchemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/schemas`);
      if (!res.ok) throw new Error('Failed to fetch schemas');
      const data = await res.json();
      setSchemas(data.schemas || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
    // eslint-disable-next-line
  }, []);

  const handleShowUpload = () => {
    setShowUpload(true);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleCancelUpload = () => {
    setShowUpload(false);
    setUploadError(null);
    setUploadSuccess(null);
    if (uploadCodeRef.current) uploadCodeRef.current.value = '';
    if (uploadFileRef.current) uploadFileRef.current.value = '';
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    const code = uploadCodeRef.current?.value.trim();
    const file = uploadFileRef.current?.files?.[0];
    if (!code || !file) {
      setUploadError('PMS code and schema file are required.');
      setUploading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      const res = await fetch(`${API_BASE}/schemas/${code}`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload schema');
      setUploadSuccess('Schema uploaded successfully!');
      await fetchSchemas();
      if (uploadCodeRef.current) uploadCodeRef.current.value = '';
      if (uploadFileRef.current) uploadFileRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (filename: string) => {
    setToDelete(filename);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/schemas/${toDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete schema');
      setDeleteSuccess(`Schema '${toDelete}' deleted.`);
      await fetchSchemas();
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    } finally {
      setDeleting(null);
      setDeleteDialogOpen(false);
      setToDelete(null);
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: 'filename', headerName: 'Filename', flex: 1, sortable: true, filterable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <IconButton color="error" onClick={() => handleDelete(params.row.filename)} disabled={deleting === params.row.filename}>
          <DeleteIcon />
        </IconButton>
      ),
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  // Filtered rows
  const rows = schemas
    .filter(filename => filename.toLowerCase().includes(search.toLowerCase()))
    .map(filename => ({ id: filename, filename }));

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 400 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 800, mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" color="primary" fontWeight={700}>
              Manage Schemas
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleShowUpload}>
              Upload New Schema
            </Button>
          </Box>
          <TextField
            label="Search Filename"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          />
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>}
          {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
          {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>}
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

          {/* Upload Schema Dialog */}
          <Dialog open={showUpload} onClose={handleCancelUpload} fullWidth maxWidth="sm">
            <DialogTitle>Upload New Schema</DialogTitle>
            <form onSubmit={handleUpload}>
              <DialogContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="PMS Code"
                      inputRef={uploadCodeRef}
                      required
                      fullWidth
                      disabled={uploading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadFileIcon />} 
                      fullWidth
                      disabled={uploading}
                    >
                      Select Schema File
                      <input
                        type="file"
                        ref={uploadFileRef}
                        accept=".xsd,.json,.yaml,.yml"
                        required
                        hidden
                        disabled={uploading}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelUpload} color="secondary" startIcon={<CancelIcon />} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />} disabled={uploading}>
                  {uploading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                  Upload
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Delete Schema</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete schema '{toDelete}'?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} color="secondary" startIcon={<CancelIcon />}>Cancel</Button>
              <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>Delete</Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Schemas; 