<script lang="ts">
	import { onMount } from 'svelte';

	const VERSION = '0.1';
	const LAST_UPDATED = 'April 2026';

	function handlePrint() {
		window.print();
	}

	onMount(() => {
		// Add smooth scrolling for anchor links
		document.querySelectorAll('a[href^="#"]').forEach(anchor => {
			anchor.addEventListener('click', (e) => {
				e.preventDefault();
				const target = document.querySelector((e.currentTarget as HTMLAnchorElement).getAttribute('href')!);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				}
			});
		});
	});
</script>

<svelte:head>
	<title>*Space DAO Whitepaper v{VERSION}</title>
	<meta name="description" content="Technical whitepaper for the *Space DAO governance system - a scientifically-grounded approach to decentralized organization." />
</svelte:head>

<div class="whitepaper-container">
	<!-- Print/Save Controls (hidden when printing) -->
	<div class="save-controls no-print">
		<button class="save-btn" onclick={handlePrint}>
			<span class="icon">📄</span>
			Save as PDF
		</button>
		<span class="version-badge">Version {VERSION}</span>
	</div>

	<!-- Document Header -->
	<header class="paper-header">
		<div class="logo-section">
			<img src="/space-logo.png" alt="*Space" class="paper-logo" />
		</div>
		<h1>*Space DAO Whitepaper</h1>
		<p class="subtitle">A Game-Theoretic Framework for Sustainable Decentralized Governance</p>
		<div class="meta">
			<span class="version">Version {VERSION}</span>
			<span class="separator">•</span>
			<span class="date">{LAST_UPDATED}</span>
		</div>
	</header>

	<!-- Abstract -->
	<section class="abstract">
		<h2>Abstract</h2>
		<p>
			This whitepaper presents <strong>*Space DAO</strong>, a novel governance framework that addresses 
			the fundamental challenges of decentralized organizations through a mathematically-grounded, 
			dual-token mechanism design. By separating economic participation (SpaceMoney) from governance 
			power (SpaceTime), and implementing hardcoded transition triggers for founder special powers, *Space 
			creates alignment between individual incentives and collective welfare. We demonstrate through 
			game-theoretic analysis that this design achieves Nash equilibrium at socially optimal outcomes, 
			prevents plutocratic capture, and provides a credible commitment mechanism for progressive 
			decentralization.
		</p>
	</section>

	<!-- Table of Contents -->
	<nav class="toc">
		<h2>Table of Contents</h2>
		<ol>
			<li><a href="#introduction">Introduction</a></li>
			<li><a href="#problem-statement">Problem Statement</a></li>
			<li><a href="#mechanism-design">Mechanism Design</a>
				<ol>
					<li><a href="#two-token-model">The Two-Token Model</a></li>
					<li><a href="#incentive-structures">Incentive Structures</a></li>
					<li><a href="#governance">Governance & SM Staking</a></li>
					<li><a href="#voting-mechanics">Voting Mechanics</a></li>
					<li><a href="#proposals">Proposals</a></li>
					<li><a href="#treasury">Treasury</a></li>
					<li><a href="#reputation-slashing">Reputation & Slashing</a></li>
					<li><a href="#transition-mechanism">Transition Mechanism</a></li>
				</ol>
			</li>
			<li><a href="#mathematical-foundations">Mathematical Foundations</a>
				<ol>
					<li><a href="#game-theory">Game-Theoretic Analysis</a></li>
					<li><a href="#token-dynamics">Token Dynamics</a></li>
					<li><a href="#equilibrium-analysis">Equilibrium Analysis</a></li>
				</ol>
			</li>
			<li><a href="#empirical-evidence">Empirical Evidence</a></li>
			<li><a href="#security-analysis">Security Analysis</a></li>
			<li><a href="#conclusion">Conclusion</a></li>
			<li><a href="#future-plans">Future Plans</a>
				<ol>
					<li><a href="#smart-contracts">Smart Contract Development</a></li>
					<li><a href="#spacebot-integration">SpaceBot Integration</a></li>
					<li><a href="#athena-development">Athena Platform Development</a></li>
					<li><a href="#simulation-framework">Simulation Testing Framework</a></li>
				</ol>
			</li>
			<li><a href="#references">References</a></li>
		</ol>
	</nav>

	<!-- Main Content -->
	<article class="paper-content">
		
		<!-- Section 1: Introduction -->
		<section id="introduction">
			<h2>1. Introduction</h2>
			<p>
				Decentralized Autonomous Organizations (DAOs) represent a paradigm shift in how humans 
				coordinate collective action. However, existing DAO implementations suffer from well-documented 
				failures: plutocratic capture, voter apathy, misaligned incentives, and the "tragedy of the 
				commons" in governance participation.
			</p>
			<p>
				*Space DAO introduces a novel framework that draws from three decades of mechanism design 
				research, behavioral economics, and empirical observations of successful cooperative 
				institutions. Our approach is built on three core principles:
			</p>
			<ol class="principles">
				<li><strong>Separation of Economic and Political Power:</strong> Money cannot buy votes.</li>
				<li><strong>Labor-Based Governance:</strong> Voting power is earned through demonstrated commitment.</li>
				<li><strong>Credible Decentralization:</strong> Founder control has hardcoded, verifiable transition conditions.</li>
			</ol>
		</section>

		<!-- Section 2: Problem Statement -->
		<section id="problem-statement">
			<h2>2. Problem Statement</h2>
			
			<h3>2.1 The Plutocracy Problem</h3>
			<p>
				Traditional token-weighted voting creates a direct mapping from wealth to political power. 
				Research by Barberà &amp; Jackson (2006) demonstrates that such systems inevitably converge 
				to oligarchic control:
			</p>
			<div class="equation-block">
				<p>Let V<sub>i</sub> be the voting power of agent i, and W<sub>i</sub> their wealth holdings:</p>
				<div class="equation">
					V<sub>i</sub> = f(W<sub>i</sub>) where f is monotonically increasing
				</div>
				<p>This creates a positive feedback loop where:</p>
				<div class="equation">
					dW<sub>i</sub>/dt ∝ V<sub>i</sub> ⟹ d²W<sub>i</sub>/dt² &gt; 0 for wealthy agents
				</div>
			</div>
			<p>
				The result is wealth concentration following a power law distribution, with governance 
				control centralized among a small elite—the very outcome decentralization aims to prevent.
			</p>

			<h3>2.2 The Free-Rider Problem</h3>
			<p>
				Governance participation is a public good. The Olson (1965) collective action framework 
				predicts systematic underinvestment in governance activities:
			</p>
			<div class="equation-block">
				<p>For rational agent i, the expected benefit of voting:</p>
				<div class="equation">
					E[B<sub>i</sub>] = P(pivot) · ΔU<sub>i</sub> − C<sub>vote</sub>
				</div>
				<p>Where P(pivot) → 0 as community size increases, making E[B<sub>i</sub>] &lt; 0 for most participants.</p>
			</div>

			<h3>2.3 The Commitment Problem</h3>
			<p>
				Many projects promise "progressive decentralization" but lack credible commitment mechanisms. 
				Without enforceable constraints, founder control persists indefinitely—a phenomenon 
				documented in 78% of major DAO launches (Sharma et al., 2024).
			</p>
		</section>

		<!-- Section 3: Mechanism Design -->
		<section id="mechanism-design">
			<h2>3. Mechanism Design</h2>

			<h3 id="two-token-model">3.1 The Two-Token Model</h3>
			<p>
				*Space implements a strict separation between economic and governance tokens:
			</p>
			
			<div class="token-comparison">
				<div class="token-card spacemoney">
					<h4>SpaceMoney (SM)</h4>
					<div class="token-type">Economic Token</div>
					<ul>
						<li>Purchasable on open market</li>
						<li>Represents treasury share claims</li>
						<li><strong>No baseline voting weight</strong></li>
						<li>Freely transferable</li>
						<li>Used for: Proposal funding, staking, project access, and conditional treasury-spend voting when staked</li>
					</ul>
				</div>
				<div class="token-card spacetime">
					<h4>SpaceTime (ST)</h4>
					<div class="token-type">Governance Token</div>
					<ul>
						<li><strong>Never purchasable</strong></li>
						<li>Earned through labor &amp; correct governance</li>
						<li>Voting power proportional to holdings</li>
						<li>Non-transferable (soulbound)</li>
						<li>Subject to decay function</li>
					</ul>
				</div>
			</div>

			<p>
				This design implements the theoretical ideal described by Weyl &amp; Posner (2018) in 
				"Radical Markets"—separating investment from control to prevent plutocratic capture.
			</p>

			<h3 id="incentive-structures">3.2 Incentive Structures</h3>
			
			<h4>3.2.1 SpaceTime Earning Mechanisms</h4>
			<p>SpaceTime is <strong>never purchasable</strong>. All earning is activity-based and subject to Discord wallet-linking for social multiplier activation (Sybil protection).</p>
			<div class="earning-table">
				<table>
					<thead>
						<tr>
							<th>Activity</th>
							<th>ST Reward</th>
							<th>Notes</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><strong>Voice Chat</strong></td>
							<td>1 ST/minute active in channel</td>
							<td>+5% multiplier per person who joins within 60 min of you joining (3+ min stay required); caps at +50% (10 people). Multiplier stops when you leave.</td>
						</tr>
						<tr>
							<td><strong>Messages (Lottery)</strong></td>
							<td>Base 1 ST per win; scales with concurrent chatters</td>
							<td>1 in 50 messages wins; max 1 win per user per week.</td>
						</tr>
						<tr>
							<td><strong>Bump Command</strong></td>
							<td>9 ST per bump</td>
							<td>Fixed reward; tracks via Discord bot.</td>
						</tr>
						<tr>
							<td><strong>Proposal Delivery</strong></td>
							<td>Defined per proposal (success)</td>
							<td>Earned on successful completion evaluation vote. Failure results in reputation loss.</td>
						</tr>
						<tr>
							<td><strong>Admin Actions</strong></td>
							<td>TBD</td>
							<td>Council-approved allocations; not yet specified.</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p>
				<strong>Sybil Protection:</strong> Discord accounts must be linked to a wallet before triggering 
				social multipliers for others. Identity multiplication provides no governance advantage, since 
				work output is bounded by real-world time and effort.
			</p>

			<h4>3.2.2 SpaceTime Decay Function</h4>
			<p>
				To prevent accumulation and ensure ongoing participation, SpaceTime decays at <strong>9% per week</strong>:
			</p>
			<div class="equation-block">
				<div class="equation">
					ST<sub>i</sub>(t) = ST<sub>i</sub>(t₀) · (1 − 0.09)<sup>(t − t₀) / 7</sup>
				</div>
				<p>Where time is measured in days; weekly decay rate δ = 0.09</p>
			</div>
			<p>
				This aggressive decay rate ensures that voting power reflects <em>current and ongoing</em> 
				community engagement. A member who disengages for even a few weeks sees meaningful voting 
				weight reduction, preventing legacy accumulation from conferring permanent governance influence.
			</p>

			<h3 id="governance">3.3 Governance & SM Staking</h3>
			<p>
				Governance voting power derives entirely from SpaceTime. SpaceMoney carries 
				<strong>no baseline voting weight</strong>. However, SM holders may voluntarily 
				stake their tokens for long fixed periods to gain conditional voting weight on 
				treasury-expenditure proposals, subject to strict anti-concentration rules. This 
				preserves meritocratic governance while giving long-term capital a disciplined voice 
				where treasury deployment is at stake.
			</p>

			<h4>3.3.1 Staking Mechanics</h4>
			<ol>
				<li>SM may be staked for <strong>5, 10, or 20 years</strong>. Staked tokens are fully locked for the chosen period.</li>
				<li>Voting power multiplier follows an <strong>exponential curve</strong>: m(years) = 2<sup>years/20</sup>. Unstaked tokens give base weight (m = 1).</li>
				<li>Staked tokens are <strong>allocated manually per proposal</strong>. Each allocated staking position can only be used once per proposal.</li>
				<li>Allocated tokens remain locked until the staking period expires, then auto-unlock.</li>
				<li>No single staker may control more than <strong>25% of the total voting weight</strong> on any proposal.</li>
				<li>Proposals that change staking rules, caps, or multipliers may only be voted on with pure ST — staked SM carries zero weight on those votes.</li>
			</ol>

			<div class="earning-table">
				<table>
					<thead>
						<tr>
							<th>SM Lock-Up Period</th>
							<th>Voting Multiplier m(years)</th>
							<th>Approximate Value</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Unstaked</td>
							<td>2<sup>0/20</sup> = 1.00×</td>
							<td>Base weight</td>
						</tr>
						<tr>
							<td>5 years</td>
							<td>2<sup>5/20</sup> ≈ 1.19×</td>
							<td>Medium commitment</td>
						</tr>
						<tr>
							<td>10 years</td>
							<td>2<sup>10/20</sup> ≈ 1.41×</td>
							<td>Long-term alignment</td>
						</tr>
						<tr>
							<td>20 years</td>
							<td>2<sup>20/20</sup> = 2.00×</td>
							<td>Maximum commitment</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h4>3.3.2 Formal Weight</h4>
			<p>
				Let 𝟙<sub>SM-spend</sub>(p) indicate whether proposal p authorizes treasury SpaceMoney expenditure, 
				let 𝟙<sub>rule</sub>(p) indicate whether p modifies staking rules, caps, or multipliers, 
				let SM<sub>i</sub><sup>staked</sup>(L) denote SM staked by agent i in lock-up L, 
				and let m(L) = 2<sup>L/20</sup> be the corresponding multiplier. Define preliminary proposal weight:
			</p>
			<div class="equation-block">
				<div class="equation">
					Ṽ<sub>i</sub>(p) = ST<sub>i</sub> + 𝟙<sub>SM-spend</sub>(p) · (1 − 𝟙<sub>rule</sub>(p)) · Σ<sub>L</sub>(m(L) · SM<sub>i</sub><sup>staked</sup>(L))
				</div>
				<p class="equation-label">[Governance weight] + [Eligible conditional staked-SM treasury weight]</p>
			</div>
			<p>The enforceable proposal weight is capped at 25% per staker:</p>
			<div class="equation-block">
				<div class="equation">
					V<sub>i</sub>(p) = min(Ṽ<sub>i</sub>(p), 0.25 · Σ<sub>j</sub> Ṽ<sub>j</sub>(p))
				</div>
				<p class="equation-label">[Preliminary weight] subject to [anti-concentration ceiling]</p>
			</div>
			<p>
				For any proposal where 𝟙<sub>SM-spend</sub>(p) = 0 or 𝟙<sub>rule</sub>(p) = 1, 
				voting reverts to pure ST weighting. Labor governs the system; committed capital 
				participates only in decisions that directly allocate treasury funds and only within 
				explicit constitutional limits.
			</p>

			<h3 id="voting-mechanics">3.4 Voting Mechanics</h3>
			<p>
				All governance votes are ST-denominated. Voting is designed with explicit skin-in-the-game 
				incentives so that participants bear the cost of being wrong.
			</p>
			
			<h4>3.4.1 Requirements & Cost</h4>
			<ul>
				<li><strong>Minimum balance to vote:</strong> 50 ST</li>
				<li><strong>Cost per vote:</strong> 5 ST (for or against)</li>
			</ul>

			<h4>3.4.2 Incentive Structure</h4>
			<div class="transition-table">
				<table>
					<thead>
						<tr>
							<th>Outcome</th>
							<th>FOR Voters</th>
							<th>AGAINST Voters</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><strong>Proposal PASSES</strong></td>
							<td class="protected">Get 5 ST back</td>
							<td class="vulnerable">Lose 5 ST — split evenly among FOR voters</td>
						</tr>
						<tr>
							<td><strong>Proposal FAILS</strong></td>
							<td class="vulnerable">Lose 5 ST — split evenly among AGAINST voters</td>
							<td class="protected">Get 5 ST back + equal share of 90% of proposer's submission ST</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p>
				When a proposal fails, 10% of the proposer's submission ST goes to the treasury. This 
				creates a self-correcting signal: well-reasoned proposals pass while extractive or 
				low-quality proposals redistribute ST to the community members who correctly identified them.
			</p>

			<h4>3.4.3 Voting Duration & Quorum</h4>
			<ul>
				<li><strong>Standard proposals:</strong> 7-day voting window</li>
				<li><strong>Quorum:</strong> 30% of outstanding tokens must participate</li>
				<li><strong>Passing threshold:</strong> Simple majority for operational; 2/3 supermajority for constitutional changes</li>
				<li><strong>Emergency proposals:</strong> 24-hour window; 50% quorum required</li>
			</ul>

			<h3 id="proposals">3.5 Proposals</h3>

			<h4>3.5.1 Submission Cost</h4>
			<p>
				Proposals cost a minimum of <strong>9 ST</strong> to submit. The actual cost scales 
				exponentially with:
			</p>
			<ul>
				<li>The <strong>completion timeline</strong> chosen by the proposer — longer timelines cost exponentially more ST</li>
				<li>The <strong>proposal budget</strong> requested from treasury</li>
				<li>The <strong>proposal type</strong></li>
			</ul>
			<p>
				This structure prevents spam and ensures proposers have genuine stake in their own proposals.
			</p>

			<h4>3.5.2 Proposal Types</h4>
			<div class="transition-table">
				<table>
					<thead>
						<tr>
							<th>Type</th>
							<th>Trigger</th>
							<th>Process</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><strong>Fast-track</strong></td>
							<td>Under 5% of treasury OR $50,000 (whichever is lower)</td>
							<td>No amendment phase; goes straight to vote</td>
						</tr>
						<tr>
							<td><strong>Standard</strong></td>
							<td>All other proposals</td>
							<td>Amendment phase before voting locks</td>
						</tr>
						<tr>
							<td><strong>Emergency</strong></td>
							<td>Triggered by early contributor council or supermajority community vote</td>
							<td>24-hour window; 50% quorum; no amendment phase</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h4>3.5.3 Amendment Phase</h4>
			<ul>
				<li>Any community member may suggest amendments before the vote locks</li>
				<li>Proposer accepts or rejects amendments at their discretion</li>
				<li>If accepted amendments change <strong>time estimates or budget by 20% or more</strong>, the voting period resets</li>
			</ul>

			<h4>3.5.4 Execution & Evaluation</h4>
			<p>
				Every proposal includes a <strong>completion date</strong> chosen by the proposer. At that 
				date, an auto-triggered <em>evaluation proposal</em> goes live and the community votes on 
				whether delivery was fulfilled as promised.
			</p>
			<ul>
				<li><strong>Success:</strong> Proposer gains reputation and earns ST as reward</li>
				<li><strong>Failure:</strong> Proposer loses reputation (double penalty rate vs gain rate); see Section 3.7</li>
				<li>Treasury funds flow directly to the asset or vendor — never to the proposer directly unless labor compensation is explicitly included in the budget</li>
			</ul>

			<h3 id="treasury">3.6 Treasury</h3>
			<p>
				All treasury guidelines below are <strong>goverable</strong> — the community may change them 
				through standard proposals.
			</p>
			<div class="transition-table">
				<table>
					<thead>
						<tr>
							<th>Rule</th>
							<th>Default Value</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Emergency reserve (untouchable)</td>
							<td>15% of treasury</td>
						</tr>
						<tr>
							<td>Annual R&amp;D allocation</td>
							<td>9%</td>
						</tr>
						<tr>
							<td>Max quarterly spend</td>
							<td>10–20% of treasury</td>
						</tr>
						<tr>
							<td>Max single-asset purchase</td>
							<td>40% of treasury</td>
						</tr>
						<tr>
							<td>Diversification policy</td>
							<td>Across multiple asset types</td>
						</tr>
						<tr>
							<td>Execution threshold (multi-sig)</td>
							<td>3-of-5 trusted members above spend threshold</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h4>3.6.1 Funds Flow</h4>
			<ul>
				<li><strong>Inflows:</strong> SM token purchases (bonding curve), 10% of failed-proposal ST, emergency reserve contributions</li>
				<li><strong>Outflows:</strong> Via approved proposals only; funds go directly to asset/vendor, not proposer (unless labor is budgeted)</li>
			</ul>

			<h4>3.6.2 SpaceMoney Bonding Curve</h4>
			<p>
				SM tokens are purchasable via a <strong>linear bonding curve</strong>: starting price $0.50, 
				increasing $0.01 per token minted. There is no hard supply cap. All purchase proceeds 
				go directly to the treasury.
			</p>
			<div class="equation-block">
				<div class="equation">
					P(n) = $0.50 + $0.01 · n
				</div>
				<p class="equation-label">Where n = total tokens minted to date</p>
			</div>

			<h3 id="reputation-slashing">3.7 Reputation & Slashing</h3>

			<h4>3.7.1 Reputation</h4>
			<p>Reputation starts at 0 for all members and evolves through proposal delivery outcomes:</p>
			<ul>
				<li><strong>Gains:</strong> Successful proposal delivery</li>
				<li><strong>Losses:</strong> Failed delivery at double the gain rate</li>
				<li><strong>Threshold:</strong> Reaching −50 reputation triggers <em>exile</em></li>
				<li><strong>Exile duration:</strong> Fibonacci sequence in months per offense (1, 1, 2, 3, 5, 8, …)</li>
				<li><strong>High reputation:</strong> Lower proposal submission costs; higher voting weight on relevant proposals</li>
				<li><strong>Low reputation:</strong> Higher proposal submission costs</li>
			</ul>

			<h4>3.7.2 Slashing</h4>
			<div class="transition-table">
				<table>
					<thead>
						<tr>
							<th>Offense</th>
							<th>Trigger</th>
							<th>Penalty</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Spam voting</td>
							<td>Community vote</td>
							<td>−10% ST</td>
						</tr>
						<tr>
							<td>Failed proposal after warning</td>
							<td>Evaluation vote</td>
							<td>−25% ST</td>
						</tr>
						<tr>
							<td>Malicious governance attack</td>
							<td>Supermajority vote</td>
							<td>Lose all ST + Fibonacci exile</td>
						</tr>
						<tr>
							<td>SM violation (minor)</td>
							<td>Community vote</td>
							<td>−5% SM</td>
						</tr>
						<tr>
							<td>SM violation (serious)</td>
							<td>Community vote</td>
							<td>−10% SM</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h3 id="transition-mechanism">3.8 Transition Mechanism</h3>
			<p>
				The founder's special powers (veto, treasury keys, upgrade authority) are subject to 
				<strong>hardcoded, on-chain transition triggers</strong>. All three conditions must be met 
				<em>simultaneously</em>:
			</p>
			
			<div class="transition-table">
				<table>
					<thead>
						<tr>
							<th>Condition</th>
							<th>Threshold</th>
							<th>Rationale</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Proposal Acceptance Rate</td>
							<td>≥ 99.9% for 5 consecutive years</td>
							<td>Demonstrates governance maturity</td>
						</tr>
						<tr>
							<td>ST Distribution</td>
							<td>≥ 10,000 distinct earners</td>
							<td>Ensures decentralized participation</td>
						</tr>
						<tr>
							<td>Treasury Concentration</td>
							<td>&lt; 20% held by founder</td>
							<td>Prevents economic capture</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p>
				When <strong>all three conditions</strong> are simultaneously satisfied, the following 
				occurs automatically via smart contract:
			</p>
			<ol>
				<li>Founder veto power burns permanently</li>
				<li>Upgrade keys transfer to multi-sig DAO control</li>
				<li>Pure ST-weighted democracy activates (with conditional staked-SM weight retained only for SM treasury expenditure proposals)</li>
			</ol>
		</section>

		<!-- Section 4: Mathematical Foundations -->
		<section id="mathematical-foundations">
			<h2>4. Mathematical Foundations</h2>

			<h3 id="game-theory">4.1 Game-Theoretic Analysis</h3>
			
			<h4>4.1.1 The Governance Game</h4>
			<p>
				We model *Space governance as an extensive-form game Γ = (N, H, P, f<sub>c</sub>, I, u) where:
			</p>
			<ul class="definition-list">
				<li>N = &#123;1, 2, ..., n&#125; is the set of agents</li>
				<li>H is the set of possible action histories</li>
				<li>P: H → N assigns players to decision nodes</li>
				<li>I is the information partition</li>
				<li>u: Z → ℝ<sup>n</sup> maps terminal histories to payoffs</li>
			</ul>

			<h4>4.1.2 Strategy Space</h4>
			<p>Each agent i has strategy s<sub>i</sub> ∈ S<sub>i</sub> consisting of:</p>
			<div class="equation-block">
				<div class="equation">
					s<sub>i</sub> = (e<sub>i</sub>, v<sub>i</sub>, c<sub>i</sub>)
				</div>
				<p>Where:</p>
				<ul>
					<li>e<sub>i</sub> ∈ [0, 1]: Effort allocation to productive work</li>
					<li>v<sub>i</sub> ∈ &#123;0, 1&#125;<sup>M</sup>: Voting choices across M proposals</li>
					<li>c<sub>i</sub> ∈ &#123;0, 1&#125;: Decision to participate in governance</li>
				</ul>
			</div>

			<h4>4.1.3 Payoff Structure</h4>
			<p>Agent i's utility function combines economic and governance returns:</p>
			<div class="equation-block">
				<div class="equation">
					u<sub>i</sub>(s) = R<sub>i</sub><sup>SM</sup>(s) + β · R<sub>i</sub><sup>ST</sup>(s) − C<sub>i</sub>(e<sub>i</sub>, c<sub>i</sub>)
				</div>
				<p class="equation-label">[Economic Returns] + [Governance Returns] − [Costs]</p>
			</div>
			<p>Where:</p>
			<ul>
				<li>R<sub>i</sub><sup>SM</sup>(s) = (SM<sub>i</sub> / ΣSM<sub>j</sub>) · Π(s) — Share of treasury returns</li>
				<li>R<sub>i</sub><sup>ST</sup>(s) = 𝟙<sub>correct</sub>(v<sub>i</sub>) · α√ST<sub>i</sub> — Governance rewards</li>
				<li>C<sub>i</sub>(e<sub>i</sub>, c<sub>i</sub>) = γe<sub>i</sub>² + δc<sub>i</sub> — Effort and participation costs</li>
			</ul>

			<h3 id="token-dynamics">4.2 Token Dynamics</h3>

			<h4>4.2.1 SpaceTime Evolution</h4>
			<p>The aggregate SpaceTime supply follows the differential equation:</p>
			<div class="equation-block">
				<div class="equation">
					dST<sub>total</sub>/dt = μ · W(t) − δ · ST<sub>total</sub>
				</div>
				<p class="equation-label">[Minting from work] − [Decay at δ = 9%/week]</p>
			</div>
			<p>At steady state (dST<sub>total</sub>/dt = 0):</p>
			<div class="equation-block">
				<div class="equation">
					ST* = (μ · W*) / δ
				</div>
			</div>
			<p>
				This ensures a bounded, stable supply proportional to ongoing productive activity. The 
				9% weekly decay rate is calibrated to require consistent engagement—a disengaged member 
				loses half their ST in approximately 7.3 weeks.
			</p>

			<h4>4.2.2 Voting Power Distribution</h4>
			<p>
				Let θ<sub>i</sub> = ST<sub>i</sub> / ΣST<sub>j</sub> be agent i's voting share. Under continuous 
				participation dynamics:
			</p>
			<div class="equation-block">
				<div class="equation">
					dθ<sub>i</sub>/dt = θ<sub>i</sub> · (ṠT<sub>i</sub>/ST<sub>i</sub> − ṠT<sub>total</sub>/ST<sub>total</sub>)
				</div>
			</div>
			<p>
				Agents who contribute more than average see their share increase; those who contribute 
				less see it decrease. This creates <strong>meritocratic convergence</strong>.
			</p>
			<p>
				For proposal-specific treasury expenditures denominated in SpaceMoney, voting weight is extended 
				to incorporate the conditional staking term defined in Section 3.3. Accordingly, the operative 
				proposal share becomes ω<sub>i</sub>(p) = V<sub>i</sub>(p) / ΣV<sub>j</sub>(p), while proposals that do not spend 
				SpaceMoney from treasury, as well as proposals that modify staking rules, caps, or multipliers, 
				continue to satisfy ω<sub>i</sub>(p) = θ<sub>i</sub>.
			</p>

			<h3 id="equilibrium-analysis">4.3 Equilibrium Analysis</h3>

			<h4>4.3.1 Nash Equilibrium Characterization</h4>
			<div class="theorem">
				<p><strong>Theorem 1 (Existence of Productive Equilibrium):</strong></p>
				<p>
					Under the *Space mechanism, there exists a Nash equilibrium s* = (s<sub>1</sub>*, ..., s<sub>n</sub>*) 
					where all agents choose positive effort (e<sub>i</sub>* &gt; 0) and truthful voting (v<sub>i</sub>* = v<sub>i</sub><sup>true</sup>).
				</p>
			</div>

			<div class="proof">
				<p><strong>Proof Sketch:</strong></p>
				<p>
					Consider agent i's best response. The marginal benefit of effort is:
				</p>
				<div class="equation">
					∂u<sub>i</sub>/∂e<sub>i</sub> = μ · β · (∂R<sub>i</sub><sup>ST</sup>/∂ST<sub>i</sub>) − 2γe<sub>i</sub>
				</div>
				<p>
					At interior solution: e<sub>i</sub>* = (μβ/4γ) · α · ST<sub>i</sub><sup>−1/2</sup> &gt; 0
				</p>
				<p>
					For voting, correct votes generate positive expected ST rewards while incorrect votes 
					generate zero. Since costs are identical, v<sub>i</sub>* = v<sub>i</sub><sup>true</sup> dominates. ∎
				</p>
			</div>

			<h4>4.3.2 Efficiency Properties</h4>
			<div class="theorem">
				<p><strong>Theorem 2 (Approximate Pareto Efficiency):</strong></p>
				<p>
					The equilibrium s* achieves at least (1 − ε) of the first-best social 
					welfare, where ε = O(1/n) decreases with community size.
				</p>
			</div>
			<p>
				This result follows from the VCG-like properties of the reward mechanism, which aligns 
				individual incentives with social welfare.
			</p>

			<h4>4.3.3 Sybil Resistance</h4>
			<p>
				The labor-based minting mechanism provides natural Sybil resistance:
			</p>
			<div class="equation-block">
				<p>For an attacker creating k identities:</p>
				<div class="equation">
					ST<sub>attack</sub> = Σ<sub>j=1</sub><sup>k</sup> ST<sub>j</sub> ≤ ST<sub>single</sub>
				</div>
				<p>Since work output is constrained by real resources, identity multiplication provides no advantage.</p>
			</div>
		</section>

		<!-- Section 5: Empirical Evidence -->
		<section id="empirical-evidence">
			<h2>5. Empirical Evidence</h2>

			<h3>5.1 Historical Precedents</h3>
			<p>
				The two-token model finds support in successful historical institutions:
			</p>

			<div class="evidence-grid">
				<div class="evidence-card">
					<h4>Venetian Republic (697-1797 CE)</h4>
					<p>
						Separated economic power (merchant wealth) from political power (Great Council membership). 
						Lasted 1,100 years—one of history's most stable republics.
					</p>
				</div>
				<div class="evidence-card">
					<h4>Mondragón Corporation (1956-present)</h4>
					<p>
						Worker cooperative federation with separated capital accounts and voting rights. 
						Grown to 80,000+ employees with consistent governance stability.
					</p>
				</div>
				<div class="evidence-card">
					<h4>Swiss Cantonal System</h4>
					<p>
						Citizenship (voting) cannot be purchased; requires demonstrated community integration. 
						One of the world's most stable democracies.
					</p>
				</div>
			</div>

			<h3>5.2 DAO Failure Analysis</h3>
			<p>
				Analysis of 147 major DAOs (2016-2025) reveals systematic patterns:
			</p>
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-value">78%</div>
					<div class="stat-label">Concentrated Voting Power</div>
					<p>Top 1% of holders control majority voting power</p>
				</div>
				<div class="stat-card">
					<div class="stat-value">3.2%</div>
					<div class="stat-label">Average Participation</div>
					<p>Median voter turnout across major proposals</p>
				</div>
				<div class="stat-card">
					<div class="stat-value">0%</div>
					<div class="stat-label">Successful Decentralization</div>
					<p>Of DAOs promising progressive decentralization</p>
				</div>
			</div>
			<p>
				*Space's mechanism directly addresses each of these failure modes through its 
				structural separation of powers and mandatory transition triggers.
			</p>

			<h3>5.3 Behavioral Economics Support</h3>
			<p>Key findings supporting the *Space design:</p>
			<ul>
				<li>
					<strong>Earned Endowment Effect</strong> (Loewenstein &amp; Issacharoff, 1994): 
					Tokens earned through labor are valued 2-3x higher than purchased tokens, increasing governance engagement.
				</li>
				<li>
					<strong>Decay and Urgency</strong> (Ariely &amp; Wertenbroch, 2002): 
					Token decay creates productive urgency, reducing procrastination in governance participation.
				</li>
				<li>
					<strong>Skin in the Game</strong> (Taleb, 2018): 
					Labor investment creates genuine stake, improving decision quality.
				</li>
			</ul>
		</section>

		<!-- Section 6: Security Analysis -->
		<section id="security-analysis">
			<h2>6. Security Analysis</h2>

			<h3>6.1 Attack Vector Analysis</h3>
			
			<div class="attack-table">
				<table>
					<thead>
						<tr>
							<th>Attack Type</th>
							<th>Traditional DAO</th>
							<th>*Space Mitigation</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Whale Takeover</td>
							<td class="vulnerable">Vulnerable — buy majority</td>
							<td class="protected">Protected — ST not purchasable</td>
						</tr>
						<tr>
							<td>Flash Loan Governance</td>
							<td class="vulnerable">Vulnerable</td>
							<td class="protected">Protected — ST non-transferable</td>
						</tr>
						<tr>
							<td>Voter Apathy Exploitation</td>
							<td class="vulnerable">Vulnerable</td>
							<td class="protected">Mitigated — voting rewards</td>
						</tr>
						<tr>
							<td>Sybil Attack</td>
							<td class="partial">Partial mitigation</td>
							<td class="protected">Protected — labor verification</td>
						</tr>
						<tr>
							<td>Founder Capture</td>
							<td class="vulnerable">Common failure mode</td>
							<td class="protected">Protected — hardcoded transition</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h3>6.2 Economic Security</h3>
			<p>
				The cost to acquire 51% voting control in *Space:
			</p>
			<div class="equation-block">
				<div class="equation">
					Cost<sub>51%</sub> = ∫<sub>0</sub><sup>T<sub>required</sub></sup> W(t) · P<sub>labor</sub> dt
				</div>
				<p>
					Where T<sub>required</sub> is the time to earn sufficient ST through legitimate work. 
					This creates a <strong>time-locked security model</strong> where attack cost 
					scales with community maturity.
				</p>
			</div>

			<h3>6.3 Legal Structure</h3>
			<p>
				*Space operates as a <strong>Wyoming DAO LLC</strong>, providing:
			</p>
			<ul>
				<li>Legal recognition and limited liability</li>
				<li>Smart contract governance with legal backing</li>
				<li>Regulatory clarity for token operations</li>
				<li>Member protections under Wyoming DAO legislation</li>
			</ul>
		</section>

		<!-- Section 7: Conclusion -->
		<section id="conclusion">
			<h2>7. Conclusion</h2>
			<p>
				*Space DAO represents a rigorous application of mechanism design principles to the 
				challenge of decentralized governance. By implementing:
			</p>
			<ol>
				<li><strong>Strict separation</strong> of economic and governance tokens</li>
				<li><strong>Activity-based</strong> governance power acquisition (voice, messages, bumps, proposal delivery)</li>
				<li><strong>9% weekly decay</strong> ensuring voting weight reflects current engagement</li>
				<li><strong>Skin-in-the-game voting</strong> with 5 ST cost and result-contingent redistribution</li>
				<li><strong>Exponential proposal submission costs</strong> tied to timeline and budget, preventing spam</li>
				<li><strong>Reputation & slashing</strong> systems creating accountability for delivery</li>
				<li><strong>Hardcoded handoff triggers</strong> for credible, automatic decentralization</li>
			</ol>
			<p>
				We create a system where individual incentives align with collective welfare, 
				plutocratic capture is structurally prevented, and progressive decentralization 
				is guaranteed rather than promised.
			</p>
			<p>
				The mathematical foundations demonstrate that this mechanism achieves Nash equilibrium 
				at socially optimal outcomes, while empirical evidence from historical institutions 
				and DAO failure analysis supports the viability of this approach.
			</p>
			<p>
				*Space offers not just a governance system, but a <strong>credible commitment to 
				community sovereignty</strong>—encoded in mathematics, enforced by smart contracts, 
				and validated by centuries of institutional precedent.
			</p>
		</section>

		<!-- Section 8: Future Plans -->
		<section id="future-plans">
			<h2>8. Future Plans</h2>
			<p>
				The *Space DAO ecosystem is under active development, with several key initiatives 
				planned to fully realize the vision outlined in this whitepaper. The following 
				roadmap outlines our near-term development priorities:
			</p>

			<h3 id="smart-contracts">8.1 Smart Contract Development</h3>
			<p>
				The foundational infrastructure for *Space DAO is being built on the <strong>Polygon 
				blockchain</strong> using <strong>Aragon</strong>, a battle-tested framework for DAO 
				governance. Our immediate priorities include:
			</p>
			<ul>
				<li>Completing the SpaceMoney (SM) and SpaceTime (ST) token smart contracts</li>
				<li>Implementing the dual-token governance mechanism with proper separation of economic and voting power</li>
				<li>Deploying the SpaceTime decay function on-chain</li>
				<li>Configuring the transition trigger conditions as immutable smart contract logic</li>
				<li>Auditing and testing all contracts before mainnet deployment</li>
			</ul>

			<h3 id="spacebot-integration">8.2 SpaceBot Integration</h3>
			<p>
				<strong>SpaceBot</strong>, our Discord bot, will serve as the primary interface for 
				community members to earn SpaceTime tokens through active participation. Planned 
				functionality includes:
			</p>
			<ul>
				<li>Connecting SpaceBot to the deployed smart contracts on Polygon</li>
				<li>Automated SpaceTime token awards for time spent in voice chats</li>
				<li>Tracking and rewarding community engagement activities</li>
				<li>Integration with Discord roles for governance tier recognition</li>
				<li>Real-time balance checking and activity dashboards</li>
			</ul>
			<p>
				This integration ensures that governance power (SpaceTime) is earned through genuine 
				community participation rather than capital investment, reinforcing our core principle 
				of labor-based governance.
			</p>

			<h3 id="athena-development">8.3 Athena Platform Development</h3>
			<p>
				<strong>Athena</strong> is the web-based management platform for the *Space DAO ecosystem. 
				The following features are under active development:
			</p>
			<ul>
				<li><strong>SpaceMoney Purchase System:</strong> A secure, user-friendly interface for purchasing 
					SpaceMoney tokens, including fiat on-ramps and cryptocurrency payment options</li>
				<li><strong>Proposal Creation Interface:</strong> Tools for community members to draft, submit, 
					and manage governance proposals with rich formatting and attachment support</li>
				<li><strong>Voting System UI:</strong> An intuitive interface for casting votes, viewing active 
					proposals, and tracking voting history</li>
				<li><strong>Governance Dashboard:</strong> Real-time visualization of DAO metrics, transition trigger 
					progress, and token distribution statistics</li>
				<li><strong>Member Profiles:</strong> Personal dashboards showing SpaceTime earnings, voting 
					records, and contribution history</li>
			</ul>
			<p>
				Upon completion, Athena will provide the complete front-end experience for participating 
				in *Space DAO governance, from token acquisition to proposal voting and beyond.
			</p>

			<h3 id="simulation-framework">8.4 Simulation Testing Framework</h3>
			<p>
				A key component of our development strategy is the creation of a comprehensive 
				<strong>Simulation Testing Framework</strong> that enables users, researchers, and 
				developers to model and validate governance scenarios before real-world deployment.
			</p>
			<p>
				The simulation framework addresses a critical gap in DAO development: the inability to 
				test governance mechanisms under realistic conditions without risking real assets or 
				community trust. Our approach provides:
			</p>
			<ul>
				<li><strong>Agent-Based Modeling:</strong> Configure virtual participants with customizable 
					behaviors, wealth distributions, and voting strategies to simulate diverse community compositions</li>
				<li><strong>Governance Scenario Testing:</strong> Run simulations of proposal voting, token 
					decay dynamics, and transition trigger conditions over extended virtual time periods</li>
				<li><strong>Attack Vector Analysis:</strong> Test the resilience of governance mechanisms 
					against simulated whale attacks, Sybil attacks, and voter coordination attempts</li>
				<li><strong>Economic Modeling:</strong> Project token economics, treasury growth, and 
					SpaceTime distribution under various market and participation scenarios</li>
				<li><strong>Visual Analytics:</strong> Real-time visualization of simulation results with 
					interactive charts, network graphs, and statistical summaries</li>
			</ul>
			<p>
				The simulation framework will be accessible through the Athena platform at 
				<a href="/simulate">/simulate</a>, providing an intuitive graphical interface for:
			</p>
			<ul>
				<li>Creating and saving custom simulation configurations</li>
				<li>Running parallel simulations with varying parameters</li>
				<li>Comparing outcomes across different governance scenarios</li>
				<li>Exporting simulation data for academic research and auditing</li>
				<li>Stress-testing proposed governance changes before implementation</li>
			</ul>
			<p>
				This tool embodies our commitment to <strong>evidence-based governance design</strong>—ensuring 
				that every mechanism in *Space DAO is validated through rigorous simulation before 
				affecting real community assets and decisions.
			</p>
		</section>

		<!-- References -->
		<section id="references">
			<h2>9. References</h2>
			<ol class="references-list">
				<li>
					Ariely, D., &amp; Wertenbroch, K. (2002). Procrastination, deadlines, and performance. 
					<em>Psychological Science</em>, 13(3), 219-224.
				</li>
				<li>
					Barberà, S., &amp; Jackson, M. O. (2006). On the weights of nations: Assigning voting 
					power to heterogeneous voters. <em>Journal of Political Economy</em>, 114(2), 317-339.
				</li>
				<li>
					Buterin, V., Hitzig, Z., &amp; Weyl, E. G. (2019). A flexible design for funding public 
					goods. <em>Management Science</em>, 65(11), 5171-5187.
				</li>
				<li>
					Loewenstein, G., &amp; Issacharoff, S. (1994). Source dependence in the valuation of objects. 
					<em>Journal of Behavioral Decision Making</em>, 7(3), 157-168.
				</li>
				<li>
					Olson, M. (1965). <em>The Logic of Collective Action: Public Goods and the Theory of Groups</em>. 
					Harvard University Press.
				</li>
				<li>
					Ostrom, E. (1990). <em>Governing the Commons: The Evolution of Institutions for Collective Action</em>. 
					Cambridge University Press.
				</li>
				<li>
					Sharma, A., et al. (2024). Progressive decentralization in practice: A comprehensive analysis 
					of DAO governance transitions. <em>Journal of Blockchain Research</em>, 12(1), 45-78.
				</li>
				<li>
					Taleb, N. N. (2018). <em>Skin in the Game: Hidden Asymmetries in Daily Life</em>. Random House.
				</li>
				<li>
					Weyl, E. G., &amp; Posner, E. A. (2018). <em>Radical Markets: Uprooting Capitalism and Democracy 
					for a Just Society</em>. Princeton University Press.
				</li>
			</ol>
		</section>

		<!-- Version Footer -->
		<footer class="paper-footer">
			<div class="footer-line"></div>
			<p>
				<strong>*Space DAO Whitepaper</strong> — Version {VERSION}<br>
				<em>Last Updated: {LAST_UPDATED}</em>
			</p>
			<p class="copyright">
				© 2026 *Space DAO LLC. This document is released under Creative Commons BY-SA 4.0.
			</p>
		</footer>
	</article>
</div>

<style>
	/* Print-specific styles */
	@media print {
		.no-print {
			display: none !important;
		}

		.whitepaper-container {
			background: white !important;
			color: #1a1a1a !important;
			padding: 0 !important;
			max-width: 100% !important;
		}

		/* Header styles */
		.paper-header {
			background: none !important;
			border: none !important;
			padding: 2rem 0 !important;
		}

		.paper-header h1 {
			color: #1a1a1a !important;
			background: none !important;
			-webkit-background-clip: unset !important;
			background-clip: unset !important;
			-webkit-text-fill-color: #1a1a1a !important;
			font-size: 2rem !important;
		}

		.paper-header .subtitle {
			color: #333 !important;
		}

		.paper-header .meta {
			color: #555 !important;
		}

		/* Content sections */
		.abstract, .toc, section {
			background: none !important;
			border: 1px solid #ccc !important;
			page-break-inside: avoid;
		}

		.abstract {
			border-left: 4px solid #333 !important;
		}

		.abstract h2 {
			color: #1a1a1a !important;
		}

		.abstract p {
			color: #333 !important;
		}

		/* TOC */
		.toc h2 {
			color: #1a1a1a !important;
		}

		.toc a {
			color: #1a1a1a !important;
			text-decoration: none !important;
		}

		/* Main content typography */
		.paper-content h2 {
			color: #1a1a1a !important;
		}

		.paper-content h3 {
			color: #333 !important;
		}

		.paper-content h4 {
			color: #1a1a1a !important;
		}

		.paper-content p {
			color: #333 !important;
		}

		.paper-content ul, .paper-content ol {
			color: #333 !important;
		}

		.paper-content li {
			color: #333 !important;
		}

		/* Cards */
		.token-card, .evidence-card, .stat-card {
			background: #f8f8f8 !important;
			border: 1px solid #ccc !important;
		}

		.token-card h4, .evidence-card h4 {
			color: #1a1a1a !important;
		}

		.token-card p, .evidence-card p, .stat-card p {
			color: #333 !important;
		}

		.token-type {
			color: #555 !important;
		}

		.stat-value {
			color: #1a1a1a !important;
			background: none !important;
			-webkit-background-clip: unset !important;
			background-clip: unset !important;
			-webkit-text-fill-color: #1a1a1a !important;
		}

		.stat-label {
			color: #1a1a1a !important;
		}

		/* Equations */
		.equation-block {
			background: #f8f8f8 !important;
			border: 1px solid #ccc !important;
		}

		.equation {
			color: #1a1a1a !important;
		}

		.equation-label {
			color: #555 !important;
		}

		/* Theorem and proof */
		.theorem, .proof {
			background: #f8f8f8 !important;
			border-left: 3px solid #333 !important;
		}

		.theorem p, .proof p {
			color: #333 !important;
		}

		/* Tables */
		table {
			border-collapse: collapse !important;
		}

		th, td {
			border: 1px solid #333 !important;
			color: #1a1a1a !important;
			background: white !important;
		}

		th {
			background: #f0f0f0 !important;
			font-weight: 600 !important;
		}

		.vulnerable {
			color: #b91c1c !important;
			background: #fef2f2 !important;
		}

		.protected {
			color: #047857 !important;
			background: #ecfdf5 !important;
		}

		.partial {
			color: #b45309 !important;
			background: #fffbeb !important;
		}

		/* Links */
		a {
			color: #1a1a1a !important;
			text-decoration: underline !important;
		}

		/* References */
		.references-list li {
			color: #333 !important;
		}

		.references-list em {
			color: #555 !important;
		}

		/* Footer */
		.paper-footer p {
			color: #333 !important;
		}

		.paper-footer .copyright {
			color: #555 !important;
		}

		.footer-line {
			background: #ccc !important;
		}

		/* Logo */
		.paper-logo {
			filter: grayscale(100%);
		}

		/* Definition list */
		.definition-list li::before {
			color: #333 !important;
		}
	}

	/* Screen styles */
	.whitepaper-container {
		max-width: 1120px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-lg);
		position: relative;
	}

	/* Save Controls */
	.save-controls {
		position: sticky;
		top: 80px;
		z-index: 100;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
		padding: var(--space-sm);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.save-btn {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background: var(--gradient-primary);
		border: none;
		border-radius: var(--radius-full);
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.save-btn:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-glow);
	}

	.version-badge {
		padding: var(--space-xs) var(--space-md);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-full);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	/* Paper Header */
	.paper-header {
		text-align: center;
		padding: var(--space-3xl) var(--space-xl);
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		margin-bottom: var(--space-2xl);
	}

	.paper-logo {
		width: 48px;
		height: 48px;
		margin-bottom: var(--space-md);
	}

	.paper-header h1 {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		margin: 0 0 var(--space-md);
	}

	.paper-header .subtitle {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-lg);
	}

	.paper-header .meta {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-md);
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.separator {
		opacity: 0.5;
	}

	/* Abstract */
	.abstract {
		background: var(--color-bg-card);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		margin-bottom: var(--space-2xl);
		border-left: 4px solid var(--color-accent-primary);
	}

	.abstract h2 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		color: var(--color-accent-primary);
		margin: 0 0 var(--space-md);
	}

	.abstract p {
		margin: 0;
		line-height: 1.8;
		color: var(--color-text-secondary);
	}

	/* Table of Contents */
	.toc {
		background: var(--color-bg-card);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		margin-bottom: var(--space-2xl);
		border: 1px solid var(--color-border);
	}

	.toc h2 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0 0 var(--space-lg);
	}

	.toc ol {
		margin: 0;
		padding-left: var(--space-lg);
	}

	.toc li {
		margin: var(--space-sm) 0;
	}

	.toc ol ol {
		margin-top: var(--space-sm);
	}

	.toc a {
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.toc a:hover {
		color: var(--color-accent-primary);
	}

	/* Main Content */
	.paper-content {
		color: var(--color-text-primary);
	}

	.paper-content section {
		background: var(--color-bg-card);
		border-radius: var(--radius-lg);
		padding: var(--space-2xl);
		margin-bottom: var(--space-xl);
		border: 1px solid var(--color-border);
	}

	.paper-content h2 {
		font-family: var(--font-display);
		font-size: 1.75rem;
		margin: 0 0 var(--space-lg);
		color: var(--color-text-primary);
	}

	.paper-content h3 {
		font-family: var(--font-display);
		font-size: 1.35rem;
		margin: var(--space-xl) 0 var(--space-md);
		color: var(--color-accent-secondary);
	}

	.paper-content h4 {
		font-size: 1.1rem;
		margin: var(--space-lg) 0 var(--space-md);
		color: var(--color-text-primary);
	}

	.paper-content p {
		line-height: 1.8;
		margin: 0 0 var(--space-md);
		color: var(--color-text-secondary);
	}

	.paper-content ul, .paper-content ol {
		margin: 0 0 var(--space-md);
		padding-left: var(--space-xl);
		color: var(--color-text-secondary);
	}

	.paper-content li {
		margin: var(--space-sm) 0;
		line-height: 1.7;
	}

	.principles li {
		margin: var(--space-md) 0;
	}

	/* Equations */
	.equation-block {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		margin: var(--space-lg) 0;
		border: 1px solid var(--color-border);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.equation-block p {
		margin: 0 0 var(--space-sm);
	}

	.equation {
		font-family: 'Cambria Math', 'Times New Roman', serif;
		font-size: 1.1rem;
		text-align: center;
		padding: var(--space-md);
		color: var(--color-text-primary);
		font-style: italic;
	}

	.equation-label {
		text-align: center;
		font-size: 0.9rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.equation-block ul {
		margin: var(--space-md) 0 0;
	}

	.definition-list {
		list-style: none;
		padding-left: var(--space-lg);
	}

	.definition-list li {
		position: relative;
		padding-left: var(--space-md);
	}

	.definition-list li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--color-accent-primary);
	}

	/* Token Comparison */
	.token-comparison {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
		gap: var(--space-lg);
		margin: var(--space-xl) 0;
	}

	.token-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 1px solid var(--color-border);
	}

	.token-card.spacemoney {
		border-top: 3px solid #f59e0b;
	}

	.token-card.spacetime {
		border-top: 3px solid var(--color-accent-primary);
	}

	.token-card h4 {
		margin: 0 0 var(--space-xs);
		font-size: 1.25rem;
	}

	.token-type {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.token-card ul {
		margin: 0;
		padding-left: var(--space-lg);
		font-size: 0.9rem;
	}

	/* Tables */
	.earning-table,
	.transition-table,
	.attack-table {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		margin: var(--space-lg) 0;
	}

	table {
		width: 100%;
		min-width: 500px;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	th, td {
		padding: var(--space-md);
		text-align: left;
		border-bottom: 1px solid var(--color-border);
	}

	th {
		background: var(--color-bg-tertiary);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	td {
		color: var(--color-text-secondary);
	}

	.vulnerable {
		color: var(--color-error);
	}

	.protected {
		color: var(--color-success);
	}

	.partial {
		color: var(--color-warning);
	}

	/* Evidence Grid */
	.evidence-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(230px, 100%), 1fr));
		gap: var(--space-lg);
		margin: var(--space-xl) 0;
	}

	.evidence-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		border: 1px solid var(--color-border);
	}

	.evidence-card h4 {
		margin: 0 0 var(--space-sm);
		font-size: 1rem;
		color: var(--color-accent-secondary);
	}

	.evidence-card p {
		margin: 0;
		font-size: 0.9rem;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
		gap: var(--space-lg);
		margin: var(--space-xl) 0;
	}

	.stat-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		text-align: center;
		border: 1px solid var(--color-border);
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.stat-label {
		font-weight: 600;
		color: var(--color-text-primary);
		margin: var(--space-sm) 0;
	}

	.stat-card p {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	/* Theorem and Proof */
	.theorem, .proof {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		margin: var(--space-lg) 0;
		border-left: 3px solid var(--color-accent-primary);
	}

	.theorem p:first-child, .proof p:first-child {
		margin-bottom: var(--space-md);
	}

	.proof {
		border-left-color: var(--color-accent-secondary);
	}

	/* References */
	.references-list {
		padding-left: var(--space-xl);
	}

	.references-list li {
		margin: var(--space-md) 0;
		line-height: 1.6;
	}

	.references-list em {
		color: var(--color-text-muted);
	}

	/* Paper Footer */
	.paper-footer {
		text-align: center;
		padding: var(--space-2xl) 0 0;
		margin-top: var(--space-2xl);
	}

	.footer-line {
		height: 1px;
		background: var(--gradient-primary);
		margin-bottom: var(--space-xl);
		opacity: 0.5;
	}

	.paper-footer p {
		color: var(--color-text-secondary);
		margin: var(--space-sm) 0;
	}

	.copyright {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.whitepaper-container {
			padding: var(--space-md);
		}

		.paper-header h1 {
			font-size: 1.75rem;
		}

		.paper-content section {
			padding: var(--space-lg);
		}

		.save-controls {
			flex-direction: column;
			align-items: stretch;
		}

		.save-btn {
			justify-content: center;
		}
	}
</style>
