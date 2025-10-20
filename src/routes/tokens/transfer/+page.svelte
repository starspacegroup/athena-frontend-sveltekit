<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth';

	let toAddress = $state('');
	let amount = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleTransfer() {
		if (!toAddress) {
			error = 'Please enter a recipient address';
			return;
		}

		if (!amount || parseFloat(amount) <= 0) {
			error = 'Please enter a valid amount';
			return;
		}

		error = '';
		success = '';
		loading = true;

		try {
			const response = await fetch('/api/tokens/transfer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ toAddress, amount })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Transfer failed');
			}

			success = `Successfully transferred ${amount} SpaceMoney! Transaction: ${data.txHash}`;
			toAddress = '';
			amount = '';

			setTimeout(() => {
				goto('/dashboard');
			}, 3000);
		} catch (err: any) {
			error = err.message || 'Failed to transfer tokens';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!$user || !$user.walletAddress || !$user.discordId) {
			goto('/');
		}
	});
</script>

<div class="container">
	<h1>Transfer SpaceMoney</h1>

	<div class="card">
		<p class="description">
			Transfer SpaceMoney tokens to another wallet address. The recipient will receive the tokens in
			their wallet.
		</p>

		<form onsubmit={(e) => { e.preventDefault(); handleTransfer(); }}>
			<div class="form-group">
				<label for="toAddress">Recipient Address</label>
				<input
					type="text"
					id="toAddress"
					bind:value={toAddress}
					placeholder="0x..."
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="amount">Amount to Transfer</label>
				<input
					type="number"
					id="amount"
					bind:value={amount}
					placeholder="0.0"
					step="0.01"
					min="0"
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="error">{error}</div>
			{/if}

			{#if success}
				<div class="success">{success}</div>
			{/if}

			<div class="actions">
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{loading ? 'Processing...' : 'Transfer'}
				</button>
				<a href="/dashboard" class="btn btn-secondary">Cancel</a>
			</div>
		</form>
	</div>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.description {
		color: #666;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #555;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
	}

	input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.error {
		background: #fee;
		color: #c33;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.success {
		background: #efe;
		color: #3c3;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
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

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-secondary:hover {
		background: #f9f9f9;
	}
</style>
