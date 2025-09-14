import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CollectionView from "@/components/CollectionView";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";

const Collection = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const accountsContext = useAccountsContext();
  
  if (!collectionId) {
    return (
      <div className="py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Invalid Collection URL</h1>
        <p className="text-gray-400 mb-6">Please provide a valid collection ID.</p>
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
        <p className="text-gray-400 mb-6">Please connect your wallet to view collection details.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <CollectionView id={collectionId} />;
};

export default Collection;