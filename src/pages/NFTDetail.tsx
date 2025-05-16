
import { useParams } from "react-router-dom";
import { nfts, categories } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

const NFTDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nft = nfts.find(n => n.id === id);
  
  if (!nft) {
    return (
      <div className="py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">NFT Not Found</h1>
        <p className="text-gray-400 mb-6">The NFT you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  const category = categories.find(c => c.slug === nft.category);
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NFT Image */}
          <div className="relative overflow-hidden rounded-lg">
            <img 
              src={nft.image} 
              alt={nft.title}
              className="w-full h-auto object-cover rounded-lg shadow-xl"
            />
          </div>
          
          {/* NFT Details */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {category && (
                <Badge variant="outline" className="border-nft-blue text-nft-blue">
                  {category.name}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-nft-purple/20 text-nft-purple border border-nft-purple">
                {new Date(nft.createdAt).toLocaleDateString()}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{nft.title}</h1>
            
            <div className="flex items-center space-x-2 mb-6">
              <p className="text-gray-400">Created by</p>
              <p className="font-semibold text-nft-purple">{nft.creator}</p>
            </div>
            
            <p className="text-gray-300 mb-6">{nft.description}</p>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">Current owner</p>
                <p className="font-mono">{nft.owner}</p>
              </div>
              
              {nft.price && (
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400">Price</p>
                  <p className="font-semibold text-xl text-white">{nft.price}</p>
                </div>
              )}
            </div>
            
            <Button className="w-full bg-nft-purple hover:bg-nft-purple/90 text-white text-lg py-6 mb-4">
              {nft.price ? (
                <>
                  <Wallet size={20} className="mr-2" />
                  Buy Now
                </>
              ) : (
                "Not For Sale"
              )}
            </Button>
            
            <Button variant="outline" className="w-full border-nft-purple text-nft-purple hover:bg-nft-purple/10">
              Make Offer
            </Button>
          </div>
        </div>
        
        <div className="mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-nft-dark-purple">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
              <Card className="bg-nft-dark-purple/50 border-nft-purple/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400">Token ID</p>
                      <p className="font-mono">{nft.id}</p>
                    </div>
                    <Separator className="bg-nft-purple/20" />
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400">Blockchain</p>
                      <p>Polkadot</p>
                    </div>
                    <Separator className="bg-nft-purple/20" />
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400">Token Standard</p>
                      <p>pallet-nfts</p>
                    </div>
                    <Separator className="bg-nft-purple/20" />
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400">Created</p>
                      <p>{new Date(nft.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="attributes" className="mt-4">
              <Card className="bg-nft-dark-purple/50 border-nft-purple/20">
                <CardContent className="p-6">
                  {nft.attributes && nft.attributes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {nft.attributes.map((attr, index) => (
                        <div key={index} className="bg-nft-purple/10 border border-nft-purple/20 rounded-lg p-4">
                          <p className="text-gray-400 text-sm mb-2">{attr.trait_type}</p>
                          <p className="font-semibold">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No attributes available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card className="bg-nft-dark-purple/50 border-nft-purple/20">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Minted</p>
                        <p className="text-gray-400 text-sm">{new Date(nft.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-gray-400">By {nft.creator}</p>
                      </div>
                    </div>
                    <Separator className="bg-nft-purple/20" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Transfer</p>
                        <p className="text-gray-400 text-sm">{new Date(nft.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-gray-400">To {nft.owner}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;
