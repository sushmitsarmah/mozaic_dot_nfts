
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@/data/mockData";
import { Loader, Wand2, X, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MintFormData } from "@/types";
import CreateNFTCollection from "@/web3/services/collections/create";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import ImageUploader from "@/web3/services/ipfs/uploadImage";
import { uploadMetadata, getIpfsUrl } from "@/web3/services/ipfs/pinata";

// Note: In production, this would connect to a real AI image generation service
// For now, we encourage users to use the upload feature with real images

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const accountsContext = useAccountsContext();
  const { sdk } = useSdkContext();
  
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creationMode, setCreationMode] = useState<"ai" | "upload">("upload");
  const [uploadedImageHash, setUploadedImageHash] = useState<string>("");
  const [isMinting, setIsMinting] = useState(false);
  
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
    // In a real implementation, this would call an AI image generation service
    setTimeout(() => {
      // For demo purposes, show a message instead of mock images
      setIsGenerating(false);
      toast({
        title: "AI Generation Demo",
        description: "AI image generation would connect to a real service like DALL-E, Midjourney, or Stable Diffusion. For now, please use the Upload Image tab to mint real NFTs!",
        variant: "default"
      });
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

  const handleSelectUploadedImage = () => {
    if (!uploadedImageHash) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return;
    }
    
    const imageUrl = getIpfsUrl(uploadedImageHash);
    setSelectedImage(imageUrl);
    setMintFormData({
      ...mintFormData,
      image: imageUrl,
      title: "Custom NFT",
      description: "NFT created from uploaded image"
    });
    setMintStep("details");
  };
  
  const handleMint = async () => {
    // Validate required fields
    if (!mintFormData.title || !mintFormData.category || !mintFormData.image) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!sdk || !accountsContext?.activeAccount) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    setIsMinting(true);
    
    try {
      // Show loading toast
      toast({
        title: "Minting NFT",
        description: "Please wait while we mint your NFT...",
      });

      // Create metadata following OpenSea/ERC-1155 standard
      const metadata = {
        name: mintFormData.title,
        description: mintFormData.description,
        image: creationMode === "upload" && uploadedImageHash ? 
          getIpfsUrl(uploadedImageHash, false) : // Use ipfs:// format for blockchain storage
          mintFormData.image, // AI images or other URLs
        attributes: mintFormData.attributes.filter(attr => attr.trait_type.trim() && attr.value.trim()),
        external_url: "", // Could be website URL
        background_color: "", // Optional hex color
        animation_url: "", // For animated NFTs
      };

      console.log('📝 Metadata to upload:', metadata);

      // Upload metadata to IPFS
      toast({
        title: "Uploading Metadata",
        description: "Uploading NFT metadata to IPFS...",
      });
      
      const metadataIpfsHash = await uploadMetadata(metadata);

      // For this demo, we'll try to mint to collection ID 1
      // In production, you'd want to let users choose or create collections
      const defaultCollectionId = 1;
      
      const account = accountsContext.activeAccount;
      const buildOptions = { signerAddress: account.address };
      const signerAccount = {
        signer: {
          sign: account.signer.sign as any
        },
        address: account.address
      };

      // Try to get collection info first to see if it exists
      let collectionExists = false;
      try {
        await sdk.nftsPallet.collection.get({ collectionId: defaultCollectionId });
        collectionExists = true;
      } catch {
        // Collection doesn't exist
      }

      if (!collectionExists) {
        toast({
          title: "Info",
          description: "No default collection found. Please create a collection first using the 'Create Collection' button.",
          variant: "destructive"
        });
        return;
      }

      // Get next available item ID
      let itemId = 1;
      try {
        // Try to get collection details to determine next item ID
        const collectionInfo = await sdk.nftsPallet.collection.get({ collectionId: defaultCollectionId });
        itemId = (collectionInfo.items || 0) + 1;
      } catch {
        // Use default
      }

      // Mint the NFT
      const { result } = await sdk.nftsPallet.item.mint({
        collectionId: defaultCollectionId,
        itemId,
        mintTo: account.address,
      }, buildOptions, signerAccount);

      console.log(`✅ NFT minted! Item ID: ${result.itemId}`);

      // Set metadata
      await sdk.nftsPallet.item.setMetadata({
        collectionId: defaultCollectionId,
        data: metadataIpfsHash as string,
        itemId: result.itemId
      }, buildOptions, signerAccount);

      toast({
        title: "Success!",
        description: `Your NFT has been minted successfully! Item ID: ${result.itemId}`,
      });
      
      // Reset form and redirect
      setTimeout(() => {
        navigate("/gallery");
      }, 2000);

    } catch (error: any) {
      console.error("Minting error:", error);
      toast({
        title: "Minting Failed",
        description: error.message || "An error occurred while minting your NFT. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
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
          <h1 className="text-4xl font-bold">Create Your NFT</h1>
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
          <Tabs value={creationMode} onValueChange={(value) => setCreationMode(value as "ai" | "upload")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-nft-dark-purple/50 border-nft-purple/20">
              <TabsTrigger value="ai" className="data-[state=active]:bg-nft-purple/20" disabled>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with AI (Coming Soon)
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-nft-purple/20">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai" className="mt-6">
              <Card className="bg-nft-dark-purple/50 border-nft-purple/20 mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Generate AI Art (Demo)</h2>
                  <p className="text-gray-400 mb-6">
                    This demonstrates AI image generation functionality. In production, this would connect to services like DALL-E, Midjourney, or Stable Diffusion. Try the "Upload Image" tab to mint real NFTs!
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
            </TabsContent>
            
            <TabsContent value="upload" className="mt-6">
              <Card className="bg-nft-dark-purple/50 border-nft-purple/20 mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Upload Your Image</h2>
                  <p className="text-gray-400 mb-6">
                    Upload your own artwork to mint as an NFT. Supported formats: JPG, PNG, GIF, SVG.
                  </p>
                  
                  <div className="mb-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm">
                      ✅ <strong>Pinata IPFS Ready:</strong> Your images will be stored on IPFS via Pinata
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <ImageUploader setImageUrl={setUploadedImageHash} />
                    
                    {uploadedImageHash && (
                      <div className="mt-4">
                        <div className="relative rounded-lg overflow-hidden border-2 border-nft-purple/20">
                          <img 
                            src={getIpfsUrl(uploadedImageHash)} 
                            alt="Uploaded image" 
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button 
                              className="bg-nft-purple hover:bg-nft-purple/90 text-white"
                              onClick={handleSelectUploadedImage}
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Use This Image
                            </Button>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4 bg-nft-purple hover:bg-nft-purple/90 text-white"
                          onClick={handleSelectUploadedImage}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Proceed with This Image
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
        
        {mintStep === "generate" && creationMode === "ai" && isGenerating && (
          <div className="text-center py-8">
            <Loader className="w-10 h-10 animate-spin mx-auto mb-4 text-nft-purple" />
            <p className="text-lg">Creating your masterpiece...</p>
            <p className="text-gray-400">This may take a few moments</p>
          </div>
        )}
        
        {mintStep === "generate" && creationMode === "ai" && generatedImages.length > 0 && (
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
        
        {mintStep === "details" && (
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
              disabled={isMinting}
              className="w-full bg-nft-purple hover:bg-nft-purple/90 text-white py-6 text-lg"
            >
              {isMinting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint NFT'
              )}
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
