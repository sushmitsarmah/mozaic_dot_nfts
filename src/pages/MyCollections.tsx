import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { CollectionCard } from "@/components/CollectionCard";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import CreateNFTCollection from "@/web3/services/collections/create";

interface NFTCollections {
  account: string;
  collections: number[];
}

const MyCollections = () => {
  const [collections, setCollections] = useState<NFTCollections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const accountsContext = useAccountsContext();
  const { sdk } = useSdkContext();

  const fetchCollections = async () => {
    if (!sdk || !accountsContext?.activeAccount) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accountAddress = accountsContext.activeAccount.address;
      
      const userCollections: NFTCollections = await sdk.nftsPallet.account.getCollections({
        account: accountAddress
      });
      
      setCollections(userCollections);
    } catch (err: any) {
      setError(`Failed to fetch collections: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCollections();
  }, [sdk, accountsContext?.activeAccount]);
  
  if (!accountsContext?.activeAccount) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Card className="bg-red-900/20 border-red-500/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Wallet Not Connected</h2>
              <p className="text-gray-300">
                Please connect your Polkadot wallet to view your collections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold text-white">My Collections</h1>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCollections}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <CreateNFTCollection />
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-nft-purple" />
            <p className="text-gray-400">Loading your collections...</p>
          </div>
        )}
        
        {error && (
          <Card className="bg-red-900/20 border-red-500/20 mb-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
              <p className="text-gray-300">{error}</p>
            </CardContent>
          </Card>
        )}
        
        {!loading && !error && collections && (
          <>
            {collections.collections.length === 0 ? (
              <Card className="bg-nft-dark-purple/50 border-nft-purple/20">
                <CardContent className="p-12 text-center">
                  <div className="mb-6">
                    <Plus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-white mb-2">No Collections Yet</h2>
                    <p className="text-gray-400 mb-6">
                      Create your first NFT collection to get started!
                    </p>
                  </div>
                  
                  <CreateNFTCollection />
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-4 text-gray-400">
                  Showing {collections.collections.length} collection{collections.collections.length !== 1 ? 's' : ''}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {collections.collections.map((id) => (
                    <CollectionCard key={id} id={id} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyCollections;