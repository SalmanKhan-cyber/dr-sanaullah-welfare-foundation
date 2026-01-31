import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get all surgery categories (public)
router.get('/public', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('surgery_categories')
			.select('*')
			.eq('is_active', true)
			.order('display_order', { ascending: true });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ categories: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all surgery categories (admin)
router.get('/', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { data, error } = await supabaseAdmin
			.from('surgery_categories')
			.select('*')
			.order('display_order', { ascending: true });
		
		if (error) {
			console.error('Error fetching surgery categories:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`Loaded ${data?.length || 0} surgery categories`);
		res.json({ categories: data || [] });
	} catch (err) {
		console.error('Exception fetching surgery categories:', err);
		res.status(500).json({ error: err.message });
	}
});

// Create surgery category (admin)
router.post('/', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { name, icon, description, display_order, is_active } = req.body || {};
		if (!name || !icon) return res.status(400).json({ error: 'name and icon required' });
		
		const { data, error } = await supabaseAdmin
			.from('surgery_categories')
			.insert({
				name,
				icon,
				description: description || null,
				display_order: display_order || 0,
				is_active: is_active !== undefined ? is_active : true
			})
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ category: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update surgery category (admin)
router.put('/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { id } = req.params;
		const updates = {
			...req.body,
			updated_at: new Date().toISOString()
		};
		
		const { data, error } = await supabaseAdmin
			.from('surgery_categories')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ category: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete surgery category (admin)
router.delete('/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { id } = req.params;
		const { error } = await supabaseAdmin.from('surgery_categories').delete().eq('id', id);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

