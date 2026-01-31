import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get all doctors offering home services
router.get('/doctors', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('doctors')
			.select('*')
			.eq('home_services', true)
			.order('name');
		
		if (error) {
			console.error('❌ Error fetching home service doctors:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ doctors: data || [] });
	} catch (err) {
		console.error('❌ Exception fetching home service doctors:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get all labs offering home services
router.get('/labs', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('labs')
			.select('*')
			.eq('home_services', true)
			.eq('is_active', true)
			.order('name');
		
		if (error) {
			console.error('❌ Error fetching home service labs:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ labs: data || [] });
	} catch (err) {
		console.error('❌ Exception fetching home service labs:', err);
		res.status(500).json({ error: err.message });
	}
});

// Public: Submit home service request
router.post('/request', async (req, res) => {
	try {
		const {
			service_type,
			doctor_id,
			lab_id,
			patient_name,
			patient_phone,
			patient_email,
			address,
			city,
			preferred_date,
			preferred_time,
			urgency,
			description
		} = req.body;
		
		// Validate required fields
		if (!service_type || !patient_name || !patient_phone || !address) {
			return res.status(400).json({ error: 'Service type, name, phone, and address are required' });
		}
		
		// Validate service type specific requirements
		if (service_type === 'doctor' && !doctor_id) {
			return res.status(400).json({ error: 'Doctor ID is required for doctor service' });
		}
		if (service_type === 'lab_test' && !lab_id) {
			return res.status(400).json({ error: 'Lab ID is required for lab test service' });
		}
		
		// Get patient_id if user is logged in
		const patient_id = req.user?.id || null;
		
		// Create request
		const { data, error } = await supabaseAdmin
			.from('home_services_requests')
			.insert({
				patient_id,
				service_type,
				doctor_id: doctor_id || null,
				lab_id: lab_id || null,
				patient_name,
				patient_phone,
				patient_email: patient_email || null,
				address,
				city: city || null,
				preferred_date: preferred_date || null,
				preferred_time: preferred_time || null,
				urgency: urgency || 'normal',
				description: description || null,
				status: 'pending'
			})
			.select('*')
			.single();
		
		if (error) {
			console.error('❌ Error creating home service request:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Home service request created successfully:', data);
		res.json({ request: data, message: 'Home service request submitted successfully' });
	} catch (err) {
		console.error('❌ Exception creating home service request:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get all home service requests (admin)
router.get('/requests', async (req, res) => {
	try {
		const { status, service_type } = req.query;
		
		let query = supabaseAdmin
			.from('home_services_requests')
			.select('*, doctors(name, specialization), labs(name, location)')
			.order('created_at', { ascending: false });
		
		if (status) {
			query = query.eq('status', status);
		}
		
		if (service_type) {
			query = query.eq('service_type', service_type);
		}
		
		const { data, error } = await query;
		
		if (error) {
			console.error('❌ Error fetching home service requests:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ requests: data || [] });
	} catch (err) {
		console.error('❌ Exception fetching home service requests:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get single home service request (admin)
router.get('/requests/:id', async (req, res) => {
	try {
		const { id } = req.params;
		
		const { data, error } = await supabaseAdmin
			.from('home_services_requests')
			.select('*, doctors(name, specialization), labs(name, location)')
			.eq('id', id)
			.single();
		
		if (error) {
			if (error.code === 'PGRST116') {
				return res.status(404).json({ error: 'Request not found' });
			}
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ request: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update home service request status (admin)
router.put('/requests/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const {
			status,
			assigned_to,
			notes
		} = req.body;
		
		const updates = {};
		if (status) updates.status = status;
		if (assigned_to !== undefined) updates.assigned_to = assigned_to || null;
		if (notes !== undefined) updates.notes = notes || null;
		
		updates.updated_at = new Date().toISOString();
		
		const { data, error } = await supabaseAdmin
			.from('home_services_requests')
			.update(updates)
			.eq('id', id)
			.select('*, doctors(name, specialization), labs(name, location)')
			.single();
		
		if (error) {
			console.error('❌ Error updating home service request:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Home service request updated successfully:', data);
		res.json({ request: data });
	} catch (err) {
		console.error('❌ Exception updating home service request:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get user's own home service requests
router.get('/my/requests', async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: 'Authentication required' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('home_services_requests')
			.select('*, doctors(name, specialization), labs(name, location)')
			.eq('patient_id', userId)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ requests: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;


