import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";

interface TransferNFTProps {
    collectionId: number;
    itemId: number;
    isOwner: boolean;
}

export default function TransferNFT({ collectionId, itemId, isOwner }: TransferNFTProps) {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [loading, setLoading] = useState(false);

    const transferNFT = async (e: React.FormEvent) => {
        e.preventDefault();

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
                description: "Only the owner can transfer this NFT",
                variant: "destructive"
            });
            return;
        }

        if (!recipient || recipient.trim() === "") {
            toast({
                title: "Error",
                description: "Please enter a valid recipient address",
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

            console.log(`📤 Transferring NFT Item #${itemId} from Collection #${collectionId} to ${recipient}...`);

            const { result } = await sdk.nftsPallet.item.transfer(
                {
                    collectionId,
                    itemId,
                    recipient: recipient.trim()
                },
                buildOptions,
                signerAccount
            );

            console.log(`✅ NFT transferred successfully!`, result);

            toast({
                title: "Success",
                description: `NFT transferred to ${recipient.slice(0, 6)}...${recipient.slice(-6)}`,
            });

            setIsOpen(false);
            setTimeout(() => window.location.reload(), 2000);
        } catch (error: any) {
            console.error("Failed to transfer NFT:", error);
            toast({
                title: "Transfer Failed",
                description: error.message || "Failed to transfer NFT",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Transfer NFT
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Transfer NFT
                    </DialogTitle>
                    <p className="text-sm text-gray-400 mt-2">
                        Collection #{collectionId} • Item #{itemId}
                    </p>
                </DialogHeader>
                <form onSubmit={transferNFT} className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="recipient" className="text-white">
                            Recipient Address
                        </Label>
                        <Input
                            id="recipient"
                            type="text"
                            placeholder="Enter recipient's wallet address"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white mt-2"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Make sure the address is correct. This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 bg-gray-700 text-white hover:bg-gray-600"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={loading || !recipient}
                        >
                            {loading ? "Transferring..." : "Transfer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
