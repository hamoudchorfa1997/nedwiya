# Foreign Key Constraint Troubleshooting

## The Error
`insert or update on table "stock_items" violates foreign key constraint "stock_items_id_fkey"`

## What This Specific Error Means
The constraint name "stock_items_id_fkey" suggests there's a foreign key relationship issue. This could be:

1. **Category ID mismatch** - The `category_id` format doesn't match
2. **Wrong foreign key constraint** - The constraint might be incorrectly configured
3. **Missing category** - The category was deleted but still appears in your local state

## Enhanced Debugging Added

The updated code now includes:
1. **Category ID format checking** - Shows the actual ID types and values
2. **Database verification** - Confirms the category exists in the database
3. **Detailed foreign key error logging** - Shows exactly which constraint failed
4. **Data type validation** - Ensures all data is properly formatted

## Steps to Debug

### Step 1: Try Creating a Stock Item
1. Go to Stock tab
2. Try to create an item
3. **Check the browser console** for these new logs:
   - "Category ID format:" - Shows the category ID type and value
   - "Database category check:" - Confirms category exists in DB
   - "Foreign key constraint details:" - Shows which constraint failed

### Step 2: Check Your Database Foreign Key Constraints

In **Supabase SQL Editor**, run this query to see the actual constraints:

```sql
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.match_option,
    rc.update_rule,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'stock_items';
```

This will show you:
- What column has the foreign key (`column_name`)
- What table/column it references (`foreign_table_name.foreign_column_name`)
- The constraint name (`constraint_name`)

### Step 3: Check Expected vs Actual

Look for:
- **Constraint name**: Should be something like `stock_items_category_id_fkey`, not `stock_items_id_fkey`
- **Referenced table**: Should be `categories`
- **Referenced column**: Should be `id`

### Step 4: Common Issues & Solutions

#### Issue: Wrong constraint name
**If the constraint is named `stock_items_id_fkey`** instead of `stock_items_category_id_fkey`, it suggests:
- The foreign key might be pointing to the wrong table/column
- There might be a self-referential constraint (stock_items.id references stock_items.id)

**Solution**: Recreate the foreign key constraint:
```sql
-- Drop existing constraint
ALTER TABLE stock_items DROP CONSTRAINT stock_items_id_fkey;

-- Add correct constraint
ALTER TABLE stock_items 
ADD CONSTRAINT stock_items_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id);
```

#### Issue: UUID vs Text mismatch
**If category IDs are UUIDs but being treated as text** (or vice versa):

**Solution**: Check data types match:
```sql
-- Check categories table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' AND column_name = 'id';

-- Check stock_items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stock_items' AND column_name = 'category_id';
```

Both should be the same type (usually `uuid`).

#### Issue: Categories not actually in database
**If the category exists in your app but not in database**:

**Solution**: Refresh the page to reload categories from database.

### Step 5: Quick Fix Attempt

If the foreign key constraint is wrong, you can temporarily disable it:

```sql
-- Disable constraint checking (DANGEROUS - use only for testing)
ALTER TABLE stock_items DISABLE TRIGGER ALL;

-- Try creating your stock item

-- Re-enable constraints
ALTER TABLE stock_items ENABLE TRIGGER ALL;
```

**⚠️ Only use this for testing to confirm it's a constraint issue!**

## Expected Console Output

When debugging, you should see:
```
Creating item with data: {...}
Category validation passed: {id: "uuid-here", name: "Electronics"}
Category ID format: string uuid-here
Selected category_id format: string uuid-here
Verifying category exists in database...
Database category check: {data: {id: "uuid-here", name: "Electronics"}, error: null}
All validations passed, attempting insert...
```

If any of these steps fail, that's where the issue is.
