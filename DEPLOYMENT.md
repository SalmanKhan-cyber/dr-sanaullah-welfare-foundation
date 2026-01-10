# Deployment Guide – Dr. Sanaullah Welfare Foundation

Quick deployment guide for Vercel (frontend) and Render (backend).

---

## Prerequisites

- GitHub account with your code pushed
- Supabase project set up (see `SETUP.md`)
- Vercel account ([vercel.com](https://vercel.com))
- Render account ([render.com](https://render.com))

---

## 1. Deploy Frontend to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your repository
4. **Project Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Environment Variables

Add these in Vercel dashboard under **Settings** → **Environment Variables**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://your-backend.onrender.com
```

**Note:** You'll update `VITE_API_URL` after deploying the backend (Step 2).

### Step 4: Deploy

Click **"Deploy"**. Vercel will build and deploy your frontend.

Your site will be live at: `https://your-project.vercel.app`

---

## 2. Deploy Backend to Render

### Step 1: Create New Web Service

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Step 2: Configure Service

- **Name**: `dswf-backend`
- **Root Directory**: `apps/backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for production)

### Step 3: Environment Variables

Click **"Advanced"** and add these environment variables:

```
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)
CORS_ORIGIN=https://your-project.vercel.app
```

### Step 4: Deploy

Click **"Create Web Service"**. Render will build and deploy your backend.

Your backend will be live at: `https://dswf-backend.onrender.com`

---

## 3. Update Frontend with Backend URL

1. Go back to Vercel dashboard
2. **Settings** → **Environment Variables**
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://dswf-backend.onrender.com
   ```
4. Go to **Deployments** → **Redeploy** (latest deployment)

---

## 4. Update Supabase Auth Settings

### Allow Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   https://your-project.vercel.app/**
   https://your-project.vercel.app/auth/callback
   ```

### Site URL

Set **Site URL** to:
```
https://your-project.vercel.app
```

---

## 5. Test Production Deployment

1. Visit `https://your-project.vercel.app`
2. Test signup/login
3. Test donation flow
4. Test file uploads (if applicable)
5. Check browser console for errors

---

## 6. Custom Domain (Optional)

### Vercel

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `dswf.org`)
3. Update DNS records as instructed
4. Wait for DNS propagation (~24 hours)

### Update Supabase Auth

Add your custom domain to redirect URLs in Supabase.

---

## 7. Environment-Specific Settings

### Production vs Development

Use environment variables to toggle features:

```js
// Backend
if (process.env.NODE_ENV === 'production') {
  // Use real Stripe keys
  // Enable email notifications
} else {
  // Use test keys
  // Log to console
}
```

---

## 8. CI/CD (Continuous Deployment)

Both Vercel and Render automatically redeploy when you push to `main` branch.

### Disable Auto-Deploy

- **Vercel**: Settings → Git → Uncheck auto-deploy
- **Render**: Settings → Build & Deploy → Manual Deploy

### Branch Deployments

- **Vercel**: Automatically creates preview deployments for PRs
- **Render**: Create separate services for `staging` branch

---

## 9. Monitoring & Logs

### Vercel Logs

1. Go to **Deployments** → Click deployment
2. View **Build Logs** and **Function Logs**

### Render Logs

1. Go to your service dashboard
2. Click **"Logs"** tab
3. View real-time logs

### Supabase Logs

1. **Database** → **Logs** (SQL queries)
2. **Storage** → **Logs** (file operations)
3. **Auth** → **Logs** (sign-ins/sign-ups)

---

## 10. Performance Optimization

### Frontend (Vercel)

- Enable **Edge Caching** (automatic)
- Use **Image Optimization** for logos/photos
- Enable **Compression** (automatic)

### Backend (Render)

- Upgrade to **Paid Plan** for:
  - No cold starts
  - More resources
  - Better uptime
- Use **Redis** for session caching (add-on)

### Database (Supabase)

- Upgrade to **Pro Plan** for:
  - Daily backups
  - Better performance
  - More storage

---

## 11. Scaling

### Horizontal Scaling

- **Vercel**: Automatic scaling (serverless)
- **Render**: Upgrade plan or add more instances

### Database Scaling

- Supabase: Upgrade to Pro/Enterprise
- Or migrate to dedicated PostgreSQL server

### File Storage

- Supabase Storage: Upgrade storage limits
- Or use AWS S3, Cloudflare R2

---

## 12. Rollback

### Vercel

1. Go to **Deployments**
2. Find previous deployment
3. Click **"Promote to Production"**

### Render

1. Go to **Manual Deploy**
2. Select previous commit
3. Click **"Deploy"**

---

## 13. Security Checklist

- [ ] HTTPS enabled (automatic)
- [ ] Environment variables set (not in code)
- [ ] CORS configured for production domain
- [ ] Service role key never exposed to frontend
- [ ] Rate limiting enabled (add `express-rate-limit`)
- [ ] Supabase RLS policies configured
- [ ] File upload size limits enforced

---

## 14. Post-Deployment

### Add Monitoring

```bash
# Backend: Install Sentry
npm install @sentry/node

# Frontend: Install Sentry
npm install @sentry/react
```

### Setup Alerts

- **Uptime Monitoring**: [UptimeRobot](https://uptimerobot.com)
- **Error Tracking**: [Sentry](https://sentry.io)
- **Analytics**: [Google Analytics](https://analytics.google.com) or [Plausible](https://plausible.io)

---

## 15. Costs Estimate

### Free Tier (Testing)

- Supabase: Free (500MB database, 1GB storage)
- Vercel: Free (100GB bandwidth)
- Render: Free (750 hours, with cold starts)

**Total: $0/month**

### Production (Paid)

- Supabase Pro: $25/month
- Vercel Pro: $20/month (optional)
- Render Standard: $7-25/month

**Total: ~$32-70/month**

---

**Your application is now live!** 🚀

- Frontend: `https://your-project.vercel.app`
- Backend: `https://dswf-backend.onrender.com`
- Database: Supabase (managed)

For issues, check logs and refer to `SETUP.md`.

