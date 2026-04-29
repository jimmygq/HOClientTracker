const db = require('./db');

async function generateRequestId() {
  const result = await db.execute('SELECT request_id FROM requests ORDER BY id DESC LIMIT 1');
  if (!result.rows.length) return 'REQ-001';
  const num = parseInt(result.rows[0].request_id.replace('REQ-', ''), 10);
  return `REQ-${String(num + 1).padStart(3, '0')}`;
}

const queries = {
  async getAllRequests(filters = {}) {
    let sql = 'SELECT * FROM requests WHERE 1=1';
    const args = [];
    if (filters.status) { sql += ' AND status = ?'; args.push(filters.status); }
    if (filters.owner) { sql += ' AND owner LIKE ?'; args.push(`%${filters.owner}%`); }
    if (filters.client) { sql += ' AND client_name LIKE ?'; args.push(`%${filters.client}%`); }
    if (filters.priority) { sql += ' AND priority = ?'; args.push(filters.priority); }
    if (filters.search) {
      sql += ' AND (title LIKE ? OR client_name LIKE ? OR request_id LIKE ?)';
      args.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    sql += ' ORDER BY id DESC';
    const result = await db.execute({ sql, args });
    return result.rows;
  },

  async getRequestById(requestId) {
    const [reqResult, updatesResult] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM requests WHERE request_id = ?', args: [requestId] }),
      db.execute({ sql: 'SELECT * FROM updates_log WHERE request_id = ? ORDER BY timestamp ASC', args: [requestId] }),
    ]);
    if (!reqResult.rows.length) return null;
    return { ...reqResult.rows[0], updates: updatesResult.rows };
  },

  async createRequest(data) {
    const now = new Date().toISOString();
    const request_id = await generateRequestId();
    await db.execute({
      sql: `INSERT INTO requests (request_id, client_name, title, type, status, owner, priority, date_started, due_date, last_updated, blockers, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        request_id, data.client_name, data.title,
        data.type || 'General', data.status || 'New', data.owner || '',
        data.priority || 'Medium', data.date_started || now.split('T')[0],
        data.due_date || null, now, data.blockers || null, now,
      ],
    });
    return queries.getRequestById(request_id);
  },

  async updateRequest(requestId, data) {
    const now = new Date().toISOString();
    const allowed = ['client_name', 'title', 'type', 'status', 'owner', 'priority', 'date_started', 'due_date', 'blockers'];
    const fields = Object.keys(data).filter(k => allowed.includes(k));
    if (fields.length === 0) return queries.getRequestById(requestId);
    const setClauses = fields.map(f => `${f} = ?`).join(', ');
    await db.execute({
      sql: `UPDATE requests SET ${setClauses}, last_updated = ? WHERE request_id = ?`,
      args: [...fields.map(f => data[f]), now, requestId],
    });
    return queries.getRequestById(requestId);
  },

  async softDeleteRequest(requestId) {
    const now = new Date().toISOString();
    await db.execute({
      sql: "UPDATE requests SET status = 'Cancelled', last_updated = ? WHERE request_id = ?",
      args: [now, requestId],
    });
    return queries.getRequestById(requestId);
  },

  async addUpdate(requestId, author, note) {
    const now = new Date().toISOString();
    await db.execute({
      sql: 'INSERT INTO updates_log (request_id, author, note, timestamp) VALUES (?, ?, ?, ?)',
      args: [requestId, author, note, now],
    });
    await db.execute({
      sql: 'UPDATE requests SET last_updated = ? WHERE request_id = ?',
      args: [now, requestId],
    });
    return queries.getRequestById(requestId);
  },

  async getStats() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const [totalOpen, blocked, highPriority, resolvedThisWeek, overdue] = await Promise.all([
      db.execute("SELECT COUNT(*) as c FROM requests WHERE status NOT IN ('Resolved','Cancelled')"),
      db.execute("SELECT COUNT(*) as c FROM requests WHERE status = 'Blocked'"),
      db.execute("SELECT COUNT(*) as c FROM requests WHERE priority IN ('High','Urgent') AND status NOT IN ('Resolved','Cancelled')"),
      db.execute({ sql: "SELECT COUNT(*) as c FROM requests WHERE status = 'Resolved' AND last_updated >= ?", args: [oneWeekAgo] }),
      db.execute({ sql: "SELECT COUNT(*) as c FROM requests WHERE due_date IS NOT NULL AND due_date < ? AND status NOT IN ('Resolved','Cancelled')", args: [today] }),
    ]);
    return {
      totalOpen: Number(totalOpen.rows[0].c),
      blocked: Number(blocked.rows[0].c),
      highPriority: Number(highPriority.rows[0].c),
      resolvedThisWeek: Number(resolvedThisWeek.rows[0].c),
      overdue: Number(overdue.rows[0].c),
    };
  },

  async getStaleRequests() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = await db.execute({
      sql: "SELECT * FROM requests WHERE status NOT IN ('Resolved','Cancelled') AND last_updated < ?",
      args: [sevenDaysAgo],
    });
    return result.rows;
  },
};

module.exports = queries;
