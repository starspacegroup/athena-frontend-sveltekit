import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getDiscordOAuthConfig } from '$lib/server/discord';

export const GET: RequestHandler = async () => {
	const config = getDiscordOAuthConfig(env);
	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		response_type: 'code',
		scope: 'identify'
	});

	throw redirect(302, `https://discord.com/api/oauth2/authorize?${params.toString()}`);
};
