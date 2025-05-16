
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Mock data for featured NFTs
const featuredNfts = [
  {
    id: "1",
    title: "Cosmic Dreams",
    creator: "CryptoArtist",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    category: "AI Art",
    price: "1.45 DOT"
  },
  {
    id: "2",
    title: "Digital Existence",
    creator: "BlockchainVisionary",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    category: "Photography",
    price: "0.89 DOT"
  },
  {
    id: "3",
    title: "Neon Wilderness",
    creator: "TechnoCreative",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    category: "Abstract",
    price: "2.13 DOT"
  },
  {
    id: "4",
    title: "Virtual Echoes",
    creator: "DigitalNomad",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    category: "AI Art",
    price: "3.25 DOT"
  }
];

const FeaturedNFTs = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Featured NFTs</h2>
          <Link 
            to="/gallery" 
            className="text-nft-purple hover:text-nft-blue transition-colors"
          >
            View all
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredNfts.map((nft) => (
            <Link to={`/nft/${nft.id}`} key={nft.id}>
              <Card className="overflow-hidden bg-nft-dark-purple border-none nft-card group transition-all duration-300 hover:shadow-xl hover:shadow-nft-purple/20">
                <div className="relative">
                  <img 
                    src={nft.image} 
                    alt={nft.title}
                    className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 nft-card-overlay flex items-end p-4">
                    <Badge variant="secondary" className="bg-nft-purple text-white mb-2">
                      {nft.price}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate">{nft.title}</h3>
                    <Badge variant="outline" className="border-nft-blue text-nft-blue">
                      {nft.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">By {nft.creator}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNFTs;
