import { describe, expect, it, vi } from 'vitest';

import { GET as getBalances } from './balances/+server';
import { POST as purchase } from './purchase/+server';
import { POST as transfer } from './transfer/+server';
import { getSession } from '$lib/server/session';

vi.mock('$lib/server/session', () => ({
	getSessionCookie: vi.fn(() => 'session-id'),
	getSession: vi.fn(() => ({ walletAddress: '0xabc' }))
}));

describe('token endpoint persistence', () => {
	it.each([
		['balances', getBalances, undefined],
		['purchase', purchase, { amount: '10' }],
		['transfer', transfer, { toAddress: '0xdef', amount: '10' }]
	])('passes the request event to session storage for %s', async (_name, handler, body) => {
		const event = {
			cookies: {},
			request: new Request('http://localhost/api/tokens', {
				method: body ? 'POST' : 'GET',
				body: body ? JSON.stringify(body) : undefined
			})
		};

		await (handler as (event: unknown) => Promise<Response>)(event);

		expect(getSession).toHaveBeenCalledWith('session-id', event);
		vi.mocked(getSession).mockClear();
	});
});
