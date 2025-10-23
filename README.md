# MozaicDot NFT Marketplace - Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [User Guide](#user-guide)
5. [Network Support](#network-support)
6. [Technical Architecture](#technical-architecture)
7. [API Reference](#api-reference)

---

## Overview

MozaicDot is a decentralized NFT marketplace built on Polkadot parachains, supporting multiple networks including Polkadot AssetHub, Kusama AssetHub, Unique Network, and various testnets. The platform allows users to create, mint, trade, and manage NFT collections across different Polkadot ecosystem chains.

### Key Features
- **Multi-chain Support**: Works across 7+ Polkadot parachains
- **Collection Management**: Create and manage NFT collections
- **NFT Minting**: Mint NFTs with images, audio, and rich metadata
- **Trading System**: List NFTs for sale, buy, and transfer
- **Wallet Integration**: Connect via Polkadot.js, Talisman, and other wallets
- **IPFS Storage**: Decentralized storage via Pinata

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- A Polkadot-compatible wallet (Polkadot.js, Talisman, SubWallet, etc.)
- Tokens on your chosen network for transaction fees

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mozaic_dot_nfts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```env
   # Pinata IPFS Configuration (Required for image/metadata storage)
   VITE_PINATA_JWT=your_pinata_jwt_token
   VITE_PINATA_GATEWAY=your_gateway_subdomain.mypinata.cloud

   # Subscan API Key (Required for trade history and collection fetching)
   VITE_SUBSCAN_API_KEY=your_subscan_api_key

   # Optional: Default Network
   VITE_REST_URL=https://rest.unique.network/v2/paseo-asset-hub
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Getting API Keys

#### Pinata (IPFS Storage)
1. Visit [https://pinata.cloud](https://pinata.cloud)
2. Create an account
3. Generate JWT token from API Keys section
4. Create a dedicated gateway (optional but recommended)
5. Add credentials to `.env`

#### Subscan API
1. Visit [https://pro.subscan.io](https://pro.subscan.io)
2. Create an account
3. Generate an API key
4. Add to `.env` as `VITE_SUBSCAN_API_KEY`

---

## Features

### 1. Network Switching
Switch between different Polkadot parachains in real-time:
- Kusama AssetHub (Mainnet)
- Polkadot AssetHub (Mainnet)
- Unique Network (Mainnet)
- Paseo AssetHub (Testnet - Recommended)
- Westend AssetHub (Testnet)
- Rococo AssetHub (Testnet)
- Opal Network (Testnet)

**Location**: Top navigation bar
**Persistence**: Your selection is saved and restored on page refresh

### 2. Wallet Connection
Connect your Polkadot-compatible wallet to interact with the platform.

**Supported Wallets**:
- Polkadot.js Extension
- Talisman
- SubWallet
- Nova Wallet
- And more via Polkadot Connect

**How to Connect**:
1. Click "Connect Wallet" in the top right
2. Select your wallet from the list
3. Approve the connection in your wallet
4. Select an account

### 3. Collection Management

#### Creating a Collection
1. Navigate to **Create** page
2. Fill in collection details:
   - **Name**: Your collection name
   - **Description**: Brief description
   - **Symbol**: 3-5 character symbol (e.g., "PKG")
   - **Max Supply**: Maximum number of NFTs (optional)
   - **Image**: Collection cover image
3. Click "Create Collection"
4. Sign the transaction in your wallet
5. Wait for blockchain confirmation

**File**: `src/web3/services/collections/create.tsx`

#### Editing a Collection
1. Navigate to your collection page
2. Click "Edit Collection" (owners only)
3. Update name, description, or image
4. Submit changes
5. Metadata is updated on IPFS and blockchain

**File**: `src/web3/services/collections/edit-collection.tsx`

### 4. NFT Creation (Minting)

#### Minting an NFT
1. Go to your collection page
2. Click "Create NFT"
3. Fill in NFT details:
   - **Name**: NFT name
   - **Description**: Detailed description
   - **Image**: NFT artwork (required)
   - **External URL**: Link to external content (optional)
   - **Audio**: Audio file (optional)
   - **Audio Description**: Description of audio (optional)
   - **Attributes**: Custom key-value properties
4. Click "Create NFT"
5. Sign transaction and wait for confirmation

**Supported Formats**:
- Images: JPG, PNG, GIF, SVG (Max 10MB)
- Audio: MP3, WAV, OGG, FLAC (Max 50MB)

**File**: `src/web3/services/collections/create-nft.tsx`

#### Editing an NFT
1. Navigate to NFT detail page
2. Click "Edit NFT" (owners only)
3. Update any metadata fields
4. Upload new image/audio or keep existing
5. Submit changes

**Important**: Existing images/audio are preserved if you don't upload new files.

**File**: `src/web3/services/collections/edit-nft.tsx`

### 5. NFT Trading

#### Listing an NFT for Sale
1. Go to your NFT detail page
2. In the "Trading Options" section:
   - Enter price in network tokens (e.g., PAS, DOT, KSM)
   - Optionally specify a buyer address (to restrict purchase)
3. Click "List for Sale"
4. Sign transaction

**File**: `src/web3/services/collections/nft_trade.tsx:83-100`

#### Buying an NFT
1. Navigate to a listed NFT
2. View the "Purchase NFT" section
3. Enter your bid (must be ≥ listed price)
4. Click "Buy NFT"
5. Sign transaction
6. NFT ownership transfers automatically

**File**: `src/web3/services/collections/nft_trade.tsx:102-160`

#### Delisting an NFT
1. Go to your listed NFT
2. Click "Delist" button
3. Sign transaction
4. NFT is removed from sale

**File**: `src/web3/services/collections/nft_trade.tsx:162-199`

### 6. NFT Operations

#### Transferring an NFT
Transfer ownership to another address.

**File**: `src/web3/services/collections/transfer-nft.tsx`

#### Burning an NFT
Permanently destroy an NFT (irreversible).

**File**: `src/web3/services/collections/burn-nft.tsx`

#### Approving Transfers
Allow another address to transfer your NFT.

**File**: `src/web3/services/collections/approve-transfer.tsx`

#### Clearing Metadata
Remove NFT metadata while keeping the token.

**File**: `src/web3/services/collections/clear-metadata.tsx`

### 7. Trade History
View the complete transaction history of any NFT:
- Purchase events with price and participants
- Listing events
- Transfer events
- Block numbers and timestamps

Powered by Subscan API for accurate on-chain data.

**File**: `src/components/TradeHistory.tsx`

---

## User Guide

### Step-by-Step Tutorial: Creating and Selling Your First NFT

#### Step 1: Setup
1. Install a Polkadot wallet (Polkadot.js or Talisman recommended)
2. Get testnet tokens:
   - For Paseo: Use [Paseo Faucet](https://faucet.polkadot.io)
3. Visit the marketplace
4. Connect your wallet
5. Select "Paseo AssetHub" network

#### Step 2: Create a Collection
1. Click "Create" in navigation
2. Wait for your collections to load
3. Click "Create New Collection"
4. Fill in details:
   ```
   Name: My First Collection
   Description: A collection of unique digital art
   Symbol: MFC
   Max Supply: 100
   ```
5. Upload a collection image
6. Click "Create Collection"
7. Sign the transaction (cost: ~0.002 PAS)
8. Wait 6-12 seconds for confirmation

#### Step 3: Mint Your First NFT
1. Navigate to "My Collections"
2. Click on your new collection
3. Click "Create NFT"
4. Fill in NFT details:
   ```
   Name: Genesis #1
   Description: The first NFT in my collection
   ```
5. Upload your artwork
6. Add attributes (optional):
   ```
   Trait: Background | Value: Blue
   Trait: Rarity | Value: Legendary
   ```
7. Click "Create NFT"
8. Sign transaction (cost: ~0.002 PAS)

#### Step 4: List for Sale
1. Click on your minted NFT
2. Scroll to "Trading Options"
3. Enter price: `0.1`
4. Leave buyer address empty (public sale)
5. Click "List for Sale"
6. Sign transaction

#### Step 5: Test Buying (Optional)
1. Connect with a different wallet
2. Navigate to the NFT
3. Enter bid: `0.1` or higher
4. Click "Buy NFT"
5. Verify ownership transfer

---

## Network Support

### Supported Networks

| Network | Type | Token | Subscan API | Status |
|---------|------|-------|-------------|--------|
| Kusama AssetHub | Mainnet | KSM | ✅ | Live |
| Polkadot AssetHub | Mainnet | DOT | ✅ | Live |
| Unique Network | Mainnet | UNQ | ✅ | Live |
| Paseo AssetHub | Testnet | PAS | ✅ | Recommended |
| Westend AssetHub | Testnet | WND | ✅ | Live |
| Rococo AssetHub | Testnet | ROC | ✅ | Live |
| Opal Network | Testnet | OPL | ✅ | Live |

### Network Configuration

Networks are defined in `src/components/NetworkSelector.tsx`:

```typescript
{
  id: "paseo-asset-hub",
  name: "Paseo AssetHub",
  url: "https://rest.unique.network/v2/paseo-asset-hub",
  tokenSymbol: "PAS",
  decimals: 10,
  subscanUrl: "https://assethub-paseo.api.subscan.io",
  isTestnet: true,
  recommended: true
}
```

### Token Decimals

Different networks use different decimal places:

- **Polkadot/Paseo**: 10 decimals (1 DOT/PAS = 10^10 units)
- **Kusama/Westend/Rococo**: 12 decimals (1 KSM = 10^12 units)
- **Unique/Opal**: 18 decimals (1 UNQ = 10^18 units)

Token conversion is handled automatically in `src/lib/utils/tokens.ts`.

---

## Technical Architecture

### Project Structure

```
mozaic_dot_nfts/
├── src/
│   ├── components/          # React components
│   │   ├── NetworkSelector.tsx
│   │   ├── Navigation.tsx
│   │   ├── NFTDetailView.tsx
│   │   ├── TradeHistory.tsx
│   │   └── nft/            # NFT-specific components
│   ├── pages/              # Page components
│   │   ├── Create.tsx
│   │   ├── Gallery.tsx
│   │   └── MyCollections.tsx
│   ├── web3/               # Blockchain integration
│   │   ├── lib/
│   │   │   ├── sdk/       # Unique SDK provider
│   │   │   └── wallets/   # Wallet connection
│   │   └── services/
│   │       ├── collections/  # Collection/NFT operations
│   │       └── ipfs/        # IPFS upload services
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   │   └── utils/
│   │       ├── tokens.ts   # Token conversion
│   │       └── ipfs.ts     # IPFS helpers
│   └── main.tsx           # App entry point
├── .env                    # Environment configuration
└── vercel.json            # Deployment config
```

### Key Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Blockchain**: Unique Network SDK v2
- **Storage**: Pinata (IPFS)
- **Indexer**: Subscan API
- **Wallet**: Polkadot Connect

### State Management

- **SDK Context**: `src/web3/lib/sdk/UniqueSDKProvider.tsx`
  - Manages network selection and SDK initialization
  - Persists network choice to localStorage

- **Wallet Context**: `src/web3/lib/wallets/AccountsProvider.tsx`
  - Manages wallet connections and account state

### Data Flow

1. **Collection Fetching**:
   ```
   User selects network → SDK initializes
   → Fetch collections via Subscan (AssetHub) or Indexer API (Unique)
   → Display in UI
   ```

2. **NFT Creation**:
   ```
   User uploads image → Upload to Pinata IPFS → Get hash
   → Build metadata JSON → Upload metadata to IPFS → Get hash
   → Call SDK create NFT → Transaction signed → NFT minted
   ```

3. **NFT Trading**:
   ```
   Owner sets price → SDK setPrice() → Transaction
   → Buyer submits bid → SDK buy() → Atomic swap (funds + NFT)
   ```

---

## API Reference

### SDK Context

```typescript
import { useSdkContext } from "@/web3/lib/sdk/UniqueSDKProvider";

const { sdk, currentNetworkId, currentNetwork, switchNetwork } = useSdkContext();

// Switch networks
switchNetwork("polkadot-asset-hub");

// Access SDK
const collection = await sdk.nftsPallet.collection.get({ collectionId: 1 });
```

### Token Utilities

```typescript
import { getNetworkTokenInfo, formatTokenAmount, parseTokenAmount } from "@/lib/utils/tokens";

// Get token info for a network
const { symbol, decimals } = getNetworkTokenInfo(networkUrl);
// Returns: { symbol: "PAS", decimals: 10 }

// Format from blockchain units to human-readable
const readable = formatTokenAmount(3000000000, networkUrl);
// Returns: "0.3"

// Parse from human input to blockchain units
const units = parseTokenAmount(0.3, networkUrl);
// Returns: "3000000000"
```

### IPFS Upload

```typescript
import { uploadImage, uploadMetadata } from "@/web3/services/ipfs/pinata";

// Upload image
const imageFile = /* File object */;
const imageHash = await uploadImage(imageFile);
// Returns: "bafybeiabc..."

// Upload metadata
const metadata = {
  name: "My NFT",
  description: "Description",
  image: `ipfs://ipfs/${imageHash}`,
  attributes: [{ trait_type: "Color", value: "Blue" }]
};
const metadataHash = await uploadMetadata(metadata);
// Returns: "ipfs://ipfs/bafybei..."
```

### Collection Operations

```typescript
// Create collection
await sdk.nftsPallet.collection.create({
  name: "My Collection",
  description: "Description",
  tokenPrefix: "MYC"
}, buildOptions, signerAccount);

// Get collection
const collection = await sdk.nftsPallet.collection.get({
  collectionId: 1
});

// Set collection metadata
await sdk.nftsPallet.collection.setMetadata({
  collectionId: 1,
  data: "ipfs://ipfs/..."
}, buildOptions, signerAccount);
```

### NFT Operations

```typescript
// Mint NFT
await sdk.nftsPallet.item.create({
  collectionId: 1,
  owner: ownerAddress,
  data: "ipfs://ipfs/..."
}, buildOptions, signerAccount);

// Get NFT
const nft = await sdk.nftsPallet.item.get({
  collectionId: 1,
  itemId: 1
});

// Update NFT metadata
await sdk.nftsPallet.item.setMetadata({
  collectionId: 1,
  itemId: 1,
  data: "ipfs://ipfs/..."
}, buildOptions, signerAccount);

// Transfer NFT
await sdk.nftsPallet.item.transfer({
  collectionId: 1,
  itemId: 1,
  to: recipientAddress
}, buildOptions, signerAccount);

// Burn NFT
await sdk.nftsPallet.item.burn({
  collectionId: 1,
  itemId: 1
}, buildOptions, signerAccount);
```

### Trading Operations

```typescript
// List for sale
await sdk.nftsPallet.trade.setPrice({
  collectionId: 1,
  itemId: 1,
  price: "3000000000", // in base units
  buyer: undefined // or specific address
}, buildOptions, signerAccount);

// Buy NFT
await sdk.nftsPallet.trade.buy({
  collectionId: 1,
  itemId: 1,
  bidPrice: "3000000000"
}, buildOptions, signerAccount);

// Delist (set price to null)
await sdk.nftsPallet.trade.setPrice({
  collectionId: 1,
  itemId: 1,
  price: null,
  buyer: undefined
}, buildOptions, signerAccount);
```

---

## Troubleshooting

### Common Issues

#### Collections Not Loading
**Symptom**: "No collections found" or infinite loading

**Solutions**:
1. Check you're on the correct network
2. Verify Subscan API key is configured
3. Check browser console for errors
4. Refresh the page

#### Image Upload Fails
**Symptom**: Error when uploading images

**Solutions**:
1. Verify Pinata JWT token is valid
2. Check image size (must be < 10MB)
3. Ensure image format is supported (JPG, PNG, GIF, SVG)

#### Transaction Fails
**Symptom**: "Transaction Failed" error

**Solutions**:
1. Check wallet balance (need tokens for fees)
2. Verify you're the owner (for owner-only operations)
3. Check network isn't congested
4. Try increasing gas/fees if option available

#### Wrong Token Symbol Showing
**Symptom**: Shows "UNQ" instead of "PAS"

**Solution**: Network configuration issue - already fixed in latest version

---

## Best Practices

### For Users

1. **Start with Testnets**: Use Paseo AssetHub to learn before using mainnet
2. **Backup Wallet**: Always backup your wallet seed phrase
3. **Verify Transactions**: Double-check addresses and amounts before signing
4. **IPFS Persistence**: Important images should be pinned on Pinata
5. **Gas Fees**: Keep some tokens for transaction fees

### For Developers

1. **Error Handling**: Always wrap SDK calls in try-catch
2. **Loading States**: Show loading indicators during blockchain operations
3. **Input Validation**: Validate user input before transactions
4. **Token Conversion**: Use utility functions for decimal conversion
5. **Network Awareness**: Check current network before operations

---

## Support & Resources

### Documentation
- [Unique Network SDK](https://docs.unique.network/build/sdk/v2/)
- [Subscan API Docs](https://support.subscan.io/)
- [Polkadot Wiki](https://wiki.polkadot.network/)

### Community
- GitHub Issues: Report bugs and request features
- Discord: Join the community (if available)

### License
See LICENSE file in repository root.
