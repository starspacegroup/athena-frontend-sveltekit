// Database service for D1 operations
// Handles account and session persistence

export interface Account {
  id: number;
  wallet_address: string;
  discord_id: string | null;
  discord_username: string | null;
  discord_avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSession {
  id: string;
  account_id: number | null;
  wallet_address: string | null;
  discord_id: string | null;
  discord_username: string | null;
  discord_avatar: string | null;
  expires_at: string;
  created_at: string;
}

// In-memory fallback for local development without D1
const inMemoryAccounts = new Map<string, Account>();
let accountIdCounter = 1;

export class InMemoryAccountService {
  getAccountByWallet(walletAddress: string): Account | null {
    return inMemoryAccounts.get(walletAddress.toLowerCase()) ?? null;
  }

  getOrCreateAccountByWallet(walletAddress: string): Account {
    const normalizedAddress = walletAddress.toLowerCase();
    const existing = inMemoryAccounts.get(normalizedAddress);
    if (existing) {
      return existing;
    }
    const account: Account = {
      id: accountIdCounter++,
      wallet_address: normalizedAddress,
      discord_id: null,
      discord_username: null,
      discord_avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryAccounts.set(normalizedAddress, account);
    return account;
  }

  linkDiscordToAccount(
    walletAddress: string,
    discordId: string,
    discordUsername: string,
    discordAvatar?: string
  ): Account {
    const normalizedAddress = walletAddress.toLowerCase();
    const account = inMemoryAccounts.get(normalizedAddress);
    if (!account) {
      throw new Error('Account not found');
    }
    account.discord_id = discordId;
    account.discord_username = discordUsername;
    account.discord_avatar = discordAvatar ?? null;
    account.updated_at = new Date().toISOString();
    inMemoryAccounts.set(normalizedAddress, account);
    return account;
  }
}

export const inMemoryAccountService = new InMemoryAccountService();

export class DatabaseService {
  constructor(private db: D1Database) { }

  // Account operations

  async getAccountByWallet(walletAddress: string): Promise<Account | null> {
    const result = await this.db
      .prepare('SELECT * FROM accounts WHERE wallet_address = ?')
      .bind(walletAddress.toLowerCase())
      .first<Account>();
    return result ?? null;
  }

  async getAccountByDiscordId(discordId: string): Promise<Account | null> {
    const result = await this.db
      .prepare('SELECT * FROM accounts WHERE discord_id = ?')
      .bind(discordId)
      .first<Account>();
    return result ?? null;
  }

  async createAccount(walletAddress: string): Promise<Account> {
    const result = await this.db
      .prepare(
        'INSERT INTO accounts (wallet_address) VALUES (?) RETURNING *'
      )
      .bind(walletAddress.toLowerCase())
      .first<Account>();

    if (!result) {
      throw new Error('Failed to create account');
    }
    return result;
  }

  async linkDiscordToAccount(
    walletAddress: string,
    discordId: string,
    discordUsername: string,
    discordAvatar?: string
  ): Promise<Account> {
    const result = await this.db
      .prepare(
        `UPDATE accounts 
				 SET discord_id = ?, discord_username = ?, discord_avatar = ?, updated_at = datetime('now')
				 WHERE wallet_address = ?
				 RETURNING *`
      )
      .bind(discordId, discordUsername, discordAvatar ?? null, walletAddress.toLowerCase())
      .first<Account>();

    if (!result) {
      throw new Error('Failed to link Discord to account');
    }
    return result;
  }

  async linkWalletToDiscordAccount(
    discordId: string,
    walletAddress: string
  ): Promise<Account> {
    const result = await this.db
      .prepare(
        `UPDATE accounts 
				 SET wallet_address = ?, updated_at = datetime('now')
				 WHERE discord_id = ?
				 RETURNING *`
      )
      .bind(walletAddress.toLowerCase(), discordId)
      .first<Account>();

    if (!result) {
      throw new Error('Failed to link wallet to account');
    }
    return result;
  }

  async getOrCreateAccountByWallet(walletAddress: string): Promise<Account> {
    const existing = await this.getAccountByWallet(walletAddress);
    if (existing) {
      return existing;
    }
    return this.createAccount(walletAddress);
  }

  // Session operations

  async createSession(
    sessionId: string,
    data: {
      accountId?: number;
      walletAddress?: string;
      discordId?: string;
      discordUsername?: string;
      discordAvatar?: string;
    },
    ttlSeconds: number = 60 * 60 * 24 * 7 // 7 days
  ): Promise<DbSession> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO sessions (id, account_id, wallet_address, discord_id, discord_username, discord_avatar, expires_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?)
				 RETURNING *`
      )
      .bind(
        sessionId,
        data.accountId ?? null,
        data.walletAddress?.toLowerCase() ?? null,
        data.discordId ?? null,
        data.discordUsername ?? null,
        data.discordAvatar ?? null,
        expiresAt
      )
      .first<DbSession>();

    if (!result) {
      throw new Error('Failed to create session');
    }
    return result;
  }

  async getSession(sessionId: string): Promise<DbSession | null> {
    const result = await this.db
      .prepare(
        `SELECT * FROM sessions 
				 WHERE id = ? AND expires_at > datetime('now')`
      )
      .bind(sessionId)
      .first<DbSession>();
    return result ?? null;
  }

  async updateSession(
    sessionId: string,
    data: {
      accountId?: number;
      walletAddress?: string;
      discordId?: string;
      discordUsername?: string;
      discordAvatar?: string;
    }
  ): Promise<DbSession | null> {
    const result = await this.db
      .prepare(
        `UPDATE sessions 
				 SET account_id = COALESCE(?, account_id),
				     wallet_address = COALESCE(?, wallet_address),
				     discord_id = COALESCE(?, discord_id),
				     discord_username = COALESCE(?, discord_username),
				     discord_avatar = COALESCE(?, discord_avatar)
				 WHERE id = ? AND expires_at > datetime('now')
				 RETURNING *`
      )
      .bind(
        data.accountId ?? null,
        data.walletAddress?.toLowerCase() ?? null,
        data.discordId ?? null,
        data.discordUsername ?? null,
        data.discordAvatar ?? null,
        sessionId
      )
      .first<DbSession>();
    return result ?? null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE id = ?')
      .bind(sessionId)
      .run();
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.db
      .prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')")
      .run();
    return result.meta.changes ?? 0;
  }
}
