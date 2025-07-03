# Stock Item Creation Debug Guide

## Issues Fixed:
1. ✅ Removed `user_id` from StockItem and Category types
2. ✅ Added form validation and loading states
3. ✅ Added comprehensive error logging and user feedback
4. ✅ Updated database insert logic with debugging

## Potential Issues & Solutions:

### 1. Environment Variables Missing
**Problem**: Supabase credentials not configured
**Solution**: 
- Copy `.env.local.template` to `.env.local`
- Fill in your Supabase project URL and anon key
- Restart the development server

### 2. Database Schema Still Has user_id
**Problem**: Database expects user_id but we're not providing it
**Solution**: In `app/page.tsx`, uncomment the user_id line:
```javascript
// user_id: user?.id || 'default-admin-id' // Uncomment if database still requires user_id
```

### 3. Database Connection Issues
**Problem**: Can't connect to Supabase
**Solution**: 
- Check if credentials are correct
- Verify project is active in Supabase dashboard
- Use the debug script to test connection

## Debugging Steps:

### Step 1: Check Environment Variables
1. Open browser console
2. Check if these are set:
   - `process.env.NEXT_PUBLIC_SUPABASE_URL`
   - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Use Debug Script
1. Open the app in browser
2. Open browser console
3. Copy and paste the content of `debug-supabase.js`
4. Run: `window.supabaseDebug.runAllTests()`
5. Check the output for errors

### Step 3: Check Console Logs
When you try to add a stock item, check browser console for:
- "Creating item with data:" - Shows the form data being submitted
- "Supabase response:" - Shows what Supabase returns
- Any error messages from the validation or database

### Step 4: Common Error Messages & Solutions

**"Error: Invalid JWT"**
- Solution: Login again or check authentication

**"Error: column 'user_id' violates not-null constraint"**
- Solution: Uncomment the user_id line in handleItemCreate

**"Error: relation 'stock_items' does not exist"**
- Solution: Check if the database table is created correctly

**"Error: Insert data is invalid"**
- Solution: Check if all required fields are provided and match the database schema

## Testing Checklist:
- [ ] Environment variables are set correctly
- [ ] Can login successfully
- [ ] Can see existing categories (if any)
- [ ] Can see existing stock items (if any)
- [ ] Form validation works (try submitting empty form)
- [ ] Console shows "Creating item with data:" when submitting
- [ ] Console shows successful response or specific error

## Next Steps:
1. Set up your `.env.local` file with Supabase credentials
2. Test the form with the debugging enabled
3. Share any error messages from the console for further troubleshooting
