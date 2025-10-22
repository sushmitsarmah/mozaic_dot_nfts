import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderType {
  setImageFile: (file: File | null) => void;
}

const ImageUploader = ({ setImageFile }: ImageUploaderType) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];

      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, GIF, etc.)');
        setFile(null);
        setPreview(null);
        setImageFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        setFile(null);
        setPreview(null);
        setImageFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setImageFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setImageFile(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="space-y-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="bg-gray-800 border-gray-600 text-white file:bg-nft-purple file:border-0 file:text-white file:px-4 file:py-2 file:rounded-md file:mr-4 cursor-pointer"
          />
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF, SVG (Max 10MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-700"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
          {file && (
            <p className="text-sm text-gray-400 mt-2">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">❌ {error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;