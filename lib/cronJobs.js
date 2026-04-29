const cron = require('node-cron');
const queries = require('./queries');
const { sendStaleDigest } = require('./slackNotifier');

function startCronJobs() {
  // Daily at 9:00 AM — stale request digest
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running stale request check...');
    const stale = queries.getStaleRequests();
    await sendStaleDigest(stale);
  });
  console.log('[Cron] Scheduled: daily stale-request digest at 9:00 AM.');
}

module.exports = { startCronJobs };
