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
		// Exclude appointment notifications (those should only be in patient panel)
		if (isStudent) {
			// Filter to only show notifications that are from teachers
			// Include: announcements, assignments, course-related messages
			// Exclude: appointment-related messages by only including teacher notifications
			query = query.or('message.ilike.%announcement%,message.ilike.%assignment%,message.ilike.%course%,message.ilike.%New announcement%,message.ilike.%New assignment%,message.ilike.%in %course%');
		}
		
		const { data, error } = await query
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Additional client-side filtering for students to exclude appointment notifications
		// This ensures appointment notifications never appear in student panel
		let filteredNotifications = data || [];
		if (isStudent) {
			filteredNotifications = filteredNotifications.filter(notif => {
				const message = (notif.message || '').toLowerCase();
				// Exclude appointment-related notifications
				const isAppointmentNotification = 
					message.includes('appointment') ||
					message.includes('booked with') ||
					message.includes('appointment status') ||
					message.includes('appointment time') ||
					message.includes('appointment request') ||
					(message.includes('doctor') && !message.includes('course'));
				
				// Only include teacher notifications (announcements, assignments, course-related)
				const isTeacherNotification = 
					message.includes('announcement') ||
					message.includes('assignment') ||
					message.includes('course') ||
					message.includes('new announcement') ||
					message.includes('new assignment');
				
				return !isAppointmentNotification && isTeacherNotification;
			});
		}
		
		res.json({ notifications: filteredNotifications });
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
