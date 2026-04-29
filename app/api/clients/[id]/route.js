import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function PUT(request, { params }) {
  try {
    const { name, contact_name, contact_email, notes } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    await db.execute({
      sql: 'UPDATE clients SET name=?, contact_name=?, contact_email=?, notes=? WHERE id=?',
      args: [name.trim(), contact_name || null, contact_email || null, notes || null, params.id],
    });
    const result = await db.execute({ sql: 'SELECT * FROM clients WHERE id=?', args: [params.id] });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return NextResponse.json({ error: 'A client with that name already exists' }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await db.execute({ sql: 'DELETE FROM clients WHERE id=?', args: [params.id] });
  return NextResponse.json({ ok: true });
}
