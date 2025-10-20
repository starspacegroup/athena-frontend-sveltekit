import { BrowserProvider, Contract } from 'ethers';

export interface WalletProvider {
	request: (args: { method: string; params?: any[] }) => Promise<any>;
	on?: (event: string, handler: (...args: any[]) => void) => void;
	removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
	interface Window {
		ethereum?: WalletProvider;
		coinbaseWalletExtension?: WalletProvider;
	}
}

const POLYGON_CHAIN_ID = '0x89'; // 137 in hex

export async function connectWallet(preferredWallet?: 'metamask' | 'coinbase'): Promise<string> {
	let provider: WalletProvider | undefined;

	if (preferredWallet === 'coinbase' && window.coinbaseWalletExtension) {
		provider = window.coinbaseWalletExtension;
	} else if (window.ethereum) {
		provider = window.ethereum;
	}

	if (!provider) {
		throw new Error('No wallet detected. Please install MetaMask or Coinbase Wallet.');
	}

	try {
		// Request account access
		const accounts = await provider.request({
			method: 'eth_requestAccounts'
		});

		// Switch to Polygon network
		try {
			await provider.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: POLYGON_CHAIN_ID }]
			});
		} catch (switchError: any) {
			// This error code indicates that the chain has not been added to the wallet
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
			} else {
				throw switchError;
			}
		}

		return accounts[0];
	} catch (error) {
		console.error('Error connecting wallet:', error);
		throw error;
	}
}

export async function disconnectWallet(): Promise<void> {
	// Note: Most wallets don't support programmatic disconnection
	// Users need to disconnect through the wallet interface
	console.log('Please disconnect through your wallet interface');
}

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
