import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionCookie, getSession } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const sessionId = getSessionCookie({ cookies } as any);

	if (!sessionId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const session = await getSession(sessionId);

	if (!session || !session.walletAddress) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { amount } = await request.json();

		if (!amount || parseFloat(amount) <= 0) {
			return json({ error: 'Invalid amount' }, { status: 400 });
		}

		// In production, this would interact with the smart contract
		// For now, return a mock transaction hash
		const mockTxHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');

		return json({
			success: true,
			txHash: mockTxHash,
			amount
		});
	} catch (error) {
		console.error('Purchase error:', error);
		return json({ error: 'Failed to purchase tokens' }, { status: 500 });
	}
};
