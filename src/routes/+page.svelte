<script lang="ts">
	import { goto } from '$app/navigation';
	import { user, walletConnected, discordConnected } from '$lib/stores/auth';
	import { isMobile, isInWalletBrowser, getDefaultWallet, connectWallet } from '$lib/wallet';
	import WalletModal from '$lib/components/WalletModal.svelte';

	let loading = $state(false);
	let error = $state('');
	let currentStep = $state(1);
	let showWalletModal = $state(false);

	// Check if we should auto-connect (in wallet browser on mobile)
	$effect(() => {
		if (typeof window !== 'undefined' && !$walletConnected) {
			const mobile = isMobile();
			const inWallet = isInWalletBrowser();
			
			if (mobile && inWallet) {
				// Auto-trigger connection in wallet browser
				handleAutoConnect();
			}
		}
	});

	async function handleAutoConnect() {
		const wallet = getDefaultWallet();
		if (wallet?.installed) {
			await handleWalletConnected(await connectWallet(wallet));
		}
	}

	async function handleWalletConnected(address: string) {
		error = '';
		loading = true;

		try {
			// Send wallet address to server
			const response = await fetch('/api/auth/wallet', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ walletAddress: address })
			});

			if (!response.ok) {
				throw new Error('Failed to authenticate with wallet');
			}

			const data = await response.json();
			user.set(data.user);
			walletConnected.set(true);
			currentStep = 2;

			// Check if user needs to connect Discord
			if (data.user.discordId) {
				// User is fully authenticated
				goto('/dashboard');
			}
		} catch (err: any) {
			error = err.message || 'Failed to connect wallet';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleWalletError(message: string) {
		error = message;
	}

	async function handleDiscordConnect() {
		// Redirect to Discord OAuth
		window.location.href = '/api/auth/discord';
	}

	async function handleLogout() {
		const response = await fetch('/api/auth/logout', { method: 'POST' });
		if (response.ok) {
			user.set(null);
			walletConnected.set(false);
			discordConnected.set(false);
			currentStep = 1;
		}
	}

	$effect(() => {
		if ($user?.walletAddress) {
			walletConnected.set(true);
			currentStep = $user?.discordId ? 3 : 2;
		}
		if ($user?.discordId) {
			discordConnected.set(true);
		}
	});

	const features = [
		{
			icon: '⏰',
			title: 'Governance Token',
			subtitle: 'Configurable Identity',
			description: 'Never purchasable and defined by the organization at formation. It can be called *Time, CivicTime, or any governance currency the community adopts later. Earned through contribution, subject to decay, and designed so voting power belongs to active members only.'
		},
		{
			icon: '💎',
			title: 'Economic Token',
			subtitle: 'Configurable Identity',
			description: 'The organization\'s treasury-linked currency. It can be called *Money, GuildCoin, or any economic unit chosen at formation or renamed later. Purchasable, transferable, and optionally stakeable for conditional treasury-spend voting.'
		},
		{
			icon: '⚖️',
			title: 'Skin-in-the-Game Voting',
			subtitle: 'Accountable Governance',
			description: 'Voting costs 5 ST. Winners get their ST back; losers\' ST redistributes to the winning side. Proposers also stake ST—failed proposals burn 10% to treasury and redistribute the rest to AGAINST voters.'
		},
		{
			icon: '🏛️',
			title: 'Wyoming DAO LLC',
			subtitle: 'Legal Foundation',
			description: 'Real-world legal entity. Smart contracts are supreme—the Operating Agreement enforces on-chain governance.'
		}
	];

	const governancePhases = [
		{
			phase: 'Now',
			status: 'active',
			title: 'Guided Launch',
			items: ['Initial Controller holds veto', 'Treasury & upgrade keys secured', 'Community building phase']
		},
		{
			phase: 'Transition',
			status: 'pending',
			title: 'Earning Trust',
			items: ['10K+ distinct ST earners', 'Founder treasury holdings < 20%', '99.9% proposal acceptance rate tracked']
		},
		{
			phase: 'Future',
			status: 'locked',
			title: 'Full Autonomy',
			items: ['Veto auto-burns permanently', 'Upgrade keys → multi-sig DAO', 'Pure ST-weighted democracy']
		}
	];
</script>

<div class="page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<div class="hero-badge">
				<span class="pulse-dot"></span>
				Governance Infrastructure
			</div>
			<h1>
				<span class="gradient-text">Governance Without Limits</span>
			</h1>
			<p class="hero-tagline">
				Longevity and Prosperity Focused Governance Software
			</p>
			<p class="hero-description">
				The operating system for organizations built to outlast their founders. Two configurable currencies — one earned through contribution, one anchored to the treasury — separate voting power from economic value, so authority and incentives can evolve independently as your community matures. Wrap it in a Wyoming DAO LLC for legal standing, or run purely on-chain. Either way, the rules are transparent, the ledger is permanent, and the institution you build today is engineered to compound for generations.
			</p>
			
			{#if !$user}
				<div class="hero-cta">
					<a href="#connect" class="btn btn-primary btn-lg">
						<span class="btn-icon">🚀</span>
						Get Started
					</a>
					<a href="#features" class="btn btn-glass btn-lg">
						Learn More
					</a>
				</div>
			{:else if $user.walletAddress && $user.discordId}
				<div class="hero-cta">
					<a href="/dashboard" class="btn btn-primary btn-lg">
						<span class="btn-icon">📊</span>
						Go to Dashboard
					</a>
				</div>
			{/if}
		</div>
		
		<div class="hero-visual">
			<div class="orbit-container">
				<div class="orbit orbit-1">
					<div class="orbit-dot"></div>
				</div>
				<div class="orbit orbit-2">
					<div class="orbit-dot"></div>
				</div>
				<div class="orbit orbit-3">
					<div class="orbit-dot"></div>
				</div>
				<img src="/space-logo.png" alt="*Space" class="center-logo" />
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features" id="features">
		<div class="section-header">
			<span class="section-badge">Two-Token Model</span>
			<h2 class="section-title">Why Athena?</h2>
			<p class="section-subtitle">Separate economic value from governance power. Work earns votes. Money earns stake.</p>
		</div>
		<div class="features-grid">
			{#each features as feature, i}
				<div class="feature-card" style="--delay: {i * 0.1}s">
					<div class="feature-header">
						<div class="feature-icon">{feature.icon}</div>
						<span class="feature-subtitle">{feature.subtitle}</span>
					</div>
					<h3>{feature.title}</h3>
					<p>{feature.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Governance Roadmap Section -->
	<section class="governance-section" id="governance">
		<div class="section-header">
			<span class="section-badge">Governance</span>
			<h2 class="section-title">The Path to Autonomy</h2>
			<p class="section-subtitle">Built-in handoff triggers ensure power transfers to the community—trustlessly.</p>
		</div>
		<div class="governance-timeline">
			{#each governancePhases as phase, i}
				<div class="timeline-card {phase.status}" style="--delay: {i * 0.15}s">
					<div class="timeline-marker">
						<span class="timeline-phase">{phase.phase}</span>
					</div>
					<div class="timeline-content">
						<h3>{phase.title}</h3>
						<ul>
							{#each phase.items as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
		<div class="governance-note">
			<span class="note-icon">🔐</span>
			<p>These transitions are <strong>hardcoded in smart contracts</strong>—not promises, but guarantees.</p>
		</div>

		<!-- Vision & Legal Foundation -->
		<div class="governance-vision">
			<div class="vision-header">
				<span class="vision-badge">🏛️ Wyoming DAO LLC</span>
				<h3>A Blueprint for Future Governance</h3>
				<p>*Space isn't just a DAO—it's a prototype for self-governing organizations that could reshape how societies organize.</p>
			</div>

			<div class="vision-grid">
				<div class="vision-card">
					<div class="vision-card-icon">⚖️</div>
					<h4>Legal Recognition</h4>
					<p>Wyoming was the first U.S. state to legally recognize DAOs. Our LLC structure means token holders are <strong>legal members</strong>, smart contracts are the <strong>operating agreement</strong>, and on-chain decisions are <strong>legally binding</strong>.</p>
				</div>

				<div class="vision-card">
					<div class="vision-card-icon">🧠</div>
					<h4>Meritocratic Voting</h4>
					<p>Voting power isn't bought—it's <strong>earned</strong>. The governance currency rewards those who contribute value and make good decisions. Your governance weight correlates with your <strong>demonstrated judgment</strong>, not your wealth.</p>
				</div>

				<div class="vision-card">
					<div class="vision-card-icon">🌐</div>
					<h4>Federated Autonomy</h4>
					<p>Sub-DAOs can operate with full autonomy over their domains—their own rules, treasuries, and decisions—so long as they don't violate the root DAO's core principle: <strong>reduced harm and increased freedom</strong>, balanced through research and consensus.</p>
				</div>

				<div class="vision-card">
					<div class="vision-card-icon">🔮</div>
					<h4>The Roadmap</h4>
					<p>Traditional governments lack mechanisms for automatic power dissolution, transparent decision-making, and federated autonomy. *Space proves these concepts work in code—a template for <strong>cities, cooperatives, and future digital nations</strong>.</p>
				</div>
			</div>

			<div class="vision-principle">
				<div class="principle-content">
					<span class="principle-icon">🎯</span>
					<div>
						<h4>The Core Principle</h4>
						<p>All governance decisions must balance <strong>reduced harm</strong> with <strong>increased freedom</strong>—researched and agreed upon by voters who have earned the right through proven good judgment. This is the immutable foundation that all sub-organizations must respect.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Whitepaper Section -->
	<section class="whitepaper-section" id="whitepaper">
		<div class="section-header">
			<span class="section-badge">Research</span>
			<h2 class="section-title">The Science Behind *Space</h2>
			<p class="section-subtitle">Our governance model is grounded in game theory, mechanism design, and decades of research on collective action.</p>
		</div>

		<div class="whitepaper-content">
			<div class="whitepaper-hero">
				<div class="whitepaper-document">
					<div class="document-header">
						<img src="/space-logo.png" alt="*Space" class="document-logo" />
						<div class="document-title">
							<h3>Athena Whitepaper</h3>
							<span class="document-version">Version 0.1 • February 2026</span>
						</div>
					</div>
					<div class="document-preview">
						<p class="preview-abstract">
							A novel governance framework that achieves Nash equilibrium at socially optimal outcomes through strict separation of economic and governance tokens, labor-based voting power, and hardcoded handoff triggers for credible decentralization.
						</p>
					</div>
					<a href="/whitepaper" class="btn btn-primary btn-lg document-cta">
						<span class="btn-icon">📄</span>
						Read Full Whitepaper
					</a>
				</div>
			</div>

			<div class="whitepaper-achievements">
				<h3 class="achievements-title">What the Whitepaper Proves</h3>
				
				<div class="achievements-grid">
					<div class="achievement-card" style="--delay: 0s">
						<div class="achievement-icon">🎯</div>
						<h4>Nash Equilibrium</h4>
						<p>Mathematical proof that rational agents converge to productive behavior—contributing work and voting honestly—under our mechanism design.</p>
					</div>

					<div class="achievement-card" style="--delay: 0.1s">
						<div class="achievement-icon">🛡️</div>
						<h4>Plutocracy Prevention</h4>
						<p>Demonstrates how separating the economic currency from the governance currency structurally prevents wealth from buying political power.</p>
					</div>

					<div class="achievement-card" style="--delay: 0.2s">
						<div class="achievement-icon">📊</div>
						<h4>Pareto Efficiency</h4>
						<p>Proves the equilibrium achieves near-optimal social welfare, with efficiency approaching 100% as community size grows.</p>
					</div>

					<div class="achievement-card" style="--delay: 0.3s">
						<div class="achievement-icon">🔐</div>
						<h4>Sybil Resistance</h4>
						<p>Shows how labor-based token minting provides natural protection against identity attacks—splitting into multiple identities offers no advantage.</p>
					</div>

					<div class="achievement-card" style="--delay: 0.4s">
						<div class="achievement-icon">⏱️</div>
						<h4>Decay Dynamics</h4>
						<p>Models the governance currency\'s decay function so voting power reflects current commitment, not historical accumulation.</p>
					</div>

					<div class="achievement-card" style="--delay: 0.5s">
						<div class="achievement-icon">🔓</div>
						<h4>Credible Handoff</h4>
						<p>Details the hardcoded on-chain triggers that guarantee founder control dissolution—mathematics, not promises.</p>
					</div>
				</div>
			</div>

			<div class="whitepaper-evidence">
				<div class="evidence-header">
					<span class="evidence-icon">📚</span>
					<h3>Backed by Evidence</h3>
				</div>
				<div class="evidence-content">
					<div class="evidence-item">
						<span class="evidence-label">Historical Precedent</span>
						<p>Validated by 1,100 years of the Venetian Republic's separated powers, Mondragón's 80,000-employee cooperative, and Swiss cantonal governance.</p>
					</div>
					<div class="evidence-item">
						<span class="evidence-label">DAO Failure Analysis</span>
						<p>Addresses the documented failures of 147 major DAOs: 78% suffer concentrated voting, 3.2% average participation, 0% successful progressive decentralization.</p>
					</div>
					<div class="evidence-item">
						<span class="evidence-label">Behavioral Economics</span>
						<p>Incorporates research on earned endowment effects, urgency from decay, and skin-in-the-game principles from leading economists.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Investments Section -->
	<section class="investments-section" id="investments">
		<div class="section-header">
			<span class="section-badge">Investments</span>
			<h2 class="section-title">Building & Acquiring the Future</h2>
			<p class="section-subtitle">*Space operates as both an incubator for innovative projects and an acquirer of creative real estate.</p>
		</div>
		
		<div class="investments-grid">
			<div class="investment-card incubator" style="--delay: 0s">
				<div class="investment-header">
					<div class="investment-icon">🚀</div>
					<span class="investment-label">Incubator</span>
				</div>
				<h3>Internal Projects</h3>
				<p class="investment-description">
					We develop and launch innovative products from within *Space. Our first incubated project is <strong>Ammoura</strong>—a next-generation website builder featuring eCommerce integration, AI-powered design tools, and much more.
				</p>
				<div class="investment-highlight">
					<span class="highlight-icon">✨</span>
					<span>Ammoura: Website Builder + eCommerce + AI</span>
				</div>
			</div>

			<div class="investment-card real-estate" style="--delay: 0.15s">
				<div class="investment-header">
					<div class="investment-icon">🏢</div>
					<span class="investment-label">Real Estate</span>
				</div>
				<h3>Creative Live/Work Spaces</h3>
				<p class="investment-description">
					We're acquiring mixed-use properties designed for creators to live and work in environments that support their craft. These spaces will accommodate as many creative disciplines as possible.
				</p>
				<div class="creative-disciplines">
					<span class="discipline">🔧 Auto Mechanics</span>
					<span class="discipline">🪵 Woodworking</span>
					<span class="discipline">🔥 Glass Blowing</span>
					<span class="discipline">💻 Software Engineering</span>
					<span class="discipline">🎨 Graphic Design</span>
					<span class="discipline">🗿 Sculpture</span>
					<span class="discipline">🖼️ Painting</span>
					<span class="discipline">🎭 And More...</span>
				</div>
			</div>
		</div>

		<div class="investments-vision">
			<span class="vision-icon">🌌</span>
			<p>Our vision: <strong>Foster creativity through ownership</strong>—both in the digital products we build and the physical spaces where creators thrive.</p>
		</div>
	</section>

	<!-- Connect Section -->
	<section class="connect-section" id="connect">
		{#if !$user}
			<div class="connect-card">
				<div class="connect-header">
					<h2>Join Athena</h2>
					<p>Connect your wallet and Discord to get started</p>
				</div>

				<!-- Progress Steps -->
				<div class="steps">
					<div class="step" class:active={currentStep >= 1} class:completed={$walletConnected}>
						<div class="step-number">{$walletConnected ? '✓' : '1'}</div>
						<span>Connect Wallet</span>
					</div>
					<div class="step-line" class:active={$walletConnected}></div>
					<div class="step" class:active={currentStep >= 2} class:completed={$discordConnected}>
						<div class="step-number">{$discordConnected ? '✓' : '2'}</div>
						<span>Link Discord</span>
					</div>
					<div class="step-line" class:active={$discordConnected}></div>
					<div class="step" class:active={$walletConnected && $discordConnected}>
						<div class="step-number">3</div>
						<span>Start Earning</span>
					</div>
				</div>

				<!-- Wallet Connection -->
				{#if !$walletConnected}
					<div class="wallet-section">
						<h3>Connect Your Wallet</h3>
						<p class="wallet-hint">Connect any Ethereum wallet to get started</p>
						<button onclick={() => showWalletModal = true} disabled={loading} class="btn btn-primary btn-block btn-connect">
							{#if loading}
								<span class="spinner"></span>
								Connecting...
							{:else}
								<span class="wallet-icon-btn">🔗</span>
								Connect Wallet
							{/if}
						</button>
					</div>
				{/if}

				<!-- Discord Connection -->
				{#if $walletConnected && !$discordConnected}
					<div class="discord-section">
						<div class="success-message">
							<span class="success-icon">✓</span>
							Wallet connected successfully!
						</div>
						<h3>Link Your Discord</h3>
						<p>Connect your Discord account to complete registration and unlock all features.</p>
						<button onclick={handleDiscordConnect} class="btn btn-discord btn-block">
							<span class="discord-logo">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
								</svg>
							</span>
							Connect Discord
						</button>
					</div>
				{/if}

				{#if error}
					<div class="error-message">
						<span class="error-icon">⚠️</span>
						{error}
					</div>
				{/if}
			</div>
		{:else}
			<!-- User is signed in - simplified view -->
			<div class="signed-in-card">
				<div class="signed-in-content">
					<div class="signed-in-icon">✓</div>
					<div>
						<h3>You're connected!</h3>
						<p>Welcome back, {$user.discordUsername || 'member'}</p>
					</div>
				</div>
				<div class="signed-in-actions">
					<a href="/dashboard" class="btn btn-primary">
						<span class="btn-icon">📊</span>
						Dashboard
					</a>
					<a href="/profile" class="btn btn-glass">
						<span class="btn-icon">👤</span>
						Profile
					</a>
				</div>
			</div>
		{/if}
	</section>
</div>

<!-- Wallet Connection Modal -->
<WalletModal 
	open={showWalletModal} 
	onClose={() => showWalletModal = false}
	onConnect={handleWalletConnected}
	onError={handleWalletError}
/>

<style>
	.page {
		min-height: 100%;
	}

	/* Hero Section */
	.hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3xl);
		align-items: center;
		min-height: 60vh;
		padding: var(--space-2xl) 0;
	}

	.hero-content {
		max-width: 600px;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-lg);
	}

	.pulse-dot {
		width: 8px;
		height: 8px;
		background: var(--color-success);
		border-radius: 50%;
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
		50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
	}

	.hero h1 {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 700;
		line-height: 1.1;
		margin: 0 0 var(--space-lg);
	}

	.gradient-text {
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-tagline {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 2.2vw, 1.75rem);
		font-weight: 600;
		line-height: 1.3;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-lg);
		letter-spacing: -0.01em;
	}

	.hero-description {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		line-height: 1.7;
		margin-bottom: var(--space-xl);
	}

	.hero-cta {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	/* Hero Visual */
	.hero-visual {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.orbit-container {
		position: relative;
		width: 400px;
		height: 400px;
	}

	.orbit {
		position: absolute;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		animation: rotate 20s linear infinite;
	}

	.orbit-1 {
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.orbit-2 {
		width: 70%;
		height: 70%;
		top: 15%;
		left: 15%;
		animation-duration: 15s;
	}

	.orbit-3 {
		width: 40%;
		height: 40%;
		top: 30%;
		left: 30%;
		animation-duration: 10s;
	}

	.orbit-dot {
		position: absolute;
		width: 12px;
		height: 12px;
		background: var(--gradient-primary);
		border-radius: 50%;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
	}

	.center-logo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80px;
		height: 80px;
		object-fit: contain;
		animation: pulse 3s ease-in-out infinite;
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Features Section */
	.features,
	.governance-section {
		padding: var(--space-3xl) 0;
	}

	.section-header {
		text-align: center;
		margin-bottom: var(--space-2xl);
	}

	.section-badge {
		display: inline-block;
		padding: var(--space-xs) var(--space-md);
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-primary);
		margin-bottom: var(--space-md);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 2rem;
		text-align: center;
		margin: 0 0 var(--space-sm);
	}

	.section-subtitle {
		color: var(--color-text-secondary);
		font-size: 1.0625rem;
		max-width: 500px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
		gap: var(--space-lg);
	}

	.feature-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		transition: all var(--transition-base);
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
	}

	.feature-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.feature-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.feature-icon {
		font-size: 2rem;
		line-height: 1;
	}

	.feature-subtitle {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		background: var(--color-bg-tertiary);
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.feature-card h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0 0 var(--space-sm);
		color: var(--color-text-primary);
	}

	.feature-card p {
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
		margin: 0;
	}

	/* Governance Section */
	.governance-timeline {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}

	.timeline-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		position: relative;
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
		transition: all var(--transition-base);
	}

	.timeline-card:hover {
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
	}

	.timeline-card.active {
		border-color: var(--color-success);
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent);
	}

	.timeline-card.pending {
		border-color: var(--color-warning);
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent);
	}

	.timeline-card.locked {
		border-color: var(--color-primary);
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent);
	}

	.timeline-marker {
		margin-bottom: var(--space-md);
	}

	.timeline-phase {
		display: inline-block;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.timeline-card.active .timeline-phase {
		background: rgba(16, 185, 129, 0.2);
		color: var(--color-success);
	}

	.timeline-card.pending .timeline-phase {
		background: rgba(245, 158, 11, 0.2);
		color: var(--color-warning);
	}

	.timeline-card.locked .timeline-phase {
		background: rgba(139, 92, 246, 0.2);
		color: var(--color-primary);
	}

	.timeline-content h3 {
		font-family: var(--font-display);
		font-size: 1.125rem;
		margin: 0 0 var(--space-sm);
	}

	.timeline-content ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.timeline-content li {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		padding: var(--space-xs) 0;
		padding-left: var(--space-md);
		position: relative;
	}

	.timeline-content li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}

	.governance-note {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.governance-note .note-icon {
		font-size: 1.25rem;
	}

	.governance-note p {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}

	.governance-note strong {
		color: var(--color-text-primary);
	}

	/* Governance Vision */
	.governance-vision {
		margin-top: var(--space-2xl);
		padding-top: var(--space-2xl);
		border-top: 1px solid var(--color-border);
	}

	.vision-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.vision-badge {
		display: inline-block;
		padding: var(--space-xs) var(--space-md);
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: var(--radius-full);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-md);
	}

	.vision-header h3 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 var(--space-sm) 0;
		color: var(--color-text-primary);
	}

	.vision-header p {
		font-size: 1.0625rem;
		color: var(--color-text-secondary);
		max-width: 600px;
		margin: 0 auto;
	}

	.vision-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}

	.vision-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		transition: all var(--transition-base);
	}

	.vision-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
	}

	.vision-card-icon {
		font-size: 1.75rem;
		margin-bottom: var(--space-sm);
	}

	.vision-card h4 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 var(--space-sm) 0;
		color: var(--color-text-primary);
	}

	.vision-card p {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.vision-card strong {
		color: var(--color-text-primary);
	}

	.vision-principle {
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
		border: 1px solid rgba(139, 92, 246, 0.25);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.principle-content {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
	}

	.principle-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.principle-content h4 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 var(--space-xs) 0;
		color: var(--color-text-primary);
	}

	.principle-content p {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.principle-content strong {
		color: var(--color-primary);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Investments Section */
	.investments-section {
		padding: var(--space-3xl) 0;
	}

	.investments-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
		gap: var(--space-xl);
		margin-bottom: var(--space-xl);
	}

	.investment-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		transition: all var(--transition-base);
		animation: fadeInUp 0.6s ease-out backwards;
		animation-delay: var(--delay);
	}

	.investment-card:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.investment-card.incubator {
		border-color: rgba(139, 92, 246, 0.3);
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent);
	}

	.investment-card.incubator:hover {
		border-color: var(--color-primary);
	}

	.investment-card.real-estate {
		border-color: rgba(59, 130, 246, 0.3);
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);
	}

	.investment-card.real-estate:hover {
		border-color: var(--color-secondary);
	}

	.investment-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.investment-icon {
		font-size: 2rem;
		line-height: 1;
	}

	.investment-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		background: var(--color-bg-tertiary);
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.investment-card h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0 0 var(--space-md);
		color: var(--color-text-primary);
	}

	.investment-description {
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
		margin: 0 0 var(--space-md);
	}

	.investment-description strong {
		color: var(--color-primary);
	}

	.investment-highlight {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.highlight-icon {
		font-size: 1rem;
	}

	.creative-disciplines {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.discipline {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		transition: all var(--transition-base);
	}

	.discipline:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
		color: var(--color-text-primary);
	}

	.investments-vision {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.vision-icon {
		font-size: 1.25rem;
	}

	.investments-vision p {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
	}

	.investments-vision strong {
		color: var(--color-text-primary);
	}

	/* Whitepaper Section */
	.whitepaper-section {
		padding: var(--space-3xl) 0;
	}

	.whitepaper-content {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
		align-items: start;
	}

	@media (min-width: 768px) {
		.whitepaper-content {
			grid-template-columns: 1fr 1fr;
		}
	}

	.whitepaper-hero {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.whitepaper-document {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		backdrop-filter: blur(20px);
		transition: all 0.3s ease;
	}

	.whitepaper-document:hover {
		border-color: var(--color-accent-primary);
		box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
	}

	.document-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.document-logo {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.document-title h3 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-text-primary);
	}

	.document-version {
		display: inline-block;
		padding: var(--space-xs) var(--space-sm);
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		margin-top: var(--space-xs);
	}

	.document-preview {
		margin-bottom: var(--space-lg);
	}

	.preview-abstract {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		line-height: 1.7;
		margin: 0;
	}

	.document-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-md) var(--space-lg);
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		color: white;
		text-decoration: none;
		border-radius: var(--radius-lg);
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.document-cta:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
	}

	.whitepaper-achievements {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.achievements-title {
		font-size: 1.5rem;
		margin: 0;
		color: var(--color-text-primary);
	}

	.achievements-grid {
		display: grid;
		gap: var(--space-md);
	}

	.achievement-card {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: all 0.3s ease;
	}

	.achievement-card:hover {
		border-color: var(--color-accent-primary);
		transform: translateX(4px);
	}

	.achievement-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.achievement-card h4 {
		margin: 0 0 var(--space-xs) 0;
		font-size: 1rem;
		color: var(--color-text-primary);
	}

	.achievement-card p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.whitepaper-evidence {
		grid-column: 1 / -1;
		padding: var(--space-xl);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		margin-top: var(--space-lg);
	}

	.evidence-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
	}

	.evidence-header h4 {
		margin: 0;
		font-size: 1.125rem;
		color: var(--color-text-primary);
	}

	.evidence-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
		gap: var(--space-lg);
	}

	.evidence-item {
		text-align: center;
		padding: var(--space-md);
	}

	.evidence-label {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-xs);
	}

	.evidence-item p:last-child {
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.whitepaper-evidence {
			grid-column: 1;
		}
	}

	/* Connect Section */
	.connect-section {
		padding: var(--space-3xl) 0;
		display: flex;
		justify-content: center;
	}

	.connect-card {
		width: 100%;
		max-width: 500px;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-2xl);
		backdrop-filter: blur(20px);
	}

	.connect-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.connect-header h2 {
		font-family: var(--font-display);
		font-size: 1.75rem;
		margin: 0 0 var(--space-sm);
	}

	.connect-header p {
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Steps */
	.steps {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-2xl);
		padding: var(--space-lg);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		opacity: 0.5;
		transition: opacity var(--transition-base);
	}

	.step.active {
		opacity: 1;
	}

	.step-number {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-tertiary);
		border-radius: 50%;
		font-weight: 600;
		font-size: 0.875rem;
		transition: all var(--transition-base);
	}

	.step.active .step-number {
		background: var(--gradient-primary);
	}

	.step.completed .step-number {
		background: var(--color-success);
	}

	.step span:not(.step-number) {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.step-line {
		width: 40px;
		height: 2px;
		background: var(--color-bg-tertiary);
		transition: background var(--transition-base);
	}

	.step-line.active {
		background: var(--gradient-primary);
	}

	/* Wallet Section */
	.wallet-section {
		text-align: center;
	}

	.wallet-section h3,
	.discord-section h3 {
		font-size: 1.125rem;
		margin: 0 0 var(--space-sm);
		color: var(--color-text-primary);
	}

	.wallet-hint {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin: 0 0 var(--space-lg);
	}

	.btn-connect {
		font-size: 1rem;
		padding: 1rem 1.5rem;
	}

	.wallet-icon-btn {
		font-size: 1.25rem;
	}

	/* Discord Section */
	.discord-section {
		text-align: center;
	}

	.discord-section p {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-lg);
		font-size: 0.9375rem;
	}

	.success-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: var(--radius-md);
		color: var(--color-success);
		margin-bottom: var(--space-lg);
	}

	.success-icon {
		font-size: 1.25rem;
	}

	.status-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-full);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.success {
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-success);
	}

	/* Signed In Card (simplified) */
	.signed-in-card {
		width: 100%;
		max-width: 500px;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		backdrop-filter: blur(20px);
	}

	.signed-in-content {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.signed-in-icon {
		width: 48px;
		height: 48px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		color: var(--color-success);
	}

	.signed-in-content h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.25rem;
	}

	.signed-in-content p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
	}

	.signed-in-actions {
		display: flex;
		gap: var(--space-sm);
	}

	.signed-in-actions .btn {
		flex: 1;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		text-decoration: none;
		position: relative;
		overflow: hidden;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--gradient-primary);
		color: white;
		box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
	}

	.btn-glass {
		background: var(--gradient-glass);
		backdrop-filter: blur(10px);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.btn-glass:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: var(--color-border-hover);
	}

	.btn-discord {
		background: #5865f2;
		color: white;
	}

	.btn-discord:hover {
		background: #4752c4;
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
	}

	.discord-logo {
		display: flex;
		align-items: center;
	}

	.btn-ghost {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.btn-ghost:hover {
		color: var(--color-text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.btn-lg {
		padding: 1rem 2rem;
		font-size: 1rem;
	}

	.btn-sm {
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
	}

	.btn-block {
		width: 100%;
	}

	.btn-icon {
		font-size: 1.125rem;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Messages */
	.error-message {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-md);
		color: var(--color-error);
		margin-top: var(--space-md);
	}

	.warning-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: var(--radius-md);
		color: var(--color-warning);
		margin-bottom: var(--space-md);
	}

	/* Responsive */
	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.hero-cta {
			justify-content: center;
		}

		.hero-visual {
			order: -1;
		}

		.orbit-container {
			width: 280px;
			height: 280px;
		}

		.governance-timeline {
			grid-template-columns: 1fr;
		}

		.investments-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.hero h1 {
			font-size: 2rem;
		}

		.connect-card,
		.signed-in-card {
			padding: var(--space-lg);
		}

		.signed-in-actions {
			flex-direction: column;
		}

		.steps {
			flex-wrap: wrap;
			gap: var(--space-md);
		}

		.step-line {
			display: none;
		}

		.governance-note {
			flex-direction: column;
			text-align: center;
		}

		.vision-grid {
			grid-template-columns: 1fr;
		}

		.vision-header h3 {
			font-size: 1.5rem;
		}

		.principle-content {
			flex-direction: column;
			text-align: center;
		}

		.investments-vision {
			flex-direction: column;
			text-align: center;
		}

		.creative-disciplines {
			justify-content: center;
		}
	}

</style>
