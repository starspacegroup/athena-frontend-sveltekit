import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionCookie, getSession } from '$lib/server/session';

// Mock token addresses (replace with actual contract addresses on Polygon)
const SPACETIME_TOKEN_ADDRESS = process.env.SPACETIME_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000001';
const SPACEMONEY_TOKEN_ADDRESS = process.env.SPACEMONEY_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000002';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = getSessionCookie({ cookies } as any);

	if (!sessionId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const session = await getSession(sessionId);

	if (!session || !session.walletAddress) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// In production, these would be fetched from the blockchain
	// For now, return mock balances
	return json({
		spaceTime: '100.0',
		spaceMoney: '50.0'
	});
};
