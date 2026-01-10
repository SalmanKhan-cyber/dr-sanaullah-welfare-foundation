// Quick script to fix admin user role
// Run this with: node fix-admin-role.js
// Make sure backend is running on http://localhost:4000

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

async function fixAdminRole() {
	try {
		// First, we need to get the user ID for admin@dswf.org
		// This requires Supabase Admin API access
		console.log('⚠️  This script requires Supabase Admin access.');
		console.log('📝 Better approach: Use the SQL script (fix-admin-role.sql) in Supabase SQL Editor');
		console.log('\n📋 Steps to fix admin role:');
		console.log('1. Go to: https://supabase.com/dashboard/project/qudebdejubackprbarvc');
		console.log('2. Click "SQL Editor" in left sidebar');
		console.log('3. Copy and paste the contents of fix-admin-role.sql');
		console.log('4. Click "Run"');
		console.log('5. Log out and log back in with admin@dswf.org');
	} catch (err) {
		console.error('Error:', err);
	}
}

fixAdminRole();

