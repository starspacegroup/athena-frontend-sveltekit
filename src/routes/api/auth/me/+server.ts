import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionCookie, getSession, updateSession } from '$lib/server/session';
import { DatabaseService, inMemoryAccountService } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
	const { cookies, platform } = event;
	const sessionId = getSessionCookie({ cookies } as any);

	if (!sessionId) {
		return json({ user: null }, { status: 401 });
	}

	const session = await getSession(sessionId, event);

	if (!session) {
		return json({ user: null }, { status: 401 });
	}

	// If wallet is connected, check for any linked Discord data
	// that might not be in the session yet
	if (session.walletAddress) {
		let account = null;

		if (platform?.env?.DB) {
			const db = new DatabaseService(platform.env.DB);
			account = await db.getAccountByWallet(session.walletAddress);
		} else {
			// Use in-memory fallback for local development
			account = inMemoryAccountService.getAccountByWallet(session.walletAddress);
		}

		// If account has Discord linked but session doesn't, update the session
		if (account?.discord_id && !session.discordId) {
			const discordData = {
				discordId: account.discord_id,
				discordUsername: account.discord_username ?? undefined,
				discordAvatar: account.discord_avatar ?? undefined
			};
			await updateSession(sessionId, discordData, event);
			return json({
				user: {
					...session,
					...discordData
				}
			});
		}
	}

	return json({ user: session });
};
