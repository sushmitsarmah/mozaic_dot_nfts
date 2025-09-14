import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { useEffect, useState } from "react";
import { fetchIpfsJson } from "@/lib/utils/ipfs";

interface CollectionCardProps {
  id: number
}

export function CollectionCard({ id }: CollectionCardProps) {
  const { sdk } = useSdkContext();
  const [metadataLink, setMetadataLink] = useState<string>("");
  const [metadata, setMetadata] = useState<any>();
  const [collection, setCollection] = useState<any>();
  const [loading, setLoading] = useState(true);

  const fetchCollectionMetadata = async () => {
    if (!sdk) return;

    try {
      const colls = await sdk.nftsPallet.collection.get({
        collectionId: id
      });

      setCollection(colls);

      if (colls.metadata) {
        if (colls.metadata.data.indexOf("collection_metadata.json") === -1) {
          setMetadataLink(colls.metadata?.data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch collection metadata:", error);
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
    fetchCollectionMetadata();
  }, [sdk, id]);

  useEffect(() => {
    if (metadataLink) {
      fetchIpfsData(metadataLink);
    }
  }, [metadataLink]);

  if (loading) {
    return (
      <Card className="overflow-hidden bg-gray-800 border-gray-700">
        <div className="aspect-square bg-gray-700 animate-pulse"></div>
        <CardContent className="p-4">
          <div className="h-5 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={`/collection/${id}`}>
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
                  <p className="text-lg font-semibold">Collection #{id}</p>
                  {collection && (
                    <p className="text-sm">{collection.items} items</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-white mb-1">
            {metadata?.name || `Collection #${id}`}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 mb-2">
            {metadata?.description || `Collection ${id} on AssetHub`}
          </p>
          {collection && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>{collection.items} items</span>
              <span>Max: {collection.config?.maxSupply || 'Unlimited'}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}