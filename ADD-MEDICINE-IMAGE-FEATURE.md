# 📸 Medicine Image Upload Feature

## Database Migration Required

To enable medicine image uploads, add the `image_url` column to the pharmacy_inventory table.

### Step 1: Open Supabase SQL Editor

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Apply Migration

Copy and paste this SQL:

```sql
-- Add image_url column to pharmacy_inventory table
ALTER TABLE public.pharmacy_inventory
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Click **Run** to execute.

### Step 3: Create Storage Bucket (If Not Exists)

Create a storage bucket for medicine images:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `medicines`
4. Public: ✅ Yes (or configure policies as needed)
5. Click **Create**

---

## ✅ Features Now Available

### Image Upload in Pharmacy Dashboard

- **Add Medicine**: Upload image when creating new medicine
- **Edit Medicine**: Upload or replace medicine image
- **Image Preview**: See image preview before saving
- **Display**: Medicine cards show uploaded images instead of icons
- **Fallback**: Shows icon if no image uploaded

### Storage Integration

- Images stored in Supabase Storage bucket `medicines`
- Automatic file naming
- Public URL generation
- Responsive image display

---

## 🧪 Testing

After applying the migration:

1. Visit `/dashboard/pharmacy`
2. Click "Add Medicine"
3. Upload a medicine image
4. Fill in other fields
5. Click "Add Medicine"
6. See the uploaded image in the medicine card!

---

**Note**: The migration file is saved at `supabase/add-pharmacy-image-url.sql`

