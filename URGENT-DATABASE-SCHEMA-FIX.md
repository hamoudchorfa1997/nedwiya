# URGENT: Database Schema Fix Required

## The Problem

The error shows a foreign key constraint mismatch:

```
Error: Key (id)=(9) is not present in table "categories"
Constraint: stock_items_id_fkey
Category ID attempted: 14
```

This means:
- Your app is sending `category_id = "14"`
- But the database is checking for `id = "9"` in categories table
- The foreign key constraint name `stock_items_id_fkey` suggests it's checking the `id` field instead of `category_id`

## Database Schema Issue

Run this in your Supabase SQL Editor to check the foreign key constraints:

```sql
-- Check current foreign key constraints
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

## Expected Result Should Be:
```
constraint_name: stock_items_category_id_fkey
table_name: stock_items
column_name: category_id
foreign_table_name: categories
foreign_column_name: id
```

## If Wrong, Fix With:

```sql
-- Drop the incorrect foreign key
ALTER TABLE stock_items DROP CONSTRAINT IF EXISTS stock_items_id_fkey;

-- Add the correct foreign key
ALTER TABLE stock_items 
ADD CONSTRAINT stock_items_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;
```

## Quick Database Reset (if needed):

```sql
-- Clear all data
DELETE FROM stock_items;
DELETE FROM categories;

-- Recreate categories table
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate stock_items table
DROP TABLE IF EXISTS stock_items CASCADE;
CREATE TABLE stock_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  quantity_brought INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  entry_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert test category
INSERT INTO categories (name, color) VALUES ('Electronics', '#3B82F6');
```

## Test Steps:

1. **Run the constraint check query** to see what's wrong
2. **Fix the foreign key constraint** if needed
3. **Test creating a category and stock item** again

The issue is definitely in the database schema, not the application code!
