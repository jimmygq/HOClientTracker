const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/tracker.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = db;
