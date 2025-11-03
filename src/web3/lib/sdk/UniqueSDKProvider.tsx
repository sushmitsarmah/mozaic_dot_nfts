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
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { toast } from "@/components/ui/use-toast";

export type SdkContextValueType = {
  sdk?: AssetHubInstance;
  currentNetworkId: string;
  currentNetwork: string; // URL for backward compatibility
  switchNetwork: (networkId: string) => void;
  checkBalance: (address: string) => Promise<bigint | null>;
};

export const UniqueSDKContext = createContext<SdkContextValueType>({
  sdk: undefined,
  currentNetworkId: "",
  currentNetwork: "",
  switchNetwork: () => {},
  checkBalance: async () => null,
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
  const accountsContext = useAccountsContext();

  const checkBalance = useCallback(async (address: string): Promise<bigint | null> => {
    if (!sdk) {
      console.warn("SDK not initialized");
      return null;
    }

    try {
      // Use the SDK's balance query method
      const balance = await sdk.balance.get({ address });
      const availableBalance = BigInt(balance.available);
      console.log(`Balance for ${address} on ${currentNetworkId}:`, balance.available);
      return availableBalance;
    } catch (error) {
      console.error("Error checking balance:", error);
      return null;
    }
  }, [sdk, currentNetworkId]);

  const notifyZeroBalance = useCallback((networkName: string, tokenSymbol: string) => {
    toast({
      title: "Insufficient Balance",
      description: `You have zero ${tokenSymbol} balance on ${networkName}. Please fund your wallet before performing transactions.`,
      variant: "destructive",
    });
  }, []);

  const initializeSdk = useCallback(async (networkId: string, shouldCheckBalance: boolean = false) => {
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

      // Check balance if requested and user is connected
      if (shouldCheckBalance && accountsContext?.activeAccount) {
        // Wait a moment for SDK to be fully ready
        setTimeout(async () => {
          try {
            const balance = await newSdk.balance.get({
              address: accountsContext.activeAccount!.address
            });
            const availableBalance = BigInt(balance.available);

            if (availableBalance === 0n) {
              notifyZeroBalance(network.name, network.tokenSymbol);
            }
          } catch (error) {
            console.error("Error checking balance after network switch:", error);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Failed to initialize AssetHub SDK:", error);
    }
  }, [accountsContext?.activeAccount, notifyZeroBalance]);

  const switchNetwork = useCallback((networkId: string) => {
    console.log("Switching network to:", networkId);
    initializeSdk(networkId, true); // Enable balance check on network switch
  }, [initializeSdk]);

  useEffect(() => {
    initializeSdk(currentNetworkId, false); // Don't check balance on initial load
  }, []);

  // Check balance when account connects
  useEffect(() => {
    const checkBalanceOnConnect = async () => {
      if (!sdk || !accountsContext?.activeAccount) return;

      try {
        const balance = await sdk.balance.get({
          address: accountsContext.activeAccount.address
        });
        const availableBalance = BigInt(balance.available);

        if (availableBalance === 0n) {
          const network = NETWORKS.find(n => n.id === currentNetworkId);
          if (network) {
            notifyZeroBalance(network.name, network.tokenSymbol);
          }
        }
      } catch (error) {
        console.error("Error checking balance on account connect:", error);
      }
    };

    checkBalanceOnConnect();
  }, [accountsContext?.activeAccount?.address, sdk, currentNetworkId, notifyZeroBalance]);

  const currentNetwork = NETWORKS.find(n => n.id === currentNetworkId)?.url || "";

  return (
    <UniqueSDKContext.Provider value={useMemo(() => ({
      sdk,
      currentNetworkId,
      currentNetwork,
      switchNetwork,
      checkBalance
    }), [sdk, currentNetworkId, currentNetwork, switchNetwork, checkBalance])}>
      {children}
    </UniqueSDKContext.Provider>
  );
};

export const useSdkContext = () => useContext(UniqueSDKContext);