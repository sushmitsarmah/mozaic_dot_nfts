import React, { useState } from 'react';
import pinata from '@/web3/services/ipfs/pinata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AudioUploaderType {
  setAudioUrl: (url: string) => void;
}

const AudioUploader = ({ setAudioUrl }: AudioUploaderType) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select an audio file.');
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
      const result = await pinata.upload.file(file);
      setSuccess(`File uploaded successfully: ${result.IpfsHash}`);
      setAudioUrl(`${result.IpfsHash}`);
    } catch (err: any) {
      setError(`Error uploading file: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input type="file" onChange={handleFileChange} accept="audio/*" className="bg-gray-800 border-gray-600 text-white" />
      <Button onClick={handleUpload} disabled={uploading} className="bg-nft-purple hover:bg-nft-purple/90">
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}
    </div>
  );
};

export default AudioUploader;