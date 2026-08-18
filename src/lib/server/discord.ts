export function getDiscordOAuthConfig(env: Record<string, string | undefined>): {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
} {
	const clientId = env.DISCORD_CLIENT_ID;
	const clientSecret = env.DISCORD_CLIENT_SECRET;
	const redirectUri = env.DISCORD_REDIRECT_URI;

	if (!clientId || !clientSecret || !redirectUri) {
		throw new Error('Discord OAuth environment is not configured');
	}

	return { clientId, clientSecret, redirectUri };
}
