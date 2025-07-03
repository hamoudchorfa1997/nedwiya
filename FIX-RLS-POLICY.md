# Fixing Row Level Security (RLS) Policy Error

## The Error
`Failed to create item: new row violates row-level security policy for table "stock_items"`

## What This Means
Supabase has Row Level Security (RLS) enabled on your tables, but there are no policies allowing your user to insert data.

## Solutions (Choose One)

### Option 1: Disable RLS (Quick Fix - Less Secure)
If you're the only user and want quick access:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Policies
3. Find the `stock_items` table
4. Click "Disable RLS" 
5. Do the same for `categories` table

**Warning**: This removes all security, so only do this if you're the only user.

### Option 2: Create Proper RLS Policies (Recommended)
Create policies that allow authenticated users to access data:

1. Go to Supabase Dashboard > Authentication > Policies
2. Select the `stock_items` table
3. Click "New Policy" and create these policies:

#### Policy 1: Allow authenticated users to SELECT
```sql
Policy Name: Enable read access for authenticated users
Policy Type: SELECT
Target Roles: authenticated
Policy Definition: true
```

#### Policy 2: Allow authenticated users to INSERT
```sql
Policy Name: Enable insert access for authenticated users  
Policy Type: INSERT
Target Roles: authenticated
Policy Definition: true
```

#### Policy 3: Allow authenticated users to UPDATE
```sql
Policy Name: Enable update access for authenticated users
Policy Type: UPDATE  
Target Roles: authenticated
Policy Definition: true
```

#### Policy 4: Allow authenticated users to DELETE
```sql
Policy Name: Enable delete access for authenticated users
Policy Type: DELETE
Target Roles: authenticated  
Policy Definition: true
```

4. Repeat the same for the `categories` table

### Option 3: User-Specific Policies (Most Secure)
If you want users to only access their own data:

#### For stock_items:
```sql
-- SELECT Policy
auth.uid() = user_id

-- INSERT Policy  
auth.uid() = user_id

-- UPDATE Policy
auth.uid() = user_id

-- DELETE Policy
auth.uid() = user_id
```

#### For categories:
```sql
-- Same policies as above
auth.uid() = user_id
```

## Database Schema Updates Required

Since we're adding `user_id` back for RLS, you need to ensure your database has the `user_id` column:

### For stock_items table:
```sql
ALTER TABLE stock_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
```

### For categories table:
```sql  
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
```

## Testing the Fix

1. Make sure you're logged in to the app
2. Try creating a stock item again
3. Check the browser console for:
   - "Current user: [user object]" (should show your user ID)
   - "Item data with user: [data with user_id]" 
   - Successful creation or a different error message

## If You Still Get Errors

### Check Authentication:
- Make sure you're properly logged in
- The console should show a valid user object

### Check RLS Policies:
- Ensure policies are created and enabled
- Test with simple `true` policies first, then make them more restrictive

### Check Database Schema:
- Ensure `user_id` columns exist and are properly typed (UUID)
- Ensure foreign key constraints are correct

## Alternative: Use Service Role Key (Development Only)
For development/testing, you can bypass RLS by using the service role key:

1. Go to Supabase Dashboard > Settings > API
2. Copy the "service_role" key (NOT the anon key)  
3. In your `.env.local`, temporarily use:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_service_role_key_here
```

**Warning**: Never use service role key in production - it bypasses all security!
