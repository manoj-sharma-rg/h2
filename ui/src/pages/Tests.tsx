import React, { useState } from 'react';

const Tests = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setRunning(true);
    setError(null);
    setResults('');
    try {
      // TODO: Replace with actual API call to backend test runner
      // const res = await fetch('http://localhost:8000/api/v1/run-tests');
      // if (!res.ok) throw new Error('Failed to run tests');
      // const data = await res.text();
      // setResults(data);
      // Simulate test results for now
      await new Promise(r => setTimeout(r, 1500));
      setResults('All tests passed!\n\n- test_utils.py ... ok\n- test_plugins.py ... ok\n- test_api.py ... ok\n- test_wizard.py ... ok');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setRunning(false);
    }
  };

  const saveResults = () => {
    if (!results) return;
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_results.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Tests</h1>
      <button onClick={runTests} disabled={running} style={{ marginRight: 12 }}>
        {running ? 'Running...' : 'Run Tests'}
      </button>
      <button onClick={saveResults} disabled={!results}>
        Save Results
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 24, maxHeight: 400, overflowY: 'auto', background: '#222', color: '#fff', padding: 16, borderRadius: 8, fontFamily: 'monospace', fontSize: 15 }}>
        {results || (running ? 'Running tests...' : 'No results yet.')}
      </div>
    </div>
  );
};

export default Tests; 