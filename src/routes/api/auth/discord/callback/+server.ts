import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getSessionCookie,
	getSession,
	createSession,
	updateSession,
	setSessionCookie
} from '$lib/server/session';
import { getDatabaseService, inMemoryAccountService } from '$lib/server/db';
import { getDiscordOAuthConfig } from '$lib/server/discord';
import { env } from '$env/dynamic/private';

interface DiscordTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

interface DiscordUser {
	id: string;
	username: string;
	avatar: string | null;
}

export const GET: RequestHandler = async (event) => {
	const { url, cookies, platform } = event;
	const code = url.searchParams.get('code');

	if (!code) {
		throw redirect(302, '/?error=no_code');
	}

	try {
		const config = getDiscordOAuthConfig(env);
		// Exchange code for access token
		const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: config.clientId,
				client_secret: config.clientSecret,
				grant_type: 'authorization_code',
				code,
				redirect_uri: config.redirectUri
			})
		});

		if (!tokenResponse.ok) {
			throw new Error('Failed to exchange code for token');
		}

		const tokenData = await tokenResponse.json() as DiscordTokenResponse;

		// Get user info
		const userResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`
			}
		});

		if (!userResponse.ok) {
			throw new Error('Failed to get user info');
		}

		const userData = await userResponse.json() as DiscordUser;

		// Check if session exists
		const sessionId = getSessionCookie({ cookies } as any);
		let session;

		if (sessionId) {
			session = await getSession(sessionId, event);
		}

		const discordData = {
			discordId: userData.id,
			discordUsername: userData.username,
			discordAvatar: userData.avatar ?? undefined
		};

		// Link Discord to account - use D1 if available, otherwise in-memory fallback
		if (session?.walletAddress) {
			const db = getDatabaseService(platform);
			if (db) {
				await db.linkDiscordToAccount(
					session.walletAddress,
					userData.id,
					userData.username,
					userData.avatar ?? undefined
				);
			} else {
				// Use in-memory fallback for local development
				inMemoryAccountService.linkDiscordToAccount(
					session.walletAddress,
					userData.id,
					userData.username,
					userData.avatar ?? undefined
				);
			}
		}

		if (session && sessionId) {
			// Update existing session
			await updateSession(sessionId, discordData, event);
		} else {
			// Create new session
			const newSessionId = await createSession(discordData, event);
			setSessionCookie({ cookies } as any, newSessionId);
		}

	} catch (error) {
		console.error('Discord auth error:', error);
		throw redirect(302, '/?error=discord_auth_failed');
	}

	// Redirect to dashboard since user is now fully authenticated
	throw redirect(302, '/dashboard');
};
