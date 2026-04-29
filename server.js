/**
 * Custom Next.js server — starts the cron job scheduler alongside Next.js.
 * Required for the daily stale-request Slack digest to run.
 * Run with: node server.js  (dev) or NODE_ENV=production node server.js (prod)
 */
require('dotenv').config();

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const { startCronJobs } = require('./lib/cronJobs');
  startCronJobs();

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`Hire Overseas Tracker ready on http://localhost:${port}`);
  });
});
