const { createClient } = require('@libsql/client/web');

let _client;

function getClient() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

// Proxy defers client creation until the first actual DB call (at request time,
// not at build time when env vars aren't available).
const db = new Proxy({}, {
  get(_, prop) {
    const client = getClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

module.exports = db;
