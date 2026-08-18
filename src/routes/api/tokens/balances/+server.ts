import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionCookie, getSession } from '$lib/server/session';

export const GET: RequestHandler = async (event) => {
	const { cookies } = event;
	const sessionId = getSessionCookie({ cookies } as any);

	if (!sessionId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const session = await getSession(sessionId, event);

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
