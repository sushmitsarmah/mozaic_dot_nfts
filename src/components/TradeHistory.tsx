import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { formatTokenAmount, getNetworkTokenInfo } from "@/lib/utils/tokens";
import { NETWORKS } from "@/components/NetworkSelector";

interface TradeHistoryProps {
    collectionId: number;
    itemId: number;
}

interface TradeEvent {
    type: 'listed' | 'sold' | 'transfer';
    price?: number;
    from?: string;
    to?: string;
    timestamp?: string;
    blockNumber?: number;
}

export const TradeHistory = ({ collectionId, itemId }: TradeHistoryProps) => {
    const { sdk, currentNetwork } = useSdkContext();
    const [trades, setTrades] = useState<TradeEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTradeHistory = async () => {
        if (!sdk) {
            setLoading(false);
            setError("SDK not initialized");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log(`Fetching trade history for Collection #${collectionId}, Item #${itemId}...`);

            const events: TradeEvent[] = [];

            // Get current item state first
            const item = await sdk.nftsPallet.item.get({
                collectionId,
                itemId
            });

            // Get Subscan URL from NETWORKS array
            const network = NETWORKS.find(n => n.url === currentNetwork);
            const subscanApiUrl = network?.subscanUrl;
            const subscanApiKey = import.meta.env.VITE_SUBSCAN_API_KEY;

            if (subscanApiUrl && subscanApiKey) {
                try {
                    // Use the dedicated NFT activities endpoint
                    const activitiesResponse = await fetch(`${subscanApiUrl}/api/scan/nfts/activities`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': subscanApiKey,
                        },
                        body: JSON.stringify({
                            collection_id: collectionId.toString(),
                            item_id: itemId.toString(),
                            page: 0,
                            row: 50
                        })
                    });

                    const activitiesData = await activitiesResponse.json();
                    console.log('Subscan activities response:', activitiesData);

                    if (activitiesData.code === 0 && activitiesData.data?.list) {
                        for (const activity of activitiesData.data.list) {
                            // Map different event types to our trade types
                            if (activity.event_id === 'ItemBought') {
                                events.push({
                                    type: 'sold',
                                    blockNumber: activity.block_num,
                                    timestamp: new Date(activity.block_timestamp * 1000).toISOString()
                                });
                            } else if (activity.event_id === 'ItemPriceSet') {
                                events.push({
                                    type: 'listed',
                                    blockNumber: activity.block_num,
                                    timestamp: new Date(activity.block_timestamp * 1000).toISOString()
                                });
                            } else if (activity.event_id === 'Transferred') {
                                events.push({
                                    type: 'transfer',
                                    blockNumber: activity.block_num,
                                    timestamp: new Date(activity.block_timestamp * 1000).toISOString()
                                });
                            }
                        }
                    }
                } catch (subscanError) {
                    console.log('Subscan query failed:', subscanError);
                }
            }

            // If currently listed, add that as the most recent event
            if (item.price) {
                const priceAmount = typeof item.price === 'object' ? item.price.amount : item.price;
                events.unshift({
                    type: 'listed',
                    price: parseInt(priceAmount.toString()),
                    from: item.owner,
                });
            }

            setTrades(events);

        } catch (error: any) {
            console.error('Failed to fetch trade history:', error);
            setError(`Failed to fetch trade history: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTradeHistory();
    }, [collectionId, itemId]);

    const formatAddress = (address: string) => {
        if (!address) return 'Unknown';
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Trade History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded animate-pulse">
                                <div className="h-4 bg-gray-600 rounded w-24"></div>
                                <div className="h-4 bg-gray-600 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white">Trade History</CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="text-center py-8">
                        <p className="text-red-400 mb-2">Failed to fetch trade history</p>
                        <p className="text-sm text-gray-400">{error}</p>
                    </div>
                ) : trades.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>No trade history available for this NFT.</p>
                        <p className="text-sm mt-2">History will appear once trading begins.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {trades.map((trade, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Badge 
                                        variant={trade.type === 'sold' ? 'default' : 'secondary'}
                                        className={
                                            trade.type === 'sold' ? 'bg-green-600' :
                                            trade.type === 'listed' ? 'bg-yellow-600' :
                                            'bg-blue-600'
                                        }
                                    >
                                        {trade.type.charAt(0).toUpperCase() + trade.type.slice(1)}
                                    </Badge>
                                    
                                    <div className="text-sm">
                                        {trade.type === 'listed' && (
                                            <span className="text-gray-300">
                                                Listed for <span className="text-yellow-400 font-semibold">
                                                    {trade.price ? formatTokenAmount(trade.price, currentNetwork) : '0'} {getNetworkTokenInfo(currentNetwork).symbol}
                                                </span>
                                            </span>
                                        )}
                                        
                                        {trade.type === 'sold' && (
                                            <span className="text-gray-300">
                                                Sold for <span className="text-green-400 font-semibold">
                                                    {trade.price ? formatTokenAmount(trade.price, currentNetwork) : '0'} {getNetworkTokenInfo(currentNetwork).symbol}
                                                </span>
                                                {trade.from && trade.to && (
                                                    <span className="block text-xs text-gray-400 mt-1">
                                                        {formatAddress(trade.from)} → {formatAddress(trade.to)}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                        
                                        {trade.type === 'transfer' && (
                                            <span className="text-gray-300">
                                                Transferred
                                                {trade.from && trade.to && (
                                                    <span className="block text-xs text-gray-400 mt-1">
                                                        {formatAddress(trade.from)} → {formatAddress(trade.to)}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-right text-xs text-gray-400">
                                    {trade.timestamp && (
                                        <div>{formatDate(trade.timestamp)}</div>
                                    )}
                                    {trade.blockNumber && (
                                        <div>Block #{trade.blockNumber}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};