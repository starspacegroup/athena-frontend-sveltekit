# Athena DAO

Digital Autonomous Organization for *Space: Members can accrue non-tradable SpaceTime tokens and earn or purchase SpaceMoney tokens, each provide magnified powers for creating and voting on proposals.

## Features

- **Dual Authentication**: Connect with both blockchain wallet (MetaMask/Coinbase Wallet) and Discord account
- **Polygon Network**: Built for Polygon blockchain for lower transaction fees
- **Token Management**: 
  - View SpaceTime token balances (non-tradable governance tokens)
  - View SpaceMoney token balances (purchasable and transferable)
  - Purchase SpaceMoney tokens
  - Transfer SpaceMoney tokens to other addresses
- **Cloudflare Pages**: Optimized for deployment on Cloudflare's edge network

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Styling**: CSS (no framework)
- **Blockchain**: Ethers.js v6 for Web3 interactions
- **Authentication**: Custom session-based auth with Discord OAuth
- **Deployment**: Cloudflare Pages

## Prerequisites

- Node.js 18+ 
- A Discord OAuth application ([Create one here](https://discord.com/developers/applications))
- MetaMask or Coinbase Wallet browser extension
- Token contracts deployed on Polygon (addresses configured in environment variables)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/starspacegroup/athena.git
cd athena
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Update the following variables:
- `DISCORD_CLIENT_ID`: Your Discord OAuth client ID
- `DISCORD_CLIENT_SECRET`: Your Discord OAuth client secret
- `DISCORD_REDIRECT_URI`: OAuth callback URL (e.g., `http://localhost:5173/api/auth/callback`)
- `SPACETIME_TOKEN_ADDRESS`: SpaceTime token contract address on Polygon
- `SPACEMONEY_TOKEN_ADDRESS`: SpaceMoney token contract address on Polygon
- `SESSION_SECRET`: Random secret for session encryption

### 4. Run the development server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Project Structure

```
athena/
├── src/
│   ├── lib/
│   │   ├── components/       # Reusable components (future use)
│   │   ├── server/           # Server-side utilities
│   │   │   └── session.ts    # Session management
│   │   ├── stores/           # Svelte stores
│   │   │   ├── auth.ts       # Authentication state
│   │   │   └── tokens.ts     # Token balances state
│   │   └── wallet.ts         # Wallet connection utilities
│   ├── routes/
│   │   ├── api/              # API endpoints
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   └── tokens/       # Token operation endpoints
│   │   ├── dashboard/        # Dashboard page
│   │   ├── tokens/
│   │   │   ├── purchase/     # Purchase tokens page
│   │   │   └── transfer/     # Transfer tokens page
│   │   ├── +layout.svelte    # Root layout
│   │   └── +page.svelte      # Home/login page
│   ├── app.d.ts              # TypeScript declarations
│   └── app.html              # HTML template
├── static/                   # Static assets
├── .env.example              # Environment variables template
├── package.json              # Dependencies
├── svelte.config.js          # SvelteKit configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── wrangler.toml             # Cloudflare configuration
```

## Authentication Flow

1. User visits the homepage
2. User connects their wallet (MetaMask or Coinbase Wallet)
   - Wallet connection triggers network switch to Polygon
3. User connects their Discord account via OAuth
4. Both connections are required to create/access an account
5. For returning users, either wallet or Discord can be used to log in
6. Session is maintained via secure HTTP-only cookies

## Deployment to Cloudflare Pages

### Option 1: Deploy via GitHub

1. Push your code to GitHub
2. Go to [Cloudflare Pages dashboard](https://dash.cloudflare.com/pages)
3. Click "Create a project" and connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.svelte-kit/cloudflare`
5. Add environment variables in the Cloudflare dashboard
6. Deploy!

### Option 2: Deploy via Wrangler CLI

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages publish .svelte-kit/cloudflare
```

### Environment Variables for Production

Set these in the Cloudflare Pages dashboard under Settings > Environment variables:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI` (use your production URL)
- `SPACETIME_TOKEN_ADDRESS`
- `SPACEMONEY_TOKEN_ADDRESS`
- `SESSION_SECRET`

## Usage

### Connecting Wallet

1. Click "Connect Wallet" on the homepage
2. Select your preferred wallet (MetaMask or Coinbase Wallet)
3. Approve the connection request in your wallet
4. The wallet will automatically switch to Polygon network

### Connecting Discord

1. After connecting wallet, click "Connect Discord Account"
2. Authorize the application in Discord
3. You'll be redirected back to the application

### Viewing Balances

Navigate to the Dashboard to see your current token balances for:
- SpaceTime tokens (non-tradable)
- SpaceMoney tokens (tradable)

### Purchasing SpaceMoney

1. Go to Dashboard and click "Purchase SpaceMoney"
2. Enter the amount you want to purchase
3. Confirm the transaction in your wallet
4. Wait for blockchain confirmation

### Transferring SpaceMoney

1. Go to Dashboard and click "Transfer SpaceMoney"
2. Enter recipient address and amount
3. Confirm the transaction in your wallet
4. Wait for blockchain confirmation

## Development Notes

### Mock Data

Currently, the token balances and transactions use mock data. To connect to real smart contracts:

1. Deploy ERC-20 token contracts for SpaceTime and SpaceMoney on Polygon
2. Update the token addresses in `.env`
3. Update `src/lib/wallet.ts` to use the real contract addresses
4. Implement the actual purchase mechanism (e.g., via a sale contract)

### Session Storage

The current implementation uses in-memory session storage which will reset on server restart. For production, consider:

- Cloudflare KV for session storage
- Cloudflare D1 for persistent user data
- Or use a JWT-based approach

### Security Considerations

- Always validate wallet signatures for sensitive operations
- Implement rate limiting on API endpoints
- Use HTTPS in production
- Keep Discord OAuth secrets secure
- Implement proper CSRF protection if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
