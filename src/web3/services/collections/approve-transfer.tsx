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
import { CheckCircle } from "lucide-react";

interface ApproveTransferProps {
    collectionId: number;
    itemId: number;
    isOwner: boolean;
}

export default function ApproveTransfer({ collectionId, itemId, isOwner }: ApproveTransferProps) {
    const { sdk } = useSdkContext();
    const accountContext = useAccountsContext();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [delegate, setDelegate] = useState("");
    const [loading, setLoading] = useState(false);

    const approveTransfer = async (e: React.FormEvent) => {
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
                description: "Only the owner can approve transfers",
                variant: "destructive"
            });
            return;
        }

        if (!delegate || delegate.trim() === "") {
            toast({
                title: "Error",
                description: "Please enter a valid delegate address",
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

            console.log(`✅ Approving transfer for NFT Item #${itemId} in Collection #${collectionId} to delegate ${delegate}...`);

            const { result } = await sdk.nftsPallet.item.approveTransfer(
                {
                    collectionId,
                    itemId,
                    delegate: delegate.trim()
                },
                buildOptions,
                signerAccount
            );

            console.log(`✅ Transfer approved successfully!`, result);

            toast({
                title: "Success",
                description: `Transfer approved for ${delegate.slice(0, 6)}...${delegate.slice(-6)}`,
            });

            setIsOpen(false);
            setTimeout(() => window.location.reload(), 2000);
        } catch (error: any) {
            console.error("Failed to approve transfer:", error);
            toast({
                title: "Approval Failed",
                description: error.message || "Failed to approve transfer",
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
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Approve Transfer Delegate
                    </DialogTitle>
                    <p className="text-sm text-gray-400 mt-2">
                        Collection #{collectionId} • Item #{itemId}
                    </p>
                </DialogHeader>
                <form onSubmit={approveTransfer} className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="delegate" className="text-white">
                            Delegate Address
                        </Label>
                        <Input
                            id="delegate"
                            type="text"
                            placeholder="Enter delegate's wallet address"
                            value={delegate}
                            onChange={(e) => setDelegate(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white mt-2"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            This address will be authorized to transfer this NFT on your behalf.
                            You can revoke this approval later.
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
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            disabled={loading || !delegate}
                        >
                            {loading ? "Approving..." : "Approve"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
