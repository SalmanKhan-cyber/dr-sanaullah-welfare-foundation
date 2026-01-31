import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get current user's verification status
router.get('/me', async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		
		const { data, error } = await supabaseAdmin
			.from('users')
			.select('id, name, email, phone, role, verified, created_at')
			.eq('id', userId)
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ user: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/', async (req, res) => {
	try {
		// OPTIMIZED: Add pagination and limit to prevent loading all users at once
		// For admin dashboard, prioritize showing unverified users first
		const limit = parseInt(req.query.limit) || 2000; // Increased to 2000 to ensure new registrations show
		const offset = parseInt(req.query.offset) || 0;
		
		// Fetch users ordered by verified status first (unverified first), then by created_at
		// This ensures new pending registrations appear at the top
		const { data, error } = await supabaseAdmin
			.from('users')
			.select('id, name, email, phone, role, verified, created_at')
			.order('verified', { ascending: true }) // Unverified (false) first
			.order('created_at', { ascending: false }) // Then by newest first
			.range(offset, offset + limit - 1);
		
		if (error) {
			console.error('❌ Error fetching users:', error);
			return res.status(400).json({ error: error.message });
		}
		
		const users = data || [];
		const unverifiedCount = users.filter(u => !u.verified).length;
		console.log(`✅ Fetched ${users.length} users (${unverifiedCount} unverified, offset: ${offset})`);
		
		res.json({ users });
	} catch (err) {
		console.error('❌ Exception in /api/users:', err);
		res.status(500).json({ error: err.message });
	}
});

router.post('/approve', async (req, res) => {
	try {
		const { userId } = req.body || {};
		if (!userId) return res.status(400).json({ error: 'userId required' });
		
		// Get user info to check role
		const { data: userData, error: userError } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', userId)
			.single();
		
		if (userError) return res.status(400).json({ error: userError.message });
		
		// Update verified status
		const { error } = await supabaseAdmin.from('users').update({ verified: true }).eq('id', userId);
		if (error) return res.status(400).json({ error: error.message });
		
		// If user is a doctor, ensure they have a doctor profile
		if (userData?.role === 'doctor') {
			const { data: existingDoctor, error: doctorCheckError } = await supabaseAdmin
				.from('doctors')
				.select('id')
				.eq('user_id', userId)
				.single();
			
			if (doctorCheckError && doctorCheckError.code !== 'PGRST116') {
				console.error('❌ Error checking existing doctor profile:', doctorCheckError);
				// Don't fail approval - continue with user approval
			}
			
			if (!existingDoctor) {
				// Get user's name to create basic profile
				const { data: userInfo, error: userError } = await supabaseAdmin
					.from('users')
					.select('name, email')
					.eq('id', userId)
					.single();
				
				if (userError) {
					console.error('❌ Failed to get user info for doctor profile:', userError);
				} else {
					// Create a minimal doctor profile so they can access the dashboard
					const { error: doctorError } = await supabaseAdmin
						.from('doctors')
						.insert({
							user_id: userId,
							name: userInfo?.name || 'Doctor',
							specialization: null,
							degrees: null,
							consultation_fee: 0,
							discount_rate: 50,
							timing: null
						});
					
					if (doctorError) {
						console.error('❌ Failed to create doctor profile:', doctorError);
						console.error('Doctor profile data:', {
							user_id: userId,
							name: userInfo?.name || 'Doctor'
						});
						// Don't fail approval - user can create profile later
					} else {
						console.log(`✅ Created doctor profile for user ${userId} (${userInfo?.name})`);
					}
				}
			} else {
				console.log(`📋 Doctor profile already exists for user ${userId}`);
			}
		}
		
		// If user is a lab user, ensure they're linked to a lab - CRITICAL for immediate access
		if (userData?.role === 'lab') {
			// Check if lab_users link exists
			const { data: labUsers, error: labUsersError } = await supabaseAdmin
				.from('lab_users')
				.select('lab_id')
				.eq('user_id', userId)
				.limit(1);
			
			if (labUsers && labUsers.length > 0) {
				// Link exists - perfect!
				console.log(`✅ Lab user ${userId} approved - linked to lab ${labUsers[0].lab_id}`);
			} else {
				// Link doesn't exist - MUST create it now so user can access their panel immediately
				console.log(`🔧 Lab user ${userId} approved but link missing. Creating link now...`);
				
				// Get user info to find their lab
				const { data: userFull, error: userFullError } = await supabaseAdmin
					.from('users')
					.select('email, created_at')
					.eq('id', userId)
					.single();
				
				if (!userFull || userFullError) {
					console.error(`❌ Failed to get user info:`, userFullError);
					// Continue anyway - link might exist but query failed
				} else {
					// Strategy 1: Find labs created around the same time (within 10 minutes after user)
					const userCreatedAt = new Date(userFull.created_at);
					const tenMinutesLater = new Date(userCreatedAt.getTime() + 10 * 60 * 1000);
					
					const { data: matchingLabs } = await supabaseAdmin
						.from('labs')
						.select('id, name, created_at')
						.gte('created_at', userCreatedAt.toISOString())
						.lte('created_at', tenMinutesLater.toISOString())
						.order('created_at', { ascending: false })
						.limit(5);
					
					let labToLink = null;
					
					if (matchingLabs && matchingLabs.length > 0) {
						// Find unassigned lab
						const { data: labsWithUsers } = await supabaseAdmin
							.from('lab_users')
							.select('lab_id')
							.in('lab_id', matchingLabs.map(l => l.id));
						
						const assignedLabIds = new Set((labsWithUsers || []).map(lu => lu.lab_id));
						labToLink = matchingLabs.find(lab => !assignedLabIds.has(lab.id));
					}
					
					// Strategy 2: If no time match, find most recent unassigned lab
					if (!labToLink) {
						const { data: allLabs } = await supabaseAdmin
							.from('labs')
							.select('id, name, created_at')
							.order('created_at', { ascending: false })
							.limit(10);
						
						const { data: allLabUsers } = await supabaseAdmin
							.from('lab_users')
							.select('lab_id');
						
						const assignedLabIds = new Set((allLabUsers || []).map(lu => lu.lab_id));
						labToLink = (allLabs || []).find(lab => !assignedLabIds.has(lab.id));
					}
					
					// Create the link - user must have a lab to access the panel
					if (labToLink) {
						const { error: linkError } = await supabaseAdmin
							.from('lab_users')
							.insert({ user_id: userId, lab_id: labToLink.id });
						
						if (!linkError) {
							console.log(`✅ Created lab_users link: user ${userId} → lab ${labToLink.id} (${labToLink.name})`);
						} else {
							console.error(`❌ Failed to create link:`, linkError);
							// If link creation fails, we should warn but not fail approval
							// The link might already exist or there could be a race condition
						}
					} else {
						console.error(`❌ No lab found to link for user ${userId}`);
						// This is a problem - user approved but no lab found
						// But we won't fail the approval to avoid blocking legitimate cases
					}
				}
			}
			
			// Final verification: Ensure link exists before returning success
			// Give database a moment to sync if link was just created
			if (!labUsers || labUsers.length === 0) {
				await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for DB sync
				
				// Re-check link one more time
				const { data: finalCheck } = await supabaseAdmin
					.from('lab_users')
					.select('lab_id')
					.eq('user_id', userId)
					.limit(1);
				
				if (finalCheck && finalCheck.length > 0) {
					console.log(`✅ Verified lab_users link exists after creation: user ${userId} → lab ${finalCheck[0].lab_id}`);
				}
			}
		}
		
		res.json({ ok: true, message: 'User approved successfully' });
	} catch (err) {
		console.error('Error approving user:', err);
		res.status(500).json({ error: err.message });
	}
});

router.post('/reject', async (req, res) => {
	try {
		const { userId } = req.body || {};
		if (!userId) return res.status(400).json({ error: 'userId required' });
		
		// Get user info before deletion (for cleanup)
		const { data: userData } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', userId)
			.single();
		
		// If it's a lab user, get lab association before deletion
		let labIdToCleanup = null;
		if (userData?.role === 'lab') {
			const { data: labUsers } = await supabaseAdmin
				.from('lab_users')
				.select('lab_id')
				.eq('user_id', userId)
				.limit(1)
				.single();
			
			if (labUsers) {
				labIdToCleanup = labUsers.lab_id;
			}
		}
		
		// Delete lab_users link first (if exists)
		await supabaseAdmin
			.from('lab_users')
			.delete()
			.eq('user_id', userId);
		
		// Delete from users table
		const { error: usersDeleteError } = await supabaseAdmin
			.from('users')
			.delete()
			.eq('id', userId);
		
		if (usersDeleteError) {
			console.error('Error deleting from users table:', usersDeleteError);
		}
		
		// Delete from Supabase Auth
		const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
		if (deleteError) {
			console.error('Error deleting from Auth:', deleteError);
			// If users table deletion succeeded but auth failed, still return success
			// because the user is effectively removed from the system
			if (usersDeleteError) {
				return res.status(400).json({ error: `Failed to delete user: ${deleteError.message}` });
			}
		}
		
		// Clean up lab if it was created during registration and has no other users
		if (labIdToCleanup) {
			const { data: remainingLabUsers } = await supabaseAdmin
				.from('lab_users')
				.select('user_id')
				.eq('lab_id', labIdToCleanup);
			
			// If no other users linked to this lab, delete the lab too
			if (!remainingLabUsers || remainingLabUsers.length === 0) {
				await supabaseAdmin
					.from('labs')
					.delete()
					.eq('id', labIdToCleanup);
				console.log(`✅ Also deleted orphaned lab ${labIdToCleanup}`);
			}
		}
		
		console.log(`✅ User ${userId} rejected and deleted successfully`);
		res.json({ ok: true, message: 'User registration rejected and account deleted' });
	} catch (err) {
		console.error('Error rejecting user:', err);
		res.status(500).json({ error: err.message });
	}
});

router.put('/role', async (req, res) => {
	const { userId, role } = req.body || {};
	if (!userId || !role) return res.status(400).json({ error: 'userId and role required' });
	
	// Update users table
	const { error } = await supabaseAdmin.from('users').update({ role }).eq('id', userId);
	if (error) return res.status(400).json({ error: error.message });
	
	// Update auth metadata
	const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { role } });
	if (authError) return res.status(400).json({ error: authError.message });
	
	res.json({ ok: true });
});

// Update user info (name, phone, password)
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { name, phone, password } = req.body || {};
	
	if (!id) return res.status(400).json({ error: 'userId required' });
	
	const updateData = {};
	if (name !== undefined) updateData.name = name;
	if (phone !== undefined) updateData.phone = phone;
	
	// Update users table
	if (Object.keys(updateData).length > 0) {
		const { error } = await supabaseAdmin.from('users').update(updateData).eq('id', id);
		if (error) return res.status(400).json({ error: error.message });
	}
	
	// Update password if provided
	if (password && password.trim()) {
		const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(id, {
			password: password
		});
		if (passwordError) return res.status(400).json({ error: passwordError.message });
	}
	
	res.json({ ok: true, message: 'User updated successfully' });
});

router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	if (!id) return res.status(400).json({ error: 'userId required' });
	
	// Delete from auth (this will cascade delete from users and related tables)
	const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
	if (error) return res.status(400).json({ error: error.message });
	
	res.json({ ok: true, message: 'User deleted successfully' });
});

export default router;
