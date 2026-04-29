import { NextResponse } from 'next/server';
const queries = require('@/lib/queries');

export async function GET() {
  try {
    return NextResponse.json(queries.getStats());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
