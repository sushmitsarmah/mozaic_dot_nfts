import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { GalleryHorizontal, RefreshCw } from "lucide-react";
import { CollectionCard } from "@/components/CollectionCard";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { requestCache, generateCacheKey, CacheTTL } from "@/lib/utils/cache";

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [collections, setCollections] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8; // Number of collections per page
  
  const accountsContext = useAccountsContext();
  const { sdk, currentNetwork } = useSdkContext();

  const fetchCollections = async (forceRefresh = false) => {
    if (!sdk) {
      console.log("SDK not initialized");
      setLoading(false);
      setError("SDK not initialized. Please check network connection.");
      return;
    }

    // Check cache first (unless force refresh)
    const cacheKey = generateCacheKey.collectionList(currentNetwork);
    if (!forceRefresh) {
      const cachedCollections = requestCache.get<number[]>(cacheKey);
      if (cachedCollections) {
        console.log("📦 Using cached collection list");
        setCollections(cachedCollections);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching collections from AssetHub...", { 
        sdkConnected: !!sdk,
        network: currentNetwork,
        cacheKey
      });
      
      // Smart collection discovery - check known collections first, then ranges
      const foundCollections: number[] = [];
      
      // Network-specific known collections
      const getKnownCollections = (network: string) => {
        if (network.includes('kusama-asset-hub')) {
          // Based on latest scan results, these collections are confirmed to exist on Kusama AssetHub
          return [1, 2, 5, 6, 7, 9, 15, 16, 29, 31, 36, 37, 66, 67, 86, 88, 89, 90, 91, 92, 96, 98, 99, 100, 102];
        }
        if (network.includes('polkadot-asset-hub')) {
          // Start with basic scanning for Polkadot AssetHub
          return [1, 2, 3, 4, 5];
        }
        if (network.includes('unique')) {
          // Unique Network might have collections starting from 1
          return [1, 2, 3, 4, 5];
        }
        if (network.includes('paseo-asset-hub')) {
          // Paseo testnet - check basic range
          return [1, 2, 3];
        }
        if (network.includes('opal')) {
          // Opal testnet - check basic range
          return [1, 2, 3, 4, 5];
        }

        // For testnets and other networks, start with minimal scanning
        return [1, 2, 3];
      };
      
      const knownCollections = getKnownCollections(currentNetwork);
      
      console.log('Checking known collections first...');
      
      // First, quickly check known collections
      const knownPromises = knownCollections.map(id => 
        sdk.nftsPallet.collection.get({ collectionId: id })
          .then((collection) => {
            console.log(`✅ Confirmed collection ${id}`);
            foundCollections.push(id);
            return true;
          })
          .catch(() => {
            console.log(`❌ Known collection ${id} no longer exists`);
            return false;
          })
      );
      
      await Promise.all(knownPromises);
      
      // Then do a limited scan for new collections in promising ranges
      const batchSize = 10;
      const getRangesToCheck = (network: string) => {
        if (network.includes('kusama-asset-hub')) {
          return [{ start: 103, end: 120 }]; // Check for even newer collections beyond 102
        }
        if (network.includes('polkadot-asset-hub')) {
          return [{ start: 6, end: 20 }]; // Conservative range for Polkadot
        }
        if (network.includes('unique')) {
          return [{ start: 6, end: 15 }]; // Check a small range first
        }
        if (network.includes('paseo-asset-hub')) {
          return [{ start: 4, end: 8 }]; // Minimal scanning for Paseo testnet
        }
        if (network.includes('opal')) {
          return [{ start: 6, end: 15 }]; // Small range for testnet
        }

        // For other networks (testnets), do minimal additional scanning
        return [{ start: 4, end: 8 }];
      };
      
      const rangesToCheck = getRangesToCheck(currentNetwork);
      
      console.log('Checking for new collections in recent ranges...');
      
      for (const range of rangesToCheck) {
        let consecutiveNotFound = 0;
        const maxConsecutiveNotFound = 5; // Stop after 5 consecutive 404s in new ranges
        
        for (let i = range.start; i <= range.end; i++) {
          try {
            const collection = await sdk.nftsPallet.collection.get({ collectionId: i });
            console.log(`🆕 Found new collection ${i}:`, collection);
            foundCollections.push(i);
            consecutiveNotFound = 0;
          } catch (err) {
            consecutiveNotFound++;
            
            // Stop scanning this range if too many consecutive 404s
            if (consecutiveNotFound >= maxConsecutiveNotFound) {
              console.log(`Stopping scan at collection ${i} due to consecutive 404s`);
              break;
            }
          }
          
          // Small delay between individual requests
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      console.log(`Scan complete. Found ${foundCollections.length} collections:`, foundCollections);
      
      const sortedCollections = foundCollections.sort((a, b) => b - a); // Sort newest first
      setCollections(sortedCollections);
      
      // Cache the results
      requestCache.set(cacheKey, sortedCollections, CacheTTL.COLLECTION_LIST);
      console.log(`💾 Cached ${sortedCollections.length} collections for ${CacheTTL.COLLECTION_LIST/1000}s`);
      
      if (foundCollections.length === 0) {
        const networkName = currentNetwork.includes('kusama') ? 'Kusama AssetHub' :
                           currentNetwork.includes('polkadot') ? 'Polkadot AssetHub' :
                           currentNetwork.includes('unique') ? 'Unique Network' :
                           currentNetwork.includes('paseo') ? 'Paseo AssetHub' :
                           currentNetwork.includes('westend') ? 'Westend AssetHub' :
                           currentNetwork.includes('rococo') ? 'Rococo AssetHub' :
                           currentNetwork.includes('opal') ? 'Opal Network' : 'this network';

        const isTestnet = currentNetwork.includes('paseo') || currentNetwork.includes('westend') || currentNetwork.includes('rococo') || currentNetwork.includes('opal');
        const isMainnet = currentNetwork.includes('kusama-asset-hub') || currentNetwork.includes('polkadot-asset-hub');
        
        let message = `No collections found on ${networkName}.`;
        if (isTestnet) {
          message += ' Testnets typically have fewer collections than mainnet. Try Kusama AssetHub or Polkadot AssetHub for more active NFT ecosystems.';
        } else if (!isMainnet) {
          message += ' This network may have limited NFT activity. Try Kusama AssetHub for the most active NFT ecosystem.';
        } else {
          message += ' Collections may need to be created first, or try connecting your wallet to see your own collections.';
        }
        
        setError(message);
      }
    } catch (err: any) {
      console.error("Failed to fetch collections:", err);
      setError(`Failed to fetch collections: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCollections();
  }, [sdk, currentNetwork]); // Refetch when network changes
  
  // Filter collections based on search query (by ID for now)
  const filteredCollections = collections.filter(id => {
    if (!searchQuery) return true;
    return id.toString().includes(searchQuery);
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCollections = filteredCollections.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">All Collections</h1>
            <p className="text-gray-400 mt-2">Discover NFT collections from all creators</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCollections(true)} // Force refresh
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center space-x-2">
              <GalleryHorizontal className="h-6 w-6 text-nft-purple" />
              <span className="text-gray-400">
                {filteredCollections.length} {filteredCollections.length === 1 ? "Collection" : "Collections"}
              </span>
            </div>
          </div>
        </div>
        
        {error && (
          <Card className="bg-red-900/20 border-red-500/20 mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Issue</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <div className="text-sm text-gray-400">
                <p><strong>Debug Info:</strong></p>
                <p>• Network: {currentNetwork}</p>
                <p>• SDK Status: {sdk ? "Connected" : "Not Connected"}</p>
              </div>
              <Button onClick={() => fetchCollections(true)} className="mt-4 bg-red-600 hover:bg-red-700">
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-8">
          <Input 
            placeholder="Search collections by ID..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="bg-gray-800 border-gray-600 text-white focus-visible:ring-nft-purple"
          />
        </div>
        
        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-gray-800 border-gray-700">
                <div className="aspect-square bg-gray-700 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-5 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !error && currentCollections.length === 0 ? (
          <div className="text-center py-12">
            <GalleryHorizontal className="w-20 h-20 mx-auto text-gray-500 mb-6" />
            <p className="text-xl text-gray-400 mb-4">
              {searchQuery ? "No collections found matching your search." : `No NFT collections found on ${currentNetwork.includes('kusama') ? 'Kusama AssetHub' :
                           currentNetwork.includes('polkadot') ? 'Polkadot AssetHub' :
                           currentNetwork.includes('unique') ? 'Unique Network' :
                           currentNetwork.includes('paseo') ? 'Paseo AssetHub' :
                           currentNetwork.includes('westend') ? 'Westend AssetHub' :
                           currentNetwork.includes('rococo') ? 'Rococo AssetHub' :
                           currentNetwork.includes('opal') ? 'Opal Network' : 'this network'}`}
            </p>
            <div className="max-w-md mx-auto text-gray-500 space-y-2">
              <p>This could mean:</p>
              <ul className="text-sm text-left space-y-1">
                <li>• No collections have been created yet</li>
                <li>• Network connection issues</li>
                <li>• Collections may exist on other networks</li>
              </ul>
            </div>
            {searchQuery && (
              <Button 
                variant="link" 
                className="text-nft-purple mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                Clear search
              </Button>
            )}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-4">Want to create the first collection?</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => fetchCollections(true)} variant="outline" className="border-gray-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scan Again
                </Button>
              </div>
            </div>
          </div>
        ) : currentCollections.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentCollections.map((collectionId) => (
                <CollectionCard key={collectionId} id={collectionId} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination className="my-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Gallery;