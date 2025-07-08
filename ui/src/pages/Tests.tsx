import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Alert, CircularProgress, Box, Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';

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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 400 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 700, mt: 2 }}>
        <CardContent>
          <Typography variant="h5" color="primary" fontWeight={700} gutterBottom align="center">
            Tests
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button
                onClick={runTests}
                disabled={running}
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                fullWidth
                sx={{ minHeight: 48, fontWeight: 500 }}
              >
                {running ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                {running ? 'Running...' : 'Run Tests'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                onClick={saveResults}
                disabled={!results}
                variant="outlined"
                color="secondary"
                startIcon={<SaveIcon />}
                fullWidth
                sx={{ minHeight: 48, fontWeight: 500 }}
              >
                Save Results
              </Button>
            </Grid>
          </Grid>
          <Card elevation={1} sx={{ background: '#222', color: '#fff', p: 2, borderRadius: 2, minHeight: 200, fontFamily: 'monospace', fontSize: 15 }}>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {results || (running ? 'Running tests...' : 'No results yet.')}
            </Box>
          </Card>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Tests; 