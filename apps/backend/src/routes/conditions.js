import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get all conditions (public)
router.get('/public', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('conditions')
			.select('*')
			.eq('is_active', true)
			.order('display_order', { ascending: true });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ conditions: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all conditions (admin)
router.get('/', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { data, error } = await supabaseAdmin
			.from('conditions')
			.select('*')
			.order('display_order', { ascending: true });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ conditions: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create condition (admin)
router.post('/', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { label, icon, search_keyword, display_order, is_active } = req.body || {};
		if (!label || !icon || !search_keyword) {
			return res.status(400).json({ error: 'label, icon, and search_keyword required' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('conditions')
			.insert({
				label,
				icon,
				search_keyword,
				display_order: display_order || 0,
				is_active: is_active !== undefined ? is_active : true
			})
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ condition: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update condition (admin)
router.put('/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { id } = req.params;
		const updates = {
			...req.body,
			updated_at: new Date().toISOString()
		};
		
		const { data, error } = await supabaseAdmin
			.from('conditions')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ condition: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete condition (admin)
router.delete('/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { id } = req.params;
		const { error } = await supabaseAdmin.from('conditions').delete().eq('id', id);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
