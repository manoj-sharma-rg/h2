import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { ExpandMore, Code, Download } from '@mui/icons-material';

const API_BASE = 'http://localhost:8000/api/v1';

interface PMSWizardData {
  pmsCode: string;
  pmsName: string;
  pmsDescription: string;
  sampleAvailabilityMessage: string;
  sampleRateMessage: string;
  messageFormat: 'json' | 'xml' | 'graphql';
  availabilityMappings: Record<string, string>;
  rateMappings: Record<string, string>;
  customConversions: Record<string, string>;
  translatorCode: string;
  mappingYaml: string;
  combinedAvailRate?: boolean;
}

const PMSIntegrationWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [wizardData, setWizardData] = useState<PMSWizardData>({
    pmsCode: '',
    pmsName: '',
    pmsDescription: '',
    sampleAvailabilityMessage: '',
    sampleRateMessage: '',
    messageFormat: 'json',
    availabilityMappings: {},
    rateMappings: {},
    customConversions: {},
    translatorCode: '',
    mappingYaml: '',
    combinedAvailRate: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unmappedFields, setUnmappedFields] = useState<string[]>([]);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [currentMappingField, setCurrentMappingField] = useState('');
  const [currentMappingValue, setCurrentMappingValue] = useState('');

  const steps = [
    'PMS Information',
    'Message Format Analysis',
    'Mapping Configuration',
    'Code Generation & Registration'
  ];

  const handlePMSInfoChange = (field: keyof PMSWizardData, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleFinish();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setWizardData({
      pmsCode: '',
      pmsName: '',
      pmsDescription: '',
      sampleAvailabilityMessage: '',
      sampleRateMessage: '',
      messageFormat: 'json',
      availabilityMappings: {},
      rateMappings: {},
      customConversions: {},
      translatorCode: '',
      mappingYaml: '',
      combinedAvailRate: false
    });
    setError(null);
    setSuccess(null);
  };

  const analyzeMessageFormat = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/wizard/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pms_code: wizardData.pmsCode,
          availability_message: wizardData.sampleAvailabilityMessage,
          rate_message: wizardData.sampleRateMessage,
          message_format: wizardData.messageFormat
        })
      });

      if (!response.ok) throw new Error('Failed to analyze message format');
      
      const analysis = await response.json();
      
      setWizardData(prev => ({
        ...prev,
        availabilityMappings: analysis.availability_mappings || {},
        rateMappings: analysis.rate_mappings || {}
      }));
      
      setUnmappedFields(analysis.unmapped_fields || []);
      setSuccess('Message format analyzed successfully!');
      
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (type: 'availability' | 'rate', field: string, value: string) => {
    setWizardData(prev => ({
      ...prev,
      [`${type}Mappings`]: {
        ...prev[`${type}Mappings` as keyof PMSWizardData] as Record<string, string>,
        [field]: value
      }
    }));
  };

  const openMappingDialog = (field: string) => {
    setCurrentMappingField(field);
    setCurrentMappingValue('');
    setMappingDialogOpen(true);
  };

  const handleAddMapping = () => {
    if (currentMappingValue.trim()) {
      setWizardData(prev => ({
        ...prev,
        availabilityMappings: {
          ...prev.availabilityMappings,
          [currentMappingField]: currentMappingValue
        }
      }));
      setMappingDialogOpen(false);
    }
  };

  const generateCode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pms_code: wizardData.pmsCode,
          pms_name: wizardData.pmsName,
          availability_mappings: wizardData.availabilityMappings,
          rate_mappings: wizardData.rateMappings,
          custom_conversions: wizardData.customConversions,
          message_format: wizardData.messageFormat
        })
      });

      if (!response.ok) throw new Error('Failed to generate code');
      
      const generated = await response.json();
      
      setWizardData(prev => ({
        ...prev,
        translatorCode: generated.translator_code,
        mappingYaml: generated.mapping_yaml
      }));
      
      setSuccess('Code generated successfully!');
      
    } catch (err: any) {
      setError(err.message || 'Code generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Register PMS
      const pmsResponse = await fetch(`${API_BASE}/pms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: wizardData.pmsCode,
          name: wizardData.pmsName,
          description: wizardData.pmsDescription,
          combined_avail_rate: String(!!wizardData.combinedAvailRate)
        })
      });

      if (!pmsResponse.ok) throw new Error('Failed to register PMS');

      // Upload mapping
      const mappingBlob = new Blob([wizardData.mappingYaml], { type: 'application/x-yaml' });
      const mappingFile = new File([mappingBlob], `${wizardData.pmsCode}.yaml`, { type: 'application/x-yaml' });
      
      const mappingFormData = new FormData();
      mappingFormData.append('file', mappingFile);
      
      const mappingResponse = await fetch(`${API_BASE}/mappings/${wizardData.pmsCode}`, {
        method: 'POST',
        body: mappingFormData
      });

      if (!mappingResponse.ok) throw new Error('Failed to upload mapping');

      setSuccess('PMS integration completed successfully!');
      
    } catch (err: any) {
      setError(err.message || 'Integration failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadCode = (type: 'translator' | 'mapping') => {
    const content = type === 'translator' ? wizardData.translatorCode : wizardData.mappingYaml;
    const filename = type === 'translator' ? `${wizardData.pmsCode}_translator.py` : `${wizardData.pmsCode}.yaml`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 3, my: 2 }}>
            <Typography variant="h6" gutterBottom>PMS Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PMS Code"
                  value={wizardData.pmsCode}
                  onChange={(e) => handlePMSInfoChange('pmsCode', e.target.value)}
                  helperText="Unique identifier for the PMS (e.g., 'cloudbeds', 'bookingdotcom')"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PMS Name"
                  value={wizardData.pmsName}
                  onChange={(e) => handlePMSInfoChange('pmsName', e.target.value)}
                  helperText="Display name for the PMS"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={wizardData.pmsDescription}
                  onChange={(e) => handlePMSInfoChange('pmsDescription', e.target.value)}
                  helperText="Brief description of the PMS"
                />
              </Grid>
              <Grid item xs={12}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!wizardData.combinedAvailRate}
                    onChange={e => handlePMSInfoChange('combinedAvailRate', e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  This PMS sends combined availability+rate messages
                </label>
              </Grid>
            </Grid>
          </Paper>
        );

      case 1:
        return (
          <Paper sx={{ p: 3, my: 2 }}>
            <Typography variant="h6" gutterBottom>Message Format Analysis</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Message Format</InputLabel>
                  <Select
                    value={wizardData.messageFormat}
                    onChange={(e) => handlePMSInfoChange('messageFormat', e.target.value)}
                  >
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="xml">XML</MenuItem>
                    <MenuItem value="graphql">GraphQL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {wizardData.combinedAvailRate ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Sample Combined Availability+Rate Message"
                    value={wizardData.sampleAvailabilityMessage}
                    onChange={(e) => handlePMSInfoChange('sampleAvailabilityMessage', e.target.value)}
                    helperText="Paste a sample combined availability+rate message from the PMS"
                    placeholder='{"hotel_id": "123", "room_type": "KING", "available": true, "rate": 100.00, ...}'
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Sample Availability Message"
                      value={wizardData.sampleAvailabilityMessage}
                      onChange={(e) => handlePMSInfoChange('sampleAvailabilityMessage', e.target.value)}
                      helperText="Paste a sample availability message from the PMS"
                      placeholder='{"hotel_id": "123", "room_type": "KING", "available": true, ...}'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Sample Rate Message"
                      value={wizardData.sampleRateMessage}
                      onChange={(e) => handlePMSInfoChange('sampleRateMessage', e.target.value)}
                      helperText="Paste a sample rate message from the PMS"
                      placeholder='{"hotel_id": "123", "room_type": "KING", "rate": 100.00, ...}'
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={analyzeMessageFormat}
                  disabled={loading || (wizardData.combinedAvailRate ? !wizardData.sampleAvailabilityMessage : (!wizardData.sampleAvailabilityMessage || !wizardData.sampleRateMessage))}
                  startIcon={loading ? <CircularProgress size={20} /> : <Code />}
                >
                  {loading ? 'Analyzing...' : 'Analyze Message Format'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        );

      case 2:
        return (
          <Paper sx={{ p: 3, my: 2 }}>
            <Typography variant="h6" gutterBottom>Mapping Configuration</Typography>
            {wizardData.combinedAvailRate ? (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">Combined Mappings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(wizardData.availabilityMappings).map(([field, mapping]) => (
                      <Grid item xs={12} md={6} key={field}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            label="PMS Field"
                            value={field}
                            disabled
                            sx={{ flexGrow: 1 }}
                          />
                          <Typography>→</Typography>
                          <TextField
                            size="small"
                            label="RGBridge Field"
                            value={mapping}
                            onChange={(e) => handleMappingChange('availability', field, e.target.value)}
                            sx={{ flexGrow: 1 }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ) : (
              <>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Availability Mappings</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {Object.entries(wizardData.availabilityMappings).map(([field, mapping]) => (
                        <Grid item xs={12} md={6} key={field}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              label="PMS Field"
                              value={field}
                              disabled
                              sx={{ flexGrow: 1 }}
                            />
                            <Typography>→</Typography>
                            <TextField
                              size="small"
                              label="RGBridge Field"
                              value={mapping}
                              onChange={(e) => handleMappingChange('availability', field, e.target.value)}
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Rate Mappings</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {Object.entries(wizardData.rateMappings).map(([field, mapping]) => (
                        <Grid item xs={12} md={6} key={field}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              label="PMS Field"
                              value={field}
                              disabled
                              sx={{ flexGrow: 1 }}
                            />
                            <Typography>→</Typography>
                            <TextField
                              size="small"
                              label="RGBridge Field"
                              value={mapping}
                              onChange={(e) => handleMappingChange('rate', field, e.target.value)}
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </>
            )}
            {unmappedFields.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" color="warning.main">
                    Unmapped Fields ({unmappedFields.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    These fields were detected in your sample messages but don't have mappings yet.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {unmappedFields.map((field) => (
                      <Chip
                        key={field}
                        label={field}
                        onClick={() => openMappingDialog(field)}
                        clickable
                        color="warning"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        );

      case 3:
        return (
          <Paper sx={{ p: 3, my: 2 }}>
            <Typography variant="h6" gutterBottom>Code Generation & Registration</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={generateCode}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Code />}
                sx={{ mr: 2 }}
              >
                {loading ? 'Generating...' : 'Generate Code'}
              </Button>
              
              {wizardData.translatorCode && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => downloadCode('translator')}
                    startIcon={<Download />}
                    sx={{ mr: 2 }}
                  >
                    Download Translator
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => downloadCode('mapping')}
                    startIcon={<Download />}
                  >
                    Download Mapping
                  </Button>
                </>
              )}
            </Box>

            {wizardData.translatorCode && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">Generated Translator Code</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    value={wizardData.translatorCode}
                    InputProps={{ readOnly: true }}
                    sx={{ fontFamily: 'monospace' }}
                  />
                </AccordionDetails>
              </Accordion>
            )}

            {wizardData.mappingYaml && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">Generated Mapping YAML</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    value={wizardData.mappingYaml}
                    InputProps={{ readOnly: true }}
                    sx={{ fontFamily: 'monospace' }}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        PMS Integration Wizard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Automatically integrate a new PMS by analyzing message formats and generating translator code.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          <Button onClick={handleReset} sx={{ mr: 1 }}>
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>

      <Dialog open={mappingDialogOpen} onClose={() => setMappingDialogOpen(false)}>
        <DialogTitle>Add Mapping for "{currentMappingField}"</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="RGBridge Field"
            value={currentMappingValue}
            onChange={(e) => setCurrentMappingValue(e.target.value)}
            helperText="Enter the corresponding RGBridge field name"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMappingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMapping} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PMSIntegrationWizard; 