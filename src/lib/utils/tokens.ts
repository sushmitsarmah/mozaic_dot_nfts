import { NETWORKS } from '@/components/NetworkSelector';

/**
 * Get token symbol and decimals based on network URL
 */
export const getNetworkTokenInfo = (networkUrl: string) => {
  const network = NETWORKS.find(n => n.url === networkUrl);

  if (network) {
    return { symbol: network.tokenSymbol, decimals: network.decimals };
  }

  // Default fallback
  return { symbol: 'UNITS', decimals: 12 };
};

/**
 * Format token amounts from blockchain base units to human-readable format
 */
export const formatTokenAmount = (amount: number | string, networkUrl?: string): string => {
  if (!amount) return '0';
  
  const { decimals } = getNetworkTokenInfo(networkUrl || '');
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formatted = numAmount / divisor;
  
  // Show up to 4 decimal places, removing trailing zeros
  return formatted.toFixed(4).replace(/\.?0+$/, '');
};

/**
 * Parse human-readable token amount to blockchain base units
 */
export const parseTokenAmount = (amount: number | string, networkUrl?: string): string => {
  if (!amount) return '0';
  
  const { decimals } = getNetworkTokenInfo(networkUrl || '');
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const multiplier = Math.pow(10, decimals);
  const result = Math.floor(numAmount * multiplier);
  
  return result.toString();
};