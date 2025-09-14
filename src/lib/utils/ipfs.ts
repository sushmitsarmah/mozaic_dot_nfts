import { requestCache, generateCacheKey, CacheTTL } from './cache';

/**
 * Convert IPFS URLs to HTTP gateway URLs for browser access
 */
export const convertIpfsUrl = (ipfsUrl: string, gateway = 'https://ipfs.io'): string => {
  if (!ipfsUrl) return ipfsUrl;
  
  // Handle ipfs://ipfs/ format (sometimes used)
  if (ipfsUrl.startsWith('ipfs://ipfs/')) {
    const hash = ipfsUrl.replace('ipfs://ipfs/', '');
    return `${gateway}/ipfs/${hash}`;
  }
  
  // Handle ipfs:// protocol
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `${gateway}/ipfs/${hash}`;
  }
  
  // Already HTTP URL
  if (ipfsUrl.startsWith('http')) {
    return ipfsUrl;
  }
  
  // Direct hash (assume it's IPFS)
  if (ipfsUrl.match(/^[A-Za-z0-9]{46,59}$/)) {
    return `${gateway}/ipfs/${ipfsUrl}`;
  }
  
  return ipfsUrl;
};

// List of public IPFS gateways with CORS support (base URLs without /ipfs/)
// Ordered by reliability and CORS compatibility
const IPFS_GATEWAYS = [
  'https://dweb.link',            // Protocol Labs - usually reliable with CORS
  'https://ipfs.io',             // Official gateway - good CORS support
  'https://gateway.pinata.cloud', // Pinata - reliable for metadata
  'https://cf-ipfs.com',         // Alternative Cloudflare gateway
  'https://w3s.link',            // Web3.storage gateway
  'https://nftstorage.link',     // NFT.storage gateway - good for NFT metadata
  'https://4everland.io',        // 4everland IPFS gateway
];

/**
 * Fetch JSON data from IPFS URL with proper error handling, caching, and gateway fallback
 */
export const fetchIpfsJson = async (ipfsUrl: string): Promise<any> => {
  if (!ipfsUrl) {
    throw new Error('IPFS URL is required');
  }

  const cacheKey = generateCacheKey.ipfsMetadata(ipfsUrl);
  
  return requestCache.cachedFetch(
    cacheKey,
    async () => {
      console.log('🔍 Fetching IPFS metadata:', ipfsUrl);
      
      let lastError: Error | null = null;
  
  // Try each gateway until one works
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const httpUrl = convertIpfsUrl(ipfsUrl, gateway);
      console.log('Fetching IPFS JSON from:', httpUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(httpUrl, {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to read as text to see what we got
        const text = await response.text();
        if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
          throw new Error('Received HTML instead of JSON - gateway error');
        }
        // If it's not HTML, maybe it's still valid JSON
        try {
          const data = JSON.parse(text);
          // Convert any image URLs in the metadata
          if (data.image) {
            data.image = convertIpfsUrl(data.image, gateway);
          }
          console.log('Successfully fetched IPFS data from:', gateway);
          return data;
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
      }
      
      const data = await response.json();
      
      // Convert any image URLs in the metadata
      if (data.image) {
        data.image = convertIpfsUrl(data.image, gateway);
      }
      
      console.log('Successfully fetched IPFS data from:', gateway);
      return data;
      
    } catch (error: any) {
      lastError = error;
      console.warn(`Failed to fetch from ${gateway}:`, error.message);
      // Continue to next gateway
    }
  }
      
      // If all gateways failed, throw the last error
      throw new Error(`Failed to fetch IPFS data from all gateways. Last error: ${lastError?.message}`);
    },
    CacheTTL.IPFS_METADATA
  );
};