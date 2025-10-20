import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionCookie, getSession } from '$lib/server/session';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = getSessionCookie({ cookies } as any);

	if (!sessionId) {
		return json({ user: null }, { status: 401 });
	}

	const session = await getSession(sessionId);

	if (!session) {
		return json({ user: null }, { status: 401 });
	}

	return json({ user: session });
};
