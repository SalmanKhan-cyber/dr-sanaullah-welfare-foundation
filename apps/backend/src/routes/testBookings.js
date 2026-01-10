import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { uploadFile } from '../lib/storage.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Upload prescription for test booking
router.post('/upload-prescription', authMiddleware, upload.single('file'), async (req, res) => {
	try {
		const patientId = req.user.id;
		if (!req.file) return res.status(400).json({ error: 'File is required' });
		
		// Ensure user has patient role
		if (req.user.role !== 'patient') {
			const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(patientId);
			if (user) {
				const currentMetadata = user.user_metadata || {};
				const updatedMetadata = { ...currentMetadata, role: 'patient' };
				await supabaseAdmin.auth.admin.updateUserById(patientId, {
					user_metadata: updatedMetadata
				});
			}
		}
		
		const path = `prescriptions/${patientId}/${Date.now()}-${req.file.originalname}`;
		const { url } = await uploadFile('prescriptions', path, req.file.buffer, req.file.mimetype);
		
		res.json({ url, path });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create a new test booking
router.post('/', authMiddleware, async (req, res) => {
	try {
		const patientId = req.user.id;
		const { lab_id, test_name, test_description, prescription_url, remarks } = req.body || {};
		
		if (!lab_id || !test_name) {
			return res.status(400).json({ error: 'lab_id and test_name are required' });
		}
		
		// Ensure user has patient role in metadata (update if not set)
		if (req.user.role !== 'patient') {
			const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(patientId);
			if (user) {
				const currentMetadata = user.user_metadata || {};
				const updatedMetadata = { ...currentMetadata, role: 'patient' };
				await supabaseAdmin.auth.admin.updateUserById(patientId, {
					user_metadata: updatedMetadata
				});
				req.user.role = 'patient';
			}
		}
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.insert({
				patient_id: patientId,
				lab_id,
				test_name,
				test_description,
				prescription_url,
				remarks,
				status: 'pending'
			})
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Send notification to lab
		if (data.lab_id) {
			const { data: labUsers } = await supabaseAdmin
				.from('lab_users')
				.select('user_id')
				.eq('lab_id', lab_id);
			
			if (labUsers && labUsers.length > 0) {
				for (const labUser of labUsers) {
					await supabaseAdmin.from('notifications').insert({
						user_id: labUser.user_id,
						message: `New test booking received: ${test_name} (Tracking: ${data.tracking_number})`
					});
				}
			}
		}
		
		// Send confirmation to patient (only if they're not a student)
		const { data: userData } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', patientId)
			.single();
		
		// Only send test booking notifications to non-students (patients)
		if (userData?.role !== 'student') {
			await supabaseAdmin.from('notifications').insert({
				user_id: patientId,
				message: `Test booking confirmed! Tracking Number: ${data.tracking_number}. Share this number to track your test.`
			});
		}
		
		res.json({ booking: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get patient's own bookings
router.get('/patient/me', authMiddleware, rbac(['patient']), async (req, res) => {
	try {
		const patientId = req.user.id;
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.select('*, labs(name, location, contact_info)')
			.eq('patient_id', patientId)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ bookings: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get bookings for a lab (Lab)
router.get('/lab/me', authMiddleware, rbac(['lab']), async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get lab_id for this user
		const { data: labUsers } = await supabaseAdmin
			.from('lab_users')
			.select('lab_id')
			.eq('user_id', userId);
		
		if (!labUsers || labUsers.length === 0) {
			return res.status(404).json({ error: 'No lab assigned to this user' });
		}
		
		const labIds = labUsers.map(lu => lu.lab_id);
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.select('*, users(name, email, phone), labs(name, location)')
			.in('lab_id', labIds)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ bookings: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update booking status (lab can update)
router.put('/:id/status', authMiddleware, rbac(['lab', 'admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body || {};
		
		if (!status) {
			return res.status(400).json({ error: 'status is required' });
		}
		
		const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}
		
		const updateData = {
			status,
			updated_at: new Date().toISOString()
		};
		
		if (status === 'completed') {
			updateData.completed_at = new Date().toISOString();
		}
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.update(updateData)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Send notification to patient (only if they're not a student)
		if (data.patient_id && status === 'completed') {
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('role')
				.eq('id', data.patient_id)
				.single();
			
			// Only send test booking notifications to non-students (patients)
			if (userData?.role !== 'student') {
				await supabaseAdmin.from('notifications').insert({
					user_id: data.patient_id,
					message: `Your test booking (${data.tracking_number}) has been completed. Check your results.`
				});
			}
		}
		
		res.json({ booking: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Upload test result file
router.post('/:id/upload-result', authMiddleware, rbac(['lab', 'admin']), upload.single('file'), async (req, res) => {
	try {
		const { id } = req.params;
		const { remarks } = req.body || {};
		if (!req.file) return res.status(400).json({ error: 'File is required' });
		
		// Get booking to find patient_id
		const { data: booking } = await supabaseAdmin
			.from('test_bookings')
			.select('patient_id')
			.eq('id', id)
			.single();
		
		if (!booking) return res.status(404).json({ error: 'Booking not found' });
		
		const path = `test-results/${booking.patient_id}/${Date.now()}-${req.file.originalname}`;
		const { url } = await uploadFile('lab-reports', path, req.file.buffer, req.file.mimetype);
		
		const updateData = {
			test_result_url: path,
			remarks,
			status: 'completed',
			completed_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.update(updateData)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Send notification to patient (only if they're not a student)
		if (data.patient_id) {
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('role')
				.eq('id', data.patient_id)
				.single();
			
			// Only send test booking notifications to non-students (patients)
			if (userData?.role !== 'student') {
				await supabaseAdmin.from('notifications').insert({
					user_id: data.patient_id,
					message: `Test results are ready for booking ${data.tracking_number}. Check your dashboard.`
				});
			}
		}
		
		res.json({ booking: data, url });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Upload test result (lab can upload)
router.put('/:id/result', authMiddleware, rbac(['lab', 'admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { test_result_url, remarks } = req.body || {};
		
		if (!test_result_url) {
			return res.status(400).json({ error: 'test_result_url is required' });
		}
		
		const updateData = {
			test_result_url,
			remarks,
			status: 'completed',
			completed_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.update(updateData)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Send notification to patient (only if they're not a student)
		if (data.patient_id) {
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('role')
				.eq('id', data.patient_id)
				.single();
			
			// Only send test booking notifications to non-students (patients)
			if (userData?.role !== 'student') {
				await supabaseAdmin.from('notifications').insert({
					user_id: data.patient_id,
					message: `Test results are ready for booking ${data.tracking_number}. Check your dashboard.`
				});
			}
		}
		
		res.json({ booking: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Public search by tracking number
router.get('/search/:trackingNumber', async (req, res) => {
	try {
		const { trackingNumber } = req.params;
		
		if (!trackingNumber) {
			return res.status(400).json({ error: 'Tracking number is required' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.select('*, labs(name, location, contact_info)')
			.eq('tracking_number', trackingNumber.toUpperCase())
			.single();
		
		if (error || !data) {
			return res.status(404).json({ error: 'Test booking not found' });
		}
		
		// Return limited info for public search (no patient details)
		res.json({
			booking: {
				tracking_number: data.tracking_number,
				test_name: data.test_name,
				test_description: data.test_description,
				status: data.status,
				booked_at: data.booked_at,
				completed_at: data.completed_at,
				test_result_url: data.test_result_url,
				lab: data.labs
			}
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get single booking by ID (authenticated)
router.get('/:id', authMiddleware, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.select('*, labs(name, location, contact_info), users(name, email, phone)')
			.eq('id', id)
			.single();
		
		if (error || !data) {
			return res.status(404).json({ error: 'Booking not found' });
		}
		
		// Check if user has access
		const isPatient = data.patient_id === userId;
		const isAdmin = req.user.role === 'admin';
		const isLab = req.user.role === 'lab';
		
		if (!isPatient && !isAdmin && !isLab) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		res.json({ booking: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all bookings (admin only)
router.get('/', authMiddleware, rbac(['admin']), async (req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('test_bookings')
			.select('*, labs(name, location), users(name, email)')
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ bookings: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

