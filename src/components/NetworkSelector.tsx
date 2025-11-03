import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

export const NETWORKS = [
  {
    id: "kusama-asset-hub",
    name: "Kusama AssetHub",
    url: "https://rest.unique.network/v2/kusama-asset-hub",
    description: "Kusama parachain with existing NFTs",
    isTestnet: false,
    recommended: false,
    tokenSymbol: "KSM",
    decimals: 12,
    subscanUrl: "https://assethub-kusama.api.subscan.io"
  },
  {
    id: "polkadot-asset-hub",
    name: "Polkadot AssetHub",
    url: "https://rest.unique.network/v2/polkadot-asset-hub",
    description: "Polkadot mainnet",
    isTestnet: false,
    tokenSymbol: "DOT",
    decimals: 10,
    subscanUrl: "https://assethub-polkadot.api.subscan.io"
  },
  {
    id: "unique-network",
    name: "Unique Network",
    url: "https://rest.unique.network/v2/unique",
    description: "Dedicated NFT parachain on Polkadot",
    isTestnet: false,
    tokenSymbol: "UNQ",
    decimals: 18,
    subscanUrl: "https://unique.api.subscan.io"
  },
  {
    id: "paseo-asset-hub",
    name: "Paseo AssetHub",
    url: "https://rest.unique.network/v2/paseo-asset-hub",
    description: "Paseo testnet",
    isTestnet: true,
    recommended: true,
    tokenSymbol: "PAS",
    decimals: 10,
    subscanUrl: "https://assethub-paseo.api.subscan.io"
  },
  // {
  //   id: "westend-asset-hub",
  //   name: "Westend AssetHub",
  //   url: "https://rest.unique.network/v2/westend-asset-hub",
  //   description: "Testnet with existing NFTs",
  //   isTestnet: true,
  //   tokenSymbol: "WND",
  //   decimals: 12,
  //   subscanUrl: "https://assethub-westend.api.subscan.io"
  // },
  // {
  //   id: "rococo-asset-hub",
  //   name: "Rococo AssetHub",
  //   url: "https://rest.unique.network/v2/rococo-asset-hub",
  //   description: "Polkadot testnet",
  //   isTestnet: true,
  //   tokenSymbol: "ROC",
  //   decimals: 12,
  //   subscanUrl: "https://assethub-rococo.api.subscan.io"
  // },
  // {
  //   id: "opal-network",
  //   name: "Opal Network",
  //   url: "https://rest.unique.network/v2/opal",
  //   description: "Unique Network testnet",
  //   isTestnet: true,
  //   tokenSymbol: "OPL",
  //   decimals: 18,
  //   subscanUrl: "https://opal.api.subscan.io"
  // }
];

interface NetworkSelectorProps {
  currentNetworkId: string;
  onNetworkChange: (networkId: string) => void;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  currentNetworkId,
  onNetworkChange
}) => {
  const current = NETWORKS.find(network => network.id === currentNetworkId) || NETWORKS.find(n => n.recommended)!;

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <Select
        value={currentNetworkId}
        onValueChange={onNetworkChange}
      >
        <SelectTrigger className="min-w-56 w-auto bg-gray-800 border-gray-600 text-white">
          <SelectValue>
            <div className="flex items-center space-x-2 min-w-0">
              <span className="truncate">{current.name}</span>
              {current.isTestnet && (
                <Badge variant="secondary" className="text-xs shrink-0">Testnet</Badge>
              )}
              {current.recommended && (
                <Badge className="text-xs bg-green-600 shrink-0">Recommended</Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {NETWORKS.map((network) => (
            <SelectItem
              key={network.id}
              value={network.id}
              className="text-white hover:bg-gray-700"
            >
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center space-x-2">
                  <span>{network.name}</span>
                  {network.isTestnet && (
                    <Badge variant="secondary" className="text-xs">Testnet</Badge>
                  )}
                  {network.recommended && (
                    <Badge className="text-xs bg-green-600">Recommended</Badge>
                  )}
                </div>
                <span className="text-xs text-gray-400">{network.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NetworkSelector;