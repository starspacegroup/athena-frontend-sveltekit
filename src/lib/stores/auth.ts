import { writable } from 'svelte/store';

export interface User {
	walletAddress?: string;
	discordId?: string;
	discordUsername?: string;
	discordAvatar?: string;
}

export const user = writable<User | null>(null);
export const walletConnected = writable<boolean>(false);
export const discordConnected = writable<boolean>(false);
