import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function PUT(request, { params }) {
  try {
    const { name, role, active } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    await db.execute({
      sql: 'UPDATE team_members SET name=?, role=?, active=? WHERE id=?',
      args: [name.trim(), role || null, active !== undefined ? (active ? 1 : 0) : 1, params.id],
    });
    const result = await db.execute({ sql: 'SELECT * FROM team_members WHERE id=?', args: [params.id] });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return NextResponse.json({ error: 'Team member already exists' }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await db.execute({ sql: 'DELETE FROM team_members WHERE id=?', args: [params.id] });
  return NextResponse.json({ ok: true });
}
