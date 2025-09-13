
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd, Paintbrush, Wallet } from "lucide-react";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { shortPolkadotAddress } from "@/web3/lib/utils";
import PolkadotWalletSelector from "@/web3/components/PolkadotWalletSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Navigation = () => {
  const accountsContext = useAccountsContext();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { activeAccount, disconnectWallet } = accountsContext || {};

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-nft-dark-purple/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-white">
            Nexus<span className="text-nft-purple">Art</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/gallery" 
            className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <GalleryVerticalEnd size={18} />
            <span>Gallery</span>
          </Link>
          <Link 
            to="/create" 
            className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Paintbrush size={18} />
            <span>Create</span>
          </Link>
        </div>

        <div>
          {activeAccount ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="bg-nft-dark-purple border-nft-purple text-nft-purple hover:bg-nft-purple/20"
              >
                <Wallet size={16} className="mr-2" />
                {shortPolkadotAddress(activeAccount.address)}
              </Button>
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-500"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setWalletModalOpen(true)} 
              className="bg-nft-purple hover:bg-nft-purple/90 text-white"
            >
              <Wallet size={16} className="mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
        
        <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Connect Wallet</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <PolkadotWalletSelector />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
};

export default Navigation;
