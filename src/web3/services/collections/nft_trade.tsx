import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatTokenAmount, parseTokenAmount, getNetworkTokenInfo } from "@/lib/utils/tokens";

interface TradeNFTProps {
    collectionId: number;
    itemId: number;
    itemData?: any;
    currentNetwork?: string;
};

const TradeNFT = ({ collectionId, itemId, itemData, currentNetwork }: TradeNFTProps) => {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [price, setPrice] = useState(itemData?.price || 0);
    const [bidPrice, setBidPrice] = useState(0);
    const [buyer, setBuyer] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Check if current user is the owner
    const isOwner = accountContext?.activeAccount?.address === itemData?.owner;
    
    // Handle price field - it might be an object with {amount, buyer} or just a number
    const currentPrice = itemData?.price ? 
        (typeof itemData.price === 'object' ? itemData.price.amount : itemData.price) : null;
    const approvedBuyer = itemData?.price?.buyer || null;
    const isListed = !!currentPrice;
    
    // Get network token info
    const { symbol: tokenSymbol } = getNetworkTokenInfo(currentNetwork || '');

    const tradeNFT = async (tradeType: string) => {
        if (!sdk || !accountContext?.activeAccount) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive"
            });
            return;
        }

        const account = accountContext?.activeAccount;
        const buildOptions = { signerAddress: account.address };
        const signerAccount = {
            signer: {
                sign: accountContext.activeAccount.signer.sign as any
            },
            address: account.address
        };

        setLoading(true);
        console.log(`🚀 ${tradeType} NFT in collection #${collectionId}...`);

        try {
            if (tradeType === "setPrice") {
                if (!isOwner) {
                    toast({
                        title: "Error",
                        description: "Only the owner can set the price for this NFT",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }
                
                if (price <= 0) {
                    toast({
                        title: "Error",
                        description: "Please enter a valid price",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }

                const { result } = await sdk.nftsPallet.trade.setPrice({
                    collectionId: +collectionId,
                    itemId: +itemId,
                    price: parseTokenAmount(price, currentNetwork),
                    buyer: buyer || null,
                }, buildOptions, signerAccount);
                
                console.log(result)
                console.log(`✅ NFT ${tradeType}! Item ID: ${result.itemId}`);
                
                toast({
                    title: "Success",
                    description: `NFT price set to ${price} ${tokenSymbol}${buyer ? ` for buyer ${buyer}` : ''}`
                });
                
                // Refresh the page to show updated pricing
                window.location.reload();
            }

            if (tradeType === "buy") {
                if (isOwner) {
                    toast({
                        title: "Error",
                        description: "You cannot buy your own NFT",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }
                
                if (!isListed) {
                    toast({
                        title: "Error",
                        description: "This NFT is not listed for sale",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }
                
                if (bidPrice <= 0) {
                    toast({
                        title: "Error", 
                        description: "Please enter a valid bid price",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }

                const humanCurrentPrice = parseFloat(formatTokenAmount(currentPrice, currentNetwork));
                if (bidPrice < humanCurrentPrice) {
                    toast({
                        title: "Error",
                        description: `Your bid must be at least ${formatTokenAmount(currentPrice, currentNetwork)} ${tokenSymbol} (listed price)`,
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }

                const { result } = await sdk.nftsPallet.trade.buy({
                    collectionId: +collectionId,
                    itemId: +itemId,
                    bidPrice: parseTokenAmount(bidPrice, currentNetwork),
                }, buildOptions, signerAccount);
                
                console.log(result)
                console.log(`✅ NFT ${tradeType}! Item ID: ${result.itemId}`);
                
                toast({
                    title: "Success",
                    description: `Successfully purchased NFT for ${bidPrice} ${tokenSymbol}!`
                });
                
                // Refresh the page to show new ownership
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Transaction Failed",
                description: error.message || "Failed to complete transaction",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
                <CardTitle className="text-white">Trading Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Owner-Only Selling Section */}
                {isOwner && (
                    <div className="space-y-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-blue-400">Owner Controls</h3>
                            <Badge className="bg-blue-600">You Own This NFT</Badge>
                        </div>
                        
                        <div className="space-y-3">
                            <Input 
                                type="number" 
                                placeholder={currentPrice ? `Current: ${formatTokenAmount(currentPrice, currentNetwork)} ${tokenSymbol}` : `Price (in ${tokenSymbol})`} 
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white"
                                step="0.0001"
                            />
                            <Input 
                                type="text" 
                                placeholder="Buyer address (optional - restrict to specific buyer)" 
                                value={buyer}
                                onChange={(e) => setBuyer(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                            <Button 
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold" 
                                onClick={() => tradeNFT("setPrice")}
                                disabled={loading || !price}
                            >
                                {loading ? "Setting Price..." : isListed ? "Update Price" : "List for Sale"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Purchase Section */}
                {!isOwner && isListed && (
                    <div className="space-y-4 p-4 bg-green-900/20 rounded-lg border border-green-800/30">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-green-400">Purchase NFT</h3>
                            <Badge className="bg-green-600">Listed: {formatTokenAmount(currentPrice, currentNetwork)} {tokenSymbol}</Badge>
                        </div>
                        
                        <div className="space-y-3">
                            <Input 
                                type="number" 
                                placeholder={`Minimum bid: ${formatTokenAmount(currentPrice, currentNetwork)} ${tokenSymbol}`}
                                value={bidPrice}
                                onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white"
                                min={formatTokenAmount(currentPrice, currentNetwork)}
                                step="0.0001"
                            />
                            <Button 
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" 
                                onClick={() => tradeNFT("buy")}
                                disabled={loading || !bidPrice || bidPrice < parseFloat(formatTokenAmount(currentPrice, currentNetwork))}
                            >
                                {loading ? "Purchasing..." : "Buy NFT"}
                            </Button>
                            
                            {bidPrice > 0 && bidPrice < parseFloat(formatTokenAmount(currentPrice, currentNetwork)) && (
                                <p className="text-red-400 text-sm">
                                    Bid must be at least {formatTokenAmount(currentPrice, currentNetwork)} {tokenSymbol}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Not Listed Message */}
                {!isOwner && !isListed && (
                    <div className="p-4 bg-gray-700 rounded-lg text-center">
                        <p className="text-gray-400">This NFT is not currently listed for sale.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
};

export default TradeNFT;