# ✅ Which SQL Script to Run

## **Answer: Run ONLY ONE script**

### 🎯 **Run This File:**

**`supabase/fix-appointments-constraint-working.sql`**

OR use the copy in: **`RUN-THIS-SQL-ONLY.sql`**

---

## ❌ **DON'T Run These (They're duplicates/alternatives):**

- `fix-appointments-foreign-key.sql` ❌ (old version)
- `fix-appointments-foreign-key-correct.sql` ❌ (alternative version)
- `fix-appointments-foreign-key-simple.sql` ❌ (simpler version)

**Only run ONE script, not all of them!**

---

## 📋 **Steps:**

1. **Open Supabase SQL Editor**
2. **Copy the entire contents** of: `supabase/fix-appointments-constraint-working.sql`
3. **Paste and run** it
4. **Check the output messages** - it will tell you:
   - Which schema was detected
   - Which constraint was created
   - ✅ Success message

---

## ✅ **What It Does:**

- ✅ Automatically detects your schema (migrated or original)
- ✅ Drops the broken constraint
- ✅ Creates the correct constraint based on your schema
- ✅ Updates existing appointments if needed
- ✅ Shows verification at the end

---

## 🎯 **Result:**

After running this ONE script, your foreign key constraint will be fixed and appointment booking will work!

---

**Just run `fix-appointments-constraint-working.sql` - that's it!** 🎉

