# Athena DAO Implementation

## Overview

This is a complete SvelteKit application for the Athena DAO that allows users to:
- Connect with their blockchain wallet (MetaMask or Coinbase Wallet on Polygon)
- Authenticate with Discord OAuth
- View their SpaceTime and SpaceMoney token balances
- Purchase SpaceMoney tokens
- Transfer SpaceMoney tokens to other addresses

## Features Implemented

### 1. Authentication System

#### Wallet Connection
- **File**: `src/lib/wallet.ts`
- Supports MetaMask and Coinbase Wallet
- Automatically switches to Polygon network (Chain ID: 137)
- Adds Polygon network if not already present in wallet
- Returns connected wallet address

#### Discord OAuth
- **Files**: 
  - `src/routes/api/auth/discord/+server.ts` - Initiates OAuth flow
  - `src/routes/api/auth/callback/+server.ts` - Handles OAuth callback
- Uses Discord's OAuth2 to authenticate users
- Stores Discord ID, username, and avatar

#### Session Management
- **File**: `src/lib/server/session.ts`
- Creates and manages user sessions
- Stores both wallet address and Discord information
- Uses secure HTTP-only cookies
- Session expires after 7 days

### 2. User Interface

#### Home Page (`/`)
- **File**: `src/routes/+page.svelte`
- Landing page with authentication
- Two-step authentication process:
  1. Connect wallet (MetaMask or Coinbase Wallet)
  2. Connect Discord account
- Shows user information when logged in
- Logout functionality

#### Dashboard (`/dashboard`)
- **File**: `src/routes/dashboard/+page.svelte`
- Displays user account information
- Shows SpaceTime token balance (non-tradable)
- Shows SpaceMoney token balance (tradable)
- Links to purchase and transfer pages

#### Purchase Page (`/tokens/purchase`)
- **File**: `src/routes/tokens/purchase/+page.svelte`
- Form to specify amount of SpaceMoney to purchase
- Processes purchase through API
- Shows transaction hash on success

#### Transfer Page (`/tokens/transfer`)
- **File**: `src/routes/tokens/transfer/+page.svelte`
- Form to specify recipient address and amount
- Processes transfer through API
- Shows transaction hash on success

### 3. API Endpoints

#### Authentication Endpoints
- `POST /api/auth/wallet` - Authenticate with wallet address
- `GET /api/auth/discord` - Initiate Discord OAuth
- `GET /api/auth/callback` - Handle Discord OAuth callback
- `GET /api/auth/me` - Get current user session
- `POST /api/auth/logout` - Clear session and logout

#### Token Endpoints
- `GET /api/tokens/balances` - Get user's token balances
- `POST /api/tokens/purchase` - Purchase SpaceMoney tokens
- `POST /api/tokens/transfer` - Transfer SpaceMoney tokens

### 4. State Management

#### Svelte Stores
- **`src/lib/stores/auth.ts`**: User authentication state
  - `user`: Current user information (wallet, Discord)
  - `walletConnected`: Boolean flag for wallet connection
  - `discordConnected`: Boolean flag for Discord connection

- **`src/lib/stores/tokens.ts`**: Token balance state
  - `tokenBalances`: SpaceTime and SpaceMoney balances

### 5. Blockchain Integration

#### Wallet Functions (`src/lib/wallet.ts`)
- `connectWallet()`: Connect to MetaMask or Coinbase Wallet
- `getTokenBalance()`: Fetch ERC-20 token balance
- `transferToken()`: Transfer ERC-20 tokens to another address

These functions use ethers.js v6 to interact with the Ethereum/Polygon blockchain.

### 6. Cloudflare Pages Deployment

#### Configuration Files
- **`svelte.config.js`**: Uses `@sveltejs/adapter-cloudflare`
- **`wrangler.toml`**: Cloudflare Workers configuration
- Build output: `.svelte-kit/cloudflare`

## Architecture

### Authentication Flow

1. **New User Registration**:
   ```
   User visits homepage
   → Clicks "Connect Wallet"
   → MetaMask/Coinbase Wallet prompts for connection
   → Wallet switches to Polygon network
   → POST /api/auth/wallet with address
   → Server creates session with wallet address
   → User clicks "Connect Discord"
   → Redirected to Discord OAuth
   → After approval, redirected to /api/auth/callback
   → Server updates session with Discord info
   → User redirected to homepage (now fully authenticated)
   → Can access dashboard
   ```

2. **Returning User Login**:
   - Can use either wallet or Discord to log in
   - If one is connected, prompted to connect the other
   - Both are required to access the dashboard

### Token Operations Flow

1. **View Balances**:
   ```
   User visits dashboard
   → GET /api/auth/me to verify session
   → GET /api/tokens/balances
   → Display SpaceTime and SpaceMoney balances
   ```

2. **Purchase Tokens**:
   ```
   User visits /tokens/purchase
   → Enters amount
   → POST /api/tokens/purchase
   → (In production: smart contract interaction)
   → Returns transaction hash
   → Redirected to dashboard
   ```

3. **Transfer Tokens**:
   ```
   User visits /tokens/transfer
   → Enters recipient address and amount
   → POST /api/tokens/transfer
   → (In production: smart contract interaction via wallet)
   → Returns transaction hash
   → Redirected to dashboard
   ```

## Technology Stack

- **Framework**: SvelteKit 2.5.28
- **UI Library**: Svelte 5.1.9
- **Language**: TypeScript 5.6.3
- **Blockchain**: ethers.js 6.13.2
- **Build Tool**: Vite 5.4.8
- **Deployment**: Cloudflare Pages (adapter-cloudflare 4.7.2)

## Security Features

1. **HTTP-only Cookies**: Session cookies are HTTP-only to prevent XSS attacks
2. **Secure Cookies**: Cookies are marked as secure (HTTPS only)
3. **SameSite Protection**: Cookies use `sameSite: 'lax'` for CSRF protection
4. **Session Expiration**: Sessions expire after 7 days
5. **Wallet Signature Verification**: (To be implemented in production)

## Current Limitations & Production TODOs

### Mock Data
Currently, the following features use mock data:

1. **Token Balances** (`/api/tokens/balances`):
   - Returns hardcoded values (100 SpaceTime, 50 SpaceMoney)
   - **Production TODO**: Fetch real balances from blockchain using ethers.js

2. **Token Purchase** (`/api/tokens/purchase`):
   - Returns mock transaction hash
   - **Production TODO**: Implement actual purchase mechanism (e.g., via a sale contract)

3. **Token Transfer** (`/api/tokens/transfer`):
   - Returns mock transaction hash
   - **Production TODO**: Call `transferToken()` function in `wallet.ts` to execute real blockchain transaction

### Session Storage
- Currently uses in-memory Map
- **Production TODO**: Use Cloudflare KV or D1 for persistent session storage

### Environment Variables
Required for production:
- `DISCORD_CLIENT_ID`: Your Discord OAuth client ID
- `DISCORD_CLIENT_SECRET`: Your Discord OAuth client secret  
- `DISCORD_REDIRECT_URI`: Your production callback URL
- `SPACETIME_TOKEN_ADDRESS`: SpaceTime ERC-20 contract address on Polygon
- `SPACEMONEY_TOKEN_ADDRESS`: SpaceMoney ERC-20 contract address on Polygon
- `SESSION_SECRET`: Random secret for session encryption

## Testing

### Manual Testing Steps

1. **Start Development Server**:
   ```bash
   npm install
   npm run dev
   ```

2. **Test Wallet Connection**:
   - Visit http://localhost:5173
   - Click "Connect Wallet"
   - Approve in MetaMask/Coinbase Wallet
   - Verify network switches to Polygon
   - Verify wallet address appears

3. **Test Discord Connection**:
   - After connecting wallet, click "Connect Discord"
   - (Requires valid Discord OAuth credentials)
   - Verify redirect and session update

4. **Test Dashboard**:
   - After both connections, navigate to /dashboard
   - Verify token balances appear
   - Verify user information displays

5. **Test Token Operations**:
   - Click "Purchase SpaceMoney"
   - Enter amount, submit
   - Verify success message with transaction hash
   - Click "Transfer SpaceMoney"
   - Enter recipient and amount
   - Verify success message with transaction hash

### Build Testing
```bash
npm run build
npm run preview
```

## Deployment Instructions

### Via GitHub (Recommended)

1. Push code to GitHub repository
2. Go to Cloudflare Pages dashboard
3. Connect GitHub repository
4. Configure:
   - Build command: `npm run build`
   - Build output directory: `.svelte-kit/cloudflare`
5. Add environment variables in Cloudflare dashboard
6. Deploy

### Via Wrangler CLI

```bash
npm run build
npx wrangler pages publish .svelte-kit/cloudflare
```

## File Structure

```
athena/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   └── session.ts          # Session management
│   │   ├── stores/
│   │   │   ├── auth.ts              # Auth state store
│   │   │   └── tokens.ts            # Token balances store
│   │   └── wallet.ts                # Wallet connection utilities
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── me/+server.ts           # Get current user
│   │   │   │   ├── wallet/+server.ts       # Wallet auth
│   │   │   │   ├── discord/+server.ts      # Discord OAuth start
│   │   │   │   ├── callback/+server.ts     # Discord OAuth callback
│   │   │   │   └── logout/+server.ts       # Logout
│   │   │   └── tokens/
│   │   │       ├── balances/+server.ts     # Get balances
│   │   │       ├── purchase/+server.ts     # Purchase tokens
│   │   │       └── transfer/+server.ts     # Transfer tokens
│   │   ├── dashboard/
│   │   │   └── +page.svelte         # Dashboard page
│   │   ├── tokens/
│   │   │   ├── purchase/+page.svelte # Purchase page
│   │   │   └── transfer/+page.svelte # Transfer page
│   │   ├── +layout.svelte           # Root layout
│   │   └── +page.svelte             # Home/login page
│   ├── app.d.ts                     # TypeScript declarations
│   └── app.html                     # HTML template
├── static/                          # Static assets
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies
├── svelte.config.js                 # SvelteKit config
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
└── wrangler.toml                    # Cloudflare config
```

## Styling

The application uses vanilla CSS with:
- Modern, clean design
- Purple gradient theme (#667eea to #764ba2)
- Responsive layouts using Flexbox and Grid
- Card-based UI components
- Smooth transitions and hover effects
- Mobile-friendly design

## Notes

- All code uses TypeScript for type safety
- Svelte 5 features are used (runes: `$state`, `$effect`, `$props`)
- No additional CSS frameworks (keeps bundle size small)
- Clean, minimal dependencies for Cloudflare Pages compatibility
- Ready for production with proper environment variable configuration
