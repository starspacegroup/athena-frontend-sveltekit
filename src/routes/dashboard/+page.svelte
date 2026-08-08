<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth';
	import { tokenBalances } from '$lib/stores/tokens';
	import type { TokenBalances } from '$lib/stores/tokens';

	let loading = $state(true);
	let greeting = $state('');

	onMount(async () => {
		// Check if user is authenticated
		if (!$user || !$user.walletAddress || !$user.discordId) {
			goto('/');
			return;
		}

		// Set greeting based on time
		const hour = new Date().getHours();
		if (hour < 12) greeting = 'Good morning';
		else if (hour < 18) greeting = 'Good afternoon';
		else greeting = 'Good evening';

		// Load token balances
		try {
			const response = await fetch('/api/tokens/balances');
			if (response.ok) {
				const data = (await response.json()) as TokenBalances;
				tokenBalances.set(data);
			}
		} catch (error) {
			console.error('Failed to load balances:', error);
		} finally {
			loading = false;
		}
	});

	const quickActions = [
		{
			icon: '💰',
			title: 'Purchase Tokens',
			description: 'Buy the organization\'s economic currency via bonding curve',
			href: '/tokens/purchase',
			color: 'purple'
		},
		{
			icon: '📤',
			title: 'Transfer Tokens',
			description: 'Send the organization\'s economic currency to another address',
			href: '/tokens/transfer',
			color: 'cyan'
		},
		{
			icon: '🗳️',
			title: 'Governance',
			description: 'Vote on active proposals using earned governance currency',
			href: '#',
			color: 'pink',
			soon: true
		},
		{
			icon: '📊',
			title: 'Analytics',
			description: 'View your activity history',
			href: '#',
			color: 'green',
			soon: true
		}
	];
</script>

<div class="dashboard">
	{#if loading}
		<div class="loading-state">
			<div class="loader"></div>
			<p>Loading your dashboard...</p>
		</div>
	{:else}
		<!-- Header -->
		<div class="dashboard-header">
			<div class="greeting">
				<h1>{greeting}, <span class="gradient-text">{$user?.discordUsername || 'Member'}</span></h1>
				<p>Welcome to your Athena dashboard</p>
			</div>
			<div class="header-stats">
				<div class="stat-pill">
					<span class="stat-dot active"></span>
					Connected
				</div>
			</div>
		</div>

		<!-- Account Card -->
		<section class="account-section">
			<div class="section-header">
				<h2>
					<span class="section-icon">👤</span>
					Your Account
				</h2>
			</div>
			<div class="account-card">
				<div class="account-avatar">
					{#if $user?.discordAvatar && $user?.discordId}
						<img 
							src="https://cdn.discordapp.com/avatars/{$user.discordId}/{$user.discordAvatar}.png?size=128" 
							alt="{$user.discordUsername}'s avatar"
						/>
					{:else if $user?.discordUsername}
						{$user.discordUsername.charAt(0).toUpperCase()}
					{:else}
						✦
					{/if}
				</div>
				<div class="account-details">
					{#if $user?.walletAddress}
						<div class="account-row">
							<div class="account-label">
								<span class="label-icon">💎</span>
								Wallet Address
							</div>
							<div class="account-value">
								<code>{$user.walletAddress.slice(0, 10)}...{$user.walletAddress.slice(-8)}</code>
								<button class="copy-btn" onclick={() => navigator.clipboard.writeText($user?.walletAddress || '')}>
									📋
								</button>
							</div>
						</div>
					{/if}
					{#if $user?.discordUsername}
						<div class="account-row">
							<div class="account-label">
								<span class="label-icon">💬</span>
								Discord
							</div>
							<div class="account-value">
								{$user.discordUsername}
								<span class="verified-badge">✓ Verified</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Token Balances -->
		<section class="balances-section">
			<div class="section-header">
				<h2>
					<span class="section-icon">💰</span>
					Currency Balances
				</h2>
				<a href="/tokens/purchase" class="section-action">
					Get Tokens →
				</a>
			</div>
			<div class="balance-cards">
				<div class="balance-card spacetime">
					<div class="balance-header">
						<div class="balance-icon">⏰</div>
						<div class="balance-info">
							<h3>Governance Currency</h3>
							<span class="token-type">Configurable Name</span>
						</div>
					</div>
				<div class="balance-amount">
					<span class="amount">{Number($tokenBalances.spaceTime).toLocaleString()}</span>
					<span class="symbol">ex. *Time</span>
				</div>
					<div class="balance-footer">
						<p>Earned, non-transferable governance currency named by the organization and changeable over time</p>
					</div>
					<div class="balance-glow"></div>
				</div>

				<div class="balance-card spacemoney">
					<div class="balance-header">
						<div class="balance-icon">💵</div>
						<div class="balance-info">
							<h3>Economic Currency</h3>
							<span class="token-type">Configurable Name</span>
						</div>
					</div>
				<div class="balance-amount">
					<span class="amount">{Number($tokenBalances.spaceMoney).toLocaleString()}</span>
					<span class="symbol">ex. *Money</span>
				</div>
					<div class="balance-footer">
						<p>Purchasable, transferable treasury-linked currency using whatever name the organization adopts</p>
					</div>
					<div class="balance-glow"></div>
				</div>
			</div>

			<!-- Voting Power -->
			<div class="voting-power-card">
				<div class="voting-header">
					<span class="voting-icon">🗳️</span>
					<div>
						<h3>Total Voting Power</h3>
						<p>Combined governance weight</p>
					</div>
				</div>
			<div class="voting-amount">
				{(Number($tokenBalances.spaceTime) + Number($tokenBalances.spaceMoney)).toLocaleString()}
				<span class="voting-label">votes</span>
			</div>
			<div class="voting-bar">
				<div class="voting-segment spacetime" style="width: {Number($tokenBalances.spaceTime) / (Number($tokenBalances.spaceTime) + Number($tokenBalances.spaceMoney) || 1) * 100}%">
					<span class="segment-tooltip">Governance currency: {$tokenBalances.spaceTime}</span>
				</div>
				<div class="voting-segment spacemoney" style="width: {Number($tokenBalances.spaceMoney) / (Number($tokenBalances.spaceTime) + Number($tokenBalances.spaceMoney) || 1) * 100}%">
					<span class="segment-tooltip">Economic currency: {$tokenBalances.spaceMoney}</span>
				</div>
			</div>
			</div>
		</section>

		<!-- Quick Actions -->
		<section class="actions-section">
			<div class="section-header">
				<h2>
					<span class="section-icon">⚡</span>
					Quick Actions
				</h2>
			</div>
			<div class="actions-grid">
				{#each quickActions as action}
					<a href={action.href} class="action-card {action.color}" class:disabled={action.soon}>
						<div class="action-icon">{action.icon}</div>
						<div class="action-content">
							<h3>
								{action.title}
								{#if action.soon}
									<span class="soon-badge">Soon</span>
								{/if}
							</h3>
							<p>{action.description}</p>
						</div>
						<span class="action-arrow">→</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: var(--space-lg);
	}

	.loader {
		width: 48px;
		height: 48px;
		border: 3px solid var(--color-bg-tertiary);
		border-top-color: var(--color-accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-state p {
		color: var(--color-text-muted);
	}

	/* Dashboard Header */
	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-2xl);
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.greeting h1 {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		margin: 0 0 var(--space-xs);
	}

	.gradient-text {
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.greeting p {
		color: var(--color-text-muted);
		margin: 0;
	}

	.header-stats {
		display: flex;
		gap: var(--space-sm);
	}

	.stat-pill {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.stat-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-text-muted);
	}

	.stat-dot.active {
		background: var(--color-success);
		box-shadow: 0 0 8px var(--color-success);
	}

	/* Section Styles */
	section {
		margin-bottom: var(--space-2xl);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.section-header h2 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0;
	}

	.section-icon {
		font-size: 1.25rem;
	}

	.section-action {
		color: var(--color-accent-primary);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.875rem;
		transition: color var(--transition-fast);
	}

	.section-action:hover {
		color: var(--color-accent-secondary);
	}

	/* Account Card */
	.account-card {
		display: flex;
		gap: var(--space-xl);
		padding: var(--space-xl);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		backdrop-filter: blur(20px);
	}

	.account-avatar {
		width: 72px;
		height: 72px;
		background: var(--gradient-primary);
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 700;
		flex-shrink: 0;
		overflow: hidden;
	}

	.account-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.account-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.account-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.account-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.label-icon {
		font-size: 1rem;
	}

	.account-value {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.account-value code {
		font-family: 'SF Mono', Monaco, monospace;
		font-size: 0.875rem;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		word-break: break-all;
		overflow-wrap: break-word;
	}

	.copy-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		opacity: 0.6;
		transition: opacity var(--transition-fast);
		padding: var(--space-xs);
	}

	.copy-btn:hover {
		opacity: 1;
	}

	.verified-badge {
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-success);
		border-radius: var(--radius-full);
	}

	/* Balance Cards */
	.balance-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
		gap: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	.balance-card {
		position: relative;
		padding: var(--space-xl);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: all var(--transition-base);
	}

	.balance-card:hover {
		transform: translateY(-4px);
		border-color: var(--color-border-hover);
		box-shadow: var(--shadow-lg);
	}

	.balance-card.spacetime {
		--accent: var(--color-accent-primary);
	}

	.balance-card.spacemoney {
		--accent: var(--color-accent-secondary);
	}

	.balance-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.balance-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-md);
	}

	.balance-info h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.125rem;
	}

	.token-type {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.balance-amount {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.balance-amount .amount {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 700;
		background: linear-gradient(135deg, var(--accent) 0%, white 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.balance-amount .symbol {
		font-size: 1rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.balance-footer p {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		line-height: 1.5;
		margin: 0;
	}

	.balance-glow {
		position: absolute;
		top: -50%;
		right: -50%;
		width: 200px;
		height: 200px;
		background: var(--accent);
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.15;
		pointer-events: none;
	}

	/* Voting Power Card */
	.voting-power-card {
		padding: var(--space-xl);
		background: var(--gradient-glass);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		backdrop-filter: blur(20px);
	}

	.voting-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.voting-icon {
		font-size: 2rem;
	}

	.voting-header h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.125rem;
	}

	.voting-header p {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.voting-amount {
		font-family: var(--font-display);
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: var(--space-md);
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.voting-label {
		font-size: 1rem;
		font-weight: 500;
		-webkit-text-fill-color: var(--color-text-muted);
	}

	.voting-bar {
		display: flex;
		height: 8px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.voting-segment {
		position: relative;
		height: 100%;
		transition: width var(--transition-base);
	}

	.voting-segment.spacetime {
		background: var(--color-accent-primary);
	}

	.voting-segment.spacemoney {
		background: var(--color-accent-secondary);
	}

	.segment-tooltip {
		display: none;
	}

	/* Quick Actions */
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
		gap: var(--space-md);
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-fast);
	}

	.action-card:hover:not(.disabled) {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
		transform: translateX(4px);
	}

	.action-card.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	.action-card.purple .action-icon {
		background: rgba(139, 92, 246, 0.15);
	}

	.action-card.cyan .action-icon {
		background: rgba(6, 182, 212, 0.15);
	}

	.action-card.pink .action-icon {
		background: rgba(236, 72, 153, 0.15);
	}

	.action-card.green .action-icon {
		background: rgba(16, 185, 129, 0.15);
	}

	.action-content {
		flex: 1;
	}

	.action-content h3 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin: 0 0 var(--space-xs);
		font-size: 1rem;
		font-weight: 600;
	}

	.action-content p {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.soon-badge {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.15rem 0.4rem;
		background: var(--color-warning);
		color: black;
		border-radius: var(--radius-full);
		text-transform: uppercase;
	}

	.action-arrow {
		font-size: 1.25rem;
		color: var(--color-text-muted);
		transition: transform var(--transition-fast);
	}

	.action-card:hover:not(.disabled) .action-arrow {
		transform: translateX(4px);
		color: var(--color-text-primary);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.account-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.account-row {
			flex-direction: column;
			text-align: center;
		}

		.balance-cards {
			grid-template-columns: 1fr;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
