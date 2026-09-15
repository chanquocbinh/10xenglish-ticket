export type UploadedFileType = 'image' | 'video';

export interface SavedFile {
  url: string;
  originalSize: number;
  compressedSize: number;
}

export interface UploadedFile extends SavedFile {
  type: UploadedFileType;
}
