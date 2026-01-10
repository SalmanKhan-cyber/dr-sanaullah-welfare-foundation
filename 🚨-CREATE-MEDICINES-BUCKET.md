# 🚨 IMPORTANT: Create Medicines Storage Bucket

## Problem
Medicine images are not uploading or displaying because the `medicines` storage bucket doesn't exist in Supabase.

---

## ✅ Solution: Create the Storage Bucket

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project
   - Navigate to **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **"New bucket"** or **"Create bucket"** button
   - **Bucket name:** `medicines` (exact name, lowercase)
   - **Public bucket:** ✅ **Yes** (checked) - Make it public so images are accessible
   - **File size limit:** 5 MB (optional)
   - Click **"Create bucket"**

3. **Done!** The bucket is created and images should now upload/display.

---

### Option 2: Using SQL Script (Recommended)

1. **Open Supabase SQL Editor**
   - Go to Supabase Dashboard
   - Navigate to **SQL Editor**
   - Click **New Query**

2. **Run the SQL Script**
   - Copy the entire contents of `supabase/create-medicines-bucket.sql`
   - Paste into the SQL Editor
   - Click **Run**

3. **Verify Bucket Created**
   - Go to **Storage** → You should see `medicines` bucket
   - Check that it's marked as **Public**

---

## ✅ After Creating the Bucket

Once the bucket is created:

1. **Refresh your browser** (F5 or Ctrl+R)
2. **Try uploading a medicine image** in Admin Dashboard
3. **Check the pharmacy page** - images should now display!

---

## 🔍 Verify Bucket Settings

The bucket should have:
- ✅ **Name:** `medicines`
- ✅ **Public:** Yes (enabled)
- ✅ **File size limit:** 5 MB
- ✅ **Allowed types:** Images only (jpeg, png, gif, webp)

---

## 📝 Notes

- **Public bucket** means anyone with the URL can access images (good for medicine photos)
- Images will be accessible at: `https://your-project.supabase.co/storage/v1/object/public/medicines/filename.jpg`
- The backend automatically generates signed URLs for uploaded images

---

## 🐛 Still Not Working?

If images still don't upload/display:

1. **Check backend console** for error messages
2. **Verify bucket exists** in Supabase Storage
3. **Check RLS policies** are set correctly
4. **Verify image_url column** exists in `pharmacy_inventory` table

---

**After creating the bucket, medicine images will work! 🎉**

