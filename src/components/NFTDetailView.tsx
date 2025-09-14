import { useEffect, useState } from "react"
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider"
import { Card, CardContent } from "@/components/ui/card"
import TradeNFT from "@/web3/services/collections/nft_trade";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchIpfsJson } from "@/lib/utils/ipfs";
import { TradeHistory } from "@/components/TradeHistory";
import { formatTokenAmount, getNetworkTokenInfo } from "@/lib/utils/tokens";

interface NFTDetailViewProps {
    itemId: number;
    collectionId: number;
}

export function NFTDetailView({ itemId, collectionId }: NFTDetailViewProps) {
    const { sdk, currentNetwork } = useSdkContext()
    const [metadataLink, setMetadataLink] = useState<string>("");
    const [metadata, setMetadata] = useState<any>();
    const [itemData, setItemData] = useState<any>();
    const [loading, setLoading] = useState(true);

    const fetchItemMetadata = async () => {
        if (!sdk) return;

        try {
            const item = await sdk.nftsPallet.item.get({
                collectionId,
                itemId
            })
            
            console.log('NFT Item Data:', item);
            setItemData(item);
            
            if (item.metadata) {
                if (item.metadata.data.indexOf("token_metadata.json") === -1) {
                    setMetadataLink(item.metadata?.data)
                }
            }
        } catch (error) {
            console.error("Failed to fetch item metadata:", error);
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

    const getAudioType = (url: string) => {
        const extension = url.split('.').pop();
        return `audio/${extension}`;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="space-y-4">
                    <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3"></div>
                    <div className="h-32 bg-gray-800 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden shadow-lg bg-gray-800">
                {metadata && metadata.image ? (
                    <img 
                        src={metadata.image}
                        alt={metadata.name}
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-nft-purple/20 to-nft-dark-purple/20 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <p className="text-xl">NFT #{itemId}</p>
                            <p className="text-sm">Collection #{collectionId}</p>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {metadata?.name || `NFT #${itemId}`}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400">
                        <span>Collection #{collectionId}</span>
                        <span>•</span>
                        <span>Item #{itemId}</span>
                    </div>
                </div>

                {metadata?.description && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-gray-300">{metadata.description}</p>
                    </div>
                )}

                {metadata?.external_url && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">External Link</h3>
                        <a 
                            href={metadata.external_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-nft-purple hover:text-nft-purple/80 underline"
                        >
                            {metadata.external_url}
                        </a>
                    </div>
                )}

                {/* Audio playback if available */}
                {metadata?.attributes?.find((attr: any) => attr.trait_type === 'audio') && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Audio</h3>
                        <audio controls className="w-full">
                            <source 
                                src={metadata.attributes.find((attr: any) => attr.trait_type === 'audio').value.replace("ipfs://ipfs/", "https://gateway.pinata.cloud/ipfs/")} 
                                type={getAudioType(metadata.attributes.find((attr: any) => attr.trait_type === 'audio').value)} 
                            />
                            Your browser does not support the audio element.
                        </audio>
                        {metadata.attributes.find((attr: any) => attr.trait_type === 'audio_description') && (
                            <p className="text-gray-400 text-sm mt-1">
                                {metadata.attributes.find((attr: any) => attr.trait_type === 'audio_description').value}
                            </p>
                        )}
                    </div>
                )}

                {/* Attributes */}
                {metadata?.attributes && metadata.attributes.length > 0 && (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-white">Attributes</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {metadata.attributes.filter((attr: any) => 
                                    attr.trait_type !== 'audio' && 
                                    attr.trait_type !== 'audio_description' &&
                                    attr.trait_type.trim() !== '' &&
                                    attr.value.trim() !== ''
                                ).map((attr: any, index: number) => (
                                    <div
                                        key={index}
                                        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                                    >
                                        <p className="text-sm text-gray-400 uppercase tracking-wide">
                                            {attr.trait_type}
                                        </p>
                                        <p className="font-medium text-white mt-1">
                                            {attr.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Ownership & Pricing Info */}
                {itemData && (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-white">Ownership & Pricing</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Owner:</span>
                                    <span className="text-white font-mono text-sm">
                                        {itemData.owner ? `${itemData.owner.slice(0, 6)}...${itemData.owner.slice(-6)}` : 'Unknown'}
                                    </span>
                                </div>
                                
                                {itemData.price && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Listed Price:</span>
                                        <span className="text-green-400 font-semibold">
                                            {formatTokenAmount(typeof itemData.price === 'object' ? itemData.price.amount : itemData.price, currentNetwork)} {getNetworkTokenInfo(currentNetwork).symbol}
                                        </span>
                                    </div>
                                )}
                                
                                {(itemData.approvedBuyer || itemData.price?.buyer) && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Approved Buyer:</span>
                                        <span className="text-blue-400 font-mono text-sm">
                                            {((itemData.approvedBuyer || itemData.price?.buyer) || '').slice(0, 6)}...{((itemData.approvedBuyer || itemData.price?.buyer) || '').slice(-6)}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Status:</span>
                                    <Badge variant={itemData.price ? "default" : "secondary"}>
                                        {itemData.price ? "For Sale" : "Not Listed"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Trading Interface */}
                <TradeNFT 
                    collectionId={collectionId} 
                    itemId={itemId} 
                    itemData={itemData}
                    currentNetwork={currentNetwork}
                />

                {/* Trade History */}
                <TradeHistory 
                    collectionId={collectionId} 
                    itemId={itemId} 
                />
            </div>
        </div>
    )
}