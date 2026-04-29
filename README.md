# Hire Overseas Client Request Tracker

Internal tool for tracking and managing client staffing requests at Hire Overseas.

## Features

- **Request Management** — Create, view, and update client staffing requests
- **Status Tracking** — Track requests through the full lifecycle with status badges
- **Dashboard & Stats** — At-a-glance stat cards and filterable request table
- **Slack Notifications** — Ping Slack channels directly from request detail panels
- **Updates Log** — Audit trail of changes per request
- **Data Export** — Export request data to Excel (XLSX)
- **Cron Jobs** — Automated background tasks for reminders and status updates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite via `better-sqlite3`
- **Notifications**: Slack Web API
- **Scheduling**: `node-cron`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your environment variables:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_CHANNEL_ID=...
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The app runs on [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
