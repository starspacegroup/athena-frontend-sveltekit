import { describe, expect, it } from 'vitest';

import { getDiscordOAuthConfig } from './discord';

describe('Discord OAuth configuration', () => {
	it('returns a complete configuration', () => {
		expect(
			getDiscordOAuthConfig({
				DISCORD_CLIENT_ID: 'id',
				DISCORD_CLIENT_SECRET: 'secret',
				DISCORD_REDIRECT_URI: 'http://localhost:4222/api/auth/callback'
			})
		).toEqual({
			clientId: 'id',
			clientSecret: 'secret',
			redirectUri: 'http://localhost:4222/api/auth/callback'
		});
	});

	it('fails closed when any OAuth variable is absent', () => {
		expect(() => getDiscordOAuthConfig({ DISCORD_CLIENT_ID: 'id' })).toThrow(
			'Discord OAuth environment is not configured'
		);
	});
});
