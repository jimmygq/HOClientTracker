import { NextResponse } from 'next/server';
const XLSX = require('xlsx');
const db = require('@/lib/db');

const now = () => new Date().toISOString();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    if (!/\.(csv|xls|xlsx)$/i.test(file.name)) {
      return NextResponse.json({ error: 'Only .csv, .xls, and .xlsx files are supported' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) return NextResponse.json({ error: 'The file is empty or has no data rows.' }, { status: 400 });

    function pick(row, ...keys) {
      for (const k of keys) {
        const found = Object.keys(row).find(rk => rk.toLowerCase().replace(/[\s_]/g, '') === k.toLowerCase().replace(/[\s_]/g, ''));
        if (found && row[found] !== '') return String(row[found]).trim();
      }
      return null;
    }

    let added = 0, skipped = 0;
    const stmts = [];

    for (const row of rows) {
      const name = pick(row, 'name', 'clientname', 'client', 'company', 'companyname');
      if (!name) { skipped++; continue; }
      stmts.push({
        sql: 'INSERT OR IGNORE INTO clients (name, contact_name, contact_email, notes, created_at) VALUES (?, ?, ?, ?, ?)',
        args: [
          name,
          pick(row, 'contactname', 'contact', 'contactperson', 'person'),
          pick(row, 'contactemail', 'email'),
          pick(row, 'notes', 'note', 'comments'),
          now(),
        ],
      });
    }

    if (stmts.length > 0) {
      const results = await db.batch(stmts, 'write');
      results.forEach(r => { r.rowsAffected > 0 ? added++ : skipped++; });
    }

    return NextResponse.json({ ok: true, added, skipped, total: rows.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
