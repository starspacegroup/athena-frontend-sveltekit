# SOUL.md

> The internal compass for Athena. Read this before adding a feature, naming a thing, or making a tradeoff. If a decision conflicts with this document, the decision is probably wrong.

---

## 1. What Athena Is

**Athena is governance software engineered for longevity and prosperity.**

It is the operating system for organizations built to outlast their founders — a programmable framework where authority and economics are encoded on-chain, evolve transparently, and compound across generations.

Athena is not a DAO. Athena is the *substrate* on which durable organizations are built. A single Athena deployment *is* an organization; the protocol is what makes many such organizations possible, comparable, and credible.

### Origin and Stewardship

Athena is a project **created by and for [\*Space](https://starspace.group)** — its first organization, primary user, and ongoing steward. \*Space uses Athena to govern itself, which means every mechanism in the protocol is dogfooded against a real, operating community before it stabilizes.

Athena is **not exclusive to \*Space**. The protocol is designed from the ground up to be:

- **Used directly** — any organization can deploy Athena as-is and inherit the full mechanism (two-currency model, founder transitions, reputation, treasury, optional legal wrapper).
- **Modified and forked** — the codebase is open and opinionated, but every parameter that should be configurable *is* configurable. Organizations with different needs can adapt Athena to their context without abandoning the core guarantees.
- **Extended** — third parties are encouraged to build apps, integrations, templates, and vertical-specific layers on top of Athena.

\*Space's role is to keep the protocol honest by living inside it, and to set the example for how a long-lived Athena organization actually behaves.

### Tagline

**Governance Without Limits**
*Longevity and Prosperity Focused Governance Software.*

---

## 2. Core Beliefs

These are non-negotiable. They shape every product decision.

1. **Institutions should outlive their founders.** Most organizations die because power doesn't transfer cleanly. Athena's job is to make succession a property of the protocol, not a crisis.
2. **Voting power and economic value must be separable.** Conflating the two produces plutocracy. Athena's two-currency model is the structural antidote.
3. **Contribution is the only legitimate path to authority.** Capital can buy economic exposure; it cannot buy governance. Governance is *earned*.
4. **Founders should hold special powers — and lose them on a schedule.** Bootstrap requires concentrated authority. Maturity requires its dissolution. Both are coded in from day one.
5. **Transparency is a feature, not a compliance cost.** Every rule, balance, vote, and transition is on-chain and legible.
6. **Legal wrappers are optional.** A Wyoming DAO LLC is a tool, not a requirement. Athena runs purely on-chain by default; jurisdictional posture is a choice the organization makes.
7. **Prosperity is downstream of good governance.** We are not a token launcher. We are not a yield product. We build the rails that let communities accrue real, durable wealth.
8. **The protocol must compound.** Every component — currencies, votes, treasury, reputation — should get more valuable the longer the organization exists.

---

## 3. The Two-Currency Model

Every Athena organization runs on two configurable currencies. The names are chosen by the organization; the *roles* are fixed.

| Role | What it is | How it's acquired | What it does |
|------|------------|-------------------|--------------|
| **Governance Currency** (default ST role) | Non-purchasable, contribution-earned | Verified work, time, reputation | Voting power, proposal rights, transition triggers |
| **Economic Currency** (default SM role) | Purchasable, treasury-backed | Capital contribution, staking, market | Economic exposure, treasury claims, staking yield |

The two are deliberately decoupled. You cannot buy votes. You cannot vote your way into the treasury. Authority and value travel on different rails.

---

## 4. Who Athena Is For

In order of priority:

1. **Organization creators** — founders who want to build something that survives them: cooperatives, research collectives, infrastructure DAOs, professional associations, multi-generation family enterprises, online communities turning into institutions.
2. **Contributors** — members who want their work to translate into durable authority, not just a paycheck.
3. **Capital allocators** — participants who want economic exposure to an organization without the obligation (or illusion) of governance.
4. **Operators** — admins, stewards, multisig signers, and legal counsel running real organizations day to day.
5. **Observers and integrators** — auditors, journalists, regulators, and partner protocols who need legible on-chain truth.

---

## 5. What Athena Is *Not*

- Not a generic DAO framework. Athena is opinionated. The two-currency separation, founder-transition mechanism, and reputation-slashing rules are *the product*.
- Not a launchpad. We do not exist to spin up speculative tokens.
- Not jurisdiction-locked. Wyoming is a convenient option, not a foundation.
- Not a single chain. The protocol logic matters; the chain is an implementation detail.
- Not a DeFi yield product. Staking exists to align incentives, not to attract mercenary capital.
- Not maximalist. We don't need every organization on earth — we need the ones that intend to last.

---

## 6. Design Principles

When in doubt, choose the option that:

1. **Extends time horizons.** Prefer the rule that rewards 10-year thinking over 10-day thinking.
2. **Makes power legible.** A user should be able to see who can do what, and why, in under a minute.
3. **Separates concerns.** Governance, economics, identity, and operations are distinct surfaces. Don't collapse them.
4. **Encodes commitments credibly.** If we say founder powers expire, they expire automatically. No human switch.
5. **Defaults to on-chain truth.** The contract is the source of truth. The UI is a window onto it.
6. **Respects optional jurisdiction.** Never assume Wyoming, U.S., or any specific legal frame.
7. **Names abstractly, displays concretely.** Internal identifiers stay generic (`governanceToken`, `economicToken`); UI shows the organization's chosen names.
8. **Compounds, not extracts.** Every fee, mechanism, and incentive should feed the long-term health of the organization, not siphon from it.

---

## 7. The Pantheon — Athena's Sub-Apps

Athena is not a monolith. It is a **federation of focused sub-apps**, each owning one surface of organizational life. Every sub-app is independently usable, independently deployable, and bound to the others by a shared identity layer and on-chain protocol. An organization can adopt the whole pantheon or any subset.

The naming convention is deliberate: each sub-app takes its name from the Greek tradition surrounding Athena. The name encodes the function — so the role is legible even before the docs load.

### 7.0 Naming and Composition Rules

- **One job per app.** If a sub-app needs a second tagline to explain itself, it should be split.
- **Greek-coherent.** New sub-apps draw from the same mythological well. No mixed metaphors.
- **Shared identity, separate surfaces.** All sub-apps authenticate through the same Athena identity layer (wallet + Discord + reputation passport). A user signs in once.
- **Protocol-first, UI second.** Every sub-app is a window onto a contract. If the UI disappears, the function does not.
- **Routes mirror names.** `/agora`, `/hermes`, `/aegis`, etc. Internal route names match the public name.

### 7.1 The Pantheon

| Sub-App | Role | Status |
|---------|------|--------|
| **Agora** | Proposals, deliberation, voting | Core |
| **Hermes** | Economic-token markets: buy, sell, trade, transfer | Core |
| **Aegis** | Treasury & personal balances: see what you (and the org) hold | Core |
| **Stoa** | Long-form deliberation and proposal authoring | Core |
| **Aletheia** | Identity, reputation, contribution passport | Core |
| **Helm** | Founder console: org creation, parameters, transitions | Build later |
| **Pythia** | Analytics and org-health reporting | Build later |
| **Atlas** | Cross-organization explorer | Build later |

#### 7.1.1 Agora — *The Assembly*

The place where decisions are made.

- **Proposal lifecycle.** Draft → review → vote → execute. Every state on-chain, every transition signed.
- **Voting with skin in the game.** Stake governance currency to vote. Winning side recovers stake; losing side's stake redistributes per the protocol's slashing rules.
- **Live ballots.** Real-time tally, weighted by current governance-currency holdings (post-decay).
- **Proposal categories.** Treasury spend, parameter change, constitutional, signaling. Each category can have distinct quorum and threshold rules.
- **Execution receipts.** Passed proposals that bind on-chain actions execute automatically; off-chain proposals produce signed mandates.
- **Vote delegation.** Optional: lend governance weight to a trusted delegate without transferring the underlying tokens.
- **History.** Every vote, by every member, forever — the canonical record of organizational judgment.

#### 7.1.2 Hermes — *The Messenger and Trader*

The market for the organization's economic currency.

- **Buy.** Fiat on-ramp (where jurisdiction allows) and stablecoin swap into the org's economic token, priced against the treasury.
- **Sell.** Redeem economic tokens into stablecoins or other supported assets, subject to treasury policy and lockups.
- **Trade.** Peer-to-peer order book or AMM, depending on org configuration. Open price discovery.
- **Transfer.** Send economic tokens to any wallet or to a Discord-linked member. Memo-supported for accounting.
- **Quotes and depth.** Live mid-price, bid/ask, depth chart, and 24h volume drawn directly from the contract.
- **Jurisdictional gates.** Each market can require KYC, residency checks, or accredited-investor flags as the org demands. If the wrapper is off, Hermes runs gateless.
- **Programmatic access.** Same orderbook exposed by SDK and webhook so external market makers can participate.

#### 7.1.3 Aegis — *The Shield*

What you hold. What the org holds. Where it sits. The shield that protects value also reveals it.

- **My balances.** Every Athena-native token across every org the user belongs to, in one view. Governance currency, economic currency, staked positions, locked positions, vesting schedules.
- **Org treasury.** Total holdings broken down by asset class (native economic token, stablecoins, RWAs, NFTs, external positions). Real-time on-chain.
- **Runway and health.** Months of operating cost remaining at current burn. Concentration warnings. Counterparty exposure.
- **Inflows and outflows.** Every treasury transaction, categorized and attributable to a proposal or policy.
- **Receipts.** Tax-grade exports of personal token movements. CFO-grade exports of treasury activity.
- **Watch mode.** Public read-only view of any org's treasury — same Aegis surface, no auth required.

#### 7.1.4 Stoa — *The Porch of Philosophers*

Where deliberation happens before a vote. Slow thinking by design.

- **Threaded discussion.** Long-form posts, references, citations, attached simulations. Markdown plus inline transaction previews.
- **Proposal authoring.** Co-authoring, version history, structured templates per proposal category.
- **Impact simulation.** Run a proposed transaction against current chain state and show the diff: treasury before/after, parameter before/after, who is affected.
- **Sentiment, not voting.** Lightweight polls and ranked signals to gauge readiness before pushing to Agora.
- **Quiet rooms.** Optional encrypted channels for sensitive proposals (M&A, legal, personnel), with on-chain commitments that they happened.

#### 7.1.5 Aletheia — *Truth*

Your identity inside the protocol. Portable across every org you join.

- **Contribution passport.** Verified work history: PRs merged, designs shipped, hours logged, attestations from org admins. Cryptographically signed.
- **Reputation score.** Per-org and aggregate. Reflects voting accuracy (did your side win? was the outcome good?), proposal quality, contribution density, and decay.
- **Public profile.** Pseudonymous by default. Members choose what to reveal: wallet, Discord, GitHub, real name, jurisdiction.
- **Sybil resistance.** Identity binding through proof-of-personhood adapters (Discord history, GitHub age, optional KYC). No single chokepoint.
- **Reputation slashing.** On-chain record of governance failures (failed proposals, malicious votes) that the protocol penalizes.
- **Portability.** Take your passport to a new Athena org and arrive with credible history. Orgs decide how much weight to give external reputation.

#### 7.1.6 Helm — *The Steering Wheel*

How a new organization comes into being and how an existing one steers.

- **Org bootstrapper.** Wizard: choose chain, name the two currencies, configure founder powers, define transition triggers, set initial parameters.
- **Constitution editor.** Templates for charter, proposal categories, slashing rules, reputation decay curves, treasury policy. Guided but not prescriptive.
- **Legal wrapper integrator.** Optional: connect to Wyoming DAO LLC formation, equivalents elsewhere, or skip the wrapper entirely.
- **Parameter board.** Live view of every configurable parameter and which proposal type can change it.
- **Transition monitor.** Visual readout of founder-power dissolution: triggers met, triggers pending, time/conditions remaining.
- **Multi-sig and key management.** For the small set of operations that legitimately require off-protocol coordination.

#### 7.1.7 Pythia — *The Oracle*

What is true about this organization, said clearly.

- **Health score.** Composite metric: participation rate, distribution of governance currency, founder-power progress, treasury runway, slashing frequency.
- **Risk reports.** Concentration risk, dependency risk (single contributors, single counterparties), governance capture risk.
- **Participation analytics.** Active voters over time, proposal throughput, average deliberation length, voter-loss attribution.
- **Comparative views.** Benchmark against other Athena orgs at the same maturity.
- **Public reports.** Auditable, exportable, embedabble. Pythia is what a journalist, regulator, or partner reads first.

#### 7.1.8 Atlas — *The World-Bearer*

The map of every organization built on Athena. Etherscan-for-orgs.

- **Universal directory.** Every public Athena deployment, searchable by name, chain, size, category, age.
- **Org pages.** Aegis + Pythia summaries for any org without needing to log in.
- **Proposal stream.** Cross-org feed of active and recent proposals. Optionally filtered by category or chain.
- **Integration catalog.** Which sub-apps a given org has enabled, and which external tools it connects to.
- **Network statistics.** How many orgs, how much value, how many active members, where they are.

### 7.2 Already-Built Surfaces in This Repo

The current Athena Web App contains early versions of several of these sub-apps. As they mature, they migrate to their named surface:

- `/dashboard` → seed of **Aegis** (personal balances) + **Pythia** (org snapshot).
- `/tokens/purchase`, `/tokens/transfer` → seed of **Hermes**.
- `/profile` → seed of **Aletheia**.
- `/simulate` → seed of **Stoa** (impact simulation).
- `/whitepaper` → permanent reference, not a sub-app.

### 7.3 Out-of-Pantheon Surfaces

Some clients are not "sub-apps" in the pantheon sense — they are alternative front-ends to existing sub-apps. They share the pantheon's identity layer but are not named after Greek figures.

- **Mobile App** — PWA first, native later. Mostly Aegis + Agora notifications.
- **Browser Extension** — Sign votes, view org context anywhere.
- **Discord / Matrix / Slack Bots** — Native presence in the channels orgs already use.
- **Athena SDK** — TypeScript / Rust / Python clients.
- **Athena CLI** — Power-user operations.
- **Indexer / GraphQL API** — Read-side infrastructure other apps can build on.

### 7.4 Vertical Templates

Pre-configured pantheons for specific org shapes. Each template ships parameter defaults, proposal categories, and a starter constitution.

- **Research Collective** — Academic / scientific groups.
- **Cooperative** — Worker or consumer co-ops.
- **Family Office** — Multi-generation wealth and decision-making.
- **Creator Guild** — Aligned with *Space's incubator and live/work-space thesis.

---

## 8. Open Questions to Decide Next

These should be resolved before scoping the ecosystem roadmap:

1. **Chain strategy.** One chain to start (Polygon already wired) or multi-chain from day one?
2. **Hosted vs. self-hosted org creation.** Do we host a managed Athena service, or is every org a self-deployed contract set?
3. **Default currency names.** Do we ship sensible defaults (e.g., "Voice" and "Stake") for organizations that don't want to pick names on day one?
4. **Reputation portability.** Is reputation per-organization, cross-organization, or both?
5. **Founder transition defaults.** What is the default schedule and what triggers are non-overridable?
6. **Token standards.** Stay on ERC-20 for the economic currency; choose between ERC-20, ERC-721, or soulbound (ERC-5114 / SBT) for the governance currency.
7. **Treasury composability.** Do we natively support multi-asset treasuries (stablecoins, RWAs, NFTs) from v1 or v2?
8. **Privacy.** Where do private votes, encrypted proposals, or shielded contributors fit in?
9. **Fee model.** Does Athena (the protocol/company) take any fee? From whom? If yes, where does it flow?
10. **Governance of Athena itself.** When and how does Athena begin governing Athena?

---

## 9. The Test

Before shipping anything, ask:

- Does this make the organization *more likely* to exist in 50 years?
- Does this *separate* governance from economics, or blur them?
- Does this *encode* a commitment, or rely on someone keeping a promise?
- Does this work for an org *without* a legal wrapper?
- Will this still be true after the founders are gone?

If the answer to any of these is "no" or "unclear," the design is incomplete.

---

*Athena. Governance Without Limits.*
