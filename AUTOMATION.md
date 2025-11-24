# 🤖 PricePulse Automation Guide

This guide explains how to set up automated price checking and alerting for your PricePulse application.

## Overview

PricePulse automatically:

- ✅ Checks prices of all tracked products every **30 minutes**
- ✅ Updates price history in the database
- ✅ Sends email alerts when prices drop below target prices
- ✅ Prevents duplicate alerts for the same price drop

## Quick Setup (100% FREE Options)

### Option 1: GitHub Actions (Recommended - Completely Free! 🎉)

GitHub Actions is **completely free** for public repositories and offers 2000 free minutes/month for private repos. This is the best free solution!

**Setup Steps:**

1. **The workflow file is already created!** ✅ Check `.github/workflows/price-check-cron.yml`

2. **Add GitHub Secrets:**

   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add these secrets:
     - `APP_URL`: Your deployed app URL (e.g., `https://amazon-pricepulse.vercel.app`)
     - `CRON_SECRET`: Generate with `openssl rand -base64 32`

3. **Push to GitHub** - The workflow will automatically start running every 30 minutes!

4. **Verify it's working:**
   - Go to your GitHub repo → Actions tab
   - You'll see "Price Check Cron Job" workflow running
   - Click on it to see execution logs

**Benefits:**

- ✅ Completely free for public repos
- ✅ 2000 free minutes/month for private repos (more than enough!)
- ✅ Built-in logging and monitoring
- ✅ Can manually trigger from GitHub UI
- ✅ No external service needed

### Option 2: Cron-job.org (Free Tier Available)

**Setup Steps:**

1. **Sign up** at [cron-job.org](https://cron-job.org/) (free account)

2. **Create a new cron job:**

   - **Title**: PricePulse Price Checker
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Schedule**: `*/30 * * * *` (every 30 minutes)
   - **Request Method**: GET
   - **Status**: Active

3. **Free Tier Limits:**
   - ✅ 2 cron jobs
   - ✅ Execution every 1 minute minimum
   - ✅ Email notifications on failures

### Option 3: EasyCron (Free Tier Available)

1. **Sign up** at [EasyCron](https://www.easycron.com/)

2. **Create a new cron job:**

   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Cron Expression**: `*/30 * * * *`
   - **HTTP Method**: GET

3. **Free Tier Limits:**
   - ✅ 1 cron job
   - ✅ Execution every 1 minute minimum

### Option 4: UptimeRobot (Free Tier Available)

1. **Sign up** at [UptimeRobot](https://uptimerobot.com/)

2. **Create a new monitor:**

   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Monitoring Interval**: 30 minutes

3. **Free Tier Limits:**
   - ✅ 50 monitors
   - ✅ 5-minute minimum interval

### For Local Development

Run the local cron script:

```bash
npm run cron:dev
```

This will:

- Run price checks every 30 minutes
- Execute an initial check immediately
- Keep running until you stop it (Ctrl+C)

**Requirements:**

- Make sure `.env.local` has all required variables:
  - `MONGODB_URI`
  - `SCRAPER_API_KEY`
  - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`

## Security

The cron endpoint is protected by a secret token:

- **GitHub Actions**: Uses GitHub Secrets (secure and encrypted)
- **External Services**: Use the `?secret=YOUR_CRON_SECRET` query parameter
- **Local Testing**: No authentication needed (development only)

**Important**:

- Never commit your `CRON_SECRET` to version control!
- Use GitHub Secrets for GitHub Actions (Settings → Secrets → Actions)
- Keep your secret secure and rotate it periodically

## How It Works

1. **Cron Job Triggers** → Calls `/api/cron` endpoint
2. **Scheduler Service** → Fetches all tracked products from database
3. **Scraper Service** → Scrapes current price for each product (in batches of 5)
4. **Price History** → Saves new price to history collection
5. **Alert Service** → Checks if price dropped below target
6. **Email Service** → Sends alert email if conditions are met

## Monitoring

### Check Cron Job Status

**GitHub Actions:**

- Go to your repo → Actions tab
- Click on "Price Check Cron Job" workflow
- View execution history, logs, and timing

**External Services:**

- Check the service dashboard for execution logs
- Monitor your application logs for scheduler output

### View Execution Logs

The scheduler logs detailed information:

- ✅ Number of products processed
- ✅ Success/failure counts
- ✅ Alert notifications sent
- ❌ Any errors encountered

Example log output:

```
🕐 Starting scheduled price tracking...
📊 Found 10 products to process
📦 Processing batch 1/2
✅ Updated: Product Name @ ₹999
📧 Alert sent to user@example.com
✅ Scheduler completed: 10 succeeded, 0 failed
```

## Troubleshooting

### Cron Job Not Running

**For GitHub Actions:**

1. **Check Actions tab** - Verify workflow is enabled and running
2. **Check GitHub Secrets** - Ensure `APP_URL` and `CRON_SECRET` are set
3. **Check workflow file** - Ensure `.github/workflows/price-check-cron.yml` exists
4. **Check logs** - Click on failed runs to see error messages

**For External Services:**

1. **Check service dashboard** - Verify cron job is active
2. **Check URL** - Ensure the endpoint URL is correct
3. **Check secret** - Verify `CRON_SECRET` matches
4. **Check app logs** - Review your application logs for errors

### No Alerts Being Sent

1. **Check email configuration** - Verify SMTP settings in `.env.local`
2. **Check alert creation** - Ensure alerts are created when tracking products
3. **Check price drops** - Verify prices are actually below target
4. **Check email service logs** - Look for email sending errors

### Rate Limiting Issues

If you have many products:

- The scheduler processes products in batches of 5
- There's a 3-second delay between batches
- Adjust batch size in `schedulerService.ts` if needed

## Manual Testing

You can manually trigger the scheduler:

```bash
# Using curl
curl https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET

# Or visit in browser (if secret is set)
https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET
```

## Schedule Customization

To change the frequency, update:

**GitHub Actions**: Edit `.github/workflows/price-check-cron.yml`:

```yaml
on:
  schedule:
    - cron: "*/15 * * * *" # Every 15 minutes
```

**External Services**: Update the cron expression in the service dashboard

**Local Development**: Edit `scripts/cron-dev.ts`:

```typescript
const CRON_SCHEDULE = "*/15 * * * *"; // Every 15 minutes
```

**Cron Schedule Format**: `minute hour day month weekday`

- `*/30 * * * *` = Every 30 minutes
- `0 */1 * * *` = Every hour
- `0 9 * * *` = Daily at 9 AM

## Next Steps

1. ✅ Set up your cron job (choose one method above)
2. ✅ Add some products to track
3. ✅ Set price alerts for products
4. ✅ Wait for the first scheduled run
5. ✅ Check your email for alerts!

---

**Need Help?** Check the main [README.md](./README.md) or open an issue on GitHub.
