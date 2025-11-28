import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getSessionCookie,
	getSession,
	createSession,
	updateSession,
	setSessionCookie
} from '$lib/server/session';
import { DatabaseService, inMemoryAccountService, type Account } from '$lib/server/db';

interface WalletAuthRequest {
	walletAddress: string;
}

export const POST: RequestHandler = async (event) => {
	const { request, cookies, platform } = event;
	try {
		const { walletAddress } = await request.json() as WalletAuthRequest;

		if (!walletAddress || !walletAddress.startsWith('0x')) {
			return json({ error: 'Invalid wallet address' }, { status: 400 });
		}

		// Create or get account - use D1 if available, otherwise in-memory fallback
		let account: Account | null = null;
		if (platform?.env?.DB) {
			const db = new DatabaseService(platform.env.DB);
			account = await db.getOrCreateAccountByWallet(walletAddress);
		} else {
			// Use in-memory fallback for local development
			account = inMemoryAccountService.getOrCreateAccountByWallet(walletAddress);
		}

		// Build session data including any existing Discord linkage
		const sessionData: {
			walletAddress: string;
			discordId?: string;
			discordUsername?: string;
			discordAvatar?: string;
		} = { walletAddress };

		// If account has Discord linked, include it in the session
		if (account?.discord_id) {
			sessionData.discordId = account.discord_id;
			sessionData.discordUsername = account.discord_username ?? undefined;
			sessionData.discordAvatar = account.discord_avatar ?? undefined;
		}

		// Check if session exists
		const sessionId = getSessionCookie({ cookies } as any);
		let session;

		if (sessionId) {
			session = await getSession(sessionId, event);
		}

		if (session && sessionId) {
			// Update existing session with wallet and any linked Discord data
			await updateSession(sessionId, sessionData, event);
			session = { ...session, ...sessionData };
		} else {
			// Create new session with wallet and any linked Discord data
			const newSessionId = await createSession(sessionData, event);
			setSessionCookie({ cookies } as any, newSessionId);
			session = sessionData;
		}

		return json({ user: session });
	} catch (error) {
		console.error('Wallet auth error:', error);
		return json({ error: 'Failed to authenticate' }, { status: 500 });
	}
};
