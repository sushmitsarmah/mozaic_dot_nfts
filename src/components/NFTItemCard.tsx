import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider"
import { useEffect, useState } from "react";
import { fetchIpfsJson } from "@/lib/utils/ipfs";

interface ItemCardProps {
  itemId: number;
  collectionId: number;
}

export function NFTItemCard({ itemId, collectionId }: ItemCardProps) {
  const { sdk } = useSdkContext()
  const [metadataLink, setMetadataLink] = useState<string>("");
  const [metadata, setMetadata] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [itemExists, setItemExists] = useState(true);

  const fetchItemMetadata = async () => {
    if (!sdk) return;

    try {
      const item = await sdk.nftsPallet.item.get({
        collectionId,
        itemId
      });
      
      if (item.metadata) {
        if (item.metadata.data.indexOf("token_metadata.json") === -1) {
          setMetadataLink(item.metadata?.data);
        }
      }
      setItemExists(true);
    } catch (error: any) {
      console.error("Failed to fetch item metadata:", error);
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        setItemExists(false);
        setLoading(false);
      }
    }
  };

  const fetchIpfsData = async (url: string) => {
    try {
      const ipfsData = await fetchIpfsJson(url);
      setMetadata(ipfsData);
    } catch (error: any) {
      console.error(`Failed to fetch IPFS data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemMetadata();
  }, [sdk, collectionId, itemId]);

  useEffect(() => {
    if (metadataLink) {
      fetchIpfsData(metadataLink);
    }
  }, [metadataLink]);

  // Don't render anything for non-existent items
  if (!itemExists) {
    return null;
  }

  if (loading) {
    return (
      <Card className="overflow-hidden bg-gray-800 border-gray-700">
        <div className="aspect-square bg-gray-700 animate-pulse"></div>
        <CardContent className="p-4">
          <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={`/nft/${collectionId}/${itemId}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:shadow-nft-purple/20 bg-gray-800 border-gray-700 hover:border-nft-purple/50">
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden">
            {metadata && metadata.image ? (
              <img 
                src={metadata.image}
                alt={metadata.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-nft-purple/20 to-nft-dark-purple/20 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-sm">NFT #{itemId}</p>
                  <p className="text-xs">Collection #{collectionId}</p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-white mb-1">
            {metadata?.name || `NFT #${itemId}`}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {metadata?.description || `Item ${itemId} from Collection ${collectionId}`}
          </p>
          {metadata?.attributes && metadata.attributes.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {metadata.attributes.slice(0, 2).map((attr: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-nft-purple/20 text-nft-purple text-xs rounded-full"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
              {metadata.attributes.length > 2 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  +{metadata.attributes.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}