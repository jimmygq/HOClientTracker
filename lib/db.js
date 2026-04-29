const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function createDb() {
  const projectRoot = process.cwd();
  const rawDbPath = process.env.DATABASE_PATH || './data/tracker.db';
  const dbPath = path.isAbsolute(rawDbPath) ? rawDbPath : path.join(projectRoot, rawDbPath);
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = new Database(dbPath);

  db.exec(`
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

  // Safe migration: add due_date if missing
  try { db.exec('ALTER TABLE requests ADD COLUMN due_date TEXT'); } catch (_) {}

  // Seed default team members
  if (db.prepare('SELECT COUNT(*) as c FROM team_members').get().c === 0) {
    const now = new Date().toISOString();
    const ins = db.prepare('INSERT OR IGNORE INTO team_members (name, role, active, created_at) VALUES (?, ?, 1, ?)');
    ins.run('James Gutierrez', 'Manager', now);
    ins.run('Marge De Guzman', 'Coordinator', now);
  }

  return db;
}

// Singleton — safe across Next.js hot reloads
if (!globalThis.__trackerDb) globalThis.__trackerDb = createDb();
module.exports = globalThis.__trackerDb;
