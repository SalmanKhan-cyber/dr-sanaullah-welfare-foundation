import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { rbac } from '../middleware/rbac.js';

const router = Router();

// Admin route to get all patients
router.get('/all', rbac(['admin']), async (req, res) => {
	try {
		// OPTIMIZED: Add pagination to prevent loading all patients at once
		const limit = parseInt(req.query.limit) || 1000; // Default 1000
		const offset = parseInt(req.query.offset) || 0;
		
		// Use LEFT JOIN to ensure all patients are returned even if users table entry is missing
		const { data, error } = await supabaseAdmin
			.from('patients')
			.select(`
				user_id,
				age,
				gender,
				cnic,
				history,
				users (
					id,
					name,
					email,
					phone,
					role,
					verified,
					created_at
				)
			`)
			.order('user_id', { ascending: false })
			.range(offset, offset + limit - 1);
		
		if (error) {
			console.error('Error fetching patients:', error);
			return res.status(400).json({ error: error.message });
		}
		
		// Ensure we return an array even if data is null
		const patients = data || [];
		console.log(`✅ Fetched ${patients.length} patients from database (authenticated endpoint, offset: ${offset})`);
		
		res.json({ patients });
	} catch (err) {
		console.error('Exception in /api/patients/all:', err);
		res.status(500).json({ error: err.message });
	}
});

router.get('/me', async (req, res) => {
	const userId = req.user.id;
	console.log('📋 Fetching patient profile for userId:', userId);
	
	const { data, error } = await supabaseAdmin
		.from('patients')
		.select('*, users(name, email, phone)')
		.eq('user_id', userId)
		.maybeSingle(); // Use maybeSingle() instead of single() to return null if not found
	
	console.log('📋 Database query result:', { data, error });
	
	// If no profile found, return null instead of error
	if (error && error.code !== 'PGRST116') {
		console.error('❌ Error fetching patient profile:', error);
		return res.status(400).json({ error: error.message });
	}
	
	if (!data) {
		console.log('⚠️ No patient profile found for userId:', userId);
		return res.json({ profile: null });
	}
	
	console.log('✅ Patient profile found:', {
		user_id: data.user_id,
		name: data.name,
		phone: data.phone,
		age: data.age,
		gender: data.gender,
		cnic: data.cnic,
		users: data.users
	});
	
	// Return profile or null
	res.json({ profile: data || null });
});

router.put('/me', async (req, res) => {
	const userId = req.user.id;
	const payload = req.body || {};
	const { error } = await supabaseAdmin.from('patients').upsert({ user_id: userId, ...payload });
	if (error) return res.status(400).json({ error: error.message });
	res.json({ ok: true });
});

router.get('/me/reports', async (req, res) => {
	const userId = req.user.id;
	const { data, error } = await supabaseAdmin.from('lab_reports').select('*').eq('patient_id', userId).order('report_date', { ascending: false });
	if (error) return res.status(400).json({ error: error.message });
	res.json({ reports: data });
});

export default router;
