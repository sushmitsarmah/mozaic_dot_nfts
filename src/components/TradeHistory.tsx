import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { formatTokenAmount, getNetworkTokenInfo } from "@/lib/utils/tokens";

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
            
            // Attempt to get trade-related events from the blockchain
            // Note: The exact method depends on the SDK's capabilities for event querying
            const events: TradeEvent[] = [];
            
            try {
                // Try to get the current item to see if it has pricing info
                const item = await sdk.nftsPallet.item.get({
                    collectionId,
                    itemId
                });
                
                console.log('Current item state:', item);
                
                // If item has pricing info, create a "listed" event
                if (item.price) {
                    const priceAmount = typeof item.price === 'object' ? item.price.amount : item.price;
                    events.push({
                        type: 'listed',
                        price: parseInt(priceAmount.toString()),
                        from: item.owner,
                        // Note: timestamp and blockNumber would require blockchain event querying
                        // which is not currently available through the SDK's item.get() method
                    });
                }
                
                // Note: Getting full trade history would require querying blockchain events
                // which may need different SDK methods or external blockchain indexers
                console.log('Trade events found:', events);
                
            } catch (itemError) {
                console.log('Could not fetch item details for trade history:', itemError);
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