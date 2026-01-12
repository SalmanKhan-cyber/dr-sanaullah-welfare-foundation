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
		
		// If user is a student, only show legitimate student notifications
		if (isStudent) {
			// Only include notifications that are relevant to students
			// Include: announcements, assignments, course-related messages, certificates, donation receipts
			// Exclude: all appointment-related, lab-related, prescription-related notifications
			query = query.or(`
				message.ilike.%announcement%,
				message.ilike.%assignment%,
				message.ilike.%course%,
				message.ilike.%certificate%,
				message.ilike.%donation%,
				message.ilike.%graded%
			`);
		}
		
		const { data, error } = await query
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Additional client-side filtering for students to exclude inappropriate notifications
		let filteredNotifications = data || [];
		if (isStudent) {
			filteredNotifications = filteredNotifications.filter(notif => {
				const message = (notif.message || '').toLowerCase();
				
				// Exclude all medical/clinical notifications
				const excludedKeywords = [
					'appointment', 'doctor', 'booked with', 'prescription', 
					'test', 'lab', 'result', 'tracking', 'medical',
					'clinic', 'hospital', 'medicine', 'diagnosis'
				];
				
				// Include only academic/educational notifications
				const includedKeywords = [
					'announcement', 'assignment', 'course', 'certificate', 
					'donation', 'graded', 'thank you'
				];
				
				const hasExcludedKeyword = excludedKeywords.some(keyword => message.includes(keyword));
				const hasIncludedKeyword = includedKeywords.some(keyword => message.includes(keyword));
				
				// Only show if it has included keywords and no excluded keywords
				return hasIncludedKeyword && !hasExcludedKeyword;
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

// Clean up inappropriate notifications for students
router.post('/cleanup', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Check if user is a student
		const { data: userData } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', userId)
			.single();
		
		if (userData?.role !== 'student') {
			return res.json({ message: 'Cleanup only available for students' });
		}
		
		// Get all notifications for this user
		const { data: notifications } = await supabaseAdmin
			.from('notifications')
			.select('*')
			.eq('user_id', userId);
		
		if (!notifications || notifications.length === 0) {
			return res.json({ message: 'No notifications to clean up' });
		}
		
		// Filter out inappropriate notifications
		const inappropriateNotifications = notifications.filter(notif => {
			const message = (notif.message || '').toLowerCase();
			
			// Exclude all medical/clinical notifications
			const excludedKeywords = [
				'appointment', 'doctor', 'booked with', 'prescription', 
				'test', 'lab', 'result', 'tracking', 'medical',
				'clinic', 'hospital', 'medicine', 'diagnosis'
			];
			
			// Include only academic/educational notifications
			const includedKeywords = [
				'announcement', 'assignment', 'course', 'certificate', 
				'donation', 'graded', 'thank you'
			];
			
			const hasExcludedKeyword = excludedKeywords.some(keyword => message.includes(keyword));
			const hasIncludedKeyword = includedKeywords.some(keyword => message.includes(keyword));
			
			// Delete if it has excluded keywords or no included keywords
			return hasExcludedKeyword || !hasIncludedKeyword;
		});
		
		// Delete inappropriate notifications
		if (inappropriateNotifications.length > 0) {
			const idsToDelete = inappropriateNotifications.map(n => n.id);
			await supabaseAdmin
				.from('notifications')
				.delete()
				.in('id', idsToDelete);
		}
		
		res.json({ 
			message: 'Cleaned up inappropriate notifications',
			deleted: inappropriateNotifications.length 
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
