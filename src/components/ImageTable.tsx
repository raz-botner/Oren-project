import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper } from '@mui/material';
import SortableRow from './SortableRow'
import { ImageRow } from '@/types';

interface Props {
  rows: ImageRow[];
  onReorder: (newRows: ImageRow[]) => void;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
  updateRowName: (id: string, newName: string) => void;
  groupSize: number
}

export const ImageTable = ({ rows, onReorder, onDelete, onPreview, updateRowName, groupSize }: Props) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      onReorder(arrayMove(rows, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <TableContainer component={Paper} sx={{ maxHeight: 600, boxShadow: 3  }}>
        <Table stickyHeader  size="small">
          <TableHead>
           <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell>Image</TableCell>
              <TableCell>Original Filename</TableCell>
              <TableCell>Extracted Label (New Name)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <SortableContext items={rows} strategy={verticalListSortingStrategy}>
              {rows.map((row, index) => (
                <SortableRow 
                  key={row.id} 
                  row={row} 
                  index={index} 
                  onDelete={onDelete} 
                  onPreview={onPreview}
                  updateRowName={updateRowName}
                  groupSize={groupSize}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </TableContainer>
    </DndContext>
  );
};