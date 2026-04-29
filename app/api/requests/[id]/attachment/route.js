import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
const db = require('@/lib/db');
const queries = require('@/lib/queries');

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

export async function POST(request, { params }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPEG, and PDF files are allowed' }, { status: 400 });
    }

    const blob = await put(`attachments/${params.id}/${file.name}`, file, { access: 'public' });

    await db.execute({
      sql: 'UPDATE requests SET attachment_url = ?, last_updated = ? WHERE request_id = ?',
      args: [blob.url, new Date().toISOString(), params.id],
    });

    return NextResponse.json(await queries.getRequestById(params.id));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
