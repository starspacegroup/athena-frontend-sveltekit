declare global {
	namespace App {
		interface Locals {
			user?: {
				walletAddress?: string;
				discordId?: string;
				discordUsername?: string;
			};
		}
		interface Platform {
			env: {
				DB: D1Database;
				DISCORD_CLIENT_ID: string;
				DISCORD_CLIENT_SECRET: string;
				SESSION_SECRET: string;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
