export interface ImageRow {
  id: string;
  file: File;
  preview: string;
  originalName: string;
  newName: string;
  status: "pending" | "processing" | "completed" | "error";
}
