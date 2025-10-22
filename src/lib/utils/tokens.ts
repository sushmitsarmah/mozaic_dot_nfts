/**
 * Get token symbol and decimals based on network URL
 */
export const getNetworkTokenInfo = (networkUrl: string) => {
  if (networkUrl.includes('kusama-asset-hub')) {
    return { symbol: 'KSM', decimals: 12 };
  }
  if (networkUrl.includes('polkadot-asset-hub')) {
    return { symbol: 'DOT', decimals: 10 };
  }
  if (networkUrl.includes('unique')) {
    return { symbol: 'UNQ', decimals: 18 };
  }
  if (networkUrl.includes('paseo-asset-hub')) {
    return { symbol: 'PAS', decimals: 10 };
  }
  if (networkUrl.includes('westend-asset-hub')) {
    return { symbol: 'WND', decimals: 12 };
  }
  if (networkUrl.includes('rococo-asset-hub')) {
    return { symbol: 'ROC', decimals: 12 };
  }
  if (networkUrl.includes('opal')) {
    return { symbol: 'OPL', decimals: 18 };
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