import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';

const router = Router();

// Get all labs (public endpoint - no auth required for viewing labs list)
router.get('/public', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('labs')
			.select('*')
			.order('name');
		if (error) return res.status(400).json({ error: error.message });
		res.json({ labs: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all labs (authenticated)
router.get('/', authMiddleware, async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('labs')
			.select('*')
			.order('name');
		if (error) return res.status(400).json({ error: error.message });
		res.json({ labs: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Register lab with user account (public endpoint - requires admin approval)
router.post('/register', async (req, res) => {
	try {
		const { lab_name, location, contact_info, services, user_name, email, password } = req.body || {};
		
		if (!lab_name || !user_name || !email || !password) {
			return res.status(400).json({ error: 'Lab name, contact person name, email, and password are required' });
		}
		
		if (password.length < 6) {
			return res.status(400).json({ error: 'Password must be at least 6 characters' });
		}
		
		// Create user account in Supabase Auth
		const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
			email,
			password,
			options: {
				data: { role: 'lab', name: user_name }
			}
		});
		
		if (authError) {
			if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
				return res.status(400).json({ error: 'Email already registered. Please use a different email or contact support.' });
			}
			return res.status(400).json({ error: authError.message });
		}
		
		const userId = authData.user.id;
		
		// Create user in users table with verified: false (requires admin approval)
		const { error: userUpsertError } = await supabaseAdmin.from('users').upsert({
			id: userId,
			role: 'lab',
			name: user_name,
			email: email,
			verified: false,
			created_at: new Date().toISOString() // Ensure created_at is set for matching during approval
		}, { onConflict: 'id' });
		
		if (userUpsertError) {
			console.error('Error upserting user into users table:', userUpsertError);
			await supabaseAdmin.auth.admin.deleteUser(userId);
			return res.status(500).json({ error: 'Failed to create user profile. Please try again.' });
		}
		
		// Create lab record
		const { data: labData, error: labError } = await supabaseAdmin
			.from('labs')
			.insert({ 
				name: lab_name, 
				location: location || null, 
				contact_info: contact_info || email || null, // Include email in contact_info for easier matching
				services: services || [],
				created_at: new Date().toISOString() // Ensure created_at is set for matching during approval
			})
			.select('*')
			.single();
		
		if (labError) {
			// If lab creation fails, delete the user account
			await supabaseAdmin.auth.admin.deleteUser(userId);
			return res.status(400).json({ error: labError.message });
		}
		
		// Link user to lab - CRITICAL: This must succeed
		// First check if link already exists (in case of retry)
		const { data: existingLink } = await supabaseAdmin
			.from('lab_users')
			.select('lab_id')
			.eq('user_id', userId)
			.eq('lab_id', labData.id)
			.single();
		
		if (!existingLink) {
			// Link doesn't exist, create it
			const { error: linkError } = await supabaseAdmin
				.from('lab_users')
				.insert({ user_id: userId, lab_id: labData.id });
			
			if (linkError) {
				console.error('❌ Error linking user to lab:', linkError);
				// If link fails, try to clean up: delete lab and user
				await supabaseAdmin.from('labs').delete().eq('id', labData.id);
				await supabaseAdmin.auth.admin.deleteUser(userId);
				return res.status(500).json({ 
					error: `Failed to link user to lab. Please try again. Error: ${linkError.message}` 
				});
			}
			console.log(`✅ Successfully created lab_users link: user ${userId} → lab ${labData.id} (${labData.name})`);
		} else {
			console.log(`✅ Lab_users link already exists: user ${userId} → lab ${labData.id} (${labData.name})`);
		}
		
		res.json({ 
			lab: labData, 
			message: 'Laboratory registration submitted successfully. Your account is pending admin approval.' 
		});
	} catch (err) {
		console.error('Lab registration error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Add lab (admin only - direct creation without approval)
router.post('/', authMiddleware, rbac(['admin']), async (req, res) => {
	try {
		const { name, location, contact_info, services } = req.body || {};
		if (!name) return res.status(400).json({ error: 'Name required' });
		
		const { data, error } = await supabaseAdmin
			.from('labs')
			.insert({ name, location, contact_info, services: services || [] })
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ lab: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update lab (admin only)
router.put('/:id', authMiddleware, rbac(['admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		
		const { data, error } = await supabaseAdmin
			.from('labs')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ lab: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete lab (admin only)
router.delete('/:id', authMiddleware, rbac(['admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { error } = await supabaseAdmin.from('labs').delete().eq('id', id);
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Assign lab user (admin only)
router.post('/users', authMiddleware, rbac(['admin']), async (req, res) => {
	try {
		const { user_id, lab_id } = req.body || {};
		if (!user_id || !lab_id) return res.status(400).json({ error: 'user_id and lab_id required' });
		
		const { data, error } = await supabaseAdmin
			.from('lab_users')
			.insert({ user_id, lab_id })
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ lab_user: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get labs for a user (authenticated)
router.get('/user/:userId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req.params;
		
		const { data, error } = await supabaseAdmin
			.from('lab_users')
			.select('*, labs(*)')
			.eq('user_id', userId);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ labs: data.map(d => d.labs) });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

