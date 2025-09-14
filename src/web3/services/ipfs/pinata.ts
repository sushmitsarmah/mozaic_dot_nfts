import { PinataSDK } from "pinata-web3";

// Check if Pinata credentials are configured
const isPinataConfigured = () => {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const apiSecret = import.meta.env.VITE_PINATA_API_SECRET;
  const gateway = import.meta.env.VITE_PINATA_GATEWAY;
  
  // Check if JWT is configured (preferred method)
  const jwtConfigured = jwt && jwt !== 'your_pinata_jwt_token_here';
  // Check if API key/secret is configured (legacy method)
  const apiConfigured = apiKey && apiSecret;
  
  return (jwtConfigured || apiConfigured) && gateway;
};

const createPinataClient = () => {
  if (!isPinataConfigured()) return null;
  
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const apiSecret = import.meta.env.VITE_PINATA_API_SECRET;
  const gateway = import.meta.env.VITE_PINATA_GATEWAY;
  
  // Prefer JWT if available
  if (jwt && jwt !== 'your_pinata_jwt_token_here') {
    console.log('🔐 Initializing Pinata with JWT token');
    return new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: gateway,
    });
  }
  
  // Fall back to API key/secret
  if (apiKey && apiSecret) {
    console.log('🔐 Initializing Pinata with API key/secret');
    return new PinataSDK({
      pinataJwt: jwt || '', // Keep empty if no JWT
      pinataGateway: gateway,
    });
  }
  
  return null;
};

const pinata = createPinataClient();

export const uploadImage = async (file: File): Promise<string> => {
  if (!pinata) {
    throw new Error('Pinata is not configured. Please add your VITE_PINATA_JWT or API credentials to .env file');
  }

  try {
    console.log('Uploading image to Pinata IPFS...');
    const result = await pinata.upload.file(file);
    console.log('✅ Image uploaded to IPFS:', result.IpfsHash);
    return result.IpfsHash;
  } catch (err: any) {
    console.error('❌ Failed to upload image to Pinata:', err);
    throw new Error(`Failed to upload image: ${err.message}`);
  }
};

export const uploadMetadata = async (metaData: any): Promise<string> => {
  if (!pinata) {
    throw new Error('Pinata is not configured. Please add your VITE_PINATA_JWT or API credentials to .env file');
  }

  const metadataBlob = new Blob([JSON.stringify(metaData, null, 2)], {
    type: "application/json",
  });
  const metadataJson = new File([metadataBlob], "token_metadata.json", {
    type: "application/json",
  });

  try {
    console.log('Uploading metadata to Pinata IPFS...');
    const result = await pinata.upload.file(metadataJson);
    console.log('✅ Metadata uploaded to IPFS:', result.IpfsHash);
    return `ipfs://ipfs/${result.IpfsHash}`;
  } catch (err: any) {
    console.error('❌ Failed to upload metadata to Pinata:', err);
    throw new Error(`Failed to upload metadata: ${err.message}`);
  }
};

export const getIpfsUrl = (hash: string, useGateway = true): string => {
  if (useGateway) {
    const gateway = import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud';
    return `https://${gateway}/ipfs/${hash}`;
  }
  return `ipfs://ipfs/${hash}`;
};

export default pinata;