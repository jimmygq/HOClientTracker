require('dotenv').config();
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/tracker.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('Running schema migrations...');

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'General',
      status TEXT NOT NULL DEFAULT 'New',
      owner TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'Medium',
      date_started TEXT NOT NULL,
      due_date TEXT,
      last_updated TEXT NOT NULL,
      blockers TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS updates_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      author TEXT NOT NULL,
      note TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES requests(request_id)
    );
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      contact_name TEXT,
      contact_email TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      role TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  try {
    await db.execute('ALTER TABLE requests ADD COLUMN due_date TEXT');
  } catch (_) {}

  const count = await db.execute('SELECT COUNT(*) as c FROM team_members');
  if (Number(count.rows[0].c) === 0) {
    const now = new Date().toISOString();
    await db.batch([
      { sql: 'INSERT OR IGNORE INTO team_members (name, role, active, created_at) VALUES (?, ?, 1, ?)', args: ['James Gutierrez', 'Manager', now] },
      { sql: 'INSERT OR IGNORE INTO team_members (name, role, active, created_at) VALUES (?, ?, 1, ?)', args: ['Marge De Guzman', 'Coordinator', now] },
    ], 'write');
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
