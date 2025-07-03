# Stock Item Creation Troubleshooting

## Current Status
✅ **Categories creation is working**  
❌ **Stock items creation is failing**

This suggests the issue is specifically with the `stock_items` table, not your authentication or general setup.

## Most Likely Causes

### 1. Different RLS Policies
The `categories` and `stock_items` tables have different Row Level Security settings.

**Solution**: 
1. Go to **Supabase Dashboard → Authentication → Policies**
2. Find the `stock_items` table
3. **Either**:
   - Click **"Disable RLS"** (easiest)
   - **Or** create the same policies you have for categories

### 2. Missing Columns in stock_items Table
The database might be missing some expected columns.

**Check**: Your `stock_items` table should have:
- `id` (UUID, primary key)
- `name` (text)
- `category_id` (UUID, foreign key to categories.id)
- `quantity_brought` (integer)
- `quantity_sold` (integer, can be 0)
- `price_per_unit` (numeric/decimal)
- `entry_cost` (numeric/decimal)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3. Check Constraints or Data Validation
The database might have constraints that prevent certain values.

## Debugging Steps

### Step 1: Check Console Output
When you try to create a stock item, look for these logs:
1. `"Creating item with data:"` - Shows form data
2. `"Category validation passed:"` - Confirms category exists
3. `"Item data to insert (cleaned):"` - Shows processed data
4. `"Item data types:"` - Shows data type validation
5. `"Supabase response:"` - Shows the actual error

### Step 2: Common Error Messages & Solutions

#### "row-level security policy"
**Cause**: RLS is blocking the insert  
**Solution**: Disable RLS on `stock_items` table or create policies

#### "foreign key constraint"
**Cause**: Category doesn't exist or ID mismatch  
**Solution**: Refresh page, ensure category is selected

#### "violates check constraint"
**Cause**: Data validation failed (negative numbers, etc.)  
**Solution**: Check that quantities and prices are positive

#### "column does not exist"
**Cause**: Database schema mismatch  
**Solution**: Check database column names match the code

### Step 3: Quick RLS Fix
If it's an RLS issue (most likely):

1. **Supabase Dashboard → Authentication → Policies**
2. **Find `stock_items` table**
3. **Click "Disable RLS"**
4. **Try creating stock item again**

### Step 4: Data Validation Test
Try creating a stock item with these exact values:
- **Name**: "Test Item"
- **Category**: Select any category you created
- **Quantity Brought**: 10
- **Quantity Sold**: 0
- **Price per Unit**: 5.99
- **Entry Cost**: 3.50

## Expected Success Flow

When everything works, you should see:
```
Creating item with data: {name: "Test Item", category_id: "...", ...}
Category validation passed: {id: "...", name: "Electronics", ...}
Item data to insert (cleaned): {name: "Test Item", category_id: "...", ...}
Item data types: {name: "string", category_id: "string", ...}
Supabase response: {data: [...], error: null}
Item created successfully
```

## If Still Failing

1. **Copy the exact error message** from browser console
2. **Check if the `stock_items` table exists** in Supabase Table Editor
3. **Compare RLS settings** between `categories` and `stock_items` tables
4. **Try disabling RLS completely** on `stock_items` table

The enhanced logging will now show exactly what's happening and where it's failing.
