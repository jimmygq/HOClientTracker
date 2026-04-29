import { NextResponse } from 'next/server';
const queries = require('@/lib/queries');
const { sendSlackNotification } = require('@/lib/slackNotifier');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    return NextResponse.json(await queries.getAllRequests(filters));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { client_name, title, type, status, owner, priority, date_started, due_date, blockers } = body;
    if (!client_name || !title || !body.notes?.trim()) {
      return NextResponse.json({ error: 'client_name, title, and notes are required' }, { status: 400 });
    }
    const req = await queries.createRequest({ client_name, title, type, status, owner, priority, date_started, due_date, blockers });
    await sendSlackNotification(req, 'New request created');
    return NextResponse.json(req, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
