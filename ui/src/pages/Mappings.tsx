import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, TextField, Button, Alert, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Snackbar, IconButton } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const API_BASE = 'http://localhost:8000/api/v1';

const Mappings = () => {
  const [mappings, setMappings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [yaml, setYaml] = useState<string>('');
  const [yamlLoading, setYamlLoading] = useState(false);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{valid: boolean, error?: string} | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const uploadCodeRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  const fetchMappings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/mappings`);
      if (!res.ok) throw new Error('Failed to fetch mappings');
      const data = await res.json();
      setMappings(data.mappings || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
    // eslint-disable-next-line
  }, []);

  const handleViewEdit = async (code: string) => {
    setSelected(code);
    setYaml('');
    setYamlError(null);
    setYamlLoading(true);
    setEditing(false);
    setSaveError(null);
    setSaveSuccess(null);
    setValidationResult(null);
    try {
      const res = await fetch(`${API_BASE}/mappings/${code}`);
      if (!res.ok) throw new Error('Failed to fetch mapping');
      const data = await res.json();
      setYaml(data.mapping || '');
      setEditing(true);
    } catch (err: any) {
      setYamlError(err.message || 'Unknown error');
    } finally {
      setYamlLoading(false);
    }
  };

  const handleCancel = () => {
    setSelected(null);
    setYaml('');
    setYamlError(null);
    setEditing(false);
    setSaveError(null);
    setSaveSuccess(null);
    setValidationResult(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const formData = new FormData();
      const blob = new Blob([yaml], { type: 'text/yaml' });
      formData.append('file', blob, `${selected}.yaml`);
      const res = await fetch(`${API_BASE}/mappings/${selected}`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to save mapping');
      setSaveSuccess('Mapping saved successfully!');
    } catch (err: any) {
      setSaveError(err.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!selected) return;
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await fetch(`${API_BASE}/mappings/${selected}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/yaml' },
        body: yaml,
      });
      if (!res.ok) throw new Error('Validation failed');
      const data = await res.json();
      setValidationResult(data);
    } catch (err: any) {
      setValidationResult({ valid: false, error: err.message || 'Unknown error' });
    } finally {
      setValidating(false);
    }
  };

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
      setUploadError('PMS code and YAML file are required.');
      setUploading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file, `${code}.yaml`);
      const res = await fetch(`${API_BASE}/mappings/${code}`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload mapping');
      setUploadSuccess('Mapping uploaded successfully!');
      await fetchMappings();
      handleCancelUpload();
    } catch (err: any) {
      setUploadError(err.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (code: string) => {
    setToDelete(code);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/mappings/${toDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete mapping');
      setDeleteSuccess(`Mapping '${toDelete}' deleted.`);
      await fetchMappings();
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    } finally {
      setDeleteDialogOpen(false);
      setToDelete(null);
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: 'code', headerName: 'PMS Code', flex: 1, sortable: true, filterable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <IconButton color="primary" onClick={() => handleViewEdit(params.row.code)} sx={{ mr: 1 }}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.code)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  // Filtered rows
  const rows = mappings
    .filter(code => code.toLowerCase().includes(search.toLowerCase()))
    .map(code => ({ id: code, code }));

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 400 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 800, mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" color="primary" fontWeight={700}>
              Manage Mappings
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleShowUpload}>
              Upload New Mapping
            </Button>
          </Box>
          <TextField
            label="Search PMS Code"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          />
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>}
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}
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

          {/* Edit Mapping Dialog */}
          <Dialog open={!!selected} onClose={handleCancel} fullWidth maxWidth="md">
            <DialogTitle>Edit Mapping: {selected}</DialogTitle>
            <DialogContent>
              {yamlLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : yamlError ? (
                <Alert severity="error">{yamlError}</Alert>
              ) : (
                <TextField
                  label="YAML Mapping"
                  value={yaml}
                  onChange={e => setYaml(e.target.value)}
                  multiline
                  minRows={12}
                  fullWidth
                  variant="outlined"
                  sx={{ fontFamily: 'monospace', mt: 2 }}
                />
              )}
              {validationResult && (
                <Alert severity={validationResult.valid ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {validationResult.valid ? 'Mapping is valid!' : `Invalid: ${validationResult.error}`}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleValidate} color="secondary" disabled={validating || yamlLoading}>
                {validating ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                Validate
              </Button>
              <Button onClick={handleSave} color="primary" variant="contained" startIcon={<SaveIcon />} disabled={saving || yamlLoading}>
                {saving ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                Save
              </Button>
              <Button onClick={handleCancel} color="secondary" startIcon={<CancelIcon />}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          {/* Upload Mapping Dialog */}
          <Dialog open={showUpload} onClose={handleCancelUpload} fullWidth maxWidth="sm">
            <DialogTitle>Upload New Mapping</DialogTitle>
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
                      Select YAML File
                      <input
                        type="file"
                        ref={uploadFileRef}
                        accept=".yaml,.yml"
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
            <DialogTitle>Delete Mapping</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete mapping '{toDelete}'?</Typography>
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

export default Mappings; 