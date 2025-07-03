# Updated Solution: Database Schema Without user_id

## The Problem
You're getting "Could not find the 'user_id' column" because your database tables don't have `user_id` columns, but Row Level Security (RLS) is still enabled.

## Current Status
✅ Code updated to NOT include user_id in inserts
✅ Better error handling for different error types
❌ RLS is still blocking inserts (likely cause)

## Solutions (Try in order)

### Solution 1: Disable RLS (Quickest Fix)
Since you don't have user_id columns and want single admin access:

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication > Policies**
3. Find your `stock_items` table
4. Click **"Disable RLS"**
5. Do the same for `categories` table

This removes all access restrictions.

### Solution 2: Create Simple RLS Policies
If you want to keep RLS but allow all authenticated users:

1. Go to **Supabase Dashboard > Authentication > Policies**
2. For `stock_items` table, create these policies:

```sql
-- Policy Name: Allow all operations for authenticated users
-- Policy Type: All operations (or create separate for SELECT, INSERT, UPDATE, DELETE)
-- Target Roles: authenticated
-- Policy Definition: true
```

3. Repeat for `categories` table

### Solution 3: Use Service Role Key (Development Only)
For testing/development, bypass all security:

1. Go to **Supabase Dashboard > Settings > API**
2. Copy the **"service_role"** key (not anon key)
3. In your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_service_role_key_here
```

⚠️ **Never use service role in production!**

## Test the Fix

After applying one of the solutions:

1. Try creating a stock item
2. Check browser console for:
   - "Creating item with data: [your data]"
   - "Item data to insert: [data without user_id]"
   - Success message or new error

## If You Still Get Errors

### "Authentication required" error:
- Make sure you're logged in
- Check console for valid user object

### "Permission denied" or similar:
- Try Solution 1 (disable RLS completely)
- Verify RLS policies are correctly created

### Other database errors:
- Check if required columns exist (name, category_id, etc.)
- Verify foreign key constraints

## Database Schema Check

Your current tables should look like this:

### stock_items table:
- `id` (uuid, primary key)
- `name` (text)
- `category_id` (uuid, foreign key to categories)
- `quantity_brought` (integer)
- `quantity_sold` (integer)  
- `price_per_unit` (numeric)
- `entry_cost` (numeric)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### categories table:
- `id` (uuid, primary key)
- `name` (text)
- `description` (text, optional)
- `color` (text)
- `order` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

No `user_id` columns needed for single admin setup.

## Recommended Action
**Try Solution 1 first** (disable RLS) since you want single admin access without user separation.
