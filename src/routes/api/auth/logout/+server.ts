import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionCookie, deleteSession, deleteSessionCookie } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = getSessionCookie({ cookies } as any);

	if (sessionId) {
		await deleteSession(sessionId);
	}

	deleteSessionCookie({ cookies } as any);

	return json({ success: true });
};
