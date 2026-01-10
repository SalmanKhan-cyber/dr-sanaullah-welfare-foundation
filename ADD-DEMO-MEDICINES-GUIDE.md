# 🏥 Add 50 Demo Medicines to Pharmacy

This guide will help you add 50 sample medicines to your pharmacy inventory in Supabase.

## 📋 Step 1: Open Supabase Dashboard

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your **Dr. Sanaullah Welfare Foundation** project
3. Click on **SQL Editor** in the left sidebar

## 📝 Step 2: Run the SQL Script

1. Open the file **`supabase/create-pharmacy-inventory.sql`** (it should have opened in Notepad)
2. **Copy the entire contents** of the file (Ctrl+A, then Ctrl+C)
3. Paste it into the **Supabase SQL Editor**
4. Click **RUN** or press `Ctrl+Enter`

## ✅ Step 3: Verify Medicines Added

1. Go to **Table Editor** in the left sidebar
2. Click on **pharmacy_inventory** table
3. You should see **50 medicines** listed!

### Medicine Categories Included:

- **Pain Relief & Analgesics** (10 medicines)
- **Antibiotics** (10 medicines)
- **Cardiovascular** (10 medicines)
- **Diabetes** (10 medicines)
- **Gastrointestinal** (10 medicines)

Each medicine includes:
- ✅ Name and dosage
- ✅ Category
- ✅ Description
- ✅ Price in PKR
- ✅ Discount percentage (15-50%)
- ✅ Stock quantity
- ✅ Supplier information

## 🧪 Test the Pharmacy Page

1. Go to your website: http://localhost:5173
2. Click on **Medicines** service card
3. You should see all 50 medicines displayed!

### Features You Can Test:

- 🔍 **Search**: Type medicine name or category
- 📂 **Filter by Category**: Click category buttons
- 🛒 **Add to Cart**: Click "Add to Cart"
- 💰 **View Discounts**: See discounted prices
- 📊 **Stock Status**: Check available quantity

## 🎨 Example Medicines Added

| Name | Category | Price | Discount |
|------|----------|-------|----------|
| Paracetamol 500mg | Pain Relief | PKR 50 | 20% |
| Amoxicillin 500mg | Antibiotics | PKR 150 | 40% |
| Atorvastatin 20mg | Cardiovascular | PKR 250 | 50% |
| Metformin 500mg | Diabetes | PKR 60 | 50% |
| Omeprazole 20mg | Gastrointestinal | PKR 100 | 50% |

## 🚀 Next Steps

After adding medicines, you can:

1. **Test the cart functionality** - Add medicines to cart
2. **Try different searches** - Search by name or category
3. **Filter by categories** - Explore different medicine types
4. **View discount prices** - See the actual discounted amounts

## 🆘 Troubleshooting

### If medicines don't show up:
1. Check if the SQL script ran successfully
2. Verify the `pharmacy_inventory` table exists
3. Make sure RLS policies allow public read access
4. Check browser console for any errors

### If you see an error:
- Copy the error message
- Make sure you're using the correct Supabase project
- Verify table structure matches the schema

## 📞 Need Help?

Check:
- `supabase/create-pharmacy-inventory.sql` - SQL script
- `apps/frontend/src/pages/Pharmacy.jsx` - Pharmacy page code
- Browser console for errors

---

**That's it!** Your pharmacy now has 50 demo medicines ready for testing! 🎉

