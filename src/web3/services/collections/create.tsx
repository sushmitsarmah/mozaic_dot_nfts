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
import { useState } from "react";
import ImageUploader from "@/web3/services/ipfs/uploadImage"
import { uploadMetadata, uploadImage } from "@/web3/services/ipfs/pinata"
import { useToast } from "@/components/ui/use-toast";

const CreateNFTCollection = () => {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [maxSupply, setMaxSupply] = useState<number>(10);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    };

    const handleMaxSupplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMaxSupply(Number(event.target.value));
    };

    const createNFTCollection = async (e: any) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            toast({
                title: "Validation Error",
                description: "Collection name is required",
                variant: "destructive"
            });
            return;
        }

        if (!imageFile) {
            toast({
                title: "Validation Error",
                description: "Please select an image for the collection",
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

        try {
            // Upload image to IPFS first
            toast({
                title: "Uploading Image",
                description: "Uploading collection image to IPFS...",
            });

            const imageIpfsHash = await uploadImage(imageFile);
            console.log("Image IPFS Hash:", imageIpfsHash);

            const formParameters = {
                name,
                description,
                image: `ipfs://ipfs/${imageIpfsHash}`,
                maxSupply
            };
            console.log("Form Parameters:", formParameters);

            toast({
                title: "Uploading Metadata",
                description: "Uploading collection metadata to IPFS...",
            });

            const metadataIpfsHash = await uploadMetadata(formParameters);
            console.log("Metadata IPFS Hash:", metadataIpfsHash);

            const account = accountContext?.activeAccount;
            const buildOptions = { signerAddress: account.address };
            const signerAccount = {
                signer: {
                    sign: accountContext.activeAccount.signer.sign as any
                },
                address: account.address
            };
            const opts = {
                collectionConfig: { maxSupply }
            };

            toast({
                title: "Creating Collection",
                description: "Creating your NFT collection on-chain...",
            });

            const collectionResult = await sdk.nftsPallet.collection.create(opts, buildOptions, signerAccount);

            const collectionId = collectionResult.result.collectionId;
            console.log(`✅ Collection created! Collection ID: ${collectionId}`);

            console.log("📝 Setting collection metadata URI...");
            await sdk.nftsPallet.collection.setMetadata({
                collectionId,
                data: metadataIpfsHash as string,
            }, buildOptions, signerAccount);
            console.log(`🔗 Collection metadata URI: ${metadataIpfsHash}`);

            toast({
                title: "Success!",
                description: `Collection #${collectionId} created successfully! Refresh the page to see it.`,
            });

            // Reset form and close modal
            setName("");
            setDescription("");
            setImageFile(null);
            setMaxSupply(10);
            setIsModalOpen(false);

            // Reload page after delay to show new collection
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error: any) {
            console.error("Failed to create collection:", error);
            toast({
                title: "Collection Creation Failed",
                description: error.message || "Failed to create collection. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div>
            <Button className="bg-nft-purple hover:bg-nft-purple/90 text-white font-bold" onClick={() => setIsModalOpen(true)}>Create new collection</Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            <div>
                                <h1>Create NFT Collection</h1>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <form onSubmit={createNFTCollection} className="flex flex-col gap-4">
                            <Label htmlFor="name" className="text-white">Name:</Label>
                            <Input
                                type="text"
                                id="name"
                                value={name}
                                onChange={handleNameChange}
                                className="bg-gray-800 border-gray-600 text-white"
                            />
                            <Label htmlFor="description" className="text-white">Description:</Label>
                            <Input
                                type="text"
                                id="description"
                                value={description}
                                onChange={handleDescriptionChange}
                                className="bg-gray-800 border-gray-600 text-white"
                            />
                            <Label htmlFor="image" className="text-white">Collection Image *</Label>
                            <ImageUploader setImageFile={setImageFile}/>

                            <Label htmlFor="maxSupply" className="text-white">Max Supply:</Label>
                            <Input
                                type="number"
                                id="maxSupply"
                                value={maxSupply}
                                onChange={handleMaxSupplyChange}
                                min="1"
                                className="bg-gray-800 border-gray-600 text-white"
                            />
                            <Button type="submit" className="bg-nft-purple hover:bg-nft-purple/90 text-white" disabled={isCreating}>
                                {isCreating ? "Creating..." : "Create NFT Collection"}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )

};

export default CreateNFTCollection;