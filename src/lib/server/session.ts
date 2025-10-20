import type { RequestEvent } from '@sveltejs/kit';

export interface SessionData {
	walletAddress?: string;
	discordId?: string;
	discordUsername?: string;
	discordAvatar?: string;
}

const SESSION_COOKIE_NAME = 'athena_session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

// Simple session storage using a Map (in production, use KV or D1)
const sessions = new Map<string, SessionData>();

function generateSessionId(): string {
	return crypto.randomUUID();
}

export async function createSession(data: SessionData): Promise<string> {
	const sessionId = generateSessionId();
	sessions.set(sessionId, data);
	return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
	return sessions.get(sessionId) || null;
}

export async function updateSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
	const existing = sessions.get(sessionId);
	if (existing) {
		sessions.set(sessionId, { ...existing, ...data });
	}
}

export async function deleteSession(sessionId: string): Promise<void> {
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
