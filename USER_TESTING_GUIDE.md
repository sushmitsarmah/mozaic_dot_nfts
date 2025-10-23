# User Testing Guide for MozaicDot NFT Marketplace

This guide walks you through testing all core features of the MozaicDot NFT marketplace from a user's perspective.

## Prerequisites
- Install a Polkadot wallet extension (Polkadot.js, Talisman, or SubWallet)
- Get testnet tokens for Paseo AssetHub (recommended for testing)

---

## Test Scenario 1: View NFTs and Collections

### Step 1: Landing on the Website
1. Open the MozaicDot website
2. You should see the homepage with "Explore NFTs on the Polkadot Ecosystem"
3. **Expected**: Paseo AssetHub should be selected by default in the network dropdown (top right)

### Step 2: Browse the Gallery
1. Click "Gallery" in the navigation menu
2. **Expected**: You should see a list of NFT collections from the selected network
3. Try switching networks using the dropdown in the header
4. **Expected**: The gallery should reload and show collections from the new network

### Step 3: View a Collection
1. Click on any collection card in the gallery
2. **Expected**: You should see:
   - Collection name and description
   - Collection image (if available)
   - Owner address
   - List of NFTs in the collection

### Step 4: View an NFT
1. Click on any NFT in the collection
2. **Expected**: You should see:
   - NFT image
   - NFT name and description
   - NFT attributes
   - Owner information
   - Price (if listed for sale)
   - Trade history (if NFT has been bought/sold)

---

## Test Scenario 2: Create and Manage Collections

### Step 1: Connect Your Wallet
1. Click "Connect Wallet" button in the top right
2. Select your wallet extension from the list
3. Approve the connection in your wallet
4. **Expected**: Your wallet address should now appear in the navigation bar

### Step 2: View Your Collections
1. Click "My Collections" in the navigation menu
2. **Expected**: You should see a list of collections you own on the current network
3. If you have no collections, you'll see a message: "No collections found"

### Step 3: Create a New Collection
1. From "My Collections" page, click "Create Collection"
2. Fill in the form:
   - **Collection Name**: e.g., "My Test Collection"
   - **Collection Description**: e.g., "A test collection for MozaicDot"
   - **Collection Image**: Upload an image (optional)
3. Click "Create Collection"
4. Approve the transaction in your wallet
5. **Expected**:
   - You should see a success notification
   - The page will reload and show your new collection

### Step 4: Edit a Collection
1. Go to "My Collections"
2. Click on the collection you just created
3. Click "Edit Collection" button
4. Update the name, description, or image
5. Click "Update Collection"
6. Approve the transaction
7. **Expected**: Collection metadata should be updated

---

## Test Scenario 3: Create and Manage NFTs

### Step 1: Create an NFT
1. Navigate to your collection (from "My Collections")
2. Click "Create NFT" button
3. Fill in the NFT form:
   - **NFT Name**: e.g., "Test NFT #1"
   - **Description**: e.g., "My first test NFT"
   - **Image**: Upload an image
   - **Audio**: (Optional) Upload audio file
   - **External URL**: (Optional) Link to external content
   - **Attributes**: Add custom traits (e.g., "Color" = "Blue")
4. Click "Create NFT"
5. Approve the transaction
6. **Expected**:
   - Success notification
   - Page reloads showing your new NFT

### Step 2: Edit an NFT
1. Click on the NFT you just created
2. Click "Edit NFT" button
3. Try editing **without uploading a new image**:
   - Change the name or description
   - Click "Update NFT"
   - **Expected**: NFT updates while keeping the original image
4. Try editing **with a new image**:
   - Upload a different image
   - Click "Update NFT"
   - **Expected**: NFT updates with the new image

---

## Test Scenario 4: List NFT for Sale

### Step 1: Set a Price
1. Navigate to one of your NFTs
2. Scroll to the "Trade NFT" section
3. Enter a price (e.g., "0.001")
4. **Expected**: Price should be displayed in the correct token (PAS for Paseo)
5. Leave "Specific Buyer" field empty for public listing
6. Click "List for Sale"
7. Approve the transaction
8. **Expected**:
   - Success notification
   - NFT now shows as "Listed for Sale"
   - Price is displayed correctly

### Step 2: Update Price
1. Change the price in the input field (e.g., "0.002")
2. Click "Update Price"
3. Approve the transaction
4. **Expected**: New price is reflected

### Step 3: Delist NFT
1. Click "Delist" button
2. Approve the transaction
3. **Expected**:
   - NFT is no longer listed for sale
   - "Delist" button disappears

---

## Test Scenario 5: Buy an NFT

### Step 1: Setup Second Wallet
1. Disconnect your current wallet (click "Disconnect")
2. Connect with a different wallet account
3. Make sure this wallet has testnet tokens

### Step 2: Browse and Buy
1. Go to "Gallery" and find a listed NFT
   - Or navigate directly to the NFT if you know the collection/item ID
2. **Expected**: You should see:
   - "Buy Now" button
   - Price displayed correctly
3. Click "Buy Now"
4. Approve the transaction
5. **Expected**:
   - Success notification
   - NFT ownership transfers to your account
   - NFT is no longer listed for sale

### Step 3: Verify Ownership
1. Go to "My Collections"
2. Find the NFT you just bought
3. **Expected**:
   - NFT now appears in your collections
   - You are shown as the owner
   - Original collection owner remains unchanged

### Step 4: Check Trade History
1. View the NFT details
2. Scroll to "Trade History" section
3. **Expected**: You should see:
   - "Bought" event with timestamp and block number
   - Previous "Listed" event
   - Any previous "Transfer" events

---

## Test Scenario 6: Network Switching

### Step 1: Test Network Persistence
1. Select "Paseo AssetHub" from the network dropdown
2. Refresh the page
3. **Expected**: Paseo AssetHub should still be selected

### Step 2: Switch Networks
1. Change network to "Westend AssetHub"
2. **Expected**:
   - Gallery reloads with Westend collections
   - Token symbol changes to WND
   - "My Collections" shows your Westend collections

---

## Common Issues to Test

### Issue 1: IPFS Image Loading
- **Test**: Create NFT with image, then edit without uploading new image
- **Expected**: Original image should remain, no blank images

### Issue 2: Price Calculations
- **Test**: List NFT on different networks
- **Expected**:
  - Paseo shows price in PAS (10 decimals)
  - Kusama shows price in KSM (12 decimals)
  - Unique shows price in UNQ (18 decimals)

### Issue 3: Wallet Disconnection
- **Test**: Disconnect wallet and try to create collection/NFT
- **Expected**: Should show "Connect Wallet" prompt

### Issue 4: Permission Checks
- **Test**: Try to edit someone else's NFT/collection
- **Expected**: Edit buttons should not appear for non-owners

---

## Test Checklist

Use this checklist to track your testing progress:

- [ ] Homepage loads correctly
- [ ] Gallery displays collections
- [ ] Can view collection details
- [ ] Can view NFT details
- [ ] Wallet connection works
- [ ] Can create a collection
- [ ] Can edit owned collection
- [ ] Can create an NFT
- [ ] Can edit NFT without changing image
- [ ] Can edit NFT with new image
- [ ] Can list NFT for sale
- [ ] Can update NFT price
- [ ] Can delist NFT
- [ ] Can buy NFT with different wallet
- [ ] Trade history appears after purchase
- [ ] Network selection persists after refresh
- [ ] Token symbols display correctly per network
- [ ] Only owners see edit buttons

---

## Reporting Issues

If you find any issues during testing:
1. Note the network you're using
2. Describe the steps you took
3. Describe what happened vs. what you expected
4. Check browser console for error messages
5. Report the issue with all above information
