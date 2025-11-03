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
  switchNetwork: (networkId: string) => Promise<void>;
  checkBalance: (address: string) => Promise<bigint | null>;
};

export const UniqueSDKContext = createContext<SdkContextValueType>({
  sdk: undefined,
  currentNetworkId: "",
  currentNetwork: "",
  switchNetwork: async () => {},
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
  const [previousNetworkId, setPreviousNetworkId] = useState<string>(currentNetworkId);
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

  const initializeSdk = useCallback(async (networkId: string, shouldCheckBalance: boolean = false): Promise<boolean> => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (!network) {
      console.error("Network not found:", networkId);
      toast({
        title: "Network Error",
        description: "Selected network configuration not found.",
        variant: "destructive",
      });
      return false;
    }

    console.log("Initializing AssetHub SDK with network:", network.name);
    try {
      const newSdk = AssetHub({ baseUrl: network.url });

      // Test the connection by making a simple query
      try {
        // Simple test to verify SDK is working
        await newSdk.balance.get({ address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" }); // Test address
      } catch (testError) {
        console.error("SDK connection test failed:", testError);
        throw new Error("Failed to connect to network. The network may be unavailable.");
      }

      setSdk(newSdk);
      setCurrentNetworkId(networkId);
      setPreviousNetworkId(networkId);
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

      return true;
    } catch (error: any) {
      console.error("Failed to initialize AssetHub SDK:", error);
      toast({
        title: "Network Switch Failed",
        description: error.message || `Failed to connect to ${network.name}. Please check your connection and try again.`,
        variant: "destructive",
      });
      return false;
    }
  }, [accountsContext?.activeAccount, notifyZeroBalance]);

  const switchNetwork = useCallback(async (networkId: string) => {
    console.log("Switching network to:", networkId);

    // Store current network in case we need to revert
    const previousNetwork = currentNetworkId;
    const targetNetwork = NETWORKS.find(n => n.id === networkId);

    if (!targetNetwork) {
      console.error("Target network not found:", networkId);
      return;
    }

    // Show loading state briefly
    toast({
      title: "Switching Network",
      description: `Connecting to ${targetNetwork.name}...`,
    });

    // Try to switch network
    const success = await initializeSdk(networkId, true); // Enable balance check on network switch

    if (!success) {
      // Switch failed - revert to previous network
      console.log("Network switch failed, reverting to:", previousNetwork);
      setCurrentNetworkId(previousNetwork);

      // Don't show another toast if initializeSdk already showed one
      const previousNetworkName = NETWORKS.find(n => n.id === previousNetwork)?.name || "previous network";
      toast({
        title: "Reverted to Previous Network",
        description: `Staying on ${previousNetworkName} due to connection failure.`,
        variant: "default",
      });
    } else {
      // Success - show confirmation
      toast({
        title: "Network Switched",
        description: `Successfully connected to ${targetNetwork.name}.`,
        variant: "default",
      });
    }
  }, [initializeSdk, currentNetworkId]);

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