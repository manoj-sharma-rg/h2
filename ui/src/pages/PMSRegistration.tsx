import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:8000/api/v1';

const PMSRegistration = () => {
  const [pmsList, setPmsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    const code = codeRef.current?.value.trim();
    const name = nameRef.current?.value.trim();
    const description = descRef.current?.value.trim();
    if (!code || !name) {
      setRegisterError('PMS code and name are required.');
      setRegistering(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('code', code);
      formData.append('name', name);
      formData.append('description', description || '');
      const res = await fetch(`${API_BASE}/pms`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to register PMS');
      setRegisterSuccess('PMS registered successfully!');
      if (codeRef.current) codeRef.current.value = '';
      if (nameRef.current) nameRef.current.value = '';
      if (descRef.current) descRef.current.value = '';
      await fetchPMSList();
    } catch (err: any) {
      setRegisterError(err.message || 'Unknown error');
    } finally {
      setRegistering(false);
    }
  };

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
    setEditError(null);
    setEditSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditName('');
    setEditDesc('');
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
    <div>
      <h1>PMS Registration</h1>
      <form onSubmit={handleRegister} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#f6f8fa' }}>
        <h2>Register New PMS</h2>
        <div style={{ marginBottom: 8 }}>
          <label>PMS Code: <input type="text" ref={codeRef} required disabled={registering} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Name: <input type="text" ref={nameRef} required disabled={registering} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Description: <input type="text" ref={descRef} disabled={registering} /></label>
        </div>
        <button type="submit" disabled={registering}>Register</button>
        {registering && <span style={{ marginLeft: 12 }}>Registering...</span>}
        {registerError && <span style={{ color: 'red', marginLeft: 12 }}>{registerError}</span>}
        {registerSuccess && <span style={{ color: 'green', marginLeft: 12 }}>{registerSuccess}</span>}
      </form>
      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}
      {deleteSuccess && <p style={{ color: 'green' }}>{deleteSuccess}</p>}
      <h2>Registered PMSs</h2>
      {loading && <p>Loading PMS list...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {Array.isArray(pmsList) && pmsList.length === 0 && <li>No PMSs registered.</li>}
          {Array.isArray(pmsList) && pmsList.map((pms: any) => (
            <li key={pms.code || pms.name}>
              {editing === pms.code ? (
                <form onSubmit={e => { e.preventDefault(); handleSaveEdit(pms.code); }} style={{ display: 'inline' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    disabled={savingEdit}
                    style={{ marginRight: 8 }}
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    disabled={savingEdit}
                    style={{ marginRight: 8 }}
                  />
                  <button type="submit" disabled={savingEdit}>Save</button>
                  <button type="button" onClick={handleCancelEdit} disabled={savingEdit} style={{ marginLeft: 4 }}>Cancel</button>
                  {savingEdit && <span style={{ marginLeft: 8 }}>Saving...</span>}
                  {editError && <span style={{ color: 'red', marginLeft: 8 }}>{editError}</span>}
                  {editSuccess && <span style={{ color: 'green', marginLeft: 8 }}>{editSuccess}</span>}
                </form>
              ) : (
                <>
                  <b>{pms.code}</b> - {pms.name} {pms.status && <span>({pms.status})</span>}
                  {pms.description && <span>: {pms.description}</span>}
                  <button
                    onClick={() => handleEdit(pms)}
                    style={{ marginLeft: 8 }}
                    disabled={deleting === pms.code}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pms.code)}
                    style={{ marginLeft: 8, color: 'red' }}
                    disabled={deleting === pms.code}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PMSRegistration; 