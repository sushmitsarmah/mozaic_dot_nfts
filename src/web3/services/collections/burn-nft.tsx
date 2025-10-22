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
import { Trash2 } from "lucide-react";

interface BurnNFTProps {
    collectionId: number;
    itemId: number;
    isOwner: boolean;
}

export default function BurnNFT({ collectionId, itemId, isOwner }: BurnNFTProps) {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const burnNFT = async () => {
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
                description: "Only the owner can burn this NFT",
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

            console.log(`🔥 Burning NFT Item #${itemId} from Collection #${collectionId}...`);

            const { result } = await sdk.nftsPallet.item.burn(
                { collectionId, itemId },
                buildOptions,
                signerAccount
            );

            console.log(`✅ NFT burned successfully!`, result);

            toast({
                title: "Success",
                description: "NFT has been permanently burned (deleted)",
            });

            // Redirect to collection page after burn
            setTimeout(() => {
                window.location.href = `/collection/${collectionId}`;
            }, 2000);
        } catch (error: any) {
            console.error("Failed to burn NFT:", error);
            toast({
                title: "Burn Failed",
                description: error.message || "Failed to burn NFT",
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
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={loading}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? "Burning..." : "Burn NFT"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        This action cannot be undone. This will permanently delete your NFT
                        (Collection #{collectionId}, Item #{itemId}) from the blockchain.
                        All metadata and ownership records will be destroyed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={burnNFT}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Burning..." : "Yes, Burn NFT"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
