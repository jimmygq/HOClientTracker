import { NextResponse } from 'next/server';
const queries = require('@/lib/queries');
const { sendSlackNotification } = require('@/lib/slackNotifier');

export async function POST(request, { params }) {
  try {
    const req = queries.getRequestById(params.id);
    if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    const { author } = await request.json();
    await sendSlackNotification(req, `:bell: Manual ping — current status: ${req.status}`, author || 'Team');
    return NextResponse.json({ ok: true, message: 'Slack notification sent.' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
