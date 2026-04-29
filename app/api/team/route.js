import { NextResponse } from 'next/server';
const db = require('@/lib/db');

const now = () => new Date().toISOString();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sql = searchParams.get('active') === '1'
    ? 'SELECT * FROM team_members WHERE active=1 ORDER BY name ASC'
    : 'SELECT * FROM team_members ORDER BY name ASC';
  return NextResponse.json(db.prepare(sql).all());
}

export async function POST(request) {
  try {
    const { name, role } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    db.prepare('INSERT INTO team_members (name, role, active, created_at) VALUES (?, ?, 1, ?)')
      .run(name.trim(), role || null, now());
    return NextResponse.json(db.prepare('SELECT * FROM team_members WHERE name=?').get(name.trim()), { status: 201 });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return NextResponse.json({ error: 'Team member already exists' }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
