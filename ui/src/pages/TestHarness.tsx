import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, Select, MenuItem, TextField, Button, Alert, CircularProgress, Box, Grid, FormControl, InputLabel } from '@mui/material';

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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 400 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 800, mt: 2 }}>
        <CardContent>
          <Typography variant="h5" color="primary" fontWeight={700} gutterBottom align="center">
            Test Harness
          </Typography>
          {errorPMS && <Alert severity="error" sx={{ mb: 2 }}>{errorPMS}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>PMS</InputLabel>
                  <Select
                    value={selectedPMS}
                    label="PMS"
                    onChange={e => setSelectedPMS(e.target.value)}
                    disabled={loadingPMS || submitting}
                  >
                    {pmsList.map((pms: any) => (
                      <MenuItem key={pms.code} value={pms.code}>
                        {pms.name || pms.code}
                        {pms.combined_avail_rate && ' [Combined Avail+Rate]'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Message Type</InputLabel>
                  <Select
                    value={messageType}
                    label="Message Type"
                    onChange={e => setMessageType(e.target.value)}
                    disabled={submitting}
                  >
                    <MenuItem value="availability">Availability</MenuItem>
                    <MenuItem value="rate">Rate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Sample PMS Message"
                  value={sample}
                  onChange={e => setSample(e.target.value)}
                  multiline
                  minRows={8}
                  fullWidth
                  inputRef={sampleRef}
                  placeholder="Paste JSON or XML PMS message here"
                  disabled={submitting}
                  sx={{ fontFamily: 'monospace' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting || !selectedPMS || !sample}
                  fullWidth
                  sx={{ minHeight: 48, fontWeight: 500 }}
                >
                  {submitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
          {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
          {result && (
            <Card elevation={2} sx={{ mt: 4, background: '#fafbfc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Translation Result</Typography>
                {selectedPMSConfig && selectedPMSConfig.combined_avail_rate && result.availability && result.rate ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Availability</Typography>
                      <Typography variant="body2"><b>Valid:</b> {String(result.availability.valid)}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}><b>XML Output:</b></Typography>
                      <Box component="pre" sx={{ background: '#222', color: '#fff', p: 2, borderRadius: 2, overflowX: 'auto', mt: 1 }}>{result.availability.xml}</Box>
                      {result.availability.translated && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight={500}>Raw Translation Output</Typography>
                          <Box component="pre" sx={{ background: '#eee', p: 2, borderRadius: 2, overflowX: 'auto' }}>{JSON.stringify(result.availability.translated, null, 2)}</Box>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Rate</Typography>
                      <Typography variant="body2"><b>Valid:</b> {String(result.rate.valid)}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}><b>XML Output:</b></Typography>
                      <Box component="pre" sx={{ background: '#222', color: '#fff', p: 2, borderRadius: 2, overflowX: 'auto', mt: 1 }}>{result.rate.xml}</Box>
                      {result.rate.translated && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight={500}>Raw Translation Output</Typography>
                          <Box component="pre" sx={{ background: '#eee', p: 2, borderRadius: 2, overflowX: 'auto' }}>{JSON.stringify(result.rate.translated, null, 2)}</Box>
                        </Box>
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2"><b>Valid:</b> {String(result.valid)}</Typography>
                    {result.error && (
                      <Typography variant="body2" color="error"><b>Error:</b> {result.error}</Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 2 }}><b>XML Output:</b></Typography>
                    <Box component="pre" sx={{ background: '#222', color: '#fff', p: 2, borderRadius: 2, overflowX: 'auto', mt: 1 }}>{result.xml}</Box>
                    {result.translated && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight={500}>Raw Translation Output</Typography>
                        <Box component="pre" sx={{ background: '#eee', p: 2, borderRadius: 2, overflowX: 'auto' }}>{JSON.stringify(result.translated, null, 2)}</Box>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestHarness; 