# Athena DAO

> _Governance interface for \*Space — a Wyoming DAO LLC with on-chain rule._

---

## Why Athena?

Athena is the governance layer for **\*Space**, a decentralized organization
designed to evolve from founder-led to fully community-governed. The system is
built with **hardcoded sunset triggers** that automatically dissolve centralized
control when the community proves itself ready.

### The Vision

```
Founder Control → Earned Trust → Community Sovereignty
```

\*Space starts with a benevolent dictator model (you hold veto + keys), but the
contracts enforce a path to decentralization. When the DAO hits maturity
metrics, control burns automatically. No promises—just code.

---

## Two-Token Model

| Token               | Type       | Acquisition     | Purpose                                                           |
| ------------------- | ---------- | --------------- | ----------------------------------------------------------------- |
| **SpaceMoney (SM)** | Economic   | Purchase / Earn | Treasury share, revenue share, incubator access, proposal funding |
| **SpaceTime (ST)**  | Governance | Work only       | Voting power, proposal creation, reputation                       |

### SpaceMoney — _The Economic Token_

- **Buyable** — functions like an equity analog
- **Zero voting weight** — money can't buy governance
- Use cases:
  - 💰 Fund proposals
  - 🔐 Stake for incubator project access
  - 🔥 Burn → mint dev credits in ecosystem projects

### SpaceTime — _The Labor Token_

- **Earned only** — never purchasable
- **Decays slowly** — prevents whale hoarding
- Earned through:
  - ✅ Completing tasks & proposals
  - 🗳️ Correct governance votes (outcome-verified)
  - 🎯 Passing internal qualification tests

---

## Governance Transition

### Initial State

- Founder holds **100% veto**
- Founder controls **treasury keys**
- Founder controls **contract upgrade keys**

### Sunset Triggers (Hardcoded)

Control auto-revokes when ALL conditions are met:

| Metric                   | Threshold                     |
| ------------------------ | ----------------------------- |
| Proposal acceptance rate | 99.9% for 5 consecutive years |
| ST distribution          | 10,000+ distinct earners      |
| Treasury concentration   | < 20% held by founder         |

**Result:** Veto burns. Upgrade keys burn. Voting becomes pure ST-weighted
democracy.

---

## Proposal System

Every proposal contains:

```
┌─────────────────────────────────────────┐
│  BUDGET          SM or stablecoins      │
│  REWARD          ST to executor         │
│  VOTER REWARD    ST to correct voters   │
│  SUCCESS METRIC  Measurable outcomes    │
│  EXECUTION       Auto-runs or escrows   │
└─────────────────────────────────────────┘
```

**Incentive alignment:**

- Work = minted ST
- Correct governance = minted ST
- Bad actors = nothing

---

## Legal Structure

**Entity:** Wyoming DAO LLC\
**Operating Agreement declares:**

- Token holders = members
- Smart contracts = operating rules
- Founder = "Initial Controller" with sunset conditions
- Trigger conditions dissolve special rights automatically

---

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Framework  | SvelteKit 2 + Svelte 5        |
| Blockchain | Ethers.js v6 / Polygon        |
| Auth       | Session-based + Discord OAuth |
| Deploy     | Cloudflare Pages (Edge)       |
| Styling    | Vanilla CSS (minimal bundle)  |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Discord OAuth app ([create here](https://discord.com/developers/applications))
- MetaMask or Coinbase Wallet
- Token contracts on Polygon

### 1. Clone & Install

```bash
git clone https://github.com/starspacegroup/athena.git
cd athena && npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

| Variable                   | Description             |
| -------------------------- | ----------------------- |
| `DISCORD_CLIENT_ID`        | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET`    | Discord OAuth secret    |
| `DISCORD_REDIRECT_URI`     | Callback URL            |
| `SPACETIME_TOKEN_ADDRESS`  | ST contract (Polygon)   |
| `SPACEMONEY_TOKEN_ADDRESS` | SM contract (Polygon)   |
| `SESSION_SECRET`           | Session encryption key  |

### 3. Run

```bash
npm run dev
```

→ Open `http://localhost:5173`

---

## Project Structure

```
src/
├── lib/
│   ├── server/session.ts     # Session management
│   ├── stores/
│   │   ├── auth.ts           # Auth state
│   │   └── tokens.ts         # Token balances
│   └── wallet.ts             # Web3 utilities
├── routes/
│   ├── api/
│   │   ├── auth/             # Auth endpoints
│   │   └── tokens/           # Token endpoints
│   ├── dashboard/            # Main dashboard
│   └── tokens/               # Purchase & transfer
└── app.html                  # Shell
```

---

## Auth Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Connect     │ → │ Connect     │ → │ Dashboard   │
│ Wallet      │    │ Discord     │    │ Access      │
└─────────────┘    └─────────────┘    └─────────────┘
     ↓                   ↓                   ↓
  Polygon           OAuth2             Session
  Network           Flow               Cookie
```

- Both wallet + Discord required for new accounts
- Returning users can auth with either
- HTTP-only secure cookies

---

## Deploy

### GitHub → Cloudflare Pages

1. Push to GitHub
2. Connect repo in [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Build: `npm run build` → `.svelte-kit/cloudflare`
4. Add env vars
5. Deploy

### CLI

```bash
npm run build
npx wrangler pages publish .svelte-kit/cloudflare
```

---

## Usage

| Action              | Steps                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| **Connect Wallet**  | Click "Connect Wallet" → Select MetaMask/Coinbase → Approve → Auto-switch to Polygon |
| **Connect Discord** | Click "Connect Discord" → Authorize → Redirected back                                |
| **View Balances**   | Dashboard shows ST (earned) + SM (owned)                                             |
| **Purchase SM**     | Dashboard → Purchase → Enter amount → Confirm tx                                     |
| **Transfer SM**     | Dashboard → Transfer → Enter recipient + amount → Confirm tx                         |

---

## Development Notes

### Current State: Mock Data

| Component      | Status    | Production TODO                    |
| -------------- | --------- | ---------------------------------- |
| Token Balances | Mock      | Fetch from chain via ethers.js     |
| Purchases      | Mock      | Implement sale contract            |
| Transfers      | Mock      | Connect to `wallet.ts` transfer fn |
| Sessions       | In-memory | Move to Cloudflare KV/D1           |

### Security Checklist

- [ ] Wallet signature verification
- [ ] Rate limiting on API endpoints
- [ ] HTTPS everywhere
- [ ] CSRF protection
- [ ] Discord secrets secured

---

## Roadmap

```
Phase 1: Auth + Balances     ← You are here
Phase 2: Real token contracts
Phase 3: Proposal system
Phase 4: ST earning mechanics
Phase 5: Governance voting
Phase 6: Sunset trigger implementation
```

---

## License

MIT
