# 🎯 Add Donor Fields to Database

## SQL Migration Required

To enable the new donor identification features (CNIC/Passport tracking), you need to apply a SQL migration to your Supabase database.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Apply Migration

Copy and paste this SQL:

```sql
-- Add donor identification fields to donations table
alter table public.donations
add column if not exists donor_type text check (donor_type in ('local', 'international')),
add column if not exists cnic text,
add column if not exists passport_number text;
```

### Step 3: Run Query

Click **Run** to execute the migration.

### Step 4: Verify

Run this query to verify the new columns exist:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'donations'
order by ordinal_position;
```

You should see these new columns:
- `donor_type`
- `cnic`
- `passport_number`

---

## ✅ Features Now Available

### Multi-Step Donation Form

1. **Step 1**: New donors create an account
2. **Step 2**: Provide identification (CNIC or Passport based on donor type)
3. **Step 3**: Select purpose and amount
4. **Step 4**: Success and receipt

### Repeat Donor Recognition

- Existing donors skip account creation
- System identifies repeat donors automatically
- Shows welcome message for loyal supporters

### Local vs International Tracking

- **Local Donors**: Required to provide CNIC
- **International Donors**: Required to provide Passport Number
- Better donor analytics and compliance

---

## 🧪 Testing

After applying the migration:

1. Visit `/donation` page
2. Create a new account (Step 1)
3. Select donor type and provide ID (Step 2)
4. Select purpose and enter amount (Step 3)
5. Complete donation

For repeat testing:
1. Log out
2. Log back in with the same email
3. You should skip to Step 2 with "Welcome back" message

---

**Note**: The migration file is also saved at `supabase/alter-donations-add-donor-fields.sql`

