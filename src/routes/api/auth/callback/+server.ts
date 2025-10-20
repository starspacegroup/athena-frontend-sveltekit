import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getSessionCookie,
	getSession,
	createSession,
	updateSession,
	setSessionCookie
} from '$lib/server/session';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'your-discord-client-id';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'your-discord-client-secret';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5173/api/auth/callback';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		throw redirect(302, '/?error=no_code');
	}

	try {
		// Exchange code for access token
		const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: DISCORD_CLIENT_ID,
				client_secret: DISCORD_CLIENT_SECRET,
				grant_type: 'authorization_code',
				code,
				redirect_uri: REDIRECT_URI
			})
		});

		if (!tokenResponse.ok) {
			throw new Error('Failed to exchange code for token');
		}

		const tokenData = await tokenResponse.json();

		// Get user info
		const userResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`
			}
		});

		if (!userResponse.ok) {
			throw new Error('Failed to get user info');
		}

		const userData = await userResponse.json();

		// Check if session exists
		const sessionId = getSessionCookie({ cookies } as any);
		let session;

		if (sessionId) {
			session = await getSession(sessionId);
		}

		const discordData = {
			discordId: userData.id,
			discordUsername: userData.username,
			discordAvatar: userData.avatar
		};

		if (session && sessionId) {
			// Update existing session
			await updateSession(sessionId, discordData);
		} else {
			// Create new session
			const newSessionId = await createSession(discordData);
			setSessionCookie({ cookies } as any, newSessionId);
		}

		throw redirect(302, '/');
	} catch (error) {
		console.error('Discord auth error:', error);
		throw redirect(302, '/?error=discord_auth_failed');
	}
};
