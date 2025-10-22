import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import ImageUploader from "@/web3/services/ipfs/uploadImage"
import { useState } from "react";
import { uploadMetadata, uploadImage } from "@/web3/services/ipfs/pinata"
import { useToast } from "@/components/ui/use-toast";

interface CreateNFTProps {
    collectionId: number;
    items: number;
};

const CreateNFT = ({ collectionId, items }: CreateNFTProps) => {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const [nftData, setNftData] = useState({
        name: '',
        description: '',
        external_url: '',
        attributes: [{ trait_type: '', value: '' }]
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNftData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAttributeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newAttributes = [...nftData.attributes];
        newAttributes[index] = { ...newAttributes[index], [name]: value };
        setNftData(prevState => ({
            ...prevState,
            attributes: newAttributes
        }));
    };

    const addAttribute = () => {
        setNftData(prevState => ({
            ...prevState,
            attributes: [...prevState.attributes, { trait_type: '', value: '' }]
        }));
    };

    const createCollectionItem = async () => {
        // Validation
        if (!nftData.name.trim()) {
            toast({
                title: "Validation Error",
                description: "NFT name is required",
                variant: "destructive"
            });
            return;
        }

        if (!imageFile) {
            toast({
                title: "Validation Error",
                description: "Please select an image",
                variant: "destructive"
            });
            return;
        }

        if (!sdk || !accountContext?.activeAccount) {
            toast({
                title: "Error",
                description: "Please connect your wallet",
                variant: "destructive"
            });
            return;
        }

        setIsCreating(true);
        setIsModalOpen(false);

        try {
            // Upload image to IPFS first
            toast({
                title: "Uploading Image",
                description: "Uploading image to IPFS...",
            });

            const imageIpfsHash = await uploadImage(imageFile);
            console.log("Image IPFS Hash:", imageIpfsHash);

            // Build metadata with only filled attributes
            const filteredAttributes = nftData.attributes.filter(
                attr => attr.trait_type.trim() && attr.value.trim()
            );

            const formParameters = {
                name: nftData.name,
                description: nftData.description,
                image: `ipfs://ipfs/${imageIpfsHash}`,
                external_url: nftData.external_url,
                attributes: filteredAttributes
            };
            console.log("Form Parameters:", formParameters);

            toast({
                title: "Uploading Metadata",
                description: "Uploading NFT metadata to IPFS...",
            });

            const metadataIpfsHash = await uploadMetadata(formParameters);
            console.log("Metadata IPFS Hash:", metadataIpfsHash);

            const account = accountContext.activeAccount;
            const buildOptions = { signerAddress: account.address };
            const signerAccount = {
                signer: {
                    sign: account.signer.sign as any
                },
                address: account.address
            };

            console.log(`🚀 Minting a new NFT in collection #${collectionId}...`);

            toast({
                title: "Minting NFT",
                description: `Creating NFT in collection #${collectionId}...`,
            });

            const itemId = items + 1;
            const { result } = await sdk.nftsPallet.item.mint({
                collectionId,
                itemId,
                mintTo: account.address,
            }, buildOptions, signerAccount);
            console.log(`✅ NFT minted! Item ID: ${result.itemId}`);

            toast({
                title: "Setting Metadata",
                description: "Attaching metadata to NFT...",
            });

            console.log("📝 Setting item metadata URI...");
            await sdk.nftsPallet.item.setMetadata({
                collectionId,
                data: metadataIpfsHash as string,
                itemId: result.itemId
            }, buildOptions, signerAccount);
            console.log(`🔗 Item metadata URI: ${metadataIpfsHash}`);

            toast({
                title: "Success!",
                description: `NFT #${result.itemId} created successfully in collection #${collectionId}`,
            });

            // Reset form
            setNftData({
                name: '',
                description: '',
                external_url: '',
                attributes: [{ trait_type: '', value: '' }]
            });
            setImageFile(null);

            // Reload page after delay to show new NFT
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error: any) {
            console.error("Failed to create NFT:", error);
            toast({
                title: "NFT Creation Failed",
                description: error.message || "Failed to create NFT. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div>
            <Button className="bg-nft-purple hover:bg-nft-purple/90 text-white" onClick={() => setIsModalOpen(true)}>Create new NFT</Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            <div>
                                <h1>Create NFT</h1>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <form onSubmit={(e) => { e.preventDefault(); createCollectionItem() }} className="flex flex-col gap-4">
                            <Label htmlFor="name" className="text-white">NFT Name:</Label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={nftData.name}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-600 text-white"
                            />
                            <Label htmlFor="description" className="text-white">Description:</Label>
                            <Input
                                type="text"
                                id="description"
                                name="description"
                                value={nftData.description}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-600 text-white"
                            />
                            <Label htmlFor="image" className="text-white">Image *</Label>
                            <ImageUploader setImageFile={setImageFile} />

                            <Label htmlFor="external_url" className="text-white">External URL (optional):</Label>
                            <Input
                                type="text"
                                id="external_url"
                                name="external_url"
                                value={nftData.external_url}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-600 text-white"
                                placeholder="https://example.com"
                            />

                            <Label className="text-white">Attributes (optional):</Label>
                            {nftData.attributes.map((attribute, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        type="text"
                                        name="trait_type"
                                        placeholder="Trait Type"
                                        value={attribute.trait_type}
                                        onChange={(e) => handleAttributeChange(index, e)}
                                        className="bg-gray-800 border-gray-600 text-white"
                                    />
                                    <Input
                                        type="text"
                                        name="value"
                                        placeholder="Value"
                                        value={attribute.value}
                                        onChange={(e) => handleAttributeChange(index, e)}
                                        className="bg-gray-800 border-gray-600 text-white"
                                    />
                                </div>
                            ))}
                            <Button type="button" onClick={addAttribute} className="bg-gray-700 hover:bg-gray-600 text-white" disabled={isCreating}>Add Attribute</Button>
                            <Button type="submit" className="bg-nft-purple hover:bg-nft-purple/90 text-white" disabled={isCreating}>
                                {isCreating ? "Creating..." : "Create NFT"}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )

};

export default CreateNFT;