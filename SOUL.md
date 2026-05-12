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

## 7. The Ecosystem of Apps (To Decide)

This frontend is one surface on Athena. A full ecosystem will need more. The following are the candidate apps — we need to decide which we build, which we partner on, and which we leave to the community.

### 7.1 Confirmed Surfaces

- **Athena Web App** *(this repo)* — Landing, dashboard, treasury view, proposal browsing, profile, simulator, whitepaper. The canonical reference client.

### 7.2 Decisions Needed

Each item below needs a verdict: **build now / build later / partner / leave to community / kill**.

#### A. Organization Creation

- **Founder Console / Org Bootstrapper** — Wizard for deploying a new Athena organization: pick chain, configure currency names, set founder powers, define transition triggers, optionally attach a legal wrapper.
- **Constitution Builder** — Templates and a guided editor for the organization's charter, proposal categories, slashing rules, and reputation parameters.
- **Legal Wrapper Integrator** — Optional flow that connects to Wyoming DAO LLC formation services, equivalents in other jurisdictions, or a "no wrapper" pure-protocol path.

#### B. Member-Facing

- **Mobile App** — Notifications, vote-from-phone, treasury watch, identity. Probably PWA first, native later.
- **Browser Extension** — Sign votes, view org context on any page, sybil-resistant identity broadcast.
- **Discord / Matrix / Slack Bots** — Native presence in the communication channels organizations already use. Vote prompts, treasury alerts, proposal summaries.

#### C. Governance Operations

- **Proposal Studio** — Rich proposal authoring: text, attached transactions, simulations, impact previews, co-author flows.
- **Voting Client** — Standalone, minimal-surface voting app for users who want only the ballot.
- **Delegate Marketplace** — Browse, vet, and delegate to active contributors. Public delegate statements, voting history, performance metrics.

#### D. Economic & Treasury

- **Treasury Dashboard** — Inflows, outflows, runway, asset allocation, on-chain receipts. Deep enough for a CFO.
- **Staking & Yield Interface** — Economic-currency staking, lockup management, claim flows.
- **Market / Exchange Interface** — Buy/sell economic currency; optional, depends on jurisdiction.

#### E. Identity & Reputation

- **Athena Passport** — Portable identity: contribution history, reputation across organizations, public profile. Sybil-resistant.
- **Contribution Verifier** — Tooling for org admins to attest to off-chain work (PRs, design, ops) that converts to governance currency.

#### F. Infrastructure & Developer

- **Athena SDK** — TypeScript / Rust / Python clients.
- **Athena CLI** — Power-user operations: bulk proposal creation, treasury ops, migrations.
- **Indexer / GraphQL API** — Read-side infrastructure other apps can build on.
- **Webhook & Event Service** — Push-style integration for partner systems.

#### G. Analytics, Audit, Trust

- **Public Explorer** — Universal browser for any Athena organization, like Etherscan-for-orgs.
- **Health Score & Risk Reports** — Governance health metrics: participation rates, concentration, slashing events, founder-transition progress.
- **Audit Trail Exporter** — Compliance-grade exports for organizations that need them (accounting, regulators, members).

#### H. Specialized / Vertical

- **Research Collective Template** — Pre-configured Athena for academic / scientific groups.
- **Cooperative Template** — Pre-configured for worker / consumer co-ops.
- **Family Office Template** — Multi-generation wealth and decision-making.

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
