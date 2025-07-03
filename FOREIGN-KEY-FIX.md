# Fixing Foreign Key Constraint Error

## The Error
`Failed to create item: insert or update on table "stock_items" violates foreign key constraint "stock_items_id_fkey"`

## What This Means
The `category_id` you're trying to insert doesn't exist in the categories table, or there's an issue with the foreign key constraint.

## Step-by-Step Solution

### Step 1: Check if You Have Categories
1. Open your app and navigate to the **Categories** tab
2. Check if any categories exist
3. If no categories exist, create at least one category first

### Step 2: Create a Test Category
If you don't have any categories:
1. Go to **Categories** tab
2. Click **"Add Category"**
3. Fill in:
   - **Name**: "Test Category"
   - **Description**: "Test category for testing"
   - **Color**: Pick any color
4. Click **"Add Category"**

### Step 3: Try Creating Stock Item Again
1. Go to **Stock** tab
2. Click **"Add Stock Item"**
3. Make sure to **select the category** from the dropdown
4. Fill in other required fields
5. Click **"Add Item"**

### Step 4: Check Browser Console
Open browser console (F12) and look for these logs when creating an item:
- "Fetching data from Supabase..." (on page load)
- "Categories fetch result:" (should show your categories)
- "Creating item with data:" (when submitting form)
- "Category validation passed:" (should show the selected category)

## Common Issues & Solutions

### Issue 1: No Categories Available
**Symptoms**: Category dropdown is empty or shows "No categories"
**Solution**: Create categories first using the Categories tab

### Issue 2: Category ID Mismatch
**Symptoms**: Categories exist but foreign key error persists
**Solution**: 
1. Refresh the page to reload categories
2. Clear browser cache
3. Check if categories are properly loaded in console

### Issue 3: Database Constraint Issues
**Symptoms**: Error persists even with valid categories
**Solution**: Check your Supabase database:
1. Go to **Supabase Dashboard > Table Editor**
2. Check the `categories` table has data
3. Check the `stock_items` table foreign key constraints
4. Verify the constraint points to `categories.id`

## Database Foreign Key Check

In your Supabase SQL Editor, run this query to check constraints:

```sql
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
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='stock_items';
```

This will show you the foreign key relationships.

## Quick Test Steps

1. **Create a category first** (if none exist)
2. **Refresh the page** to ensure categories are loaded
3. **Check console logs** when creating stock item
4. **Verify category selection** in the form dropdown

## Expected Console Output

When everything works correctly, you should see:
```
Fetching data from Supabase...
Categories fetch result: {data: [...], error: null}
Creating item with data: {name: "...", category_id: "...", ...}
Category validation passed: {id: "...", name: "...", ...}
Item data to insert: {name: "...", category_id: "...", ...}
Supabase response: {data: [...], error: null}
Item created successfully
```

If you see errors in any of these steps, that's where the issue is.
