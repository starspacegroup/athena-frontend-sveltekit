import { writable } from 'svelte/store';

export interface TokenBalances {
	spaceTime: string;
	spaceMoney: string;
}

export const tokenBalances = writable<TokenBalances>({
	spaceTime: '0',
	spaceMoney: '0'
});
