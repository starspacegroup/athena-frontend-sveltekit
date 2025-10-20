<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth';
	import { tokenBalances } from '$lib/stores/tokens';

	let loading = $state(true);

	onMount(async () => {
		// Check if user is authenticated
		if (!$user || !$user.walletAddress || !$user.discordId) {
			goto('/');
			return;
		}

		// Load token balances
		try {
			const response = await fetch('/api/tokens/balances');
			if (response.ok) {
				const data = await response.json();
				tokenBalances.set(data);
			}
		} catch (error) {
			console.error('Failed to load balances:', error);
		} finally {
			loading = false;
		}
	});
</script>

<div class="dashboard">
	<h1>Dashboard</h1>

	{#if loading}
		<p>Loading...</p>
	{:else}
		<div class="user-card">
			<h2>Your Account</h2>
			<div class="user-details">
				{#if $user?.walletAddress}
					<div class="detail">
						<span class="label">Wallet Address:</span>
						<span class="value">
							{$user.walletAddress.slice(0, 10)}...{$user.walletAddress.slice(-8)}
						</span>
					</div>
				{/if}
				{#if $user?.discordUsername}
					<div class="detail">
						<span class="label">Discord:</span>
						<span class="value">{$user.discordUsername}</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="balances">
			<h2>Token Balances</h2>
			<div class="balance-cards">
				<div class="balance-card spacetime">
					<h3>SpaceTime</h3>
					<p class="balance">{$tokenBalances.spaceTime}</p>
					<p class="description">Non-tradable governance tokens earned through participation</p>
				</div>
				<div class="balance-card spacemoney">
					<h3>SpaceMoney</h3>
					<p class="balance">{$tokenBalances.spaceMoney}</p>
					<p class="description">Purchasable and transferable governance tokens</p>
				</div>
			</div>
		</div>

		<div class="actions">
			<a href="/tokens/purchase" class="btn btn-primary">Purchase SpaceMoney</a>
			<a href="/tokens/transfer" class="btn btn-secondary">Transfer SpaceMoney</a>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1000px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 2rem;
		color: #333;
	}

	.user-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.user-card h2 {
		margin-top: 0;
		color: #555;
	}

	.user-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.detail {
		display: flex;
		gap: 1rem;
	}

	.label {
		font-weight: 600;
		color: #666;
	}

	.value {
		color: #333;
		font-family: monospace;
	}

	.balances {
		margin-bottom: 2rem;
	}

	.balances h2 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.balance-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.balance-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-top: 4px solid;
	}

	.balance-card.spacetime {
		border-top-color: #667eea;
	}

	.balance-card.spacemoney {
		border-top-color: #764ba2;
	}

	.balance-card h3 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.balance {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 1rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.description {
		color: #666;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		padding: 1rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: inline-block;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-secondary:hover {
		background: #f9f9f9;
		transform: translateY(-2px);
	}
</style>
