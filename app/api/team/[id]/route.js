import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function PUT(request, { params }) {
  try {
    const { name, role, active } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    db.prepare('UPDATE team_members SET name=?, role=?, active=? WHERE id=?')
      .run(name.trim(), role || null, active !== undefined ? (active ? 1 : 0) : 1, params.id);
    return NextResponse.json(db.prepare('SELECT * FROM team_members WHERE id=?').get(params.id));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return NextResponse.json({ error: 'Team member already exists' }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  db.prepare('DELETE FROM team_members WHERE id=?').run(params.id);
  return NextResponse.json({ ok: true });
}
