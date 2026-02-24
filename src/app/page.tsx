'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Container, Typography, Box, Paper, Button, Dialog, 
  DialogContent, Stack,
  TextField,
  InputAdornment,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Collapse
} from '@mui/material';
import { 
  FileDownload as DownloadIcon, 
  FolderZip as FolderIcon,
  Filter2 as Filter2Icon,
  Filter3 as Filter3Icon
} from '@mui/icons-material';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ImageRow } from '../types';
import { UploadZone } from '../components/UploadZone';
import { ImageTable } from '../components/ImageTable';
import { useSnackbar } from 'notistack';

// --- Main Page Component ---
export default function PhotoLabelerPage() {

  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = useState<ImageRow[]>([]);
  const [zipName, setZipName] = useState('labeled_images');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [groupSize, setGroupSize] = useState<number>(2);

  useEffect(() => { setHasMounted(true); }, []);

  // -- File Upload Logic --
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newRows: ImageRow[] = acceptedFiles.map(file => ({
      id: `${file.name}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      originalName: file.name,
      newName: '',
      status: 'pending'
    }));
    setRows(prev => [...prev, ...newRows]);
  }, []);

  const updateRowName = (id: string, newName: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, newName } : r));
  };

  // -- OCR Logic (Pairs) --
  const runOCR = async () => {
    if (!apiKey) {
      enqueueSnackbar("Please enter your Google API Key first.", { variant: 'error' });
      return;
    }
    
    setIsProcessing(true);

    for (let i = 0; i < rows.length; i += groupSize) {
      const firstRow = rows[i];
      if (!firstRow || firstRow.status === 'completed') continue;

      setRows(prev => prev.map(r => r.id === firstRow.id ? { ...r, status: 'processing' } : r));

      try {
        const formData = new FormData();
        formData.append("file", firstRow.file);

        const response = await fetch("/api/ocr", { 
          method: "POST", 
          body: formData, 
          headers: { "x-api-key": apiKey } 
        });

        const data = await response.json();
        

        const detectedLabel = data.text?.trim() || "UNKNOWN";
        const sanitizedLabel = detectedLabel.replace(/[/\\?%*:|"<>]/g, '-');

        setRows(prev => {
          const newItems = [...prev];
          const idx1 = newItems.findIndex(r => r.id === firstRow.id);
          if (idx1 !== -1) {
            newItems[idx1] = { ...newItems[idx1], newName: sanitizedLabel, status: 'completed' };
            if (groupSize >= 2 && newItems[idx1 + 1]) {
              newItems[idx1 + 1] = { ...newItems[idx1 + 1], newName: `${sanitizedLabel}-2`, status: 'completed' };
            }
            if (groupSize === 3 && newItems[idx1 + 2]) {
              newItems[idx1 + 2] = { ...newItems[idx1 + 2], newName: `${sanitizedLabel}-3`, status: 'completed' };
            }
          }
          return newItems;
        });

      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(`Error: ${error.message}`, { 
          variant: 'error',
          autoHideDuration: 5000 
        });
        
        setRows(prev => prev.map(r => r.id === firstRow.id ? { ...r, status: 'error' } : r));
      }
    }
    setIsProcessing(false);
  };

  // -- Export Logic --
  const downloadZip = async () => {
    const zip = new JSZip();
    rows.forEach(row => {
      const extension = row.file.name.split('.').pop();
      const fileName = row.newName ? `${row.newName}.${extension}` : row.originalName;
      zip.file(fileName, row.file);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${zipName.replace(/\s+/g, '_')}.zip`);  
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Photo Labels');

    const columns = [
        { header: 'New Label (Pair)', key: 'newLabel', width: 30 },
        { header: 'Image 2 (Associated)', key: 'img2', width: 40 },
        { header: 'Image 1 (Sticker)', key: 'img1', width: 40 },
      ];
      
      if (groupSize === 3) columns.push({ header: 'Image 3', key: 'img3', width: 35 });
      worksheet.columns = columns;

      const addImageToCell = async (file: File, colNumber: number, rowNumber: number) => {
        try {
          const buffer = await file.arrayBuffer();
          const imageId = workbook.addImage({
            buffer,
            extension: file.type.split('/')[1] as 'jpeg' | 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: colNumber - 0.95, row: rowNumber - 0.95 },
            ext: { width: 120, height: 90 },
            editAs: 'undefined'
          });
        } catch (err) { console.error(err); }
      };


      for (let i = 0; i < rows.length; i += groupSize) {
            const g = rows.slice(i, i + groupSize);
            const excelRow = worksheet.addRow({ newLabel: g[0]?.newName || 'N/A' });
            excelRow.height = 80;

            for (let j = 0; j < g.length; j++) {
              // עמודה 1 היא הטקסט, לכן התמונות מתחילות מעמודה 2
              await addImageToCell(g[j].file, j + 2, excelRow.number);
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${zipName.replace(/\s+/g, '_')}-report.xlsx`);
      };

  if (!hasMounted) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          Photo Labeler Pro
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload pairs of images. The first image should have a yellow sticker (ACC or R).
        </Typography>
      </Box>

      {/* Dynamic Dropzone */}
      <UploadZone hasFiles={rows.length > 0} onUpload={onDrop}/>

     <Box mb={4}>
      <TextField
        fullWidth 
        label="Google Gemini API Key" 
        type="password" 
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Paste your API key here..."
        variant="outlined"
        helperText={
          <Typography variant="caption">
            Get a free key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>
          </Typography>
        }
      />
      </Box>

      {rows.length > 0 && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold">{rows.length} Images loaded (Sorted by pairs)</Typography>
            <ToggleButtonGroup
                value={groupSize}
                exclusive
                onChange={(_, val) => val && setGroupSize(val)}
                size="small"
                color="primary"
              >
                <ToggleButton value={2}><Filter2Icon sx={{ mr: 1 }}/> Pairs</ToggleButton>
                <ToggleButton value={3}><Filter3Icon sx={{ mr: 1 }}/> Triplets</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Stack direction="row" spacing={2}>
               <Button variant="outlined" color="error" size="small" onClick={() => setRows([])}>Clear All</Button>
               <Button variant="contained" color="secondary" onClick={runOCR} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Process All ${groupSize === 2 ? 'Pairs' : 'Triplets'}`}
              </Button>
            </Stack>
          </Box>

          <ImageTable 
            rows={rows}
            onPreview={setPreviewImage}
            onDelete={(id: string) => setRows(prev => prev.filter(r => r.id !== id))}
            onReorder={setRows}
            updateRowName={updateRowName}
            groupSize={groupSize}
          />

          <Paper variant="outlined" sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" justifyContent="center">
              <TextField
                label="File Name"
                variant="outlined"
                size="small"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><FolderIcon color="action" /></InputAdornment> }}
              />
              <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={downloadZip} disabled={isProcessing || rows.length === 0}>
                Download ZIP
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadExcel} disabled={isProcessing}>
              Export Excel
            </Button>
            </Stack>
          </Paper>
        </>
      )}

      {/* Image Zoom Dialog */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0, bgcolor: 'black', display: 'flex', justifyContent: 'center' }}>
          {previewImage && <img src={previewImage} alt="zoom" style={{ maxWidth: '100%', maxHeight: '80vh' }} />}
        </DialogContent>
      </Dialog>
    </Container>
  );
}