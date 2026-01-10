# Add Doctor Photo Feature Guide

This guide will help you add the doctor photo upload feature to your application.

## Step 1: Run SQL Migration

1. Go to the **Supabase SQL Editor**: https://supabase.com/dashboard/project/_/sql/new
2. Open the file `supabase/add-doctor-image-url.sql`
3. Copy and paste the SQL into the editor
4. Click **Run** to execute

The SQL will add an `image_url` column to the `doctors` table:

```sql
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## Step 2: Verify Storage Bucket

The feature uses the **certificates** storage bucket (the same bucket used for certificates and receipts).

Make sure you have the `certificates` bucket in your Supabase Storage:
- Open **Storage** in your Supabase dashboard
- Verify `certificates` bucket exists
- It should be **public** (check the bucket settings)

## Step 3: Test the Feature

1. **Open the Admin Dashboard**: http://localhost:5173/dashboard/admin
2. Click on **"Doctors"** tab
3. Click **"+ Add Doctor"** button
4. You should see a new **"Doctor Photo"** upload field
5. Click the file input to upload a doctor's photo
6. The preview will show immediately
7. Fill in other details (Name, Specialization, Degrees, Discount Rate)
8. Click **"Add Doctor"** to save

## Features Implemented

✅ **Photo Upload**:
- Live preview as you upload
- Uploads to Supabase Storage (`certificates` bucket)
- Saves public URL to database
- Fallback emoji avatar if no photo

✅ **Display**:
- Doctor photos shown on DoctorsList page
- Professional circular image with shadow
- Verified badge overlay
- Emoji fallback for doctors without photos

✅ **Backend**:
- API updated to accept `image_url`
- Database column added
- Storage integration working

## Testing Checklist

- [ ] SQL migration executed successfully
- [ ] Can upload doctor photo in admin panel
- [ ] Photo preview shows before saving
- [ ] Doctor appears with photo on DoctorsList page
- [ ] Verified badge overlays correctly
- [ ] Emoji fallback shows for doctors without photos
- [ ] Photo displays in both grid and list view

## Troubleshooting

**Issue**: Photo upload fails
- **Solution**: Check that `certificates` storage bucket exists and is public

**Issue**: Photo not showing after upload
- **Solution**: Verify the SQL migration was run successfully
- Check browser console for any errors

**Issue**: Upload button disabled
- **Solution**: Wait for previous upload to complete
- Check network tab for upload progress

## Next Steps

Consider adding:
- Photo cropping/editing before upload
- Multiple photos per doctor
- Photo gallery view
- Photo deletion functionality
- Image compression optimization

