import { describe, expect, it, vi } from 'vitest';

import { DatabaseService, getDatabaseService, inMemoryAccountService } from './db';

describe('persistence selection', () => {
	it('uses in-memory accounts only when the Cloudflare platform is absent', () => {
		expect(getDatabaseService(undefined)).toBeNull();

		const account = inMemoryAccountService.getOrCreateAccountByWallet('0xABC');
		expect(inMemoryAccountService.getAccountByWallet('0xabc')).toBe(account);
	});

	it('uses the DB binding when Cloudflare provides it', () => {
		const d1 = { prepare: vi.fn() } as unknown as D1Database;
		const service = getDatabaseService({ env: { DB: d1 } } as App.Platform);

		expect(service).toBeInstanceOf(DatabaseService);
	});

	it('fails closed when Cloudflare is present without DB', () => {
		expect(() => getDatabaseService({ env: {} } as App.Platform)).toThrow(
			'Cloudflare D1 binding "DB" is required'
		);
	});
});
