-- Migration: 0001_initial_accounts
-- Description: Create accounts table to store wallet and Discord connections

CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT UNIQUE NOT NULL,
    discord_id TEXT UNIQUE,
    discord_username TEXT,
    discord_avatar TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for faster lookups by wallet address
CREATE INDEX IF NOT EXISTS idx_accounts_wallet ON accounts(wallet_address);

-- Index for faster lookups by discord id
CREATE INDEX IF NOT EXISTS idx_accounts_discord ON accounts(discord_id);

-- Sessions table for persistent session storage
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    account_id INTEGER,
    wallet_address TEXT,
    discord_id TEXT,
    discord_username TEXT,
    discord_avatar TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Index for session expiry cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
