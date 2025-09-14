import React from "react";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { KNOWN_WALLETS, shortPolkadotAddress } from "@/web3/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Wallet, Check, ExternalLink } from "lucide-react";

// Wallet icons/colors for better visual distinction
const walletConfig = {
  "polkadot-js": { color: "bg-orange-600 hover:bg-orange-700", icon: "🟠" },
  "talisman": { color: "bg-purple-600 hover:bg-purple-700", icon: "🔮" },
  "subwallet-js": { color: "bg-blue-600 hover:bg-blue-700", icon: "🌊" },
  "nova": { color: "bg-green-600 hover:bg-green-700", icon: "⭐" },
  "enkrypt": { color: "bg-indigo-600 hover:bg-indigo-700", icon: "🔐" },
};

const PolkadotWalletSelector: React.FC = () => {
  const accountsContext = useAccountsContext();

  if (!accountsContext) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nft-purple"></div>
      </div>
    );
  }

  const {
    wallets,
    accounts,
    activeAccount,
    connectWallet,
    setActiveAccount,
    disconnectWallet,
    error,
  } = accountsContext;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Choose from multiple supported Polkadot wallets</p>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {KNOWN_WALLETS.map(({ name, title, downloadLink }) => {
          const wallet = wallets.find((w) => w.name === name);
          const config = walletConfig[name as keyof typeof walletConfig];
          
          return (
            <Card key={name} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{config?.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    {wallet && <Badge variant="secondary" className="text-xs">Detected</Badge>}
                  </div>
                </div>
                
                <Button
                  className={`w-full ${wallet 
                    ? config?.color + " text-white" 
                    : "bg-gray-600 hover:bg-gray-500 text-gray-200"
                  }`}
                  onClick={() =>
                    wallet ? connectWallet(wallet.name) : window.open(downloadLink, "_blank")
                  }
                >
                  {wallet ? (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect {title}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Install {title}
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {accounts.size > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-400" />
              Connected Accounts ({accounts.size})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...accounts.entries()].map(([address, account]) => (
              <div 
                key={address}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeAccount?.address === address 
                    ? "bg-nft-purple/20 border border-nft-purple/40" 
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setActiveAccount(account)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="activeAccount"
                    checked={activeAccount?.address === address || false}
                    onChange={() => setActiveAccount(account)}
                    className="text-nft-purple focus:ring-nft-purple"
                  />
                  <div>
                    <p className="font-medium text-white">
                      {account.name || shortPolkadotAddress(account.address)}
                    </p>
                    <p className="text-sm text-gray-400">
                      via {account.wallet?.prettyName || "Unknown Wallet"}
                    </p>
                  </div>
                </div>
                {activeAccount?.address === address && (
                  <Badge className="bg-nft-purple text-white">Active</Badge>
                )}
              </div>
            ))}
            
            <Button 
              variant="outline" 
              onClick={disconnectWallet}
              className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Disconnect All Wallets
            </Button>
          </CardContent>
        </Card>
      )}

      {accounts.size === 0 && (
        <Card className="bg-gray-800/50 border-gray-700 border-dashed">
          <CardContent className="p-6 text-center">
            <Wallet className="w-12 h-12 mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400 mb-2">No accounts connected</p>
            <p className="text-sm text-gray-500">
              Install and connect a wallet to start using the platform
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolkadotWalletSelector;