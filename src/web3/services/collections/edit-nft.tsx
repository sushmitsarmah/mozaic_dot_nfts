import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useState } from "react";
import { uploadMetadata } from "@/web3/services/ipfs/pinata";
import { useToast } from "@/components/ui/use-toast";
import { useNFTMetadata } from "@/hooks/useNFTMetadata";
import { NFTBasicInfoForm } from "@/components/nft/NFTBasicInfoForm";
import { NFTMediaUploader } from "@/components/nft/NFTMediaUploader";
import { NFTAttributeEditor } from "@/components/nft/NFTAttributeEditor";

interface EditNFTProps {
    collectionId: number;
    itemId: number;
    currentMetadata?: any;
    isOwner: boolean;
}

export default function EditNFT({ collectionId, itemId, currentMetadata, isOwner }: EditNFTProps) {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        nftData,
        imageUrl,
        audioUrl,
        audioDesc,
        setImageUrl,
        setAudioUrl,
        setAudioDesc,
        updateBasicInfo,
        updateAttribute,
        addAttribute,
        removeAttribute,
        buildMetadataPayload
    } = useNFTMetadata({ currentMetadata, isOpen: isModalOpen });

    const updateNFTMetadata = async () => {
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
                description: "Only the owner can edit this NFT",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        setIsModalOpen(false);

        try {
            const formParameters = buildMetadataPayload();
            console.log("Updated NFT Parameters:", formParameters);

            const metadataIpfsHash = await uploadMetadata(formParameters);
            console.log("New Metadata Hash:", metadataIpfsHash);

            const account = accountContext.activeAccount;
            const buildOptions = { signerAddress: account.address };
            const signerAccount = {
                signer: { sign: account.signer.sign as any },
                address: account.address
            };

            console.log(`📝 Updating NFT metadata for Item #${itemId} in Collection #${collectionId}...`);

            await sdk.nftsPallet.item.setMetadata(
                { collectionId, data: metadataIpfsHash as string, itemId },
                buildOptions,
                signerAccount
            );

            console.log(`✅ NFT metadata updated successfully!`);
            console.log(`🔗 New metadata URI: ${metadataIpfsHash}`);

            toast({
                title: "Success",
                description: "NFT metadata updated successfully!",
            });

            setTimeout(() => window.location.reload(), 2000);
        } catch (error: any) {
            console.error("Failed to update NFT metadata:", error);
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update NFT metadata",
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
                {loading ? "Updating..." : "Edit NFT"}
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            <h1>Edit NFT Metadata</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Collection #{collectionId} • Item #{itemId}
                            </p>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={(e) => { e.preventDefault(); updateNFTMetadata(); }} className="space-y-6 py-4">
                        <NFTBasicInfoForm
                            data={{
                                name: nftData.name,
                                description: nftData.description,
                                external_url: nftData.external_url
                            }}
                            onChange={updateBasicInfo}
                        />

                        <NFTMediaUploader
                            imageUrl={imageUrl}
                            audioUrl={audioUrl}
                            onImageChange={setImageUrl}
                            onAudioChange={setAudioUrl}
                        />

                        <div>
                            <Label htmlFor="audio_description" className="text-white">
                                Audio Description:
                            </Label>
                            <Input
                                type="text"
                                name="audio_description"
                                value={audioDesc}
                                onChange={(e) => setAudioDesc(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white"
                                placeholder="Describe the audio content"
                            />
                        </div>

                        <NFTAttributeEditor
                            attributes={nftData.attributes}
                            onAttributeChange={updateAttribute}
                            onAddAttribute={addAttribute}
                            onRemoveAttribute={removeAttribute}
                        />

                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update NFT Metadata"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
