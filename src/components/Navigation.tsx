
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd, Paintbrush, Wallet, FolderOpen } from "lucide-react";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { shortPolkadotAddress } from "@/web3/lib/utils";
import PolkadotWalletSelector from "@/web3/components/PolkadotWalletSelector";
import { NetworkSelector } from "@/components/NetworkSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Navigation = () => {
  const accountsContext = useAccountsContext();
  const { currentNetworkId, switchNetwork } = useSdkContext();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { activeAccount, disconnectWallet } = accountsContext || {};

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-nft-dark-purple/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-white">
            Mozaic<span className="text-nft-purple">Dot</span>
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
            to="/my-collections" 
            className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <FolderOpen size={18} />
            <span>My Collections</span>
          </Link>
          <Link 
            to="/create" 
            className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Paintbrush size={18} />
            <span>Create</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Network Selector */}
          <NetworkSelector
            currentNetworkId={currentNetworkId}
            onNetworkChange={switchNetwork}
          />
          
          {/* Wallet Section */}
          <div>
            {activeAccount ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="bg-nft-dark-purple border-nft-purple text-nft-purple hover:bg-nft-purple/20"
                  onClick={() => setWalletModalOpen(true)}
                >
                  <Wallet size={16} className="mr-2" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{shortPolkadotAddress(activeAccount.address)}</span>
                    <span className="text-xs opacity-75">{activeAccount.wallet?.prettyName || "Wallet"}</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={disconnectWallet}
                  className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-500"
                  size="sm"
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
        </div>
        
        <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Connect Your Wallet</DialogTitle>
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
