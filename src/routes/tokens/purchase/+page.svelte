<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth';

	let amount = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state('');

	const presetAmounts = [10, 50, 100, 500, 1000];

	async function handlePurchase() {
		if (!amount || parseFloat(amount) <= 0) {
			error = 'Please enter a valid amount';
			return;
		}

		error = '';
		success = '';
		loading = true;

		try {
			const response = await fetch('/api/tokens/purchase', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Purchase failed');
			}

			success = `Successfully purchased ${amount} economic tokens!`;
			amount = '';

			setTimeout(() => {
				goto('/dashboard');
			}, 3000);
		} catch (err: any) {
			error = err.message || 'Failed to purchase tokens';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function setPresetAmount(preset: number) {
		amount = preset.toString();
	}

	$effect(() => {
		if (!$user || !$user.walletAddress || !$user.discordId) {
			goto('/');
		}
	});
</script>

<div class="page">
	<!-- Back Link -->
	<a href="/dashboard" class="back-link">
		<span class="back-arrow">←</span>
		Back to Dashboard
	</a>

	<div class="page-header">
		<div class="header-icon">💰</div>
		<div>
			<h1>Purchase Economic Currency</h1>
			<p>Buy the organization\'s treasury-linked currency via linear bonding curve, whatever name the community chooses for it</p>
		</div>
	</div>

	<div class="content-grid">
		<!-- Purchase Form Card -->
		<div class="form-card">
			<div class="card-header">
				<h2>Buy Tokens</h2>
				<span class="token-badge">ex. *Money</span>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handlePurchase(); }}>
				<!-- Amount Input -->
				<div class="form-group">
					<label for="amount">Amount to Purchase</label>
					<div class="input-wrapper">
						<span class="input-prefix">💵</span>
						<input
							type="number"
							id="amount"
							bind:value={amount}
							placeholder="0.00"
							step="0.01"
							min="0"
							disabled={loading}
						/>
						<span class="input-suffix">Custom</span>
					</div>
				</div>

				<!-- Preset Amounts -->
				<div class="preset-amounts">
					{#each presetAmounts as preset}
						<button
							type="button"
							class="preset-btn"
							class:active={amount === preset.toString()}
							onclick={() => setPresetAmount(preset)}
							disabled={loading}
						>
							{preset}
						</button>
					{/each}
				</div>

				<!-- Summary -->
				{#if amount && parseFloat(amount) > 0}
					<div class="summary">
						<div class="summary-row">
							<span>Amount</span>
							<span>{parseFloat(amount).toLocaleString()} units</span>
						</div>
						<div class="summary-row">
							<span>Network Fee</span>
							<span class="fee">~0.001 ETH</span>
						</div>
						<div class="summary-divider"></div>
						<div class="summary-row total">
							<span>You'll Receive</span>
							<span class="gradient-text">{parseFloat(amount).toLocaleString()} economic currency units</span>
						</div>
					</div>
				{/if}

				<!-- Messages -->
				{#if error}
					<div class="message error">
						<span class="message-icon">⚠️</span>
						{error}
					</div>
				{/if}

				{#if success}
					<div class="message success">
						<span class="message-icon">✓</span>
						<div>
							<strong>{success}</strong>
							<p>Redirecting to dashboard...</p>
						</div>
					</div>
				{/if}

				<!-- Actions -->
				<div class="actions">
					<button type="submit" class="btn btn-primary btn-lg" disabled={loading || !amount}>
						{#if loading}
							<span class="spinner"></span>
							Processing...
						{:else}
							Purchase Economic Currency
						{/if}
					</button>
				</div>
			</form>
		</div>

		<!-- Info Card -->
		<div class="info-card">
			<h3>About the Economic Currency</h3>
			<div class="info-items">
				<div class="info-item">
					<span class="info-icon">�</span>
					<div>
						<h4>Bonding Curve Pricing</h4>
						<p>The economic currency can use a linear bonding curve. Starting price: $0.50 per unit. Price increases by $0.01 for each unit minted, regardless of whether the organization calls it *Money or something else.</p>
					</div>
				</div>
				<div class="info-item">
					<span class="info-icon">🗳️</span>
					<div>
						<h4>Staking for Voting</h4>
						<p>Stake SM for 5, 10, or 20 years to earn conditional voting weight on treasury proposals. Multiplier: 2^(years/20). Unstaked SM carries no voting power.</p>
					</div>
				</div>
				<div class="info-item">
					<span class="info-icon">📤</span>
					<div>
						<h4>Transferable</h4>
						<p>The economic currency can be transferred to other wallet addresses. No supply cap is implied by the naming choice.</p>
					</div>
				</div>
				<div class="info-item">
					<span class="info-icon">🏦</span>
					<div>
						<h4>Treasury Backed</h4>
						<p>All purchase proceeds go directly to the Athena treasury. These units represent a stake in the collective treasury.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.page {
		max-width: 1000px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: 0.875rem;
		margin-bottom: var(--space-xl);
		transition: color var(--transition-fast);
	}

	.back-link:hover {
		color: var(--color-text-primary);
	}

	.back-arrow {
		font-size: 1.25rem;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		margin-bottom: var(--space-2xl);
	}

	.header-icon {
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		background: rgba(139, 92, 246, 0.15);
		border-radius: var(--radius-lg);
	}

	.page-header h1 {
		font-family: var(--font-display);
		font-size: 2rem;
		margin: 0 0 var(--space-xs);
	}

	.page-header p {
		color: var(--color-text-muted);
		margin: 0;
	}

	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
	}

	@media (min-width: 900px) {
		.content-grid {
			grid-template-columns: 1fr 360px;
		}
	}

	/* Form Card */
	.form-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-2xl);
		backdrop-filter: blur(20px);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xl);
	}

	.card-header h2 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0;
	}

	.token-badge {
		padding: 0.25rem 0.75rem;
		background: var(--gradient-primary);
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.form-group {
		margin-bottom: var(--space-lg);
	}

	label {
		display: block;
		font-weight: 500;
		margin-bottom: var(--space-sm);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color var(--transition-fast);
		overflow: hidden;
	}

	.input-wrapper:focus-within {
		border-color: var(--color-accent-primary);
	}

	.input-prefix,
	.input-suffix {
		padding: 0 var(--space-md);
		color: var(--color-text-muted);
		font-size: 1.125rem;
	}

	.input-suffix {
		font-size: 0.875rem;
		font-weight: 600;
		background: var(--color-bg-tertiary);
		padding: var(--space-md);
	}

	input {
		flex: 1;
		padding: var(--space-md);
		background: transparent;
		border: none;
		font-size: 1.25rem;
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--color-text-primary);
		width: 100%;
	}

	input:focus {
		outline: none;
	}

	input::placeholder {
		color: var(--color-text-muted);
	}

	input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Preset Amounts */
	.preset-amounts {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-xl);
		flex-wrap: wrap;
	}

	.preset-btn {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.preset-btn:hover:not(:disabled) {
		background: var(--color-bg-tertiary);
		border-color: var(--color-border-hover);
	}

	.preset-btn.active {
		background: rgba(139, 92, 246, 0.15);
		border-color: var(--color-accent-primary);
		color: var(--color-accent-primary);
	}

	.preset-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Summary */
	.summary {
		padding: var(--space-lg);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-xl);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) 0;
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
	}

	.summary-row.total {
		font-weight: 600;
		font-size: 1rem;
		color: var(--color-text-primary);
	}

	.fee {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.summary-divider {
		height: 1px;
		background: var(--color-border);
		margin: var(--space-sm) 0;
	}

	.gradient-text {
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Messages */
	.message {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-lg);
	}

	.message.error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: var(--color-error);
	}

	.message.success {
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: var(--color-success);
	}

	.message-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.message p {
		margin: var(--space-xs) 0 0;
		font-size: 0.875rem;
		opacity: 0.8;
	}

	/* Actions */
	.actions {
		display: flex;
		gap: var(--space-md);
	}

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
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--gradient-primary);
		color: white;
		box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
		width: 100%;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
	}

	.btn-lg {
		padding: 1rem 2rem;
		font-size: 1rem;
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

	/* Info Card */
	.info-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		height: fit-content;
		position: sticky;
		top: 100px;
	}

	.info-card h3 {
		font-family: var(--font-display);
		font-size: 1rem;
		margin: 0 0 var(--space-lg);
		color: var(--color-text-secondary);
	}

	.info-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.info-item {
		display: flex;
		gap: var(--space-md);
	}

	.info-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.info-item h4 {
		margin: 0 0 var(--space-xs);
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.info-item p {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.info-card {
			position: static;
		}
	}

	@media (max-width: 640px) {
		.page-header {
			flex-direction: column;
			text-align: center;
		}

		.form-card {
			padding: var(--space-lg);
		}
	}
</style>
