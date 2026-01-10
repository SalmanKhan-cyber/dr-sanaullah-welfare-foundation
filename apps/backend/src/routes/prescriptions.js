import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadFile, getSignedUrl } from '../lib/storage.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		const { patientId, doctorId } = req.body || {};
		if (!req.file || !patientId) return res.status(400).json({ error: 'file and patientId required' });
		
		const path = `${patientId}/${Date.now()}-${req.file.originalname}`;
		const { url } = await uploadFile('prescriptions', path, req.file.buffer, req.file.mimetype);
		
		await supabaseAdmin.from('prescriptions').insert({
			patient_id: patientId,
			doctor_id: doctorId,
			file_url: path
		});
		
		// Check if user is a student - don't send prescription notifications to students
		const { data: userData } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', patientId)
			.single();
		
		// Only send prescription notifications to non-students (patients)
		if (userData?.role !== 'student') {
			await supabaseAdmin.from('notifications').insert({
				user_id: patientId,
				message: 'New prescription uploaded by your doctor.'
			});
		}
		
		res.json({ url, path });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Admin: Get all prescriptions
router.get('/all', async (req, res) => {
	try {
		// Check if user is admin
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('prescriptions')
			.select('*, patients(users(name, email)), doctors(name, specialization)')
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ prescriptions: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/patient/:patientId', async (req, res) => {
	try {
		const { patientId } = req.params;
		const { data, error } = await supabaseAdmin
			.from('prescriptions')
			.select('*')
			.eq('patient_id', patientId)
			.order('created_at', { ascending: false });
		if (error) return res.status(400).json({ error: error.message });
		res.json({ prescriptions: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/:id/download', async (req, res) => {
	try {
		const { id } = req.params;
		const { data } = await supabaseAdmin.from('prescriptions').select('file_url').eq('id', id).single();
		if (!data?.file_url) return res.status(404).json({ error: 'Prescription not found' });
		const url = await getSignedUrl('prescriptions', data.file_url);
		res.json({ url });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

