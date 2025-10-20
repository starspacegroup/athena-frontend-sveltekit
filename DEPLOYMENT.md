# Athena DAO - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Discord OAuth Application**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to OAuth2 section
   - Add redirect URL: `https://your-domain.pages.dev/api/auth/callback`
   - Copy Client ID and Client Secret

2. **Token Contracts** (Optional for MVP)
   - Deploy SpaceTime and SpaceMoney ERC-20 contracts on Polygon
   - Note the contract addresses
   - Or use placeholder addresses for testing

3. **Cloudflare Account**
   - Sign up at https://dash.cloudflare.com
   - Have Pages access

## Deployment Method 1: Cloudflare Pages (via GitHub) - Recommended

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. Log in to Cloudflare Dashboard
2. Go to **Pages** section
3. Click **"Create a project"**
4. Select **"Connect to Git"**
5. Choose **GitHub** and authorize
6. Select the **athena** repository
7. Click **"Begin setup"**

### Step 3: Configure Build Settings

Set the following:
- **Project name**: athena (or your preferred name)
- **Production branch**: main
- **Framework preset**: SvelteKit
- **Build command**: `npm run build`
- **Build output directory**: `.svelte-kit/cloudflare`

### Step 4: Set Environment Variables

Click **"Environment variables"** and add:

| Variable | Value | Example |
|----------|-------|---------|
| `DISCORD_CLIENT_ID` | Your Discord OAuth Client ID | `1234567890123456789` |
| `DISCORD_CLIENT_SECRET` | Your Discord OAuth Client Secret | `abcdef1234567890` |
| `DISCORD_REDIRECT_URI` | Your callback URL | `https://athena.pages.dev/api/auth/callback` |
| `SPACETIME_TOKEN_ADDRESS` | SpaceTime contract address | `0x1234...` |
| `SPACEMONEY_TOKEN_ADDRESS` | SpaceMoney contract address | `0x5678...` |
| `SESSION_SECRET` | Random secret string | `your-random-secret-key` |

**Note**: For `DISCORD_REDIRECT_URI`, use your actual Cloudflare Pages URL.

### Step 5: Deploy

1. Click **"Save and Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your site will be live at `https://athena.pages.dev` (or your custom domain)

### Step 6: Update Discord OAuth Settings

1. Go back to Discord Developer Portal
2. Update the redirect URI to match your deployed URL
3. Save changes

## Deployment Method 2: Wrangler CLI

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```

### Step 3: Build the Project
```bash
npm run build
```

### Step 4: Deploy
```bash
wrangler pages deploy .svelte-kit/cloudflare --project-name athena
```

### Step 5: Set Environment Variables (via Dashboard)

After deployment, go to Cloudflare Dashboard:
1. Pages → Your project → Settings → Environment variables
2. Add all the required variables as listed above

## Post-Deployment Steps

### 1. Test Authentication Flow

1. Visit your deployed site
2. Click "Connect Wallet"
3. Test MetaMask connection
4. Test Discord OAuth (should redirect properly)
5. Verify dashboard access after both connections

### 2. Verify Network Switching

1. Connect wallet
2. Verify it switches to Polygon network
3. If wallet doesn't have Polygon, verify it offers to add it

### 3. Test Token Operations

1. Go to dashboard
2. Verify balances load (mock data for now)
3. Test purchase flow (mock transaction)
4. Test transfer flow (mock transaction)

## Environment-Specific Configuration

### Development
```bash
# .env
DISCORD_CLIENT_ID=your-dev-client-id
DISCORD_CLIENT_SECRET=your-dev-client-secret
DISCORD_REDIRECT_URI=http://localhost:5173/api/auth/callback
SPACETIME_TOKEN_ADDRESS=0x0000000000000000000000000000000000000001
SPACEMONEY_TOKEN_ADDRESS=0x0000000000000000000000000000000000000002
SESSION_SECRET=dev-secret
```

### Production
Set these in Cloudflare Dashboard, not in `.env`:
```
DISCORD_CLIENT_ID=your-prod-client-id
DISCORD_CLIENT_SECRET=your-prod-client-secret
DISCORD_REDIRECT_URI=https://athena.pages.dev/api/auth/callback
SPACETIME_TOKEN_ADDRESS=0xYourRealContractAddress
SPACEMONEY_TOKEN_ADDRESS=0xYourRealContractAddress
SESSION_SECRET=production-secret-random-string
```

## Custom Domain Setup (Optional)

### Step 1: Add Custom Domain in Cloudflare

1. Go to Pages → Your project → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `athena.yourdomain.com`)
4. Follow DNS setup instructions

### Step 2: Update Discord OAuth

1. Add new redirect URI: `https://athena.yourdomain.com/api/auth/callback`
2. Update `DISCORD_REDIRECT_URI` environment variable in Cloudflare

## Troubleshooting

### Build Failures

**Issue**: Build fails with module errors
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally and commit `package-lock.json`

**Issue**: TypeScript errors during build
- **Solution**: Run `npm run check` locally to find and fix errors

### Authentication Issues

**Issue**: Discord OAuth fails
- **Solution**: 
  - Verify redirect URI matches exactly
  - Check Client ID and Secret are correct
  - Ensure environment variables are set correctly

**Issue**: Wallet doesn't connect
- **Solution**: 
  - Ensure MetaMask/Coinbase Wallet is installed
  - Check browser console for errors
  - Verify user approves connection

### Runtime Errors

**Issue**: 404 errors on routes
- **Solution**: Ensure build output directory is correct (`.svelte-kit/cloudflare`)

**Issue**: Session not persisting
- **Solution**: 
  - Check SESSION_SECRET is set
  - Verify cookies are enabled
  - For production, consider using Cloudflare KV

## Monitoring & Logs

### Cloudflare Dashboard

1. Go to Pages → Your project → Analytics
2. Monitor requests, errors, and performance
3. Check logs under "Logs" tab

### Real-Time Logs (via Wrangler)

```bash
wrangler pages deployment tail
```

## Production Considerations

### 1. Session Storage

Current implementation uses in-memory storage. For production:

**Option A: Cloudflare KV**
```typescript
// Modify src/lib/server/session.ts
export async function createSession(platform: Platform, data: SessionData) {
  const sessionId = generateSessionId();
  await platform.env.KV.put(`session:${sessionId}`, JSON.stringify(data), {
    expirationTtl: SESSION_TTL
  });
  return sessionId;
}
```

**Option B: Cloudflare D1**
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
```

### 2. Real Blockchain Integration

Update `src/routes/api/tokens/balances/+server.ts`:
```typescript
import { getTokenBalance } from '$lib/wallet';

// Replace mock data with real blockchain calls
const spaceTimeBalance = await getTokenBalance(
  SPACETIME_TOKEN_ADDRESS, 
  session.walletAddress
);
const spaceMoneyBalance = await getTokenBalance(
  SPACEMONEY_TOKEN_ADDRESS, 
  session.walletAddress
);
```

### 3. Rate Limiting

Add rate limiting to API endpoints:
```typescript
import { error } from '@sveltejs/kit';

// Example middleware
export async function checkRateLimit(ip: string) {
  // Implement using Cloudflare KV or rate limiting API
}
```

### 4. Security Enhancements

- Implement wallet signature verification
- Add CSRF tokens for state-changing operations
- Use encrypted sessions
- Implement proper error handling (don't leak sensitive info)

### 5. Analytics

Add analytics to track:
- User registrations
- Token purchases/transfers
- Page views
- Wallet connection success rate

## Rollback Procedure

If deployment fails or has issues:

### Via Cloudflare Dashboard
1. Go to Pages → Your project → Deployments
2. Find previous working deployment
3. Click "..." → "Rollback to this deployment"

### Via Wrangler
```bash
wrangler pages deployment list
wrangler pages deployment rollback <deployment-id>
```

## Performance Optimization

### 1. Enable Caching
Static assets are automatically cached by Cloudflare.

### 2. Minification
Already handled by Vite during build.

### 3. Code Splitting
Automatic with SvelteKit's routing.

### 4. Image Optimization
Consider using Cloudflare Images for any future image assets.

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring Checklist
- [ ] Check error rates weekly
- [ ] Monitor API response times
- [ ] Review user feedback
- [ ] Update dependencies monthly
- [ ] Test authentication flow monthly
- [ ] Backup session data (if using D1/KV)

## Cost Estimation (Cloudflare Pages)

- **Free Tier**: 
  - 500 builds/month
  - Unlimited requests
  - 100 GB bandwidth/month
  - Perfect for MVP and small-medium usage

- **Paid Tier** ($20/month):
  - 5000 builds/month
  - Unlimited requests
  - Unlimited bandwidth

## Support & Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **SvelteKit Docs**: https://kit.svelte.dev/docs
- **Discord OAuth**: https://discord.com/developers/docs/topics/oauth2
- **Ethers.js**: https://docs.ethers.org/v6/

## Success Checklist

Before marking deployment as complete:

- [ ] Site loads without errors
- [ ] Wallet connection works (MetaMask and Coinbase)
- [ ] Discord OAuth works and redirects properly
- [ ] Dashboard displays after authentication
- [ ] Token balances appear
- [ ] Purchase flow works
- [ ] Transfer flow works
- [ ] Custom domain configured (if applicable)
- [ ] Environment variables all set
- [ ] Error tracking configured
- [ ] Performance acceptable (< 2s load time)
- [ ] Mobile responsive
- [ ] HTTPS enabled (automatic with Cloudflare)

---

**Deployment Complete!** 🚀

Your Athena DAO application is now live and accessible to users worldwide.
