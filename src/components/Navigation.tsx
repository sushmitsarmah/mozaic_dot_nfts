
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd, Paintbrush, Wallet } from "lucide-react";

const Navigation = () => {
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = () => {
    // In a real implementation, this would connect to Polkadot.js
    console.log("Connecting wallet...");
    setTimeout(() => {
      setWalletConnected(true);
    }, 1000);
  };

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
          {walletConnected ? (
            <Button 
              variant="outline" 
              className="bg-nft-dark-purple border-nft-purple text-nft-purple hover:bg-nft-purple/20"
            >
              <Wallet size={16} className="mr-2" />
              0x7A...3F4D
            </Button>
          ) : (
            <Button 
              onClick={connectWallet} 
              className="bg-nft-purple hover:bg-nft-purple/90 text-white"
            >
              <Wallet size={16} className="mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
