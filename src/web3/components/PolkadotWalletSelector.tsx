import React from "react";
import { useAccountsContext } from "@/web3/lib/wallets/AccountsProvider";
import { KNOWN_WALLETS, shortPolkadotAddress } from "@/web3/lib/utils";
import { Button } from "@/components/ui/button";

const PolkadotWalletSelector: React.FC = () => {
  const accountsContext = useAccountsContext();

  if (!accountsContext) {
    return <div>Loading...</div>;
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
    <div className="">
      <h2 className="">Polkadot Wallet Selector</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        {KNOWN_WALLETS.map(({ name, title, downloadLink }) => {
          const wallet = wallets.find((w) => w.name === name);
          return (
            <Button
              key={name}
              className={`${
                wallet ? "bg-slate-600" : "bg-slate-200"
              }`}
              onClick={() =>
                wallet ? connectWallet(wallet.name) : window.open(downloadLink, "_blank")
              }
            >
              {wallet ? `Connect ${title}` : `Download ${title}`}
            </Button>
          );
        })}
      </div>

      {accounts.size > 0 && (
        <div className="flex flex-col gap-2">
          <h3>Connected Accounts</h3>
          {[...accounts.entries()].map(([address, account]) => (
            <label key={address}>
              <input
                type="radio"
                name="activeAccount"
                checked={activeAccount?.address === address || false}
                onChange={() => setActiveAccount(account)}
              />
              {account.name || shortPolkadotAddress(account.address)}
              <small>By {account.wallet?.prettyName || "Unknown"}</small>
            </label>
          ))}
          <button onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletSelector;