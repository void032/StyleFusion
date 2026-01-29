import React, { useRef } from 'react';
import { ImageFile } from '../types';

interface ImageUploadProps {
  label: string;
  subLabel: string;
  image: ImageFile | null;
  onImageSelected: (image: ImageFile) => void;
  onRemove: () => void;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  label, 
  subLabel, 
  image, 
  onImageSelected, 
  onRemove,
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // extract mime type
        const mimeType = result.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
        
        onImageSelected({
          file,
          previewUrl: result,
          base64: result, // We keep the full data URL here for preview, clean it in service
          mimeType
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-slate-300">
          {label} {required && <span className="text-pink-500">*</span>}
        </label>
        <span className="text-xs text-slate-500">{subLabel}</span>
      </div>

      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ${
          image 
            ? 'border-indigo-500/50 bg-slate-800/50' 
            : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600'
        }`}
      >
        {image ? (
          <div className="relative w-full h-full p-2">
            <img 
              src={image.previewUrl} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <button 
                onClick={onRemove}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transform scale-95 hover:scale-100 transition-all"
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center pt-5 pb-6 cursor-pointer w-full h-full"
            onClick={() => inputRef.current?.click()}
          >
            <svg className="w-10 h-10 mb-3 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-2 text-sm text-slate-400 text-center px-4">
              <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-600">PNG, JPG or WEBP</p>
          </div>
        )}
        
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
