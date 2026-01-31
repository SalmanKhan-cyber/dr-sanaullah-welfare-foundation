import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Create surgery booking (public - for booking form)
router.post('/', async (req, res) => {
	try {
		const { patient_name, phone, city, surgery_type, remarks } = req.body || {};
		
		if (!patient_name || !phone || !surgery_type) {
			return res.status(400).json({ error: 'patient_name, phone, and surgery_type are required' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('surgery_bookings')
			.insert({
				patient_name,
				phone,
				city: city || null,
				surgery_type,
				remarks: remarks || null,
				status: 'pending'
			})
			.select('*')
			.single();
		
		if (error) {
			console.error('Error creating surgery booking:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Surgery booking created:', data.id);
		res.json({ booking: data });
	} catch (err) {
		console.error('Exception creating surgery booking:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get all surgery bookings (admin only)
router.get('/', async (req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('surgery_bookings')
			.select('*')
			.order('created_at', { ascending: false });
		
		if (error) {
			console.error('Error fetching surgery bookings:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`✅ Loaded ${data?.length || 0} surgery bookings`);
		res.json({ bookings: data || [] });
	} catch (err) {
		console.error('Exception fetching surgery bookings:', err);
		res.status(500).json({ error: err.message });
	}
});

// Update surgery booking status (admin only)
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { status, remarks } = req.body || {};
		
		const updates = {};
		if (status) updates.status = status;
		if (remarks !== undefined) updates.remarks = remarks;
		updates.updated_at = new Date().toISOString();
		
		const { data, error } = await supabaseAdmin
			.from('surgery_bookings')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) {
			console.error('Error updating surgery booking:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Surgery booking updated:', id);
		res.json({ booking: data });
	} catch (err) {
		console.error('Exception updating surgery booking:', err);
		res.status(500).json({ error: err.message });
	}
});

export default router;

