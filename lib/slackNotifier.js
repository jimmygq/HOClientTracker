const axios = require('axios');
const { WebClient } = require('@slack/web-api');

function daysOpen(dateStarted) {
  return Math.floor((Date.now() - new Date(dateStarted)) / (1000 * 60 * 60 * 24));
}

function buildBlocks(request, eventText, author) {
  const days = daysOpen(request.date_started);
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const footer = author ? `Updated by ${author} at ${timestamp} ET` : `${timestamp} ET`;

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: `${request.request_id} — ${request.title}`, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `*${eventText}*` } },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Client:*\n${request.client_name}` },
        { type: 'mrkdwn', text: `*Status:*\n${request.status}` },
        { type: 'mrkdwn', text: `*Owner:*\n${request.owner || 'Unassigned'}` },
        { type: 'mrkdwn', text: `*Days Open:*\n${days} day${days !== 1 ? 's' : ''}` },
        { type: 'mrkdwn', text: `*Priority:*\n${request.priority}` },
        { type: 'mrkdwn', text: `*Type:*\n${request.type}` },
      ],
    },
  ];

  if (request.blockers) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `:rotating_light: *Blocker:* ${request.blockers}` } });
  }
  if (request.due_date) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `:calendar: *Due Date:* ${request.due_date}` } });
  }

  blocks.push({ type: 'divider' });
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: footer }] });
  return blocks;
}

async function sendSlackNotification(request, eventText, author = null) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (!webhookUrl && !botToken) {
    console.log('[Slack] No credentials configured — skipping notification.');
    return;
  }

  const blocks = buildBlocks(request, eventText, author);
  const text = `${request.request_id}: ${eventText}`;

  try {
    if (botToken && channelId) {
      const client = new WebClient(botToken);
      await client.chat.postMessage({ channel: channelId, text, blocks });
    } else {
      await axios.post(webhookUrl, { text, blocks });
    }
    console.log(`[Slack] Sent: ${request.request_id} — ${eventText}`);
  } catch (err) {
    console.error('[Slack] Failed:', err.message);
  }
}

async function sendStaleDigest(requests) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;
  if ((!webhookUrl && !botToken) || requests.length === 0) return;

  const lines = requests.map(r => {
    const days = daysOpen(r.date_started);
    return `• *${r.request_id}* — ${r.title} (${r.client_name}) — ${days} days open — Owner: ${r.owner || 'Unassigned'}`;
  }).join('\n');

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: ':alarm_clock: Stale Request Daily Digest', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `*${requests.length}* request${requests.length !== 1 ? 's have' : ' has'} had no updates in 7+ days:\n\n${lines}` } },
    { type: 'divider' },
    { type: 'context', elements: [{ type: 'mrkdwn', text: `Sent at ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET` }] },
  ];

  try {
    if (botToken && channelId) {
      const client = new WebClient(botToken);
      await client.chat.postMessage({ channel: channelId, text: 'Stale Request Daily Digest', blocks });
    } else {
      await axios.post(webhookUrl, { text: 'Stale Request Daily Digest', blocks });
    }
    console.log(`[Slack] Stale digest sent for ${requests.length} requests.`);
  } catch (err) {
    console.error('[Slack] Failed to send digest:', err.message);
  }
}

module.exports = { sendSlackNotification, sendStaleDigest };
