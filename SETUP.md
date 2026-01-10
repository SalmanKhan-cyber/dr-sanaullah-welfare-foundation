# Dr. Sanaullah Welfare Foundation – Setup Guide

Complete setup and configuration guide for local development and production deployment.

---

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** ([supabase.com](https://supabase.com))
- **Git** installed
- Code editor (VS Code recommended)

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd foundation

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Supabase Setup

### A. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - Project name: `dswf` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### B. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy entire contents of `supabase/schema.sql`
3. Paste and click **"Run"**
4. Verify tables are created under **Database** → **Tables**

### C. Create Storage Buckets

1. Go to **Storage** in left sidebar
2. Click **"New bucket"** and create these 4 buckets (all **Private**):
   - `lab-reports`
   - `prescriptions`
   - `certificates`
   - `receipts`

### D. Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep secret, never expose to frontend)

---

## 3. Environment Configuration

### Backend Environment (`apps/backend/.env`)

Create `apps/backend/.env` file:

```env
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Security
CORS_ORIGIN=http://localhost:5173

# Optional: Direct database access
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Frontend Environment (`apps/frontend/.env`)

Create `apps/frontend/.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:4000
```

---

## 4. Run Locally

Open **two terminal windows**:

### Terminal 1: Backend

```bash
cd apps/backend
npm run dev
```

Backend runs on `http://localhost:4000`

### Terminal 2: Frontend

```bash
cd apps/frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 5. Test the Application

1. Open `http://localhost:5173` in your browser
2. Click **"Login"** → Try email signup or phone OTP
3. After signup, set user role via backend API or Supabase dashboard
4. Navigate to appropriate dashboard based on role

---

## 6. Create First Admin User

### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click on a user
3. Go to **User Metadata** section
4. Add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save

### Option B: Via Backend API

Use Postman or curl:

```bash
curl -X POST http://localhost:4000/api/auth/set-role \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid-here", "role": "admin"}'
```

---

## 7. Production Deployment

### A. Frontend (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set **Root Directory**: `apps/frontend`
5. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://your-backend.onrender.com
   ```
6. Deploy

### B. Backend (Render)

1. Go to [render.com](https://render.com)
2. Create **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   ```
   PORT=4000
   NODE_ENV=production
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
6. Deploy

### C. Update Frontend with Production Backend URL

After backend is deployed, update Vercel environment variable:
```
VITE_API_URL=https://your-backend.onrender.com
```

Redeploy frontend.

---

## 8. Optional Integrations

### Stripe for Donations

1. Get API keys from [stripe.com/dashboard](https://dashboard.stripe.com)
2. Add to backend `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Install: `npm install stripe`
4. Uncomment Stripe integration code in `apps/backend/src/routes/donations.js`

### Twilio for Phone OTP

1. Get credentials from [twilio.com/console](https://console.twilio.com)
2. Add to backend `.env`:
   ```env
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Supabase Auth already handles OTP; Twilio is optional fallback

### PDF Generation (Receipts/Certificates)

Install puppeteer:
```bash
cd apps/backend
npm install puppeteer
```

Uncomment PDF generation code in:
- `apps/backend/src/lib/pdf.js`
- `apps/backend/src/lib/receipt.js`

---

## 9. Security Checklist

- [ ] Never commit `.env` files (already in `.gitignore`)
- [ ] Use HTTPS in production (automatic on Vercel/Render)
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret (backend only)
- [ ] Enable Supabase email verification in production
- [ ] Set up Row Level Security (RLS) policies (basic ones already in `schema.sql`)
- [ ] Configure CORS properly (only allow your frontend domain)
- [ ] Enable rate limiting on backend routes (use `express-rate-limit`)

---

## 10. Common Issues

### "Missing token" error
- Ensure user is logged in via Supabase Auth
- Check that frontend sends `Authorization: Bearer <token>` header

### CORS errors
- Update `CORS_ORIGIN` in backend `.env`
- Restart backend server

### File upload fails
- Verify storage buckets exist in Supabase
- Check bucket names match code (case-sensitive)
- Ensure file size within limits (20MB default)

### Role access denied
- Verify user has correct role in user metadata
- Check RBAC middleware allows that role for the route

---

## 11. Database Migrations

When schema changes:

1. Update `supabase/schema.sql`
2. Run in Supabase SQL Editor
3. Or use Supabase CLI:
   ```bash
   supabase db push
   ```

---

## 12. Backup & Monitoring

### Automated Backups
- Supabase Pro+ includes daily backups
- Or use `pg_dump` for manual backups

### Monitoring
- Supabase Dashboard: **Database** → **Logs**
- Backend: Add logging (Winston, Pino)
- Frontend: Sentry for error tracking

---

## Support

For issues:
1. Check [Supabase Docs](https://supabase.com/docs)
2. Check [Express.js Docs](https://expressjs.com)
3. Check [React Router Docs](https://reactrouter.com)

---

**You're all set!** 🎉

Visit your deployed site or `http://localhost:5173` to start using the platform.

