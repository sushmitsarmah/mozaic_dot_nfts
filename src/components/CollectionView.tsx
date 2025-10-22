import { useEffect, useState } from "react"
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider"
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider"
import { NFTItemCard } from "@/components/NFTItemCard";
import { RefreshCw } from "lucide-react";
import CreateNFT from "@/web3/services/collections/create-nft";
import { Button } from "@/components/ui/button";
import { fetchIpfsJson } from "@/lib/utils/ipfs";

interface CollectionViewProps {
    id: string;
}

const CollectionView = ({ id }: CollectionViewProps) => {
    const { sdk } = useSdkContext()
    const accountsContext = useAccountsContext()
    const [collection, setCollection] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [metadataLink, setMetadataLink] = useState<string>("");
    const [metadata, setMetadata] = useState<any>();

    const fetchCollection = async () => {
        if (!sdk) return;

        try {
            console.log('fetching collection', id)
            const collectionData = await sdk.nftsPallet.collection.get({
                collectionId: parseInt(id, 10)
            })
            setCollection(collectionData)

            if (collectionData.metadata) {
                if (collectionData.metadata.data.indexOf("collection_metadata.json") === -1) {
                    setMetadataLink(collectionData.metadata?.data)
                }
            }

        } catch (err: any) {
            setError(`Failed to fetch collection: ${err.message}`)
        } finally {
            setLoading(false)
        }
    };

    const fetchIpfsData = async (url: string) => {
        try {
            const ipfsData = await fetchIpfsJson(url);
            setMetadata(ipfsData);
        } catch (error: any) {
            console.error(`Failed to fetch IPFS data: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchCollection()
    }, [sdk, id])

    useEffect(() => {
        if (metadataLink) {
            fetchIpfsData(metadataLink);
        }
    }, [metadataLink]);

    const showItems = (itemCount: number) => {
        const arr = [];
        // Limit to first 50 items to avoid overwhelming requests
        const maxItems = Math.min(itemCount, 50);
        
        for (let i = 1; i <= maxItems; i++) {
            arr.push(
                <NFTItemCard key={i} itemId={i} collectionId={+id} />
            )
        }
        
        // If there are more items, show a message
        if (itemCount > 50) {
            arr.push(
                <div key="more-items" className="col-span-full text-center p-8 text-gray-400">
                    Showing first 50 of {itemCount} items
                </div>
            );
        }
        
        return arr;
    };

    if (loading) {
        return (
            <div className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-800 rounded w-1/3"></div>
                        <div className="flex gap-4">
                            <div className="w-48 h-48 bg-gray-800 rounded"></div>
                            <div className="flex-1 space-y-4">
                                <div className="h-4 bg-gray-800 rounded"></div>
                                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-800 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 px-4 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
                <p className="text-red-400 mb-6">{error}</p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="py-12 px-4 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Collection Not Found</h1>
                <p className="text-gray-400 mb-6">The collection you're looking for doesn't exist.</p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    // Check if current user is the collection owner
    const isOwner = accountsContext?.activeAccount?.address === collection?.owner;

    return (
        <div className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {metadata?.name || `Collection #${id}`}
                </h1>

                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    {metadata && metadata.image && (
                        <div className="lg:w-1/3">
                            <img
                                width="300"
                                height="300"
                                alt="collection image"
                                src={metadata.image}
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    <div className="flex-1 space-y-6">
                        {metadata?.description && (
                            <p className="text-gray-300 text-lg">{metadata.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
                                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wide mb-2">Owner</h3>
                                <p className="font-mono text-white text-sm break-all">
                                    {collection.owner ? `${collection.owner.slice(0, 6)}...${collection.owner.slice(-6)}` : 'Unknown'}
                                    {isOwner && <span className="text-green-400 block text-xs mt-1">(You)</span>}
                                </p>
                            </div>
                            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
                                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wide mb-2">Max Supply</h3>
                                <p className="font-bold text-white text-3xl">{collection.config?.maxSupply || 'Unlimited'}</p>
                            </div>
                            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
                                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wide mb-2">Items Minted</h3>
                                <p className="font-bold text-white text-3xl">{collection.items}</p>
                            </div>
                            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
                                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wide mb-2">Mint Type</h3>
                                <p className="font-bold text-white text-xl">{collection.config?.mintSettings?.mintType || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Collection Items</h2>
                    <div className="flex flex-row gap-4 items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchCollection}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Refresh
                        </Button>
                        {isOwner && <CreateNFT collectionId={+id} items={collection.items} />}
                    </div>
                </div>

                {collection.items > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {showItems(collection.items)}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">No items in this collection yet.</p>
                        {isOwner && <CreateNFT collectionId={+id} items={collection.items} />}
                        {!isOwner && (
                            <p className="text-gray-500 text-sm mt-2">Only the collection owner can create items.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CollectionView;