import React, { useEffect, useState, useRef } from 'react';

const API_BASE = 'http://localhost:8000/api/v1';

const TestHarness = () => {
  const [pmsList, setPmsList] = useState<any[]>([]);
  const [loadingPMS, setLoadingPMS] = useState(true);
  const [errorPMS, setErrorPMS] = useState<string | null>(null);
  const [selectedPMS, setSelectedPMS] = useState('');
  const [selectedPMSConfig, setSelectedPMSConfig] = useState<any>(null);
  const [messageType, setMessageType] = useState('availability');
  const [sample, setSample] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sampleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchPMSList = async () => {
      setLoadingPMS(true);
      setErrorPMS(null);
      try {
        const res = await fetch(`${API_BASE}/pms`);
        if (!res.ok) throw new Error('Failed to fetch PMS list');
        const data = await res.json();
        let list: any[] = [];
        if (Array.isArray(data.endpoints)) {
          list = data.endpoints.map((code: string) => ({ code }));
        } else if (Array.isArray(data)) {
          list = data;
        }
        setPmsList(list);
        if (list.length > 0) {
          setSelectedPMS(list[0].code);
          setSelectedPMSConfig(list[0]);
        }
      } catch (err: any) {
        setErrorPMS(err.message || 'Unknown error');
      } finally {
        setLoadingPMS(false);
      }
    };
    fetchPMSList();
  }, []);

  useEffect(() => {
    const found = pmsList.find(p => p.code === selectedPMS);
    setSelectedPMSConfig(found || null);
  }, [selectedPMS, pmsList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/translate/${selectedPMS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_type: messageType, sample }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setSubmitError(err.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Test Harness</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#f6f8fa' }}>
        <div style={{ marginBottom: 8 }}>
          <label>PMS:
            <select
              value={selectedPMS}
              onChange={e => setSelectedPMS(e.target.value)}
              disabled={loadingPMS || submitting}
              style={{ marginLeft: 8 }}
            >
              {pmsList.map((pms: any) => (
                <option key={pms.code} value={pms.code}>{pms.name || pms.code}</option>
              ))}
            </select>
            {selectedPMSConfig && selectedPMSConfig.combined_avail_rate && (
              <span style={{ color: '#1976d2', marginLeft: 12 }}>[Combined Avail+Rate]</span>
            )}
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Message Type:
            <select
              value={messageType}
              onChange={e => setMessageType(e.target.value)}
              disabled={submitting}
              style={{ marginLeft: 8 }}
            >
              <option value="availability">Availability</option>
              <option value="rate">Rate</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Sample PMS Message:</label>
          <textarea
            ref={sampleRef}
            value={sample}
            onChange={e => setSample(e.target.value)}
            rows={10}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }}
            disabled={submitting}
            placeholder="Paste JSON or XML PMS message here"
          />
        </div>
        <button type="submit" disabled={submitting || !selectedPMS || !sample}>Submit</button>
        {submitting && <span style={{ marginLeft: 12 }}>Submitting...</span>}
        {submitError && <span style={{ color: 'red', marginLeft: 12 }}>{submitError}</span>}
      </form>
      {result && (
        <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#fafbfc' }}>
          <h2>Translation Result</h2>
          {selectedPMSConfig && selectedPMSConfig.combined_avail_rate && result.availability && result.rate ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <b>Availability</b>
                <div><b>Valid:</b> {String(result.availability.valid)}</div>
                <div style={{ marginTop: 8 }}>
                  <b>XML Output:</b>
                  <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{result.availability.xml}</pre>
                </div>
                {result.availability.translated && (
                  <details style={{ marginTop: 8 }}>
                    <summary>Raw Translation Output</summary>
                    <pre style={{ background: '#eee', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(result.availability.translated, null, 2)}</pre>
                  </details>
                )}
              </div>
              <div>
                <b>Rate</b>
                <div><b>Valid:</b> {String(result.rate.valid)}</div>
                <div style={{ marginTop: 8 }}>
                  <b>XML Output:</b>
                  <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{result.rate.xml}</pre>
                </div>
                {result.rate.translated && (
                  <details style={{ marginTop: 8 }}>
                    <summary>Raw Translation Output</summary>
                    <pre style={{ background: '#eee', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(result.rate.translated, null, 2)}</pre>
                  </details>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <b>Valid:</b> {String(result.valid)}
              </div>
              {result.error && (
                <div style={{ color: 'red' }}><b>Error:</b> {result.error}</div>
              )}
              <div style={{ marginTop: 12 }}>
                <b>XML Output:</b>
                <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{result.xml}</pre>
              </div>
              {result.translated && (
                <details style={{ marginTop: 12 }}>
                  <summary>Raw Translation Output</summary>
                  <pre style={{ background: '#eee', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(result.translated, null, 2)}</pre>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TestHarness; 