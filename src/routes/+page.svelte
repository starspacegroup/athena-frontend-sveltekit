<script lang="ts">
	import { goto } from '$app/navigation';
	import { user, walletConnected, discordConnected } from '$lib/stores/auth';
	import { connectWallet } from '$lib/wallet';

	let loading = $state(false);
	let error = $state('');
	let selectedWallet = $state<'metamask' | 'coinbase'>('metamask');
	let currentStep = $state(1);

	async function handleWalletConnect() {
		error = '';
		loading = true;

		try {
			const address = await connectWallet(selectedWallet);

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
			if (!data.user.discordId) {
				// User needs to connect Discord
				error = '';
			} else {
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
			title: 'SpaceTime Tokens',
			description: 'Earn non-tradable governance tokens through active participation in the DAO'
		},
		{
			icon: '💰',
			title: 'SpaceMoney',
			description: 'Purchase and transfer governance tokens to increase your voting power'
		},
		{
			icon: '🗳️',
			title: 'Governance',
			description: 'Participate in DAO decisions and shape the future of *Space'
		},
		{
			icon: '🔗',
			title: 'Web3 Native',
			description: 'Connect your wallet and Discord for a seamless decentralized experience'
		}
	];
</script>

<div class="page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<div class="hero-badge">
				<span class="pulse-dot"></span>
				Decentralized Autonomous Organization
			</div>
			<h1>
				Welcome to
				<span class="gradient-text">*Space DAO</span>
			</h1>
			<p class="hero-description">
				Join the future of decentralized governance. Earn SpaceTime tokens through participation
				and acquire SpaceMoney to shape the direction of *Space.
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
				<div class="center-logo">✦</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features" id="features">
		<h2 class="section-title">Why *Space DAO?</h2>
		<div class="features-grid">
			{#each features as feature, i}
				<div class="feature-card" style="--delay: {i * 0.1}s">
					<div class="feature-icon">{feature.icon}</div>
					<h3>{feature.title}</h3>
					<p>{feature.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Connect Section -->
	<section class="connect-section" id="connect">
		{#if !$user}
			<div class="connect-card">
				<div class="connect-header">
					<h2>Join *Space DAO</h2>
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

				<!-- Wallet Selection -->
				{#if !$walletConnected}
					<div class="wallet-section">
						<h3>Choose Your Wallet</h3>
						<div class="wallet-options">
							<label class="wallet-option" class:selected={selectedWallet === 'metamask'}>
								<input type="radio" bind:group={selectedWallet} value="metamask" />
								<div class="wallet-icon">🦊</div>
								<div class="wallet-info">
									<span class="wallet-name">MetaMask</span>
									<span class="wallet-desc">Popular browser wallet</span>
								</div>
								{#if selectedWallet === 'metamask'}
									<span class="check-icon">✓</span>
								{/if}
							</label>
							<label class="wallet-option" class:selected={selectedWallet === 'coinbase'}>
								<input type="radio" bind:group={selectedWallet} value="coinbase" />
								<div class="wallet-icon">💙</div>
								<div class="wallet-info">
									<span class="wallet-name">Coinbase Wallet</span>
									<span class="wallet-desc">By Coinbase</span>
								</div>
								{#if selectedWallet === 'coinbase'}
									<span class="check-icon">✓</span>
								{/if}
							</label>
						</div>
						<button onclick={handleWalletConnect} disabled={loading} class="btn btn-primary btn-block">
							{#if loading}
								<span class="spinner"></span>
								Connecting...
							{:else}
								Connect {selectedWallet === 'metamask' ? 'MetaMask' : 'Coinbase Wallet'}
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
			<div class="welcome-card">
				<div class="welcome-header">
					<div class="welcome-avatar">
						{#if $user.discordUsername}
							{$user.discordUsername.charAt(0).toUpperCase()}
						{:else}
							✦
						{/if}
					</div>
					<div>
						<h2>Welcome back!</h2>
						<p class="welcome-subtitle">You're connected to *Space DAO</p>
					</div>
				</div>

				<div class="user-details">
					{#if $user.walletAddress}
						<div class="detail-row">
							<span class="detail-icon">💎</span>
							<div class="detail-content">
								<span class="detail-label">Wallet</span>
								<span class="detail-value mono">
									{$user.walletAddress.slice(0, 6)}...{$user.walletAddress.slice(-4)}
								</span>
							</div>
							<span class="status-badge success">Connected</span>
						</div>
					{/if}
					{#if $user.discordUsername}
						<div class="detail-row">
							<span class="detail-icon">💬</span>
							<div class="detail-content">
								<span class="detail-label">Discord</span>
								<span class="detail-value">{$user.discordUsername}</span>
							</div>
							<span class="status-badge success">Linked</span>
						</div>
					{/if}
				</div>

				{#if $user.walletAddress && $user.discordId}
					<a href="/dashboard" class="btn btn-primary btn-block btn-lg">
						<span class="btn-icon">📊</span>
						Go to Dashboard
					</a>
				{:else}
					<div class="warning-message">
						<span class="warning-icon">⚡</span>
						Complete your profile to access all features
					</div>
					{#if !$user.walletAddress}
						<button onclick={handleWalletConnect} class="btn btn-primary btn-block">
							Connect Wallet
						</button>
					{/if}
					{#if !$user.discordId}
						<button onclick={handleDiscordConnect} class="btn btn-discord btn-block">
							<span class="discord-logo">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
								</svg>
							</span>
							Connect Discord
						</button>
					{/if}
				{/if}

				<button onclick={handleLogout} class="btn btn-ghost btn-sm logout-btn">
					Sign Out
				</button>
			</div>
		{/if}
	</section>
</div>

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
		animation-direction: reverse;
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
		font-size: 4rem;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: pulse 3s ease-in-out infinite;
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Features Section */
	.features {
		padding: var(--space-3xl) 0;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 2rem;
		text-align: center;
		margin-bottom: var(--space-2xl);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: var(--space-md);
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

	/* Connect Section */
	.connect-section {
		padding: var(--space-3xl) 0;
		display: flex;
		justify-content: center;
	}

	.connect-card,
	.welcome-card {
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
	.wallet-section h3,
	.discord-section h3 {
		font-size: 1rem;
		margin: 0 0 var(--space-md);
		color: var(--color-text-secondary);
	}

	.wallet-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
	}

	.wallet-option {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.wallet-option:hover {
		background: var(--color-bg-tertiary);
	}

	.wallet-option.selected {
		border-color: var(--color-accent-primary);
		background: rgba(139, 92, 246, 0.1);
	}

	.wallet-option input {
		display: none;
	}

	.wallet-icon {
		font-size: 2rem;
	}

	.wallet-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.wallet-name {
		font-weight: 600;
	}

	.wallet-desc {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.check-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent-primary);
		border-radius: 50%;
		font-size: 0.75rem;
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

	/* Welcome Card */
	.welcome-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.welcome-avatar {
		width: 56px;
		height: 56px;
		background: var(--gradient-primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.welcome-header h2 {
		margin: 0;
		font-family: var(--font-display);
	}

	.welcome-subtitle {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.user-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-xl);
	}

	.detail-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
	}

	.detail-icon {
		font-size: 1.25rem;
	}

	.detail-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.detail-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.detail-value {
		font-weight: 500;
	}

	.detail-value.mono {
		font-family: 'SF Mono', Monaco, monospace;
		font-size: 0.875rem;
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

	.logout-btn {
		margin-top: var(--space-md);
		width: 100%;
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
	}

	@media (max-width: 640px) {
		.hero h1 {
			font-size: 2rem;
		}

		.connect-card,
		.welcome-card {
			padding: var(--space-lg);
		}

		.steps {
			flex-wrap: wrap;
			gap: var(--space-md);
		}

		.step-line {
			display: none;
		}
	}
</style>
