
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NFTDetailView } from "@/components/NFTDetailView";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";

const NFTDetail = () => {
  const { collectionId, itemId } = useParams<{ collectionId: string; itemId: string }>();
  const accountsContext = useAccountsContext();
  
  if (!collectionId || !itemId) {
    return (
      <div className="py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Invalid NFT URL</h1>
        <p className="text-gray-400 mb-6">Please provide a valid collection and item ID.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  if (!accountsContext?.activeAccount) {
    return (
      <div className="py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Wallet Not Connected</h1>
        <p className="text-gray-400 mb-6">Please connect your wallet to view NFT details.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <NFTDetailView 
          collectionId={parseInt(collectionId)} 
          itemId={parseInt(itemId)} 
        />
      </div>
    </div>
  );
};

export default NFTDetail;
