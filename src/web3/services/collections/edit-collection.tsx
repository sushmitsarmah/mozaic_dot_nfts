import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useState, useEffect } from "react";
import { uploadMetadata, uploadImage } from "@/web3/services/ipfs/pinata";
import { useToast } from "@/components/ui/use-toast";
import ImageUploader from "@/web3/services/ipfs/uploadImage";

interface EditCollectionProps {
    collectionId: number;
    currentMetadata?: any;
    isOwner: boolean;
}

export default function EditCollection({ collectionId, currentMetadata, isOwner }: EditCollectionProps) {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (isModalOpen && currentMetadata) {
            setName(currentMetadata.name || '');
            setDescription(currentMetadata.description || '');

            // Extract image hash
            if (currentMetadata.image) {
                let imageHash = currentMetadata.image
                    .replace(/^ipfs:\/\/ipfs\//, '')
                    .replace(/^ipfs:\/\//, '')
                    .replace(/^https?:\/\/[^\/]+\/ipfs\//, '');

                if (imageHash.includes('.ipfs.')) {
                    imageHash = imageHash.split('.ipfs.')[0];
                }

                imageHash = imageHash.split('?')[0].split('#')[0].replace(/\/$/, '');
                setImageUrl(imageHash);
            }
        }
    }, [isModalOpen, currentMetadata]);

    const updateCollectionMetadata = async () => {
        if (!sdk || !accountContext?.activeAccount) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive"
            });
            return;
        }

        if (!isOwner) {
            toast({
                title: "Error",
                description: "Only the owner can edit this collection",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        setIsModalOpen(false);

        try {
            // Upload new image if provided
            let finalImageHash = imageUrl;
            if (imageFile) {
                console.log("📸 Uploading new image to IPFS...");
                finalImageHash = await uploadImage(imageFile);
                console.log("✅ New image uploaded:", finalImageHash);
            } else {
                console.log("ℹ️ No new image uploaded, keeping existing image");
            }

            // Build metadata
            const metadata = {
                name,
                description,
                image: finalImageHash ? `ipfs://ipfs/${finalImageHash}` : currentMetadata?.image || ''
            };

            console.log("Updated Collection Metadata:", metadata);

            const metadataIpfsHash = await uploadMetadata(metadata);
            console.log("New Metadata Hash:", metadataIpfsHash);

            const account = accountContext.activeAccount;
            const buildOptions = { signerAddress: account.address };
            const signerAccount = {
                signer: { sign: account.signer.sign as any },
                address: account.address
            };

            console.log(`📝 Updating collection metadata for Collection #${collectionId}...`);

            await sdk.nftsPallet.collection.setMetadata(
                { collectionId, data: metadataIpfsHash as string },
                buildOptions,
                signerAccount
            );

            console.log(`✅ Collection metadata updated successfully!`);
            console.log(`🔗 New metadata URI: ${metadataIpfsHash}`);

            toast({
                title: "Success",
                description: "Collection metadata updated successfully!",
            });

            setTimeout(() => window.location.reload(), 2000);
        } catch (error: any) {
            console.error("Failed to update collection metadata:", error);
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update collection metadata",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) return null;

    return (
        <>
            <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
            >
                {loading ? "Updating..." : "Edit Collection"}
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            <h1>Edit Collection Metadata</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Collection #{collectionId}
                            </p>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={(e) => { e.preventDefault(); updateCollectionMetadata(); }} className="space-y-6 py-4">
                        <div>
                            <Label htmlFor="name" className="text-white">
                                Collection Name:
                            </Label>
                            <Input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white"
                                placeholder="My NFT Collection"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-white">
                                Description:
                            </Label>
                            <Textarea
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white"
                                placeholder="Describe your collection"
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label htmlFor="image" className="text-white">Image:</Label>
                            <ImageUploader setImageFile={setImageFile} />
                            {imageUrl && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-400 mb-1">Current Image:</p>
                                    <img
                                        width={100}
                                        height={100}
                                        src={`https://gateway.pinata.cloud/ipfs/${imageUrl}`}
                                        alt="Collection Image"
                                        className="rounded"
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                            disabled={loading || !name}
                        >
                            {loading ? "Updating..." : "Update Collection Metadata"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
