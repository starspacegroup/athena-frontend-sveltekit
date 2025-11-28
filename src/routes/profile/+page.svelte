<script lang="ts">
	import { goto } from '$app/navigation';
	import { user, walletConnected, discordConnected } from '$lib/stores/auth';
	import WalletModal from '$lib/components/WalletModal.svelte';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let error = $state('');
	let showWalletModal = $state(false);

	onMount(() => {
		// Redirect to home if not logged in
		if (!$user) {
			goto('/');
		}
	});

	async function handleWalletConnected(address: string) {
		error = '';
		loading = true;

		try {
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
		window.location.href = '/api/auth/discord';
	}

	async function handleLogout() {
		const response = await fetch('/api/auth/logout', { method: 'POST' });
		if (response.ok) {
			user.set(null);
			walletConnected.set(false);
			discordConnected.set(false);
			goto('/');
		}
	}
</script>

{#if $user}
<div class="profile-page">
	<div class="profile-container">
		<!-- Profile Header -->
		<div class="profile-header">
			<div class="profile-avatar">
				{#if $user.discordUsername}
					{$user.discordUsername.charAt(0).toUpperCase()}
				{:else}
					✦
				{/if}
			</div>
			<div class="profile-info">
				<h1>{$user.discordUsername || 'Anonymous'}</h1>
				<p class="profile-subtitle">*Space DAO Member</p>
			</div>
		</div>

		<!-- Connection Status -->
		<div class="connections-card">
			<h2>Connections</h2>
			
			<div class="connection-list">
				<!-- Wallet -->
				<div class="connection-item">
					<div class="connection-icon wallet">💎</div>
					<div class="connection-info">
						<span class="connection-label">Wallet</span>
						{#if $user.walletAddress}
							<span class="connection-value mono">
								{$user.walletAddress.slice(0, 6)}...{$user.walletAddress.slice(-4)}
							</span>
						{:else}
							<span class="connection-value muted">Not connected</span>
						{/if}
					</div>
					{#if $user.walletAddress}
						<span class="status-badge success">Connected</span>
					{:else}
						<button onclick={() => showWalletModal = true} class="btn btn-sm btn-primary" disabled={loading}>
							Connect
						</button>
					{/if}
				</div>

				<!-- Discord -->
				<div class="connection-item">
					<div class="connection-icon discord">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
						</svg>
					</div>
					<div class="connection-info">
						<span class="connection-label">Discord</span>
						{#if $user.discordUsername}
							<span class="connection-value">{$user.discordUsername}</span>
						{:else}
							<span class="connection-value muted">Not linked</span>
						{/if}
					</div>
					{#if $user.discordId}
						<span class="status-badge success">Linked</span>
					{:else}
						<button onclick={handleDiscordConnect} class="btn btn-sm btn-discord">
							Link
						</button>
					{/if}
				</div>
			</div>

			{#if !$user.walletAddress || !$user.discordId}
				<div class="incomplete-notice">
					<span class="notice-icon">⚡</span>
					<p>Complete your profile to unlock all DAO features</p>
				</div>
			{/if}
		</div>

		<!-- Quick Actions -->
		<div class="actions-card">
			<h2>Quick Actions</h2>
			<div class="actions-grid">
				<a href="/dashboard" class="action-item">
					<span class="action-icon">📊</span>
					<span>Dashboard</span>
				</a>
				<a href="/tokens/purchase" class="action-item">
					<span class="action-icon">💎</span>
					<span>Buy Tokens</span>
				</a>
				<a href="/tokens/transfer" class="action-item">
					<span class="action-icon">↗️</span>
					<span>Transfer</span>
				</a>
			</div>
		</div>

		<!-- Sign Out -->
		<button onclick={handleLogout} class="btn btn-ghost logout-btn">
			<span>🚪</span>
			Sign Out
		</button>

		{#if error}
			<div class="error-message">
				<span class="error-icon">⚠️</span>
				{error}
			</div>
		{/if}
	</div>
</div>
{/if}

<!-- Wallet Connection Modal -->
<WalletModal 
	open={showWalletModal} 
	onClose={() => showWalletModal = false}
	onConnect={handleWalletConnected}
	onError={handleWalletError}
/>

<style>
	.profile-page {
		min-height: 100%;
		padding: var(--space-xl) 0;
	}

	.profile-container {
		max-width: 560px;
		margin: 0 auto;
	}

	/* Profile Header */
	.profile-header {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		margin-bottom: var(--space-2xl);
	}

	.profile-avatar {
		width: 80px;
		height: 80px;
		background: var(--gradient-primary);
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 700;
		color: white;
		box-shadow: var(--shadow-lg);
	}

	.profile-info h1 {
		font-family: var(--font-display);
		font-size: 1.75rem;
		margin: 0 0 var(--space-xs);
	}

	.profile-subtitle {
		color: var(--color-text-secondary);
		margin: 0;
		font-size: 0.9375rem;
	}

	/* Cards */
	.connections-card,
	.actions-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		margin-bottom: var(--space-lg);
	}

	.connections-card h2,
	.actions-card h2 {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 var(--space-lg);
	}

	/* Connection List */
	.connection-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.connection-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
	}

	.connection-icon {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
	}

	.connection-icon.wallet {
		background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
	}

	.connection-icon.discord {
		background: rgba(88, 101, 242, 0.2);
		color: #5865f2;
	}

	.connection-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.connection-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.connection-value {
		font-size: 0.9375rem;
		color: var(--color-text-primary);
	}

	.connection-value.mono {
		font-family: var(--font-mono);
	}

	.connection-value.muted {
		color: var(--color-text-muted);
	}

	.status-badge {
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge.success {
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-success);
		border: 1px solid rgba(16, 185, 129, 0.3);
	}

	/* Incomplete Notice */
	.incomplete-notice {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-top: var(--space-lg);
		padding: var(--space-md);
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: var(--radius-md);
	}

	.incomplete-notice .notice-icon {
		font-size: 1rem;
	}

	.incomplete-notice p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-warning);
	}

	/* Actions Grid */
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-lg) var(--space-md);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: var(--color-text-primary);
		transition: all var(--transition-base);
	}

	.action-item:hover {
		background: var(--color-bg-tertiary);
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
	}

	.action-icon {
		font-size: 1.5rem;
	}

	.action-item span:last-child {
		font-size: 0.8125rem;
		font-weight: 500;
	}

	/* Button Base Styles */
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

	.btn-ghost {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.btn-ghost:hover {
		color: var(--color-text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.btn-sm {
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
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

	/* Logout Button */
	.logout-btn {
		width: 100%;
		justify-content: center;
		gap: var(--space-sm);
		color: var(--color-text-muted);
		margin-top: var(--space-md);
	}

	.logout-btn:hover {
		color: var(--color-error);
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
	}

	/* Error Message */
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

	/* Responsive */
	@media (max-width: 640px) {
		.profile-header {
			flex-direction: column;
			text-align: center;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
