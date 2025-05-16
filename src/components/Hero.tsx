
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
          Create Unique NFTs with AI
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Turn your imagination into digital art collectibles on the
          Polkadot blockchain ecosystem
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/create">
            <Button 
              size="lg" 
              className="bg-nft-purple hover:bg-nft-purple/90 text-white px-8 py-6 text-lg"
            >
              Start Creating
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
          
          <Link to="/gallery">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-nft-purple text-nft-purple hover:bg-nft-purple/10 px-8 py-6 text-lg"
            >
              Explore Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
