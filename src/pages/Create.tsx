
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/mockData";
import { Loader, Wand2, X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MintFormData } from "@/types";
import CreateNFTCollection from "@/web3/services/collections/create";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";

// Mock generated images for prototype
const mockGeneratedImages = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1"
];

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const accountsContext = useAccountsContext();
  
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [mintStep, setMintStep] = useState<"generate" | "details">("generate");
  const [mintFormData, setMintFormData] = useState<MintFormData>({
    title: "",
    description: "",
    category: "",
    attributes: [{ trait_type: "", value: "" }],
    image: ""
  });
  
  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }
    
    // Show loading state
    setIsGenerating(true);
    setGeneratedImages([]);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setGeneratedImages(mockGeneratedImages);
      setIsGenerating(false);
    }, 2000);
  };
  
  const handleSelectImage = (image: string) => {
    setSelectedImage(image);
    setMintFormData({
      ...mintFormData,
      image: image,
      title: prompt,
      description: `AI-generated artwork from prompt: "${prompt}"`
    });
    setMintStep("details");
  };
  
  const handleMint = () => {
    // Validate required fields
    if (!mintFormData.title || !mintFormData.category || !mintFormData.image) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Show loading toast
    toast({
      title: "Minting NFT",
      description: "Please wait while we mint your NFT...",
    });
    
    // Simulate blockchain interaction with timeout
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Your NFT has been minted successfully!",
      });
      
      // Redirect to gallery
      navigate("/gallery");
    }, 2000);
  };
  
  const handleAddAttribute = () => {
    setMintFormData({
      ...mintFormData,
      attributes: [...mintFormData.attributes, { trait_type: "", value: "" }]
    });
  };
  
  const handleRemoveAttribute = (index: number) => {
    setMintFormData({
      ...mintFormData,
      attributes: mintFormData.attributes.filter((_, i) => i !== index)
    });
  };
  
  const handleAttributeChange = (index: number, field: "trait_type" | "value", value: string) => {
    const newAttributes = [...mintFormData.attributes];
    newAttributes[index][field] = value;
    
    setMintFormData({
      ...mintFormData,
      attributes: newAttributes
    });
  };
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Create NFT with AI</h1>
          {accountsContext?.activeAccount && (
            <CreateNFTCollection />
          )}
        </div>
        
        {!accountsContext?.activeAccount && (
          <Card className="bg-red-900/20 border-red-500/20 mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Wallet Not Connected</h2>
              <p className="text-gray-300">
                Please connect your Polkadot wallet to create NFTs and collections.
              </p>
            </CardContent>
          </Card>
        )}
        
        {mintStep === "generate" ? (
          <>
            <Card className="bg-nft-dark-purple/50 border-nft-purple/20 mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Generate AI Art</h2>
                <p className="text-gray-400 mb-6">
                  Enter a detailed description of what you want to create. Be as specific as possible for best results.
                </p>
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="A futuristic cityscape with neon lights, cyberpunk style, detailed, trending on artstation..."
                    className="min-h-24 bg-nft-dark-purple border-nft-purple/30 focus-visible:ring-nft-purple"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  
                  <Button 
                    onClick={handleGenerate} 
                    className="w-full bg-nft-purple hover:bg-nft-purple/90 text-white"
                    disabled={isGenerating || !prompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {isGenerating && (
              <div className="text-center py-8">
                <Loader className="w-10 h-10 animate-spin mx-auto mb-4 text-nft-purple" />
                <p className="text-lg">Creating your masterpiece...</p>
                <p className="text-gray-400">This may take a few moments</p>
              </div>
            )}
            
            {generatedImages.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Choose an Image to Mint</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {generatedImages.map((image, index) => (
                    <div 
                      key={index} 
                      className={`relative cursor-pointer overflow-hidden rounded-lg border-2 ${
                        selectedImage === image ? "border-nft-purple" : "border-transparent"
                      } transition-all hover:shadow-lg hover:shadow-nft-purple/20`}
                      onClick={() => handleSelectImage(image)}
                    >
                      <img 
                        src={image} 
                        alt={`Generated image ${index + 1}`} 
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button className="bg-nft-purple hover:bg-nft-purple/90 text-white">
                          Select Image
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            <Card className="bg-nft-dark-purple/50 border-nft-purple/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-6 mb-8">
                  <img 
                    src={mintFormData.image} 
                    alt="Selected image" 
                    className="w-40 h-40 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h2 className="text-2xl font-semibold mb-4">NFT Details</h2>
                    <p className="text-gray-400 mb-4">
                      Provide information about your NFT
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-nft-purple/30 text-nft-purple"
                      onClick={() => setMintStep("generate")}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <Input
                      placeholder="Enter NFT title"
                      className="bg-nft-dark-purple border-nft-purple/30 focus-visible:ring-nft-purple"
                      value={mintFormData.title}
                      onChange={(e) => setMintFormData({...mintFormData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      placeholder="Enter a detailed description of your NFT"
                      className="min-h-24 bg-nft-dark-purple border-nft-purple/30 focus-visible:ring-nft-purple"
                      value={mintFormData.description}
                      onChange={(e) => setMintFormData({...mintFormData, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <Select
                      value={mintFormData.category}
                      onValueChange={(value) => setMintFormData({...mintFormData, category: value})}
                    >
                      <SelectTrigger className="bg-nft-dark-purple border-nft-purple/30">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-nft-dark-purple border-nft-purple/30">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Attributes</label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-nft-purple hover:text-nft-purple/90"
                        onClick={handleAddAttribute}
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {mintFormData.attributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            placeholder="Trait type"
                            className="bg-nft-dark-purple border-nft-purple/30 focus-visible:ring-nft-purple"
                            value={attr.trait_type}
                            onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                          />
                          <Input
                            placeholder="Value"
                            className="bg-nft-dark-purple border-nft-purple/30 focus-visible:ring-nft-purple"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                          />
                          {mintFormData.attributes.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-red-500"
                              onClick={() => handleRemoveAttribute(index)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              onClick={handleMint} 
              className="w-full bg-nft-purple hover:bg-nft-purple/90 text-white py-6 text-lg"
            >
              Mint NFT
            </Button>
            
            <p className="text-gray-400 text-center text-sm">
              Gas fees will be calculated at time of minting based on current network conditions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
