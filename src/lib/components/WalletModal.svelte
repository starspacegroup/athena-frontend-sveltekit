<script lang="ts">
	import { detectWallets, connectWallet, isMobile, isInWalletBrowser, type DetectedWallet } from '$lib/wallet';

	interface Props {
		open: boolean;
		onClose: () => void;
		onConnect: (address: string) => void;
		onError: (error: string) => void;
	}

	let { open, onClose, onConnect, onError }: Props = $props();

	let wallets = $state<DetectedWallet[]>([]);
	let connecting = $state<string | null>(null);
	let mobile = $state(false);
	let inWalletBrowser = $state(false);

	$effect(() => {
		if (open) {
			wallets = detectWallets();
			mobile = isMobile();
			inWalletBrowser = isInWalletBrowser();
			
			// If we're in a wallet browser on mobile, auto-connect
			if (mobile && inWalletBrowser) {
				const defaultWallet = wallets.find(w => w.installed);
				if (defaultWallet) {
					handleConnect(defaultWallet);
				}
			}
		}
	});

	async function handleConnect(wallet: DetectedWallet) {
		connecting = wallet.id;
		
		try {
			const address = await connectWallet(wallet);
			onConnect(address);
			onClose();
		} catch (err: any) {
			onError(err.message || 'Failed to connect wallet');
		} finally {
			connecting = null;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	// Sort wallets: installed first, then by name
	let sortedWallets = $derived(
		[...wallets].sort((a, b) => {
			if (a.installed && !b.installed) return -1;
			if (!a.installed && b.installed) return 1;
			return a.name.localeCompare(b.name);
		})
	);

	let hasInstalledWallet = $derived(wallets.some(w => w.installed));
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="modal-header">
				<h2 id="modal-title">Connect Wallet</h2>
				<button class="close-btn" onclick={onClose} aria-label="Close">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="modal-body">
				{#if mobile && !inWalletBrowser && !hasInstalledWallet}
					<div class="mobile-hint">
						<span class="hint-icon">📱</span>
						<p>Select a wallet to open its app. If you don't have a wallet, you can download one below.</p>
					</div>
				{/if}

				<div class="wallet-list">
					{#each sortedWallets as wallet (wallet.id)}
						<button
							class="wallet-item"
							class:installed={wallet.installed}
							class:connecting={connecting === wallet.id}
							onclick={() => handleConnect(wallet)}
							disabled={connecting !== null}
						>
							<span class="wallet-icon">{wallet.icon}</span>
							<div class="wallet-details">
								<span class="wallet-name">{wallet.name}</span>
								{#if wallet.installed}
									<span class="wallet-status installed">Detected</span>
								{:else if mobile && wallet.deepLink}
									<span class="wallet-status">Tap to open</span>
								{:else}
									<span class="wallet-status">Not installed</span>
								{/if}
							</div>
							{#if connecting === wallet.id}
								<div class="spinner"></div>
							{:else if wallet.installed}
								<svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M9 18l6-6-6-6" />
								</svg>
							{:else if !mobile && wallet.downloadUrl}
								<a 
									href={wallet.downloadUrl} 
									target="_blank" 
									rel="noopener noreferrer"
									class="download-link"
									onclick={(e) => e.stopPropagation()}
								>
									Install
								</a>
							{/if}
						</button>
					{/each}
				</div>

				<div class="modal-footer">
					<p class="footer-text">
						{#if mobile}
							Don't have a wallet? 
							<a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
								Get MetaMask
							</a>
						{:else}
							New to Web3? 
							<a href="https://ethereum.org/en/wallets/" target="_blank" rel="noopener noreferrer">
								Learn about wallets
							</a>
						{/if}
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal {
		width: 100%;
		max-width: 400px;
		max-height: 90vh;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		overflow: hidden;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from { 
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to { 
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.25rem;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.modal-body {
		padding: var(--space-lg);
		overflow-y: auto;
	}

	.mobile-hint {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-lg);
	}

	.hint-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.mobile-hint p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
	}

	.wallet-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.wallet-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border: 1px solid transparent;
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.wallet-item:hover:not(:disabled) {
		background: var(--color-bg-tertiary);
		border-color: var(--color-border);
	}

	.wallet-item.installed {
		border-color: rgba(139, 92, 246, 0.3);
	}

	.wallet-item.installed:hover:not(:disabled) {
		border-color: var(--color-primary);
		box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
	}

	.wallet-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.wallet-item.connecting {
		border-color: var(--color-primary);
		background: rgba(139, 92, 246, 0.1);
	}

	.wallet-icon {
		font-size: 2rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.wallet-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.wallet-name {
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.wallet-status {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.wallet-status.installed {
		color: var(--color-success);
	}

	.arrow-icon {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.download-link {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-primary);
		text-decoration: none;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.download-link:hover {
		background: rgba(139, 92, 246, 0.15);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(139, 92, 246, 0.3);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.modal-footer {
		margin-top: var(--space-lg);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
		text-align: center;
	}

	.footer-text {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.footer-text a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.footer-text a:hover {
		text-decoration: underline;
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.modal-backdrop {
			padding: 0;
			align-items: flex-end;
		}

		.modal {
			max-width: none;
			max-height: 85vh;
			border-radius: var(--radius-xl) var(--radius-xl) 0 0;
			animation: slideUpMobile 0.3s ease-out;
		}

		@keyframes slideUpMobile {
			from { 
				opacity: 0;
				transform: translateY(100%);
			}
			to { 
				opacity: 1;
				transform: translateY(0);
			}
		}

		.modal-body {
			padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom, 0));
		}
	}
</style>
