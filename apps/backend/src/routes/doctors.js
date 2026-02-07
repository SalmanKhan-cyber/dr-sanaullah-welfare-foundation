import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadFile } from '../lib/storage.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

function normalizeEmptyToNull(value) {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (typeof value === 'string' && value.trim() === '') return null;
	return value;
}

function normalizeDoctorUpdates(rawUpdates = {}) {
	const updates = { ...rawUpdates };

	if (Object.prototype.hasOwnProperty.call(updates, 'consultation_fee')) {
		const v = normalizeEmptyToNull(updates.consultation_fee);
		updates.consultation_fee = v === null ? null : Number(v);
		if (updates.consultation_fee !== null && Number.isNaN(updates.consultation_fee)) {
			updates.consultation_fee = null;
		}
	}

	if (Object.prototype.hasOwnProperty.call(updates, 'discount_rate')) {
		const v = normalizeEmptyToNull(updates.discount_rate);
		updates.discount_rate = v === null ? null : Number(v);
		if (updates.discount_rate !== null && Number.isNaN(updates.discount_rate)) {
			updates.discount_rate = null;
		}
	}

	if (Object.prototype.hasOwnProperty.call(updates, 'specialization')) {
		updates.specialization = normalizeEmptyToNull(updates.specialization);
	}
	if (Object.prototype.hasOwnProperty.call(updates, 'degrees')) {
		updates.degrees = normalizeEmptyToNull(updates.degrees);
	}
	if (Object.prototype.hasOwnProperty.call(updates, 'image_url')) {
		updates.image_url = normalizeEmptyToNull(updates.image_url);
	}
	if (Object.prototype.hasOwnProperty.call(updates, 'timing')) {
		updates.timing = normalizeEmptyToNull(updates.timing);
	}

	return updates;
}

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
		console.log(`🔍 Fetching doctor profile for user: ${userId}`);
		
		// First check if profile exists
		const { data, error } = await supabaseAdmin
			.from('doctors')
			.select('*')
			.eq('user_id', userId)
			.single();
		
		console.log(`📋 Doctor profile query result:`, { data, error });
		
		// If profile doesn't exist, return null instead of error
		// This allows frontend to show "create profile" option
		if (error && error.code === 'PGRST116') {
			// PGRST116 = no rows returned
			console.log(`⚠️ Doctor profile not found for user ${userId}`);
			return res.json({ doctor: null, profile_missing: true });
		}
		
		if (error) {
			console.error(`❌ Error fetching doctor profile:`, error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`✅ Doctor profile found for user ${userId}:`, data);
		res.json({ doctor: data });
	} catch (err) {
		console.error(`❌ Server error in doctor profile fetch:`, err);
		res.status(500).json({ error: err.message });
	}
});

// Update or create logged-in doctor's profile
router.put('/me', async (req, res) => {
	try {
		const userId = req.user.id;
		const updates = normalizeDoctorUpdates(req.body);
		console.log(`🔍 Updating/creating doctor profile for user: ${userId}`);
		console.log(`📝 Profile updates:`, updates);
		
		// Check if profile exists
		const { data: existing, error: checkError } = await supabaseAdmin
			.from('doctors')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		console.log(`🔍 Existing profile check:`, { existing, checkError });
		
		let data;
		let error;
		
		if (existing) {
			console.log(`📝 Updating existing doctor profile for user: ${userId}`);
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
			console.log(`➕ Creating new doctor profile for user: ${userId}`);
			// Create new profile (upsert)
			// Get user's name for default
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('name')
				.eq('id', userId)
				.single();
			
			console.log(`👤 User data for default name:`, userData);
			
			const result = await supabaseAdmin
				.from('doctors')
				.upsert({
					user_id: userId,
					name: updates.name || userData?.name || 'Doctor',
					specialization: updates.specialization || null,
					degrees: updates.degrees || null,
					consultation_fee: updates.consultation_fee === null || updates.consultation_fee === undefined ? 0 : Number(updates.consultation_fee),
					discount_rate: updates.discount_rate === null || updates.discount_rate === undefined ? 50 : Number(updates.discount_rate),
					timing: updates.timing || null
				}, {
					onConflict: 'user_id'
				})
				.select('*')
				.single();
			data = result.data;
			error = result.error;
		}
		
		console.log(`📊 Profile save result:`, { data, error });
		
		if (error) {
			console.error(`❌ Error saving doctor profile:`, error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`✅ Doctor profile saved successfully for user: ${userId}:`, data);
		res.json({ doctor: data });
	} catch (err) {
		console.error(`❌ Server error in doctor profile save:`, err);
		res.status(500).json({ error: err.message });
	}
});

// Add doctor (admin only)
router.post('/', async (req, res) => {
	try {
		const body = normalizeDoctorUpdates(req.body || {});
		const { name, specialization, discount_rate, degrees, image_url, consultation_fee, timing } = body;
		if (!name) return res.status(400).json({ error: 'Name required' });
		
		const doctorData = {
			name,
			specialization: specialization || null,
			discount_rate: discount_rate === null || discount_rate === undefined ? 50 : discount_rate,
			degrees: degrees || null,
			image_url: image_url || null,
			consultation_fee: consultation_fee === null || consultation_fee === undefined ? null : consultation_fee,
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
		const updates = normalizeDoctorUpdates(req.body);
		
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

