import { NextResponse } from 'next/server';
const queries = require('@/lib/queries');

export async function POST(request, { params }) {
  try {
    const { author, note } = await request.json();
    if (!author || !note) {
      return NextResponse.json({ error: 'author and note are required' }, { status: 400 });
    }
    if (!await queries.getRequestById(params.id)) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    return NextResponse.json(await queries.addUpdate(params.id, author, note), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
