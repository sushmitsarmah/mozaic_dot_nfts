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

export type SdkContextValueType = {
  sdk?: AssetHubInstance;
  currentNetwork: string;
  switchNetwork: (networkUrl: string) => void;
};

export const UniqueSDKContext = createContext<SdkContextValueType>({
  sdk: undefined,
  currentNetwork: "",
  switchNetwork: () => {},
});

const defaultNetwork = import.meta.env.VITE_REST_URL || "https://rest.unique.network/v2/kusama-asset-hub";

export const UniqueSDKProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<AssetHubInstance>();
  const [currentNetwork, setCurrentNetwork] = useState<string>(defaultNetwork);

  const initializeSdk = useCallback((networkUrl: string) => {
    console.log("Initializing AssetHub SDK with URL:", networkUrl);
    try {
      const newSdk = AssetHub({ baseUrl: networkUrl });
      setSdk(newSdk);
      setCurrentNetwork(networkUrl);
      console.log("AssetHub SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AssetHub SDK:", error);
    }
  }, []);

  const switchNetwork = useCallback((networkUrl: string) => {
    console.log("Switching network to:", networkUrl);
    initializeSdk(networkUrl);
  }, [initializeSdk]);

  useEffect(() => {
    initializeSdk(defaultNetwork);
  }, [initializeSdk]);

  return (
    <UniqueSDKContext.Provider value={useMemo(() => ({ sdk, currentNetwork, switchNetwork }), [sdk, currentNetwork, switchNetwork])}>
      {children}
    </UniqueSDKContext.Provider>
  );
};

export const useSdkContext = () => useContext(UniqueSDKContext);