
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedNFT {
  collectionId: number;
  itemId: number;
  title: string;
  image: string;
  creator?: string;
}

const FeaturedNFTs = () => {
  const { sdk } = useSdkContext();
  const [featuredNfts, setFeaturedNfts] = useState<FeaturedNFT[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedNFTs = async () => {
    if (!sdk) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const featuredItems: FeaturedNFT[] = [];
      
      // Look for NFTs in the first few collections
      for (let collectionId = 1; collectionId <= 10 && featuredItems.length < 4; collectionId++) {
        try {
          const collection = await sdk.nftsPallet.collection.get({ collectionId });
          
          if (collection.items > 0) {
            // Get a few items from this collection
            const maxItems = Math.min(collection.items, 2); // Max 2 items per collection
            for (let itemId = 1; itemId <= maxItems && featuredItems.length < 4; itemId++) {
              try {
                const item = await sdk.nftsPallet.item.get({ collectionId, itemId });
                
                if (item.metadata?.data) {
                  let metadataUrl = item.metadata.data;
                  if (!metadataUrl.startsWith('http')) {
                    metadataUrl = metadataUrl.replace("ipfs://ipfs/", "https://gateway.pinata.cloud/ipfs/");
                  }
                  
                  try {
                    const response = await fetch(metadataUrl);
                    if (response.ok) {
                      const metadata = await response.json();
                      
                      let imageUrl = metadata.image;
                      if (imageUrl && imageUrl.includes('ipfs://')) {
                        imageUrl = imageUrl.replace("ipfs://ipfs/", "https://gateway.pinata.cloud/ipfs/");
                      }
                      
                      if (metadata.name && imageUrl) {
                        featuredItems.push({
                          collectionId,
                          itemId,
                          title: metadata.name,
                          image: imageUrl,
                          creator: `Collection ${collectionId}`
                        });
                      }
                    }
                  } catch (error) {
                    console.log(`Failed to fetch metadata for item ${itemId} in collection ${collectionId}`);
                  }
                }
              } catch (error) {
                // Item doesn't exist, continue
              }
            }
          }
        } catch (error) {
          // Collection doesn't exist, continue
        }
      }
      
      setFeaturedNfts(featuredItems);
    } catch (error) {
      console.error("Error fetching featured NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedNFTs();
  }, [sdk]);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured NFTs</h2>
            <Link 
              to="/gallery" 
              className="text-nft-purple hover:text-nft-blue transition-colors"
            >
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden bg-nft-dark-purple border-none">
                <Skeleton className="h-64 w-full bg-gray-700" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredNfts.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured NFTs</h2>
            <Link 
              to="/gallery" 
              className="text-nft-purple hover:text-nft-blue transition-colors"
            >
              View all
            </Link>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No NFTs found yet.</p>
            <p className="text-gray-500 mt-2">Create some NFTs to see them featured here!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Featured NFTs</h2>
          <Link 
            to="/gallery" 
            className="text-nft-purple hover:text-nft-blue transition-colors"
          >
            View all
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredNfts.map((nft) => (
            <Link to={`/nft/${nft.collectionId}/${nft.itemId}`} key={`${nft.collectionId}-${nft.itemId}`}>
              <Card className="overflow-hidden bg-nft-dark-purple border-none nft-card group transition-all duration-300 hover:shadow-xl hover:shadow-nft-purple/20">
                <div className="relative">
                  <img 
                    src={nft.image} 
                    alt={nft.title}
                    className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback image if IPFS fails
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300/6B46C1/ffffff?text=NFT";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 nft-card-overlay flex items-end p-4">
                    <Badge variant="secondary" className="bg-nft-purple text-white mb-2">
                      #{nft.itemId}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate">{nft.title}</h3>
                    <Badge variant="outline" className="border-nft-blue text-nft-blue">
                      Real NFT
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">From {nft.creator}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNFTs;
