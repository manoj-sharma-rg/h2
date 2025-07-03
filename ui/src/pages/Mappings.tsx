import React, { useEffect, useState, useRef } from 'react';

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

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete mapping '${code}'?`)) return;
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/mappings/${code}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete mapping');
      setDeleteSuccess(`Mapping '${code}' deleted.`);
      await fetchMappings();
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    }
  };

  return (
    <div>
      <h1>Manage Mappings</h1>
      <button onClick={handleShowUpload} style={{ marginBottom: 16 }}>Upload New Mapping</button>
      {showUpload && (
        <form onSubmit={handleUpload} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#f6f8fa' }}>
          <h2>Upload New Mapping</h2>
          <div style={{ marginBottom: 8 }}>
            <label>PMS Code: <input type="text" ref={uploadCodeRef} required disabled={uploading} /></label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>YAML File: <input type="file" ref={uploadFileRef} accept=".yaml,.yml" required disabled={uploading} /></label>
          </div>
          <button type="submit" disabled={uploading}>Upload</button>
          <button type="button" onClick={handleCancelUpload} style={{ marginLeft: 8 }} disabled={uploading}>Cancel</button>
          {uploading && <span style={{ marginLeft: 12 }}>Uploading...</span>}
          {uploadError && <span style={{ color: 'red', marginLeft: 12 }}>{uploadError}</span>}
          {uploadSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{uploadSuccess}</span>}
        </form>
      )}
      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}
      {deleteSuccess && <p style={{ color: 'green' }}>{deleteSuccess}</p>}
      {loading && <p>Loading mappings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {mappings.length === 0 && <li>No mappings found.</li>}
          {mappings.map((code) => (
            <li key={code}>
              {code}
              {' '}
              <button onClick={() => handleViewEdit(code)}>View/Edit</button>
              <button onClick={() => handleDelete(code)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      {editing && selected && (
        <div style={{ marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#fafbfc' }}>
          <h2>Editing: {selected}.yaml</h2>
          {yamlLoading && <p>Loading YAML...</p>}
          {yamlError && <p style={{ color: 'red' }}>{yamlError}</p>}
          {!yamlLoading && !yamlError && (
            <>
              <textarea
                value={yaml}
                onChange={e => setYaml(e.target.value)}
                rows={20}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }}
                disabled={saving}
              />
              <div style={{ marginTop: 12 }}>
                <button onClick={handleSave} disabled={saving}>Save</button>
                <button onClick={handleCancel} style={{ marginLeft: 8 }} disabled={saving}>Cancel</button>
                <button onClick={handleValidate} disabled={saving || validating} style={{ marginLeft: 8 }}>Validate</button>
                {saving && <span style={{ marginLeft: 12 }}>Saving...</span>}
                {validating && <span style={{ marginLeft: 12 }}>Validating...</span>}
                {saveError && <span style={{ color: 'red', marginLeft: 12 }}>{saveError}</span>}
                {saveSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{saveSuccess}</span>}
              </div>
              {validationResult && (
                <div style={{ marginTop: 10 }}>
                  {validationResult.valid ? (
                    <span style={{ color: 'green' }}>YAML is valid!</span>
                  ) : (
                    <span style={{ color: 'red' }}>Invalid YAML: {validationResult.error}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Mappings; 