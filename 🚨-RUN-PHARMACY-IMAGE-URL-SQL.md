# 🚨 URGENT: Add image_url Column to Pharmacy Inventory

## Error
```
Could not find the 'image_url' column of 'pharmacy_inventory' in the schema cache
```

## Solution
You need to run this SQL in your Supabase SQL Editor to add the missing column.

## Steps:
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL below
5. Click "Run" (or press Ctrl+Enter)

## SQL to Run:

```sql
-- Add image_url column to pharmacy_inventory table
ALTER TABLE public.pharmacy_inventory
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## After Running:
- Refresh your browser
- Try uploading/updating a medicine image again
- The error should be resolved

## Verification:
To verify the column was added, run this query:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pharmacy_inventory' 
AND column_name = 'image_url';
```

You should see `image_url` with type `text`.

