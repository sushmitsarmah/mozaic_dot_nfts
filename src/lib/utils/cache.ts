/**
 * Simple in-memory cache for API requests and blockchain data
 * Helps reduce redundant network calls and improves performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`🟢 Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * Set data in cache with TTL (time to live)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });

    console.log(`🟡 Cached data for key: ${key} (expires in ${ttl/1000}s)`);
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    console.log('🔴 Cache cleared');
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`);
    }

    return deletedCount;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Cached fetch wrapper - automatically caches successful responses
   */
  async cachedFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = this.get<T>(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // Fetch fresh data
    console.log(`🔵 Cache miss for key: ${key}, fetching...`);
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch data for key: ${key}`, error);
      throw error;
    }
  }
}

// Create global cache instance
export const requestCache = new RequestCache();

// Cache key generators for different data types
export const generateCacheKey = {
  collection: (id: number) => `collection:${id}`,
  nft: (collectionId: number, itemId: number) => `nft:${collectionId}:${itemId}`,
  collectionList: (network: string) => `collections:${network}`,
  ipfsMetadata: (hash: string) => `ipfs:metadata:${hash}`,
  ipfsImage: (hash: string) => `ipfs:image:${hash}`,
  tradeHistory: (collectionId: number, itemId: number) => `trades:${collectionId}:${itemId}`,
  networkStats: (network: string) => `network:stats:${network}`
};

// Different TTL values for different data types
export const CacheTTL = {
  COLLECTION_METADATA: 10 * 60 * 1000, // 10 minutes (relatively stable)
  NFT_METADATA: 5 * 60 * 1000,         // 5 minutes (can change with trades)
  COLLECTION_LIST: 2 * 60 * 1000,      // 2 minutes (new collections appear)
  IPFS_METADATA: 60 * 60 * 1000,       // 1 hour (immutable on IPFS)
  TRADE_HISTORY: 1 * 60 * 1000,        // 1 minute (trades happen frequently)
  NETWORK_STATS: 30 * 1000,            // 30 seconds (block info changes fast)
};

// Auto cleanup expired entries every 10 minutes
setInterval(() => {
  requestCache.cleanup();
}, 10 * 60 * 1000);

export default requestCache;