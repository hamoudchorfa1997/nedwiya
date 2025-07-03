# Database Schema Debug

## Quick Test to Check Data Types

1. **Open your app and go to Stock tab**
2. **Open browser console (F12)**
3. **Try to create a stock item**
4. **Look for these logs:**

```
🔄 Fetching data from Supabase...
📊 Categories data types and values:
  1. Electronics: ID = 14 (string)  // or (number)
📋 Available categories: [{id: "14", name: "Electronics", idType: "string"}]
🔍 Selected category_id: "14" Type: string
🔍 Category comparison results:
  - Electronics: 14 (string) === 14 (string) = true
```

## Likely Issues and Solutions

### Issue 1: Data Type Mismatch
**Problem**: Category IDs in database are numbers but UI treats them as strings
**Solution**: Convert types consistently

### Issue 2: Stale Category Data
**Problem**: UI shows old categories that were deleted
**Solution**: Click "🔄 Refresh" button or refresh page

### Issue 3: Database Schema Issue
**Problem**: Foreign key constraint expects different data type
**Solution**: Check database schema

## Database Commands to Run

**Check category data types in Supabase SQL Editor:**

```sql
-- Check what's in categories table
SELECT id, name, pg_typeof(id) as id_type FROM categories;

-- Check foreign key constraint details
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='stock_items';
```

## Expected Output

You should see category ID "14" in the logs. If you see:
- **ID = "14" (string)**: Good, this is expected
- **ID = 14 (number)**: This might cause issues if the UI expects strings

## Quick Fixes

### Fix 1: Force String Conversion
In the stock creation, ensure category_id is always a string:

```javascript
category_id: String(formData.category_id)
```

### Fix 2: Database Schema Fix
If categories use UUID (text), make sure stock_items.category_id is also text:

```sql
ALTER TABLE stock_items ALTER COLUMN category_id TYPE TEXT;
```

### Fix 3: Clear All Data and Start Fresh
```sql
DELETE FROM stock_items;
DELETE FROM categories;
INSERT INTO categories (name, color) VALUES ('Electronics', '#3B82F6');
```

## Test Steps

1. **Check console logs** when loading the app
2. **Note the category ID type** from the logs
3. **Try creating a stock item** and see what happens
4. **If it fails**, check if the types match in the logs

The detailed logging should show us exactly where the mismatch is happening!
