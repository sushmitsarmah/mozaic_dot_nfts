import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { XCircle } from "lucide-react";

interface ClearMetadataProps {
    collectionId: number;
    itemId: number;
    isOwner: boolean;
}

export default function ClearMetadata({ collectionId, itemId, isOwner }: ClearMetadataProps) {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const clearMetadata = async () => {
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
                description: "Only the owner can clear metadata",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const account = accountContext.activeAccount;
            const buildOptions = { signerAddress: account.address };
            const signerAccount = {
                signer: { sign: account.signer.sign as any },
                address: account.address
            };

            console.log(`🗑️ Clearing metadata for NFT Item #${itemId} in Collection #${collectionId}...`);

            const { result } = await sdk.nftsPallet.item.clearMetadata(
                { collectionId, itemId },
                buildOptions,
                signerAccount
            );

            console.log(`✅ Metadata cleared successfully!`, result);

            toast({
                title: "Success",
                description: "NFT metadata has been cleared",
            });

            setTimeout(() => window.location.reload(), 2000);
        } catch (error: any) {
            console.error("Failed to clear metadata:", error);
            toast({
                title: "Clear Failed",
                description: error.message || "Failed to clear metadata",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) return null;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                    disabled={loading}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    {loading ? "Clearing..." : "Clear Metadata"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                        Clear NFT Metadata?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        This will remove all metadata (name, description, image, attributes) from this NFT
                        (Collection #{collectionId}, Item #{itemId}). The NFT will still exist but will have
                        no associated metadata. You can set new metadata later.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={clearMetadata}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Clearing..." : "Yes, Clear Metadata"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
