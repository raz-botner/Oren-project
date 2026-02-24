import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  TableRow, 
  TableCell, 
  IconButton, 
  Typography, 
  Box, 
  TextField, 
  CircularProgress, 
  Chip, 
  Stack
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const SortableRow = ({ row, index, onPreview, onDelete, updateRowName, groupSize }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  
  const isEditable = row.status === 'completed' || row.status === 'error';

  // חישוב רקע דינמי לפי גודל הקבוצה
  // אנחנו בודקים באיזו "קבוצה" האינדקס נמצא, ואז מחליפים צבע בין קבוצות זוגיות לאי-זוגיות
  const groupIndex = Math.floor(index / (groupSize || 2));
  const isAlternateGroup = groupIndex % 2 === 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    backgroundColor: isDragging 
      ? '#f0f7ff' 
      : (isAlternateGroup ? '#fff' : '#f5f5f5'), // אפור מעט כהה יותר (#f5f5f5) כדי להבדיל בין שלשות
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} sx={{ '&:hover': { bgcolor: isDragging ? '#f0f7ff' : '#eceff1 !important' } }}>
      <TableCell sx={{ width: 40 }}>
        <IconButton {...attributes} {...listeners} size="small" sx={{ cursor: 'grab' }}>
          <DragIcon fontSize="small" />
        </IconButton>
      </TableCell>
      
      <TableCell sx={{ width: 60 }}>
        <Box 
          component="img"
          src={row.preview} 
          onClick={() => onPreview(row.preview)}
          sx={{ 
            width: 50, 
            height: 50, 
            borderRadius: 1, 
            cursor: 'zoom-in', 
            objectFit: 'cover', 
            border: '1px solid #ddd',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.1)', zIndex: 10 }
          }} 
        />
      </TableCell>
      
      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Typography variant="caption" color="text.secondary">
          {row.originalName}
        </Typography>
      </TableCell>
      
      <TableCell>
       {row.newName && row.status !== 'processing' ? 
       <TextField
          size="small"
          variant={isEditable ? "outlined" : "standard"}
          fullWidth
          value={row.newName}
          disabled={!isEditable} 
          onChange={(e) => updateRowName(row.id, e.target.value)}
        /> 
        : 
        <Stack direction="row" spacing={1} alignItems="center">
            {row.status === 'processing' && <CircularProgress size={16} thickness={5} />}
            <Typography variant="body2" fontWeight="bold" color={row.status === 'processing' ? "primary" : "text.disabled"}>
              {row.status === 'processing' ? 'Scanning...' : '---'}
            </Typography>
          </Stack>}
      </TableCell>
      
      <TableCell>
        {row.status === 'completed' && (
          <Chip icon={<CheckIcon />} label="Done" color="success" size="small" variant="outlined" />
        )}
        {row.status === 'error' && (
          <Chip icon={<ErrorIcon />} label="Error" color="error" size="small" variant="outlined" />
        )}
        {row.status === 'pending' && (
          <Typography variant="caption" color="text.disabled">Pending</Typography>
        )}
        {row.status === 'processing' && (
          <Typography variant="caption" color="primary">Processing...</Typography>
        )}
      </TableCell>
      
      <TableCell align="right">
        <IconButton 
          color="error" 
          onClick={() => onDelete(row.id)} 
          size="small"
          disabled={row.status === 'processing'}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default SortableRow;