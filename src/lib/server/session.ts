import type { RequestEvent } from '@sveltejs/kit';
import { DatabaseService } from './db';

export interface SessionData {
	walletAddress?: string;
	discordId?: string;
	discordUsername?: string;
	discordAvatar?: string;
}

const SESSION_COOKIE_NAME = 'athena_session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

// Fallback in-memory storage for local development without D1
const sessions = new Map<string, SessionData>();

function generateSessionId(): string {
	return crypto.randomUUID();
}

function getDb(event: RequestEvent): DatabaseService | null {
	const db = event.platform?.env?.DB;
	if (db) {
		return new DatabaseService(db);
	}
	return null;
}

export async function createSession(data: SessionData, event?: RequestEvent): Promise<string> {
	const sessionId = generateSessionId();

	// Try to use D1 if available
	if (event) {
		const db = getDb(event);
		if (db) {
			await db.createSession(sessionId, {
				walletAddress: data.walletAddress,
				discordId: data.discordId,
				discordUsername: data.discordUsername,
				discordAvatar: data.discordAvatar
			}, SESSION_TTL);
			return sessionId;
		}
	}

	// Fallback to in-memory storage
	sessions.set(sessionId, data);
	return sessionId;
}

export async function getSession(sessionId: string, event?: RequestEvent): Promise<SessionData | null> {
	// Try to use D1 if available
	if (event) {
		const db = getDb(event);
		if (db) {
			const session = await db.getSession(sessionId);
			if (session) {
				return {
					walletAddress: session.wallet_address ?? undefined,
					discordId: session.discord_id ?? undefined,
					discordUsername: session.discord_username ?? undefined,
					discordAvatar: session.discord_avatar ?? undefined
				};
			}
			return null;
		}
	}

	// Fallback to in-memory storage
	return sessions.get(sessionId) || null;
}

export async function updateSession(sessionId: string, data: Partial<SessionData>, event?: RequestEvent): Promise<void> {
	// Try to use D1 if available
	if (event) {
		const db = getDb(event);
		if (db) {
			await db.updateSession(sessionId, {
				walletAddress: data.walletAddress,
				discordId: data.discordId,
				discordUsername: data.discordUsername,
				discordAvatar: data.discordAvatar
			});
			return;
		}
	}

	// Fallback to in-memory storage
	const existing = sessions.get(sessionId);
	if (existing) {
		sessions.set(sessionId, { ...existing, ...data });
	}
}

export async function deleteSession(sessionId: string, event?: RequestEvent): Promise<void> {
	// Try to use D1 if available
	if (event) {
		const db = getDb(event);
		if (db) {
			await db.deleteSession(sessionId);
			return;
		}
	}

	// Fallback to in-memory storage
	sessions.delete(sessionId);
}

export function setSessionCookie(event: RequestEvent, sessionId: string): void {
	event.cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: SESSION_TTL
	});
}

export function getSessionCookie(event: RequestEvent): string | undefined {
	return event.cookies.get(SESSION_COOKIE_NAME);
}

export function deleteSessionCookie(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE_NAME, {
		path: '/'
	});
}
