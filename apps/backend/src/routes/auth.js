import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Email sign up (magic link/verification email)
// All registrations require admin approval (verified: false)
// Supports multiple roles per email - each role has its own profile
router.post('/signup-email', async (req, res) => {
	const { email, password, role, name } = req.body || {};
	if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
	
	let userId;
	let isExistingUser = false;
	
	// Check if user already exists
	const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
	const existingUser = existingUsers.users.find(u => u.email === email);
	
	if (existingUser) {
		// User exists - verify password but DO NOT sign in automatically
		isExistingUser = true;
		userId = existingUser.id;
		
		// Just verify password exists, but don't create session
		// Users should log in manually after registration
		console.log(`✅ Using existing user account: ${userId} for new ${role} profile`);
	} else {
		// New user - create auth account
		const { data, error } = await supabaseAdmin.auth.signUp({
			email,
			password,
			options: { data: { role, name } }
		});
		
		if (error) return res.status(400).json({ error: error.message });
		if (!data.user) return res.status(400).json({ error: 'Failed to create user account' });
		
		userId = data.user.id;
		console.log(`✅ Created new user account: ${userId}`);
	}
	
	// Check if user already has this role profile
	const { data: existingUserData } = await supabaseAdmin
		.from('users')
		.select('role, verified')
		.eq('id', userId)
		.maybeSingle(); // Use maybeSingle to handle case where user doesn't exist yet
	
	// Determine verified status:
	// - If user doesn't exist: false (new registration requires approval)
	// - If user exists and is admin: preserve admin status (true) - admins stay verified
	// - If user exists and is registering a different role: require new approval (false)
	// - If user exists with same role and is verified: preserve (true)
	const isNewUser = !existingUserData;
	const isRoleChange = existingUserData && existingUserData.role !== role;
	const isAdmin = existingUserData?.role === 'admin';
	
	// New users or role changes require approval, unless they're already an admin
	const verifiedStatus = (isAdmin && existingUserData?.verified) 
		? true  // Admins stay verified even when adding new roles
		: (isNewUser || isRoleChange) 
			? false  // New registrations or role changes require approval
			: (existingUserData?.verified ?? false);  // Same role: preserve existing status
	
	// Validate role
	const validRoles = ['patient', 'doctor', 'donor', 'lab', 'student', 'teacher', 'pharmacy', 'blood_bank', 'admin'];
	const finalRole = role || existingUserData?.role || 'patient';
	
	if (!validRoles.includes(finalRole)) {
		console.error(`❌ Invalid role: ${finalRole}. Valid roles are: ${validRoles.join(', ')}`);
		return res.status(400).json({ error: `Invalid role: ${finalRole}. Please select a valid role.` });
	}
	
	// Update or create user in users table
	// IMPORTANT: Always update to the new role being registered, don't preserve old role
	// This ensures blood_bank registrations actually set the role to blood_bank
	const userData = {
		id: userId,
		role: finalRole, // Use NEW role, not existing one
		name: name || existingUserData?.name || null,
		email: email,
		verified: verifiedStatus // New registrations or role changes require approval
	};
	
	console.log(`📝 User registration: userId=${userId}, existingRole=${existingUserData?.role || 'none'}, newRole=${role}, finalRole=${finalRole}, isNewUser=${isNewUser}, isRoleChange=${isRoleChange}, verified=${verifiedStatus}`);
	
	console.log('📝 User data to be upserted:', JSON.stringify(userData, null, 2));
	
	const { error: upsertError } = await supabaseAdmin.from('users').upsert(userData, { onConflict: 'id' });
	
	if (upsertError) {
		console.error('❌ Error updating user in users table:', upsertError);
		console.error('❌ User data that failed:', JSON.stringify(userData, null, 2));
		console.error('❌ Supabase error details:', {
			message: upsertError.message,
			details: upsertError.details,
			hint: upsertError.hint,
			code: upsertError.code
		});
		
		// Return more detailed error message to help debug
		const errorMessage = upsertError.message || 'Failed to create user profile';
		const isConstraintError = errorMessage.includes('constraint') || errorMessage.includes('check');
		
		if (isConstraintError) {
			return res.status(400).json({ 
				error: `Invalid role or data: ${errorMessage}. Please check that the role "${userData.role}" is valid.` 
			});
		}
		
		return res.status(500).json({ 
			error: `Failed to create user profile: ${errorMessage}. Please ensure all fields are filled correctly and try again.` 
		});
	}
	
	console.log(`✅ User ${userId} (${email}) profile updated for role: ${role}`);
	
	return res.json({ 
		user: { id: userId, email },
		isExistingUser,
		message: isExistingUser 
			? `Additional ${role} profile created successfully. Your registration is pending admin approval.`
			: 'Registration submitted successfully. Your account is pending admin approval.'
	});
});

// Phone OTP sign in/up
router.post('/otp', async (req, res) => {
	const { phone } = req.body || {};
	if (!phone) return res.status(400).json({ error: 'Phone required' });
	const { error } = await supabaseAdmin.auth.signInWithOtp({ phone });
	if (error) return res.status(400).json({ error: error.message });
	return res.json({ ok: true });
});

// Get all roles/profiles for a user
router.get('/user-roles', authMiddleware, async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		const roles = [];
		
		// Check each role-specific table to see if user has a profile
		const roleChecks = [
			{ role: 'patient', table: 'patients', field: 'user_id' },
			{ role: 'doctor', table: 'doctors', field: 'user_id' },
			{ role: 'donor', table: 'donations', field: 'donor_id' }, // Check if they've made donations
			{ role: 'lab', table: 'lab_users', field: 'user_id' },
			{ role: 'student', table: 'students', field: 'user_id' },
			{ role: 'teacher', table: 'teachers', field: 'user_id' }, // Check teachers table
			{ role: 'pharmacy', table: 'pharmacy_users', field: 'user_id' },
		];
		
		// Check users table for primary role
		const { data: userData } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', userId)
			.single();
		
		if (userData?.role) {
			roles.push({ role: userData.role, isPrimary: true });
		}
		
		// Check each role table
		for (const check of roleChecks) {
			try {
				const { data, error } = await supabaseAdmin
					.from(check.table)
					.select(check.field)
					.eq(check.field, userId)
					.limit(1);
				
				if (!error && data && data.length > 0) {
					// Only add if not already in roles list
					if (!roles.find(r => r.role === check.role)) {
						roles.push({ role: check.role, isPrimary: false });
					}
				}
			} catch (err) {
				// Table might not exist, skip it
				console.warn(`Could not check ${check.table}:`, err.message);
			}
		}
		
		// Also check admin role (usually in users table, but check explicitly)
		if (userData?.role === 'admin') {
			const adminRole = roles.find(r => r.role === 'admin');
			if (adminRole) {
				adminRole.isPrimary = true;
			}
		}
		
		// Remove duplicates and sort (primary role first)
		const uniqueRoles = roles.reduce((acc, role) => {
			if (!acc.find(r => r.role === role.role)) {
				acc.push(role);
			}
			return acc;
		}, []);
		
		uniqueRoles.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
		
		res.json({ roles: uniqueRoles });
	} catch (err) {
		console.error('Error fetching user roles:', err);
		res.status(500).json({ error: err.message });
	}
});

// Set or update role in user metadata (admin or the user who owns it)
router.post('/set-role', async (req, res) => {
	const { userId, role, name, email, phone } = req.body || {};
	if (!userId || !role) return res.status(400).json({ error: 'userId and role required' });
	
	// Update user metadata in Auth
	const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { role, name } });
	if (error) return res.status(400).json({ error: error.message });
	
	// Get the auth user to get email and other details
	const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
	
	// Get current user data to preserve verified status when switching roles
	const { data: currentUser } = await supabaseAdmin
		.from('users')
		.select('verified')
		.eq('id', userId)
		.single();
	
	// Also update users table with complete info
	// Preserve verified status if user is switching between roles they already have access to
	const userData = {
		id: userId,
		role,
		name: name || authUser?.user?.user_metadata?.name || null,
		email: email || authUser?.user?.email || null,
		verified: currentUser?.verified ?? false // Preserve existing verified status
	};
	
	// Only add phone if it's provided and doesn't conflict
	if (phone) {
		// Check if phone is already taken by another user
		const { data: existingUserWithPhone } = await supabaseAdmin
			.from('users')
			.select('id')
			.eq('phone', phone)
			.neq('id', userId)
			.single();
		
		if (existingUserWithPhone) {
			console.warn(`Phone ${phone} already in use by another user, skipping phone update`);
			// Don't add phone to avoid conflict, but continue with user creation
		} else {
			userData.phone = phone;
		}
	} else {
		// If no phone provided, use from auth user if available
		userData.phone = authUser?.user?.phone || null;
	}
	
	const { error: upsertError } = await supabaseAdmin.from('users').upsert(userData, { onConflict: 'id' });
	if (upsertError) {
		// If it's a phone conflict, try again without phone
		if (upsertError.message?.includes('phone') && phone) {
			console.warn('Phone conflict detected, retrying without phone');
			delete userData.phone;
			const { error: retryError } = await supabaseAdmin.from('users').upsert(userData, { onConflict: 'id' });
			if (retryError) return res.status(400).json({ error: retryError.message });
		} else {
			return res.status(400).json({ error: upsertError.message });
		}
	}
	
	return res.json({ user: data.user, message: 'User created successfully' });
});

export default router;
