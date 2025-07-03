// Debug script to test Supabase connection and database operations
// Run this in your browser console after logging in to see what's happening

console.log('=== Supabase Debug Script ===');

// Test 1: Check if Supabase client is initialized
console.log('1. Supabase client:', window.supabase || 'Not available');

// Test 2: Check environment variables
console.log('2. Environment variables:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Test 3: Check current session and user
async function checkSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log('3. Authentication Status:');
  console.log('Session:', session ? 'Active' : 'None');
  console.log('User:', user ? user : 'Not authenticated');
  console.log('User ID:', user?.id || 'No user ID');
  console.log('Session error:', error);
  console.log('User error:', userError);
  return { session, user };
}

// Test 4: Check RLS policies by testing read access
async function testRLSRead() {
  console.log('4. Testing RLS policies (READ access)...');
  
  // Test categories read
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .limit(5);
  console.log('Categories READ result:', { data: categories, error: catError });
  
  // Test stock_items read  
  const { data: items, error: itemsError } = await supabase
    .from('stock_items')
    .select('*')
    .limit(5);
  console.log('Stock items READ result:', { data: items, error: itemsError });
}

// Test 5: Check RLS policies by testing write access
async function testRLSWrite() {
  console.log('5. Testing RLS policies (WRITE access)...');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('Cannot test write access - user not authenticated');
    return;
  }
  
  // Test category insert
  const testCategory = {
    name: 'RLS Test Category - ' + Date.now(),
    description: 'Test category for RLS',
    color: '#FF0000',
    order: 1,
    user_id: user.id
  };
  
  console.log('Testing category insert with data:', testCategory);
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .insert([testCategory])
    .select();
  console.log('Category INSERT result:', { data: catData, error: catError });
  
  // If category insert worked, test stock item insert
  if (catData && catData.length > 0) {
    const testItem = {
      name: 'RLS Test Item - ' + Date.now(),
      category_id: catData[0].id,
      quantity_brought: 10,
      quantity_sold: 0,
      price_per_unit: 1.99,
      entry_cost: 1.00,
      user_id: user.id
    };
    
    console.log('Testing stock item insert with data:', testItem);
    const { data: itemData, error: itemError } = await supabase
      .from('stock_items')
      .insert([testItem])
      .select();
    console.log('Stock item INSERT result:', { data: itemData, error: itemError });
    
    // Clean up test data
    if (itemData && itemData.length > 0) {
      console.log('Cleaning up test item...');
      await supabase.from('stock_items').delete().eq('id', itemData[0].id);
    }
    
    console.log('Cleaning up test category...');
    await supabase.from('categories').delete().eq('id', catData[0].id);
  }
}

// Test 6: Check if tables have user_id columns
async function checkTableSchema() {
  console.log('6. Checking table schema...');
  
  // This won't work directly, but we can infer from error messages
  const { data, error } = await supabase
    .from('stock_items')
    .insert([{ invalid_test: true }])
    .select();
    
  console.log('Schema test error (expected):', error);
  if (error?.message) {
    if (error.message.includes('user_id')) {
      console.log('✓ Table appears to have user_id column');
    } else {
      console.log('? Cannot determine if user_id column exists');
    }
  }
}

// Run all tests
async function runAllTests() {
  try {
    const auth = await checkSession();
    await testRLSRead();
    if (auth.user) {
      await testRLSWrite();
    }
    await checkTableSchema();
    console.log('=== Debug script completed ===');
    
    // Summary
    console.log('\n=== SUMMARY ===');
    if (!auth.user) {
      console.log('❌ USER NOT AUTHENTICATED - Please log in first');
    } else {
      console.log('✓ User authenticated with ID:', auth.user.id);
    }
    
    console.log('\nNext steps:');
    console.log('1. If not authenticated, log in to the app');
    console.log('2. If authenticated but getting RLS errors, check the RLS policies in Supabase dashboard');
    console.log('3. Ensure user_id columns exist in your tables');
    console.log('4. Try the solutions in FIX-RLS-POLICY.md');
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.supabaseDebug = {
    checkSession,
    testRLSRead,
    testRLSWrite,
    checkTableSchema,
    runAllTests
  };
}

console.log('Debug functions available: window.supabaseDebug');
console.log('Run window.supabaseDebug.runAllTests() to test everything');
