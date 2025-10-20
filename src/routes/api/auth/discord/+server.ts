import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'your-discord-client-id';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5173/api/auth/callback';

export const GET: RequestHandler = async () => {
	const params = new URLSearchParams({
		client_id: DISCORD_CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		response_type: 'code',
		scope: 'identify'
	});

	throw redirect(302, `https://discord.com/api/oauth2/authorize?${params.toString()}`);
};
