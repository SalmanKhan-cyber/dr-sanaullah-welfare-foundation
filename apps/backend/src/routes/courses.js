import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { getSignedUrl } from '../lib/storage.js';

const router = Router();

// Public route to get all courses (no auth required)
router.get('/public', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin.from('courses').select('*').order('title');
		if (error) return res.status(400).json({ error: error.message });
		res.json({ courses: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Protected route (requires auth)
router.get('/', async (_req, res) => {
	const { data, error } = await supabaseAdmin.from('courses').select('*').order('title');
	if (error) return res.status(400).json({ error: error.message });
	res.json({ courses: data });
});

router.post('/', async (req, res) => {
	// Teacher requests a course; admin later approves/edit outside scope
	const { title, description, discount_rate, duration, trainer_id } = req.body || {};
	// Convert empty string to null, or use provided trainer_id, or use current user if not admin
	const final_trainer_id = (trainer_id && trainer_id !== '') ? trainer_id : (req.user?.role !== 'admin' ? req.user?.id : null);
	
	console.log('➕ Creating course with trainer_id:', final_trainer_id, 'from input:', trainer_id);
	
	const { data, error } = await supabaseAdmin
		.from('courses')
		.insert({ title, description, discount_rate, duration, trainer_id: final_trainer_id })
		.select('*')
		.single();
	
	if (error) {
		console.error('❌ Error creating course:', error);
		return res.status(400).json({ error: error.message });
	}
	
	console.log('✅ Course created successfully:', data);
	res.json({ course: data });
});

router.post('/enroll', async (req, res) => {
	const { course_id } = req.body || {};
	const user_id = req.user.id;
	const { error } = await supabaseAdmin.from('students').insert({ user_id, course_id });
	if (error) return res.status(400).json({ error: error.message });
	res.json({ ok: true });
});

// Get student's enrolled courses with progress
router.get('/my', async (req, res) => {
	try {
		const user_id = req.user.id;
		const { data, error } = await supabaseAdmin
			.from('students')
			.select('*, courses(*)')
			.eq('user_id', user_id)
			.order('progress', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ enrollments: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		
		// Convert empty string trainer_id to null
		if (updates.trainer_id === '') {
			updates.trainer_id = null;
		}
		
		console.log('📝 Updating course:', id, 'with updates:', updates);
		
		const { data, error } = await supabaseAdmin
			.from('courses')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) {
			console.error('❌ Error updating course:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Course updated successfully:', data);
		res.json({ course: data });
	} catch (err) {
		console.error('❌ Exception updating course:', err);
		res.status(500).json({ error: err.message });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { error } = await supabaseAdmin.from('courses').delete().eq('id', id);
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ========== STUDENT MATERIALS & ASSIGNMENTS ==========

// Get materials for a course (student access)
router.get('/:courseId/materials', async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.user.id;
		
		// Verify student is enrolled
		const { data: enrollment } = await supabaseAdmin
			.from('students')
			.select('course_id')
			.eq('user_id', userId)
			.eq('course_id', courseId)
			.single();
		
		if (!enrollment) {
			return res.status(403).json({ error: 'You must be enrolled in this course to access materials' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('course_materials')
			.select('*')
			.eq('course_id', courseId)
			.order('display_order', { ascending: true })
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ materials: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get fresh signed URL for a material file (student access)
router.get('/materials/:id/url', async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		
		// Get material and verify student is enrolled
		const { data: material, error: materialError } = await supabaseAdmin
			.from('course_materials')
			.select('*, courses!inner(id)')
			.eq('id', id)
			.single();
		
		if (materialError || !material) {
			return res.status(404).json({ error: 'Material not found' });
		}
		
		// Verify enrollment
		const { data: enrollment } = await supabaseAdmin
			.from('students')
			.select('course_id')
			.eq('user_id', userId)
			.eq('course_id', material.courses.id)
			.single();
		
		if (!enrollment) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		if (!material.file_url) {
			return res.status(404).json({ error: 'No file attached to this material' });
		}
		
		// Extract path from URL and generate fresh signed URL
		const fileUrl = material.file_url;
		
		if (fileUrl.includes('/storage/v1/object/public/')) {
			return res.json({ url: fileUrl, isPublic: true });
		}
		
		const signedUrlMatch = fileUrl.match(/\/storage\/v1\/object\/sign\/course-materials\/([^?]+)/);
		if (signedUrlMatch) {
			const filePath = signedUrlMatch[1];
			try {
				const freshUrl = await getSignedUrl('course-materials', filePath, 60 * 60 * 24 * 365);
				return res.json({ url: freshUrl, isPublic: false });
			} catch (urlError) {
				console.error('Error generating fresh signed URL:', urlError);
				return res.json({ url: fileUrl, isPublic: false });
			}
		}
		
		return res.json({ url: fileUrl, isPublic: false });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get assignments for a course (student access)
router.get('/:courseId/assignments', async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.user.id;
		
		// Verify student is enrolled
		const { data: enrollment } = await supabaseAdmin
			.from('students')
			.select('course_id')
			.eq('user_id', userId)
			.eq('course_id', courseId)
			.single();
		
		if (!enrollment) {
			return res.status(403).json({ error: 'You must be enrolled in this course to access assignments' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('course_assignments')
			.select('*')
			.eq('course_id', courseId)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ assignments: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get fresh signed URL for an assignment file (student access)
router.get('/assignments/:id/url', async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		
		// Get assignment and verify student is enrolled
		const { data: assignment, error: assignmentError } = await supabaseAdmin
			.from('course_assignments')
			.select('*, courses!inner(id)')
			.eq('id', id)
			.single();
		
		if (assignmentError || !assignment) {
			return res.status(404).json({ error: 'Assignment not found' });
		}
		
		// Verify enrollment
		const { data: enrollment } = await supabaseAdmin
			.from('students')
			.select('course_id')
			.eq('user_id', userId)
			.eq('course_id', assignment.courses.id)
			.single();
		
		if (!enrollment) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		if (!assignment.file_url) {
			return res.status(404).json({ error: 'No file attached to this assignment' });
		}
		
		// Extract path from URL and generate fresh signed URL
		const fileUrl = assignment.file_url;
		
		if (fileUrl.includes('/storage/v1/object/public/')) {
			return res.json({ url: fileUrl, isPublic: true });
		}
		
		const signedUrlMatch = fileUrl.match(/\/storage\/v1\/object\/sign\/course-assignments\/([^?]+)/);
		if (signedUrlMatch) {
			const filePath = signedUrlMatch[1];
			try {
				const freshUrl = await getSignedUrl('course-assignments', filePath, 60 * 60 * 24 * 365);
				return res.json({ url: freshUrl, isPublic: false });
			} catch (urlError) {
				console.error('Error generating fresh signed URL:', urlError);
				return res.json({ url: fileUrl, isPublic: false });
			}
		}
		
		return res.json({ url: fileUrl, isPublic: false });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
