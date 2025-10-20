<script lang="ts">
	import { goto } from '$app/navigation';
	import { user, walletConnected, discordConnected } from '$lib/stores/auth';
	import { connectWallet } from '$lib/wallet';

	let loading = $state(false);
	let error = $state('');
	let selectedWallet = $state<'metamask' | 'coinbase'>('metamask');

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

			// Check if user needs to connect Discord
			if (!data.user.discordId) {
				// User needs to connect Discord
				error = 'Please also connect your Discord account to complete registration';
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
		}
	}

	$effect(() => {
		if ($user?.walletAddress) {
			walletConnected.set(true);
		}
		if ($user?.discordId) {
			discordConnected.set(true);
		}
	});
</script>

<div class="container">
	<div class="hero">
		<h1>Welcome to Athena DAO</h1>
		<p>
			Digital Autonomous Organization for *Space. Earn SpaceTime tokens and purchase SpaceMoney to
			participate in governance.
		</p>
	</div>

	{#if !$user}
		<div class="auth-section">
			<h2>Login or Register</h2>
			<p class="info">Connect both your wallet and Discord account to get started</p>

			<div class="wallet-options">
				<h3>Step 1: Connect Your Wallet</h3>
				<div class="wallet-buttons">
					<label>
						<input type="radio" bind:group={selectedWallet} value="metamask" />
						MetaMask
					</label>
					<label>
						<input type="radio" bind:group={selectedWallet} value="coinbase" />
						Coinbase Wallet
					</label>
				</div>
				<button onclick={handleWalletConnect} disabled={loading} class="btn btn-primary">
					{loading ? 'Connecting...' : 'Connect Wallet'}
				</button>
			</div>

			{#if $walletConnected && !$discordConnected}
				<div class="discord-section">
					<h3>Step 2: Connect Discord</h3>
					<button onclick={handleDiscordConnect} class="btn btn-discord">
						Connect Discord Account
					</button>
				</div>
			{/if}

			{#if error}
				<div class="error">{error}</div>
			{/if}
		</div>
	{:else}
		<div class="user-section">
			<h2>Welcome back!</h2>
			<div class="user-info">
				{#if $user.walletAddress}
					<p>
						<strong>Wallet:</strong>
						{$user.walletAddress.slice(0, 6)}...{$user.walletAddress.slice(-4)}
					</p>
				{/if}
				{#if $user.discordUsername}
					<p><strong>Discord:</strong> {$user.discordUsername}</p>
				{/if}
			</div>

			{#if $user.walletAddress && $user.discordId}
				<a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
			{:else}
				<p class="warning">
					You need to connect both wallet and Discord to access the dashboard.
				</p>
				{#if !$user.walletAddress}
					<button onclick={handleWalletConnect} class="btn btn-primary">Connect Wallet</button>
				{/if}
				{#if !$user.discordId}
					<button onclick={handleDiscordConnect} class="btn btn-discord">Connect Discord</button>
				{/if}
			{/if}

			<button onclick={handleLogout} class="btn btn-secondary">Logout</button>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero p {
		font-size: 1.2rem;
		color: #666;
		line-height: 1.6;
	}

	.auth-section,
	.user-section {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.auth-section h2,
	.user-section h2 {
		margin-top: 0;
		color: #333;
	}

	.info {
		color: #666;
		margin-bottom: 2rem;
	}

	.wallet-options {
		margin-bottom: 2rem;
	}

	.wallet-options h3 {
		margin-bottom: 1rem;
		color: #555;
	}

	.wallet-buttons {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.wallet-buttons label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.discord-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e0e0e0;
	}

	.discord-section h3 {
		margin-bottom: 1rem;
		color: #555;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: inline-block;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
	}

	.btn-discord {
		background: #5865f2;
		color: white;
	}

	.btn-discord:hover {
		background: #4752c4;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(88, 101, 242, 0.4);
	}

	.btn-secondary {
		background: #f5f5f5;
		color: #666;
		margin-top: 1rem;
	}

	.btn-secondary:hover {
		background: #e0e0e0;
	}

	.error {
		background: #fee;
		color: #c33;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
	}

	.warning {
		background: #fff3cd;
		color: #856404;
		padding: 1rem;
		border-radius: 8px;
		margin: 1rem 0;
	}

	.user-info {
		background: #f9f9f9;
		padding: 1rem;
		border-radius: 8px;
		margin: 1rem 0;
	}

	.user-info p {
		margin: 0.5rem 0;
	}
</style>
