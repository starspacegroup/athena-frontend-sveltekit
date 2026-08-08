import { describe, expect, it } from 'vitest';

import { createSession, getSession } from './session';

describe('auth session persistence', () => {
	it('keeps plain Vite development sessions in memory', async () => {
		const sessionId = await createSession({ walletAddress: '0xabc' });

		await expect(getSession(sessionId)).resolves.toEqual({ walletAddress: '0xabc' });
	});

	it('does not fall back to memory when a Cloudflare binding is missing', async () => {
		const event = { platform: { env: {} } } as Parameters<typeof createSession>[1];

		await expect(createSession({ walletAddress: '0xabc' }, event)).rejects.toThrow(
			'Cloudflare D1 binding "DB" is required'
		);
	});
});
