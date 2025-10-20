# Athena DAO - Quick Start Guide

This guide will get you up and running in 5 minutes.

## 🚀 Quick Setup (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add at minimum:
```bash
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=http://localhost:5173/api/auth/callback
```

*Note: You can get Discord credentials at https://discord.com/developers/applications*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Browser
Navigate to: http://localhost:5173

## 🎯 What You'll See

### Home Page
1. **Connect Wallet** - Choose MetaMask or Coinbase Wallet
2. **Connect Discord** - Link your Discord account
3. **Access Dashboard** - View your tokens and perform operations

### Dashboard
- View SpaceTime token balance (non-tradable)
- View SpaceMoney token balance (tradable)
- Purchase SpaceMoney tokens
- Transfer SpaceMoney tokens

## 📝 Key Features

### Authentication
- ✅ Dual authentication (Wallet + Discord required)
- ✅ Polygon network support
- ✅ Automatic network switching
- ✅ Session management

### Token Operations
- ✅ View balances
- ✅ Purchase tokens
- ✅ Transfer tokens
- ✅ Transaction confirmations

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Project Structure

```
athena/
├── src/
│   ├── lib/              # Utilities and stores
│   ├── routes/           # Pages and API endpoints
│   ├── app.html          # HTML template
│   └── app.d.ts          # Type definitions
├── static/               # Static assets
├── package.json          # Dependencies
└── svelte.config.js      # SvelteKit config
```

## 🌐 Deploying to Cloudflare Pages

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push to GitHub
2. Connect repository in Cloudflare Pages
3. Set environment variables
4. Deploy!

## 📚 Documentation

- **[README.md](./README.md)** - Project overview and getting started
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Technical implementation details
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[SCREENSHOTS.md](./SCREENSHOTS.md)** - UI overview and design system

## 🔑 Required Environment Variables

### Development
```bash
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_REDIRECT_URI=http://localhost:5173/api/auth/callback
```

### Production
```bash
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_REDIRECT_URI=https://your-domain.pages.dev/api/auth/callback
SPACETIME_TOKEN_ADDRESS=0xYourTokenAddress
SPACEMONEY_TOKEN_ADDRESS=0xYourTokenAddress
SESSION_SECRET=your-random-secret
```

## 🐛 Common Issues

### "No wallet detected"
- Install MetaMask or Coinbase Wallet browser extension
- Refresh the page

### "Discord OAuth failed"
- Verify your Discord credentials in `.env`
- Check redirect URI matches exactly
- Ensure your Discord app has OAuth enabled

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Run `npm run check` to check for TypeScript errors
- Clear `.svelte-kit` folder and rebuild

## 🎨 Customization

### Change Colors
Edit the CSS in:
- `src/routes/+layout.svelte` - Global styles
- Individual page `.svelte` files - Component styles

### Add New Features
1. Create new routes in `src/routes/`
2. Add API endpoints in `src/routes/api/`
3. Create stores in `src/lib/stores/`
4. Add utilities in `src/lib/`

## 📞 Need Help?

- Check the [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details
- Review the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Look at the code comments for inline documentation

## ⚡ Next Steps

After getting the basic setup working:

1. **Configure Real Token Contracts**
   - Deploy or use existing ERC-20 contracts on Polygon
   - Update contract addresses in environment variables

2. **Set Up Production Deployment**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Configure Cloudflare Pages
   - Set production environment variables

3. **Implement Real Blockchain Calls**
   - Update `src/routes/api/tokens/balances/+server.ts`
   - Implement actual purchase mechanism
   - Enable real token transfers

4. **Add Persistent Session Storage**
   - Configure Cloudflare KV or D1
   - Update session management in `src/lib/server/session.ts`

5. **Enhance Security**
   - Implement wallet signature verification
   - Add rate limiting
   - Set up monitoring and alerts

---

**Ready to build! 🚀**

Start with `npm install && npm run dev` and you're good to go!
