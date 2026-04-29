import { NextResponse } from 'next/server';
const queries = require('@/lib/queries');
const { sendSlackNotification } = require('@/lib/slackNotifier');

export async function GET(request, { params }) {
  try {
    const req = await queries.getRequestById(params.id);
    if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    return NextResponse.json(req);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const existing = await queries.getRequestById(params.id);
    if (!existing) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    const body = await request.json();
    const updated = await queries.updateRequest(params.id, body);
    const author = body._author || null;

    if (updated.status !== existing.status) {
      if (updated.status === 'Blocked') {
        await sendSlackNotification(updated, ':rotating_light: Request marked as BLOCKED', author);
      } else if (updated.status === 'Resolved') {
        await sendSlackNotification(updated, ':white_check_mark: Request RESOLVED', author);
      }
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const existing = await queries.getRequestById(params.id);
    if (!existing) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    return NextResponse.json(await queries.softDeleteRequest(params.id));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
