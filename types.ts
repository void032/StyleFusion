export enum TransformationMode {
  REALISTIC = 'REALISTIC',
  FULL_STYLE = 'FULL_STYLE'
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface GeneratedImage {
  imageUrl: string;
  timestamp: number;
}
