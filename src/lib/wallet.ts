import { BrowserProvider, Contract } from 'ethers';

export interface WalletProvider {
	request: (args: { method: string; params?: any[]; }) => Promise<any>;
	on?: (event: string, handler: (...args: any[]) => void) => void;
	removeListener?: (event: string, handler: (...args: any[]) => void) => void;
	isMetaMask?: boolean;
	isCoinbaseWallet?: boolean;
	isBraveWallet?: boolean;
	isRabby?: boolean;
	isTrust?: boolean;
	isTokenPocket?: boolean;
	providers?: WalletProvider[];
}

declare global {
	interface Window {
		ethereum?: WalletProvider;
	}
}

export interface DetectedWallet {
	id: string;
	name: string;
	icon: string;
	provider: WalletProvider | null;
	installed: boolean;
	deepLink?: string;
	downloadUrl?: string;
}

const POLYGON_CHAIN_ID = '0x89'; // 137 in hex

// Detect if we're on mobile
export function isMobile(): boolean {
	if (typeof window === 'undefined') return false;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detect if we're inside a wallet's in-app browser
export function isInWalletBrowser(): boolean {
	if (typeof window === 'undefined') return false;
	const ethereum = window.ethereum;
	return !!(ethereum && (ethereum.isMetaMask || ethereum.isCoinbaseWallet || ethereum.isTrust));
}

// Wallet configurations
function getWalletConfigs(): Record<string, Omit<DetectedWallet, 'provider' | 'installed'>> {
	const host = typeof window !== 'undefined' ? window.location.host : '';
	const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
	const fullUrl = typeof window !== 'undefined' ? window.location.href : '';

	return {
		metamask: {
			id: 'metamask',
			name: 'MetaMask',
			icon: '🦊',
			deepLink: `https://metamask.app.link/dapp/${host}${pathname}`,
			downloadUrl: 'https://metamask.io/download/'
		},
		coinbase: {
			id: 'coinbase',
			name: 'Coinbase Wallet',
			icon: '💙',
			deepLink: `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(fullUrl)}`,
			downloadUrl: 'https://www.coinbase.com/wallet/downloads'
		},
		trust: {
			id: 'trust',
			name: 'Trust Wallet',
			icon: '🛡️',
			deepLink: `https://link.trustwallet.com/open_url?coin_id=966&url=${encodeURIComponent(fullUrl)}`,
			downloadUrl: 'https://trustwallet.com/download'
		},
		brave: {
			id: 'brave',
			name: 'Brave Wallet',
			icon: '🦁',
			downloadUrl: 'https://brave.com/wallet/'
		},
		rabby: {
			id: 'rabby',
			name: 'Rabby Wallet',
			icon: '🐰',
			downloadUrl: 'https://rabby.io/'
		},
		injected: {
			id: 'injected',
			name: 'Browser Wallet',
			icon: '🔌'
		}
	};
}

// Detect all available wallets
export function detectWallets(): DetectedWallet[] {
	if (typeof window === 'undefined') return [];

	const wallets: DetectedWallet[] = [];
	const ethereum = window.ethereum;
	const mobile = isMobile();
	const configs = getWalletConfigs();

	// Handle multiple injected providers (EIP-5749)
	const providers: WalletProvider[] = ethereum?.providers || (ethereum ? [ethereum] : []);

	// Check for MetaMask
	const metamaskProvider = providers.find(p => p.isMetaMask && !p.isBraveWallet);
	wallets.push({
		...configs.metamask,
		provider: metamaskProvider || null,
		installed: !!metamaskProvider,
		deepLink: mobile ? configs.metamask.deepLink : undefined
	});

	// Check for Coinbase Wallet
	const coinbaseProvider = providers.find(p => p.isCoinbaseWallet);
	wallets.push({
		...configs.coinbase,
		provider: coinbaseProvider || null,
		installed: !!coinbaseProvider,
		deepLink: mobile ? configs.coinbase.deepLink : undefined
	});

	// Check for Trust Wallet
	const trustProvider = providers.find(p => p.isTrust);
	if (trustProvider || mobile) {
		wallets.push({
			...configs.trust,
			provider: trustProvider || null,
			installed: !!trustProvider,
			deepLink: mobile ? configs.trust.deepLink : undefined
		});
	}

	// Check for Brave Wallet (desktop only usually)
	const braveProvider = providers.find(p => p.isBraveWallet);
	if (braveProvider) {
		wallets.push({
			...configs.brave,
			provider: braveProvider,
			installed: true
		});
	}

	// Check for Rabby (desktop only)
	const rabbyProvider = providers.find(p => p.isRabby);
	if (rabbyProvider) {
		wallets.push({
			...configs.rabby,
			provider: rabbyProvider,
			installed: true
		});
	}

	// If we're in a wallet browser but none of the above matched, show generic injected
	if (ethereum && !wallets.some(w => w.installed)) {
		wallets.unshift({
			...configs.injected,
			provider: ethereum,
			installed: true
		});
	}

	return wallets;
}

// Get the best available wallet (for auto-connect scenarios)
export function getDefaultWallet(): DetectedWallet | null {
	const wallets = detectWallets();

	// If we're in a wallet browser, use that wallet
	if (isInWalletBrowser() && window.ethereum) {
		const installed = wallets.find(w => w.installed);
		if (installed) return installed;
	}

	// Otherwise return the first installed wallet
	return wallets.find(w => w.installed) || null;
}

// Connect to a specific wallet
export async function connectWallet(wallet?: DetectedWallet): Promise<string> {
	const mobile = isMobile();

	// If no wallet specified, try to get default
	if (!wallet) {
		wallet = getDefaultWallet() ?? undefined;
	}

	// On mobile, if wallet isn't installed, open deep link
	if (mobile && wallet && !wallet.installed && wallet.deepLink) {
		window.location.href = wallet.deepLink;
		// Wait a bit to see if the redirect happens
		await new Promise(resolve => setTimeout(resolve, 2000));
		throw new Error(`Opening ${wallet.name}... If the app doesn't open, please install it.`);
	}

	// Get the provider
	let provider: WalletProvider | undefined;

	if (wallet?.provider) {
		provider = wallet.provider;
	} else if (window.ethereum) {
		provider = window.ethereum;
	}

	if (!provider) {
		if (mobile) {
			throw new Error('No wallet detected. Please open this page in your wallet app or install a wallet.');
		}
		throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
	}

	try {
		// Request account access
		const accounts = await provider.request({
			method: 'eth_requestAccounts'
		});

		if (!accounts || accounts.length === 0) {
			throw new Error('No accounts found. Please unlock your wallet.');
		}

		// Switch to Polygon network
		await switchToPolygon(provider);

		return accounts[0];
	} catch (error: any) {
		// User rejected the request
		if (error.code === 4001) {
			throw new Error('Connection cancelled. Please try again.');
		}
		console.error('Error connecting wallet:', error);
		throw error;
	}
}

// Switch to Polygon network
async function switchToPolygon(provider: WalletProvider): Promise<void> {
	try {
		await provider.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: POLYGON_CHAIN_ID }]
		});
	} catch (switchError: any) {
		// Chain not added - add it
		if (switchError.code === 4902) {
			await provider.request({
				method: 'wallet_addEthereumChain',
				params: [
					{
						chainId: POLYGON_CHAIN_ID,
						chainName: 'Polygon Mainnet',
						nativeCurrency: {
							name: 'MATIC',
							symbol: 'MATIC',
							decimals: 18
						},
						rpcUrls: ['https://polygon-rpc.com/'],
						blockExplorerUrls: ['https://polygonscan.com/']
					}
				]
			});
		} else if (switchError.code !== 4001) {
			// Ignore user rejection, throw other errors
			throw switchError;
		}
	}
}

// Disconnect wallet (note: most wallets don't support programmatic disconnect)
export async function disconnectWallet(): Promise<void> {
	console.log('Please disconnect through your wallet interface');
}

// Listen for account changes
export function onAccountChange(callback: (accounts: string[]) => void): () => void {
	if (typeof window === 'undefined' || !window.ethereum?.on) {
		return () => { };
	}

	window.ethereum.on('accountsChanged', callback);

	return () => {
		window.ethereum?.removeListener?.('accountsChanged', callback);
	};
}

// Listen for chain changes
export function onChainChange(callback: (chainId: string) => void): () => void {
	if (typeof window === 'undefined' || !window.ethereum?.on) {
		return () => { };
	}

	window.ethereum.on('chainChanged', callback);

	return () => {
		window.ethereum?.removeListener?.('chainChanged', callback);
	};
}

// Check if already connected
export async function getConnectedAccount(): Promise<string | null> {
	if (typeof window === 'undefined' || !window.ethereum) {
		return null;
	}

	try {
		const accounts = await window.ethereum.request({
			method: 'eth_accounts'
		});
		return accounts?.[0] || null;
	} catch {
		return null;
	}
}

// Get token balance
export async function getTokenBalance(
	tokenAddress: string,
	walletAddress: string
): Promise<string> {
	if (!window.ethereum) {
		throw new Error('No wallet detected');
	}

	const provider = new BrowserProvider(window.ethereum);
	const erc20Abi = [
		'function balanceOf(address owner) view returns (uint256)',
		'function decimals() view returns (uint8)'
	];

	const contract = new Contract(tokenAddress, erc20Abi, provider);
	const balance = await contract.balanceOf(walletAddress);
	const decimals = await contract.decimals();

	// Convert balance to human-readable format
	const divisor = BigInt(10) ** BigInt(decimals);
	const wholePart = balance / divisor;
	const fractionalPart = balance % divisor;
	const fractionalStr = fractionalPart.toString().padStart(Number(decimals), '0');

	return `${wholePart}.${fractionalStr}`;
}

// Transfer tokens
export async function transferToken(
	tokenAddress: string,
	toAddress: string,
	amount: string
): Promise<string> {
	if (!window.ethereum) {
		throw new Error('No wallet detected');
	}

	const provider = new BrowserProvider(window.ethereum);
	const signer = await provider.getSigner();

	const erc20Abi = [
		'function transfer(address to, uint256 amount) returns (bool)',
		'function decimals() view returns (uint8)'
	];

	const contract = new Contract(tokenAddress, erc20Abi, signer);
	const decimals = await contract.decimals();

	// Convert amount to token units
	const [whole, fractional = '0'] = amount.split('.');
	const paddedFractional = fractional.padEnd(Number(decimals), '0');
	const amountInUnits = BigInt(whole + paddedFractional);

	const tx = await contract.transfer(toAddress, amountInUnits);
	await tx.wait();

	return tx.hash;
}
