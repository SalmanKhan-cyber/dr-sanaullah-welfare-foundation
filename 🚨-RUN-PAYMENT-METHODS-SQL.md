# 🚨 Run SQL Script to Add Payment Methods

## Step 1: Create Payment Methods Table

1. Open Supabase SQL Editor
2. Copy and paste the contents of: `supabase/create-payment-methods-table.sql`
3. Run the script
4. ✅ Done!

---

## What This Does

- ✅ Creates `payment_methods` table for storing saved cards
- ✅ Adds payment columns to `pharmacy_orders` table:
  - `payment_method_id` - Links to saved card
  - `payment_status` - pending/processing/paid/failed/refunded
  - `payment_transaction_id` - Payment gateway transaction ID
  - `paid_at` - Timestamp when payment was completed
- ✅ Sets up RLS policies for secure access
- ✅ Creates indexes for better performance

---

**After running this SQL script, the payment system will be ready!** 🎉

