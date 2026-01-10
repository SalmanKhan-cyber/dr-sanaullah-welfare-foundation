# 🔍 Debug Profile Check Issue

## Quick Check - Run This SQL:

```sql
-- Check if your profile exists and what fields it has
SELECT 
    user_id,
    name,
    phone,
    age,
    gender,
    cnic,
    history
FROM public.patients
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE');
```

**Replace `YOUR_EMAIL_HERE` with your actual email address.**

---

## What to Look For:

1. **If query returns no rows:**
   - Profile doesn't exist → Need to create it

2. **If query returns rows but `name` or `phone` is NULL:**
   - Profile exists but incomplete → Need to add name/phone

3. **If all fields are filled:**
   - Profile is complete → Issue is elsewhere

---

## Common Issues:

### Issue 1: SQL Not Run
**Solution:** Run this SQL:
```sql
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS phone text;
```

### Issue 2: Profile Missing Name/Phone
**Solution:** Update your profile in Patient Dashboard → Profile tab

### Issue 3: Backend Not Restarted
**Solution:** Restart backend server

---

## Test the API Directly:

Open browser console and run:
```javascript
// Check what the API returns
fetch('http://localhost:4000/api/patients/me', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(console.log);
```

**This will show you exactly what the backend is returning.**

