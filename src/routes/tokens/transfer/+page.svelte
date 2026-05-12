<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth';

	let toAddress = $state('');
	let amount = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state('');
	let step = $state(1);

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

			success = `Successfully transferred ${amount} economic currency units!`;
			step = 3;

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

	function nextStep() {
		if (step === 1 && toAddress) {
			error = '';
			step = 2;
		}
	}

	function prevStep() {
		if (step === 2) {
			step = 1;
		}
	}

	function isValidAddress(address: string): boolean {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
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
		<div class="header-icon">📤</div>
		<div>
			<h1>Transfer Economic Currency</h1>
			<p>Send the organization\'s economic currency to another wallet address</p>
		</div>
	</div>

	<div class="content-grid">
		<!-- Transfer Form Card -->
		<div class="form-card">
			<!-- Progress Steps -->
			<div class="progress-steps">
				<div class="progress-step" class:active={step >= 1} class:completed={step > 1}>
					<div class="step-indicator">
						{#if step > 1}✓{:else}1{/if}
					</div>
					<span>Recipient</span>
				</div>
				<div class="progress-line" class:active={step > 1}></div>
				<div class="progress-step" class:active={step >= 2} class:completed={step > 2}>
					<div class="step-indicator">
						{#if step > 2}✓{:else}2{/if}
					</div>
					<span>Amount</span>
				</div>
				<div class="progress-line" class:active={step > 2}></div>
				<div class="progress-step" class:active={step >= 3}>
					<div class="step-indicator">3</div>
					<span>Complete</span>
				</div>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); if (step === 2) handleTransfer(); else nextStep(); }}>
				<!-- Step 1: Recipient -->
				{#if step === 1}
					<div class="step-content">
						<h2>Who are you sending to?</h2>
						<p class="step-description">Enter the recipient's wallet address</p>

						<div class="form-group">
							<label for="toAddress">Recipient Address</label>
							<div class="input-wrapper" class:valid={isValidAddress(toAddress)} class:invalid={toAddress && !isValidAddress(toAddress)}>
								<span class="input-prefix">💎</span>
								<input
									type="text"
									id="toAddress"
									bind:value={toAddress}
									placeholder="0x..."
									disabled={loading}
								/>
								{#if isValidAddress(toAddress)}
									<span class="input-status valid">✓</span>
								{:else if toAddress}
									<span class="input-status invalid">✗</span>
								{/if}
							</div>
							{#if toAddress && !isValidAddress(toAddress)}
								<span class="input-hint error">Please enter a valid Ethereum address</span>
							{/if}
						</div>

						<button type="submit" class="btn btn-primary btn-lg btn-block" disabled={!isValidAddress(toAddress)}>
							Continue
							<span class="btn-arrow">→</span>
						</button>
					</div>
				{/if}

				<!-- Step 2: Amount -->
				{#if step === 2}
					<div class="step-content">
						<h2>How much do you want to send?</h2>
						<p class="step-description">Enter the amount of economic currency to transfer</p>

						<!-- Recipient Preview -->
						<div class="recipient-preview">
							<span class="preview-label">Sending to</span>
							<div class="preview-address">
								<span class="address-icon">💎</span>
								<code>{toAddress.slice(0, 10)}...{toAddress.slice(-8)}</code>
								<button type="button" class="edit-btn" onclick={prevStep}>Edit</button>
							</div>
						</div>

						<div class="form-group">
							<label for="amount">Amount to Transfer</label>
							<div class="input-wrapper large">
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
									<span>Recipient Gets</span>
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

						<div class="actions">
							<button type="button" class="btn btn-ghost" onclick={prevStep} disabled={loading}>
								← Back
							</button>
							<button type="submit" class="btn btn-primary btn-lg" disabled={loading || !amount || parseFloat(amount) <= 0}>
								{#if loading}
									<span class="spinner"></span>
									Processing...
								{:else}
									Confirm Transfer
								{/if}
							</button>
						</div>
					</div>
				{/if}

				<!-- Step 3: Success -->
				{#if step === 3}
					<div class="step-content success-state">
						<div class="success-icon-large">✓</div>
						<h2>Transfer Complete!</h2>
						<p class="step-description">{success}</p>
						
						<div class="transfer-summary">
							<div class="summary-item">
								<span class="summary-label">Amount Sent</span>
								<span class="summary-value">{amount} units</span>
							</div>
							<div class="summary-item">
								<span class="summary-label">To</span>
								<code class="summary-value">{toAddress.slice(0, 10)}...{toAddress.slice(-8)}</code>
							</div>
						</div>

						<p class="redirect-notice">Redirecting to dashboard...</p>
					</div>
				{/if}
			</form>
		</div>

		<!-- Info Card -->
		<div class="info-card">
			<h3>Transfer Info</h3>
			<div class="info-items">
				<div class="info-item">
					<span class="info-icon">⚡</span>
					<div>
						<h4>Instant Transfers</h4>
						<p>Tokens are transferred immediately to the recipient</p>
					</div>
				</div>
				<div class="info-item">
					<span class="info-icon">🔒</span>
					<div>
						<h4>Secure</h4>
						<p>All transfers are verified on the blockchain</p>
					</div>
				</div>
				<div class="info-item">
					<span class="info-icon">⚠️</span>
					<div>
						<h4>Irreversible</h4>
						<p>Double-check the address before confirming</p>
					</div>
				</div>
				<div class="info-item">
					<span class="info-icon">💡</span>
					<div>
						<h4>Economic Currency Only</h4>
						<p>The governance currency is earned rather than transferred</p>
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
		background: rgba(6, 182, 212, 0.15);
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

	/* Progress Steps */
	.progress-steps {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-2xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.progress-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		opacity: 0.5;
		transition: opacity var(--transition-base);
	}

	.progress-step.active {
		opacity: 1;
	}

	.step-indicator {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-tertiary);
		border-radius: 50%;
		font-weight: 600;
		font-size: 0.875rem;
		transition: all var(--transition-base);
	}

	.progress-step.active .step-indicator {
		background: var(--gradient-primary);
	}

	.progress-step.completed .step-indicator {
		background: var(--color-success);
	}

	.progress-step span:not(.step-indicator) {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.progress-line {
		width: 60px;
		height: 2px;
		background: var(--color-bg-tertiary);
		transition: background var(--transition-base);
	}

	.progress-line.active {
		background: var(--gradient-primary);
	}

	/* Step Content */
	.step-content {
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.step-content h2 {
		font-family: var(--font-display);
		font-size: 1.5rem;
		margin: 0 0 var(--space-sm);
	}

	.step-description {
		color: var(--color-text-muted);
		margin: 0 0 var(--space-xl);
	}

	/* Form Group */
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

	.input-wrapper.valid {
		border-color: var(--color-success);
	}

	.input-wrapper.invalid {
		border-color: var(--color-error);
	}

	.input-wrapper.large input {
		font-size: 2rem;
		padding: var(--space-lg);
		text-align: center;
	}

	.input-prefix {
		padding: 0 var(--space-md);
		color: var(--color-text-muted);
		font-size: 1.125rem;
	}

	.input-suffix {
		font-size: 1rem;
		font-weight: 600;
		background: var(--color-bg-tertiary);
		padding: var(--space-lg);
		color: var(--color-text-muted);
	}

	.input-status {
		padding: 0 var(--space-md);
		font-weight: 600;
	}

	.input-status.valid {
		color: var(--color-success);
	}

	.input-status.invalid {
		color: var(--color-error);
	}

	input {
		flex: 1;
		padding: var(--space-md);
		background: transparent;
		border: none;
		font-size: 1rem;
		font-family: var(--font-sans);
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

	.input-hint {
		display: block;
		margin-top: var(--space-sm);
		font-size: 0.8125rem;
	}

	.input-hint.error {
		color: var(--color-error);
	}

	/* Recipient Preview */
	.recipient-preview {
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-lg);
	}

	.preview-label {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-sm);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.preview-address {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.address-icon {
		font-size: 1.125rem;
	}

	.preview-address code {
		flex: 1;
		font-family: 'SF Mono', Monaco, monospace;
		font-size: 0.875rem;
	}

	.edit-btn {
		background: none;
		border: none;
		color: var(--color-accent-primary);
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 500;
		transition: color var(--transition-fast);
	}

	.edit-btn:hover {
		color: var(--color-accent-secondary);
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

	/* Success State */
	.success-state {
		text-align: center;
		padding: var(--space-xl) 0;
	}

	.success-icon-large {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-success);
		border-radius: 50%;
		font-size: 2.5rem;
		margin: 0 auto var(--space-lg);
		animation: scaleIn 0.5s ease;
	}

	@keyframes scaleIn {
		from { transform: scale(0); }
		to { transform: scale(1); }
	}

	.transfer-summary {
		padding: var(--space-lg);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		margin: var(--space-xl) 0;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		padding: var(--space-sm) 0;
	}

	.summary-label {
		color: var(--color-text-muted);
	}

	.summary-value {
		font-weight: 600;
	}

	.redirect-notice {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
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

	.message-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
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
		flex: 1;
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

	.btn-ghost:hover:not(:disabled) {
		color: var(--color-text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.btn-lg {
		padding: 1rem 2rem;
		font-size: 1rem;
	}

	.btn-block {
		width: 100%;
	}

	.btn-arrow {
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

		.progress-steps {
			flex-wrap: wrap;
		}

		.progress-line {
			display: none;
		}

		.actions {
			flex-direction: column;
		}

		.btn-ghost {
			order: 1;
		}
	}
</style>
