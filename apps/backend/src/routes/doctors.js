import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadFile } from '../lib/storage.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Get all doctors
router.get('/', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('doctors')
			.select('*')
			.order('name');
		if (error) return res.status(400).json({ error: error.message });
		res.json({ doctors: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get logged-in doctor's profile
router.get('/me', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// First check if profile exists
		const { data, error } = await supabaseAdmin
			.from('doctors')
			.select('*')
			.eq('user_id', userId)
			.single();
		
		// If profile doesn't exist, return null instead of error
		// This allows frontend to show "create profile" option
		if (error && error.code === 'PGRST116') {
			// PGRST116 = no rows returned
			console.log(`⚠️ Doctor profile not found for user ${userId}`);
			return res.json({ doctor: null, profile_missing: true });
		}
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ doctor: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update or create logged-in doctor's profile
router.put('/me', async (req, res) => {
	try {
		const userId = req.user.id;
		const updates = req.body;
		
		// Check if profile exists
		const { data: existing } = await supabaseAdmin
			.from('doctors')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		let data;
		let error;
		
		if (existing) {
			// Update existing profile
			const result = await supabaseAdmin
				.from('doctors')
				.update(updates)
				.eq('user_id', userId)
				.select('*')
				.single();
			data = result.data;
			error = result.error;
		} else {
			// Create new profile (upsert)
			// Get user's name for default
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('name')
				.eq('id', userId)
				.single();
			
			const result = await supabaseAdmin
				.from('doctors')
				.upsert({
					user_id: userId,
					name: updates.name || userData?.name || 'Doctor',
					specialization: updates.specialization || null,
					degrees: updates.degrees || null,
					consultation_fee: updates.consultation_fee ? parseFloat(updates.consultation_fee) : 0,
					discount_rate: updates.discount_rate ? parseFloat(updates.discount_rate) : 50,
					timing: updates.timing || null
				}, {
					onConflict: 'user_id'
				})
				.select('*')
				.single();
			data = result.data;
			error = result.error;
		}
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ doctor: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Add doctor (admin only)
router.post('/', async (req, res) => {
	try {
		const { name, specialization, discount_rate, degrees, image_url, consultation_fee, timing } = req.body || {};
		if (!name) return res.status(400).json({ error: 'Name required' });
		
		const doctorData = {
			name,
			specialization: specialization || null,
			discount_rate: discount_rate || 50,
			degrees: degrees || null,
			image_url: image_url || null,
			consultation_fee: consultation_fee ? Number(consultation_fee) : null,
			timing: timing || null
		};
		
		const { data, error } = await supabaseAdmin
			.from('doctors')
			.insert(doctorData)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ doctor: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update doctor
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		
		const { data, error } = await supabaseAdmin
			.from('doctors')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ doctor: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete doctor
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { error } = await supabaseAdmin.from('doctors').delete().eq('id', id);
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Upload doctor image (admin only)
router.post('/upload-image', authMiddleware, upload.single('file'), async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}

		if (!req.file) {
			return res.status(400).json({ error: 'File is required' });
		}

		const fileExt = req.file.originalname.split('.').pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const path = `doctors/${fileName}`;

		// Upload using service role (bypasses RLS)
		const { error: uploadError } = await supabaseAdmin.storage
			.from('certificates')
			.upload(path, req.file.buffer, { 
				contentType: req.file.mimetype,
				upsert: false 
			});

		if (uploadError) throw new Error(uploadError.message);

		// Get public URL (works if bucket is public)
		const { data: publicUrlData } = supabaseAdmin.storage
			.from('certificates')
			.getPublicUrl(path);

		// If public URL doesn't work, create a long-lived signed URL (1 year)
		let imageUrl = publicUrlData?.publicUrl;
		if (!imageUrl) {
			const { data: signedData, error: signedError } = await supabaseAdmin.storage
				.from('certificates')
				.createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
			
			if (signedError) throw new Error(signedError.message);
			imageUrl = signedData?.signedUrl;
		}

		res.json({ 
			url: imageUrl,
			path 
		});
	} catch (err) {
		console.error('Doctor image upload error:', err);
		res.status(500).json({ error: err.message || 'Failed to upload image' });
	}
});

export default router;

