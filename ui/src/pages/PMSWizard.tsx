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
  AccordionDetails,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  ListSubheader,
  Container,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { ExpandMore, Code, Download } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';

const API_BASE = 'http://localhost:8000/api/v1';

// Helper function to read file content
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

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
  specsDocument: File | null;
}

const availFields = [
  { value: 'HotelCode', label: 'HotelCode' },
  { value: 'InvCode', label: 'InvCode' },
  { value: 'RatePlanCode', label: 'RatePlanCode' },
  { value: 'Status', label: 'Status' },
  // ...add more as needed
];
const rateFields = [
  { value: 'HotelCode', label: 'HotelCode' },
  { value: 'InvCode', label: 'InvCode' },
  { value: 'RatePlanCode', label: 'RatePlanCode' },
  { value: 'AmountBeforeTax', label: 'AmountBeforeTax' },
  { value: 'AmountAfterTax', label: 'AmountAfterTax' },
  // ...add more as needed
];
const conversionTemplates = [
  'value / 100',
  'str(value)',
  'parse_date(value)',
  'value1 + value2',
];
function getFieldDescription(field: string) {
  // Add descriptions for RGBridge fields
  const descs: Record<string, string> = {
    HotelCode: 'Unique hotel identifier',
    InvCode: 'Room or inventory code',
    RatePlanCode: 'Rate plan code',
    AmountBeforeTax: 'Rate before tax',
    AmountAfterTax: 'Rate after tax',
    Status: 'Availability status',
  };
  return descs[field] || '';
}

// AI mapping suggestion function with backend integration
async function getAIMappingSuggestion({
  field,
  sampleMessage,
  rgbridgeFields,
  type,
  specsDocumentContent
}: {
  field: string;
  sampleMessage: string;
  rgbridgeFields: string[];
  type: 'availability' | 'rate';
  specsDocumentContent?: string;
}): Promise<{ suggestion: string | null, method: string | null }> {
  try {
    const payload: any = {
      field,
      sample_message: sampleMessage,
      rgbridge_fields: rgbridgeFields,
      type
    };
    
    // Include specs document content if available
    if (specsDocumentContent) {
      payload.specs_document_content = specsDocumentContent;
    }
    
    const response = await fetch(`${API_BASE}/wizard/suggest-mapping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to get mapping suggestion');
    const data = await response.json();
    return { suggestion: data.suggestion, method: data.method };
  } catch (e) {
    return { suggestion: null, method: null };
  }
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
    combinedAvailRate: false,
    specsDocument: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unmappedFields, setUnmappedFields] = useState<string[]>([]);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [currentMappingField, setCurrentMappingField] = useState('');
  const [currentMappingValue, setCurrentMappingValue] = useState('');
  const [mappingDialogType, setMappingDialogType] = useState<'availability' | 'rate'>('availability');
  const [mappingDialogFieldObj, setMappingDialogFieldObj] = useState<{ value: string, label: string } | null>(null);
  const [mappingDialogConversion, setMappingDialogConversion] = useState('');
  const [aiSuggestion, setAISuggestion] = useState<{ suggestion: string | null, method: string | null }>({ suggestion: null, method: null });
  const [aiLoading, setAILoading] = useState(false);

  const steps = [
    'PMS Information',
    'Message Format Analysis',
    'Mapping Configuration',
    'Code Generation & Registration'
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      combinedAvailRate: false,
      specsDocument: null
    });
    setError(null);
    setSuccess(null);
  };

  const analyzeMessageFormat = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let analyzePayload: any = {
        pms_code: wizardData.pmsCode,
        message_format: wizardData.messageFormat
      };
      
      // Include specs document content if available
      if (wizardData.specsDocument) {
        try {
          analyzePayload.specs_document_content = await readFileContent(wizardData.specsDocument);
        } catch (e) {
          console.warn('Failed to read specs document:', e);
        }
      }
      
      if (wizardData.sampleAvailabilityMessage && wizardData.sampleRateMessage) {
        analyzePayload.availability_message = wizardData.sampleAvailabilityMessage;
        analyzePayload.rate_message = wizardData.sampleRateMessage;
      } else if (wizardData.sampleAvailabilityMessage || wizardData.sampleRateMessage) {
        analyzePayload.combined_message = wizardData.sampleAvailabilityMessage || wizardData.sampleRateMessage;
      }
      
      const response = await fetch(`${API_BASE}/wizard/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyzePayload)
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
    setAISuggestion({ suggestion: null, method: null });
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

  const handleAddAdvancedMapping = () => {
    if (mappingDialogFieldObj) {
      handleMappingChange(mappingDialogType, currentMappingField, mappingDialogFieldObj.value);
      if (mappingDialogConversion.trim()) {
        setWizardData(prev => ({
          ...prev,
          customConversions: {
            ...prev.customConversions,
            [currentMappingField]: mappingDialogConversion.trim(),
          },
        }));
      }
      setMappingDialogOpen(false);
      setMappingDialogType('availability');
      setMappingDialogFieldObj(null);
      setMappingDialogConversion('');
    }
  };

  const handleAISuggest = async () => {
    setAILoading(true);
    setAISuggestion({ suggestion: null, method: null });
    try {
      let specsDocumentContent: string | undefined;
      if (wizardData.specsDocument) {
        specsDocumentContent = await readFileContent(wizardData.specsDocument);
      }
      
      const result = await getAIMappingSuggestion({
        field: currentMappingField,
        sampleMessage: mappingDialogType === 'availability' ? wizardData.sampleAvailabilityMessage : wizardData.sampleRateMessage,
        rgbridgeFields: mappingDialogType === 'availability' ? availFields.map(f => f.value) : rateFields.map(f => f.value),
        type: mappingDialogType,
        specsDocumentContent
      });
      setAISuggestion(result);
    } catch (e) {
      setAISuggestion({ suggestion: 'No suggestion found.', method: null });
    } finally {
      setAILoading(false);
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
    setSuccess(null);
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

      // Upload translator
      const translatorBlob = new Blob([wizardData.translatorCode], { type: 'text/x-python' });
      const translatorFile = new File([translatorBlob], `${wizardData.pmsCode}_translator.py`, { type: 'text/x-python' });
      const translatorFormData = new FormData();
      translatorFormData.append('file', translatorFile);
      const translatorResponse = await fetch(`${API_BASE}/translators/${wizardData.pmsCode}`, {
        method: 'POST',
        body: translatorFormData
      });
      if (!translatorResponse.ok) throw new Error('Failed to upload translator');

      setSuccess('PMS integration completed successfully! Mapping and translator uploaded.');
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
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Full Specs Document (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a complete specifications document for this PMS. This will be used for analysis, mapping, and doubt clearing during integration.
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handlePMSInfoChange('specsDocument', file);
                  }}
                  style={{ marginTop: 8 }}
                />
                {wizardData.specsDocument && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Selected: {wizardData.specsDocument.name} ({(wizardData.specsDocument.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                )}
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
                  {wizardData.specsDocument && (
                    <Chip 
                      label="With Specs" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                </Button>
                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                  </Alert>
                )}
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
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', background: theme.palette.background.default, p: { xs: 0, sm: 2 } }}>
      {/* AppBar/Header */}
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Optionally add a logo here */}
            <Typography variant="h5" color="primary" fontWeight={700} sx={{ letterSpacing: 1 }}>
              PMS Integration Wizard
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
        {steps.map((label, idx) => (
          <Step key={label} completed={activeStep > idx}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Main Card */}
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 700, mx: 'auto', p: { xs: 2, sm: 4 }, mb: 4, minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        {/* Success/Error Alerts */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons - fixed at bottom of card */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          px: { xs: 2, sm: 4 },
          py: 2,
          background: 'rgba(255,255,255,0.95)',
          borderTop: `1px solid ${theme.palette.divider}`,
          zIndex: 2
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
          >
            Back
          </Button>
          <Box>
            <Button onClick={handleReset} sx={{ mr: 1 }} size={isMobile ? 'small' : 'medium'} color="secondary">
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              size={isMobile ? 'small' : 'medium'}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Mapping Dialog (unchanged) */}
      <Dialog open={mappingDialogOpen} onClose={() => setMappingDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Mapping for "{currentMappingField}"</DialogTitle>
        <DialogContent>
          <RadioGroup
            row
            value={mappingDialogType || 'availability'}
            onChange={e => setMappingDialogType((e.target.value as 'availability' | 'rate'))}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="availability" control={<Radio />} label="Availability" />
            <FormControlLabel value="rate" control={<Radio />} label="Rate" />
          </RadioGroup>
          <Autocomplete
            options={mappingDialogType === 'rate' ? rateFields : availFields}
            groupBy={option => mappingDialogType === 'rate' ? 'Rate' : 'Availability'}
            getOptionLabel={option => option.label}
            value={mappingDialogFieldObj}
            onChange={(_, value) => setMappingDialogFieldObj(value)}
            renderInput={params => <TextField {...params} label="RGBridge Field" />}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            onClick={handleAISuggest}
            disabled={aiLoading}
            sx={{ mb: 2 }}
          >
            {aiLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            AI Suggest
            {wizardData.specsDocument && (
              <Chip 
                label="With Specs" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ ml: 1, height: 20 }}
              />
            )}
          </Button>
          {aiSuggestion.suggestion && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Suggested mapping: <strong>{aiSuggestion.suggestion}</strong>
              {aiSuggestion.method && (
                <span> (Source: {aiSuggestion.method === 'ai' ? 'AI' : 'Heuristic'})</span>
              )}
            </Alert>
          )}
          <Tooltip title={getFieldDescription(mappingDialogFieldObj?.value || '')}>
            <InfoIcon sx={{ mb: 2, ml: 1 }} />
          </Tooltip>
          <Autocomplete
            options={conversionTemplates}
            onChange={(_, value) => setMappingDialogConversion(value || '')}
            renderInput={params => <TextField {...params} label="Conversion Template (optional)" />}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Custom Conversion (optional)"
            value={mappingDialogConversion}
            onChange={e => setMappingDialogConversion(e.target.value)}
            placeholder="e.g. value / 100"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMappingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAdvancedMapping} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PMSIntegrationWizard; 