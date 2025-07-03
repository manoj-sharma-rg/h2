import React, { useEffect, useState, useRef } from 'react';

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

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to delete schema '${filename}'?`)) return;
    setDeleting(filename);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/schemas/${filename}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete schema');
      setDeleteSuccess(`Schema '${filename}' deleted.`);
      await fetchSchemas();
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <h1>Manage Schemas</h1>
      <form onSubmit={handleUpload} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#f6f8fa' }}>
        <h2>Upload New Schema</h2>
        <div style={{ marginBottom: 8 }}>
          <label>PMS Code: <input type="text" ref={uploadCodeRef} required disabled={uploading} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Schema File: <input type="file" ref={uploadFileRef} accept=".xsd,.json,.yaml,.yml" required disabled={uploading} /></label>
        </div>
        <button type="submit" disabled={uploading}>Upload</button>
        {uploading && <span style={{ marginLeft: 12 }}>Uploading...</span>}
        {uploadError && <span style={{ color: 'red', marginLeft: 12 }}>{uploadError}</span>}
        {uploadSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{uploadSuccess}</span>}
      </form>
      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}
      {deleteSuccess && <p style={{ color: 'green' }}>{deleteSuccess}</p>}
      {loading && <p>Loading schemas...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {schemas.length === 0 && <li>No schemas found.</li>}
          {schemas.map((filename) => (
            <li key={filename}>
              {filename}
              <button
                onClick={() => handleDelete(filename)}
                style={{ marginLeft: 8, color: 'red' }}
                disabled={deleting === filename}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Schemas; 