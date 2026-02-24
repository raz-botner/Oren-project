import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (files: File[]) => void;
  hasFiles: boolean;
}

export const UploadZone = ({ onUpload, hasFiles }: Props) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: { 'image/*': [] }
  });

  return (
    <Paper
      {...getRootProps()}
      variant="outlined"
      sx={{
        p: hasFiles ? 2 : 6,
        mb: 4, textAlign: 'center', borderStyle: 'dashed', borderWidth: 2,
        bgcolor: isDragActive ? '#e3f2fd' : '#fbfbfb',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <input {...getInputProps()} />
      <Stack direction={hasFiles ? "row" : "column"} spacing={2} alignItems="center" justifyContent="center">
        <CloudUploadIcon color="primary" fontSize={hasFiles ? "medium" : "large"} />
        <Typography variant={hasFiles ? "body2" : "h6"}>
          {isDragActive ? "Drop them here!" : hasFiles ? "Add more photos" : "Drag & drop photos or click to upload"}
        </Typography>
      </Stack>
    </Paper>
  );
};