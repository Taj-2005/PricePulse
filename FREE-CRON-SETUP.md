# 🆓 Free Cron Setup Guide - Quick Start

Since Vercel Cron is a paid feature, here are **100% FREE** alternatives to automate your price checking every 30 minutes.

## 🥇 Best Option: GitHub Actions (Recommended)

**Why GitHub Actions?**
- ✅ Completely FREE for public repositories
- ✅ 2000 free minutes/month for private repos (more than enough!)
- ✅ Built-in logging and monitoring
- ✅ Can manually trigger from GitHub UI
- ✅ No external service needed

### Quick Setup (5 minutes)

1. **The workflow file is already created!** ✅
   - File: `.github/workflows/price-check-cron.yml`

2. **Add GitHub Secrets:**
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```
   
   Then in GitHub:
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Add these two secrets:
     - **Name**: `APP_URL`
       **Value**: `https://your-app.vercel.app` (your deployed app URL)
     - **Name**: `CRON_SECRET`
       **Value**: `[paste the generated secret]`

3. **Push to GitHub:**
   ```bash
   git add .github/workflows/price-check-cron.yml
   git commit -m "Add GitHub Actions cron workflow"
   git push
   ```

4. **Verify it's working:**
   - Go to your GitHub repo → **Actions** tab
   - You should see "Price Check Cron Job" workflow
   - It will run automatically every 30 minutes
   - Click on it to see logs and execution history

**That's it!** Your price checking is now automated and completely free! 🎉

---

## 🥈 Alternative Free Options

### Option 2: Cron-job.org

1. Sign up at [cron-job.org](https://cron-job.org/) (free)
2. Create new cron job:
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Schedule**: `*/30 * * * *`
   - **Method**: GET
3. **Free limits**: 2 cron jobs, 1-minute minimum

### Option 3: EasyCron

1. Sign up at [EasyCron](https://www.easycron.com/) (free)
2. Create new cron job:
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Schedule**: `*/30 * * * *`
3. **Free limits**: 1 cron job, 1-minute minimum

### Option 4: UptimeRobot

1. Sign up at [UptimeRobot](https://uptimerobot.com/) (free)
2. Create new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Interval**: 30 minutes
3. **Free limits**: 50 monitors, 5-minute minimum

---

## 🔒 Security Note

**Important**: Always use the `secret` query parameter with your `CRON_SECRET`:
```
https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET
```

Never commit your `CRON_SECRET` to version control!

---

## 📊 Comparison

| Service | Free Tier | Ease of Setup | Best For |
|---------|-----------|---------------|----------|
| **GitHub Actions** | ✅ Unlimited (public) | ⭐⭐⭐⭐⭐ | **Best overall** |
| Cron-job.org | ✅ 2 jobs | ⭐⭐⭐⭐ | Simple external service |
| EasyCron | ✅ 1 job | ⭐⭐⭐ | Basic needs |
| UptimeRobot | ✅ 50 monitors | ⭐⭐⭐ | Uptime + cron combo |

---

## 🆘 Need Help?

- See [AUTOMATION.md](./AUTOMATION.md) for detailed instructions
- Check [README.md](./README.md) for full documentation
- Open an issue on GitHub if you need assistance

---

**Recommendation**: Use **GitHub Actions** - it's the easiest, most reliable, and completely free! 🚀

