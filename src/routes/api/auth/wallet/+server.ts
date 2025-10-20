import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getSessionCookie,
	getSession,
	createSession,
	updateSession,
	setSessionCookie
} from '$lib/server/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { walletAddress } = await request.json();

		if (!walletAddress || !walletAddress.startsWith('0x')) {
			return json({ error: 'Invalid wallet address' }, { status: 400 });
		}

		// Check if session exists
		const sessionId = getSessionCookie({ cookies } as any);
		let session;

		if (sessionId) {
			session = await getSession(sessionId);
		}

		if (session && sessionId) {
			// Update existing session
			await updateSession(sessionId, { walletAddress });
			session.walletAddress = walletAddress;
		} else {
			// Create new session
			const newSessionId = await createSession({ walletAddress });
			setSessionCookie({ cookies } as any, newSessionId);
			session = { walletAddress };
		}

		return json({ user: session });
	} catch (error) {
		console.error('Wallet auth error:', error);
		return json({ error: 'Failed to authenticate' }, { status: 500 });
	}
};
