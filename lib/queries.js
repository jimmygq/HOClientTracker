const db = require('./db');

function generateRequestId() {
  const row = db.prepare('SELECT request_id FROM requests ORDER BY id DESC LIMIT 1').get();
  if (!row) return 'REQ-001';
  const num = parseInt(row.request_id.replace('REQ-', ''), 10);
  return `REQ-${String(num + 1).padStart(3, '0')}`;
}

const queries = {
  getAllRequests(filters = {}) {
    let sql = 'SELECT * FROM requests WHERE 1=1';
    const params = [];
    if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
    if (filters.owner) { sql += ' AND owner LIKE ?'; params.push(`%${filters.owner}%`); }
    if (filters.client) { sql += ' AND client_name LIKE ?'; params.push(`%${filters.client}%`); }
    if (filters.priority) { sql += ' AND priority = ?'; params.push(filters.priority); }
    if (filters.search) {
      sql += ' AND (title LIKE ? OR client_name LIKE ? OR request_id LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    sql += ' ORDER BY id DESC';
    return db.prepare(sql).all(...params);
  },

  getRequestById(requestId) {
    const request = db.prepare('SELECT * FROM requests WHERE request_id = ?').get(requestId);
    if (!request) return null;
    const updates = db.prepare('SELECT * FROM updates_log WHERE request_id = ? ORDER BY timestamp ASC').all(requestId);
    return { ...request, updates };
  },

  createRequest(data) {
    const now = new Date().toISOString();
    const request_id = generateRequestId();
    db.prepare(`
      INSERT INTO requests (request_id, client_name, title, type, status, owner, priority, date_started, due_date, last_updated, blockers, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      request_id, data.client_name, data.title,
      data.type || 'General', data.status || 'New', data.owner || '',
      data.priority || 'Medium', data.date_started || now.split('T')[0],
      data.due_date || null, now, data.blockers || null, now
    );
    return queries.getRequestById(request_id);
  },

  updateRequest(requestId, data) {
    const now = new Date().toISOString();
    const allowed = ['client_name', 'title', 'type', 'status', 'owner', 'priority', 'date_started', 'due_date', 'blockers'];
    const fields = Object.keys(data).filter(k => allowed.includes(k));
    if (fields.length === 0) return queries.getRequestById(requestId);
    const setClauses = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE requests SET ${setClauses}, last_updated = ? WHERE request_id = ?`)
      .run(...fields.map(f => data[f]), now, requestId);
    return queries.getRequestById(requestId);
  },

  softDeleteRequest(requestId) {
    const now = new Date().toISOString();
    db.prepare("UPDATE requests SET status = 'Cancelled', last_updated = ? WHERE request_id = ?").run(now, requestId);
    return queries.getRequestById(requestId);
  },

  addUpdate(requestId, author, note) {
    const now = new Date().toISOString();
    db.prepare('INSERT INTO updates_log (request_id, author, note, timestamp) VALUES (?, ?, ?, ?)').run(requestId, author, note, now);
    db.prepare('UPDATE requests SET last_updated = ? WHERE request_id = ?').run(now, requestId);
    return queries.getRequestById(requestId);
  },

  getStats() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return {
      totalOpen: db.prepare("SELECT COUNT(*) as c FROM requests WHERE status NOT IN ('Resolved','Cancelled')").get().c,
      blocked: db.prepare("SELECT COUNT(*) as c FROM requests WHERE status = 'Blocked'").get().c,
      highPriority: db.prepare("SELECT COUNT(*) as c FROM requests WHERE priority IN ('High','Urgent') AND status NOT IN ('Resolved','Cancelled')").get().c,
      resolvedThisWeek: db.prepare("SELECT COUNT(*) as c FROM requests WHERE status = 'Resolved' AND last_updated >= ?").get(oneWeekAgo).c,
      overdue: db.prepare("SELECT COUNT(*) as c FROM requests WHERE due_date IS NOT NULL AND due_date < ? AND status NOT IN ('Resolved','Cancelled')").get(today).c,
    };
  },

  getStaleRequests() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return db.prepare("SELECT * FROM requests WHERE status NOT IN ('Resolved','Cancelled') AND last_updated < ?").all(sevenDaysAgo);
  },
};

module.exports = queries;
