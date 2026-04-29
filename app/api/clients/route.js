import { NextResponse } from 'next/server';
const db = require('@/lib/db');

const now = () => new Date().toISOString();

export async function GET() {
  const result = await db.execute('SELECT * FROM clients ORDER BY name ASC');
  return NextResponse.json(result.rows);
}

export async function POST(request) {
  try {
    const { name, contact_name, contact_email, notes } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    await db.execute({
      sql: 'INSERT INTO clients (name, contact_name, contact_email, notes, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [name.trim(), contact_name || null, contact_email || null, notes || null, now()],
    });
    const result = await db.execute({ sql: 'SELECT * FROM clients WHERE name = ?', args: [name.trim()] });
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return NextResponse.json({ error: 'A client with that name already exists' }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
