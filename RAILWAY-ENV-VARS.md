# Railway Environment Variables Configuration

## 🚂 Backend Service Environment Variables

Add these in Railway Dashboard → Your Backend Service → Variables

### Required Variables

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# CORS Configuration (REQUIRED)
# Replace with your frontend Railway URL(s)
# For multiple origins, use comma-separated values (no spaces)
CORS_ORIGIN=https://your-frontend.railway.app,https://www.yourdomain.com

# Frontend URL (for receipt generation)
# Replace with your frontend Railway URL
FRONTEND_URL=https://your-frontend.railway.app

# Logo URL (optional - defaults to FRONTEND_URL/last-logo.png)
LOGO_URL=https://your-frontend.railway.app/last-logo.png
```

### Optional Variables

```bash
# JWT Secret (if using custom JWT - currently using Supabase auth)
# Generate a secure random string: openssl rand -base64 32
JWT_SECRET=your_jwt_secret_here

# Database URL (optional - using Supabase client)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

---

## ⚡ Frontend Service Environment Variables

Add these in Railway Dashboard → Your Frontend Service → Variables

### Required Variables

```bash
# Backend API URL (REQUIRED)
# Replace with your backend Railway URL
VITE_API_URL=https://your-backend.railway.app

# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Optional Variables

```bash
# Google Maps API Key (optional - for map embed)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## 📋 Step-by-Step Setup in Railway

### 1. **Get Your Supabase Credentials**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### 2. **Get Your Railway URLs**

After deploying:
1. Backend URL: `https://your-backend-service-name.railway.app`
2. Frontend URL: `https://your-frontend-service-name.railway.app`

### 3. **Configure Backend Service**

1. In Railway, select your **Backend** service
2. Go to **Variables** tab
3. Add all backend variables listed above
4. Replace placeholders with actual values
5. Click **Deploy** to restart with new variables

### 4. **Configure Frontend Service**

1. In Railway, select your **Frontend** service
2. Go to **Variables** tab
3. Add all frontend variables listed above
4. Replace placeholders with actual values
5. Click **Deploy** to rebuild with new variables

---

## 🔐 Security Notes

### ⚠️ **Never commit these to Git:**
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access!
- `JWT_SECRET` - Authentication secret
- Any API keys

### ✅ **Safe to expose in frontend (already public):**
- `VITE_SUPABASE_URL` - Public URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key (RLS protected)
- `VITE_API_URL` - Public API endpoint

---

## 🔄 Railway Auto-Detection

Railway will automatically:
- Set `PORT` from the service configuration
- Set `RAILWAY_ENVIRONMENT` to `production`
- Provide `RAILWAY_PUBLIC_DOMAIN` (optional, for custom domains)

You can optionally use:
```bash
# Use Railway's auto-provided port (if not set, defaults to 4000)
PORT=${PORT:-4000}

# Use Railway's public domain if available
FRONTEND_URL=${RAILWAY_PUBLIC_DOMAIN:-https://your-frontend.railway.app}
```

---

## ✅ Verification Checklist

After setting variables, verify:

### Backend Health Check:
```bash
curl https://your-backend.railway.app/api/health
# Should return: {"ok":true,"timestamp":"..."}
```

### Frontend Build:
- Check Railway build logs for any missing `VITE_*` variables
- Frontend should build successfully with all env vars

### CORS Test:
- Open browser console on your frontend
- Try making an API request
- Should not see CORS errors

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check all `SUPABASE_*` variables are set
- Verify no typos in variable names
- Ensure values are copied completely (no extra spaces)

### "CORS error" in browser
- Verify `CORS_ORIGIN` matches your frontend URL exactly
- For multiple origins: `url1,url2` (no spaces after comma)
- Restart backend after changing CORS_ORIGIN

### "Environment variable not found" in frontend
- Frontend variables MUST start with `VITE_` prefix
- Rebuild frontend after adding variables (Railway auto-rebuilds)
- Check build logs for variable substitution

### Backend not starting
- Verify `PORT` is set (Railway usually sets this automatically)
- Check `NODE_ENV=production` is set
- Review Railway logs for specific errors

---

## 📝 Example Configuration (Copy-Paste Ready)

### Backend Variables:
```bash
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CORS_ORIGIN=https://myapp.railway.app
FRONTEND_URL=https://myapp.railway.app
LOGO_URL=https://myapp.railway.app/last-logo.png
```

### Frontend Variables:
```bash
VITE_API_URL=https://myapp-backend.railway.app
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Quick Start

1. **Copy backend variables** → Railway Backend Service → Variables → Add each variable
2. **Copy frontend variables** → Railway Frontend Service → Variables → Add each variable
3. **Deploy** → Railway will automatically rebuild/redeploy
4. **Test** → Visit your frontend URL and check browser console for errors

Done! 🎉

