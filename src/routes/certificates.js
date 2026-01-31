import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { getSignedUrl } from '../lib/storage.js';

const router = Router();

// Generate/issue certificate (admin/teacher action)
router.post('/issue', async (req, res) => {
	try {
		const { userId, courseId, certificateUrl } = req.body || {};
		if (!userId || !courseId || !certificateUrl) {
			return res.status(400).json({ error: 'userId, courseId, and certificateUrl required' });
		}
		
		const { error } = await supabaseAdmin
			.from('students')
			.update({ certificate_url: certificateUrl, progress: 100 })
			.eq('user_id', userId)
			.eq('course_id', courseId);
		
		if (error) return res.status(400).json({ error: error.message });
		
		await supabaseAdmin.from('notifications').insert({
			user_id: userId,
			message: 'Congratulations! Your course certificate is ready.'
		});
		
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get student's certificates
router.get('/my', async (req, res) => {
	try {
		const userId = req.user.id;
		const { data, error } = await supabaseAdmin
			.from('students')
			.select('*, courses(title)')
			.eq('user_id', userId)
			.not('certificate_url', 'is', null);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ certificates: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Download certificate
router.get('/:id/download', async (req, res) => {
	try {
		const { id } = req.params;
		const { data } = await supabaseAdmin
			.from('students')
			.select('certificate_url')
			.eq('user_id', req.user.id)
			.eq('course_id', id)
			.single();
		
		if (!data?.certificate_url) return res.status(404).json({ error: 'Certificate not found' });
		const url = await getSignedUrl('certificates', data.certificate_url);
		res.json({ url });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

