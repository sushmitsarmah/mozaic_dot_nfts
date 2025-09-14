import React, { useState } from 'react';
import { uploadImage } from '@/web3/services/ipfs/pinata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader, CheckCircle } from 'lucide-react';

interface ImageUploaderType {
  setImageUrl: (url: string) => void;
}

const ImageUploader = ({ setImageUrl }: ImageUploaderType) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select an image file.');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const ipfsHash = await uploadImage(file);
      setSuccess(`File uploaded successfully to IPFS!`);
      setImageUrl(ipfsHash);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*"
          className="bg-gray-800 border-gray-600 text-white file:bg-nft-purple file:border-0 file:text-white file:px-4 file:py-2 file:rounded-md file:mr-4" 
        />
        {file && (
          <p className="text-sm text-gray-400">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>
      
      <Button 
        onClick={handleUpload} 
        disabled={uploading || !file} 
        className="w-full bg-nft-purple hover:bg-nft-purple/90"
      >
        {uploading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Uploading to IPFS...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Uploaded Successfully
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload to IPFS
          </>
        )}
      </Button>
      
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">❌ {error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">✅ {success}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;