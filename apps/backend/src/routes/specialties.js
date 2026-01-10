import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get all specialties (public)
router.get('/public', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('specialties')
			.select('*')
			.eq('is_active', true)
			.order('display_order', { ascending: true });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ specialties: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all specialties (admin)
router.get('/', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { data, error } = await supabaseAdmin
			.from('specialties')
			.select('*')
			.order('display_order', { ascending: true });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ specialties: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create specialty (admin)
router.post('/', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { label, icon, display_order, is_active } = req.body || {};
		if (!label || !icon) return res.status(400).json({ error: 'label and icon required' });
		
		const { data, error } = await supabaseAdmin
			.from('specialties')
			.insert({
				label,
				icon,
				display_order: display_order || 0,
				is_active: is_active !== undefined ? is_active : true
			})
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ specialty: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update specialty (admin)
router.put('/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { id } = req.params;
		const updates = {
			...req.body,
			updated_at: new Date().toISOString()
		};
		
		const { data, error } = await supabaseAdmin
			.from('specialties')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ specialty: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete specialty (admin)
router.delete('/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { id } = req.params;
		const { error } = await supabaseAdmin.from('specialties').delete().eq('id', id);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
