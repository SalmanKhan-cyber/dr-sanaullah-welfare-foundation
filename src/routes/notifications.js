import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Check if user is a student
		const { data: userData } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', userId)
			.single();
		
		const isStudent = userData?.role === 'student';
		
		let query = supabaseAdmin
			.from('notifications')
			.select('*')
			.eq('user_id', userId);
		
		// If user is a student, only show notifications from teachers
		if (isStudent) {
			// Only show notifications where the sender is a teacher
			// Join with users table to check sender role
			const { data: notifications, error } = await supabaseAdmin
				.from('notifications')
				.select(`
					*,
					sender_users!notifications_sender_id_fkey(role)
				`)
				.eq('user_id', userId)
				.eq('sender_users.role', 'teacher')
				.order('created_at', { ascending: false });
			
			if (error) return res.status(400).json({ error: error.message });
			
			res.json({ notifications: notifications || [] });
			return;
		}
		
		// For non-students (teachers, admin, etc.), show all notifications
		const { data, error } = await query
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		
		res.json({ notifications: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.post('/read', async (req, res) => {
	const { id } = req.body || {};
	const { error } = await supabaseAdmin.from('notifications').update({ read: true }).eq('id', id);
	if (error) return res.status(400).json({ error: error.message });
	res.json({ ok: true });
});

export default router;
