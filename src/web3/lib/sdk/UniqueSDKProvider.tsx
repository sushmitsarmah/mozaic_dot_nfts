import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
} from "react";
import { AssetHub, AssetHubInstance } from "@unique-nft/sdk";
import { NETWORKS } from "@/components/NetworkSelector";

export type SdkContextValueType = {
  sdk?: AssetHubInstance;
  currentNetworkId: string;
  currentNetwork: string; // URL for backward compatibility
  switchNetwork: (networkId: string) => void;
};

export const UniqueSDKContext = createContext<SdkContextValueType>({
  sdk: undefined,
  currentNetworkId: "",
  currentNetwork: "",
  switchNetwork: () => {},
});

const DEFAULT_NETWORK_ID = "paseo-asset-hub";
const NETWORK_STORAGE_KEY = "selected_network_id";

export const UniqueSDKProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<AssetHubInstance>();
  const [currentNetworkId, setCurrentNetworkId] = useState<string>(() => {
    // Load saved network ID from localStorage or use default
    const savedNetworkId = localStorage.getItem(NETWORK_STORAGE_KEY);
    return savedNetworkId || DEFAULT_NETWORK_ID;
  });

  const initializeSdk = useCallback((networkId: string) => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (!network) {
      console.error("Network not found:", networkId);
      return;
    }

    console.log("Initializing AssetHub SDK with network:", network.name);
    try {
      const newSdk = AssetHub({ baseUrl: network.url });
      setSdk(newSdk);
      setCurrentNetworkId(networkId);
      // Save to localStorage
      localStorage.setItem(NETWORK_STORAGE_KEY, networkId);
      console.log("AssetHub SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AssetHub SDK:", error);
    }
  }, []);

  const switchNetwork = useCallback((networkId: string) => {
    console.log("Switching network to:", networkId);
    initializeSdk(networkId);
  }, [initializeSdk]);

  useEffect(() => {
    initializeSdk(currentNetworkId);
  }, [initializeSdk]);

  const currentNetwork = NETWORKS.find(n => n.id === currentNetworkId)?.url || "";

  return (
    <UniqueSDKContext.Provider value={useMemo(() => ({ sdk, currentNetworkId, currentNetwork, switchNetwork }), [sdk, currentNetworkId, currentNetwork, switchNetwork])}>
      {children}
    </UniqueSDKContext.Provider>
  );
};

export const useSdkContext = () => useContext(UniqueSDKContext);