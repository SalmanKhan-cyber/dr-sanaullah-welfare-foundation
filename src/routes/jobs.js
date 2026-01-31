import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Public route to get all active jobs (no auth required)
router.get('/public', async (_req, res) => {
	try {
		const { data, error } = await supabaseAdmin
			.from('jobs')
			.select('*')
			.eq('is_active', true)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ jobs: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get single job by ID (public)
router.get('/public/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { data, error } = await supabaseAdmin
			.from('jobs')
			.select('*')
			.eq('id', id)
			.eq('is_active', true)
			.single();
		
		if (error) {
			if (error.code === 'PGRST116') {
				return res.status(404).json({ error: 'Job not found' });
			}
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ job: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Admin: Get all jobs (including inactive)
router.get('/', async (req, res) => {
	try {
		// Check if user is authenticated (optional for now, but should be required for admin)
		if (!req.user && !req.headers.authorization) {
			// Allow for now, but in production this should require auth
			console.log('⚠️ Jobs list accessed without auth - allowing for now');
		}
		
		const { data, error } = await supabaseAdmin
			.from('jobs')
			.select('*, posted_by:users(name, email)')
			.order('created_at', { ascending: false });
		
		if (error) {
			console.error('❌ Error fetching jobs:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`✅ Fetched ${data?.length || 0} jobs`);
		res.json({ jobs: data || [] });
	} catch (err) {
		console.error('❌ Exception fetching jobs:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Get single job (must come after /public routes to avoid conflicts)
router.get('/:id', async (req, res) => {
	try {
		// Skip if this is a public route
		if (req.path.includes('/public')) {
			return res.status(404).json({ error: 'Not found' });
		}
		
		const { id } = req.params;
		const { data, error } = await supabaseAdmin
			.from('jobs')
			.select('*, posted_by:users(name, email)')
			.eq('id', id)
			.single();
		
		if (error) {
			if (error.code === 'PGRST116') {
				return res.status(404).json({ error: 'Job not found' });
			}
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ job: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Admin: Create job
router.post('/', async (req, res) => {
	try {
		const {
			title,
			department,
			description,
			requirements,
			location,
			employment_type,
			salary_range,
			experience_required,
			education_required,
			is_active
		} = req.body;
		
		const posted_by = req.user?.id;
		
		const { data, error } = await supabaseAdmin
			.from('jobs')
			.insert({
				title,
				department,
				description,
				requirements,
				location,
				employment_type: employment_type || 'full-time',
				salary_range,
				experience_required,
				education_required,
				is_active: is_active !== undefined ? is_active : true,
				posted_by
			})
			.select('*')
			.single();
		
		if (error) {
			console.error('❌ Error creating job:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Job created successfully:', data);
		res.json({ job: data });
	} catch (err) {
		console.error('❌ Exception creating job:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Update job
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		
		// Remove posted_by from updates if present (shouldn't be changed)
		delete updates.posted_by;
		delete updates.created_at;
		
		// Add updated_at
		updates.updated_at = new Date().toISOString();
		
		const { data, error } = await supabaseAdmin
			.from('jobs')
			.update(updates)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) {
			console.error('❌ Error updating job:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Job updated successfully:', data);
		res.json({ job: data });
	} catch (err) {
		console.error('❌ Exception updating job:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Delete job
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		console.log(`🗑️ Deleting job ${id}`);
		
		// Check if there are applications for this job
		const { data: applications, error: checkError } = await supabaseAdmin
			.from('job_applications')
			.select('id')
			.eq('job_id', id)
			.limit(1);
		
		if (checkError) {
			console.error('❌ Error checking applications:', checkError);
			return res.status(400).json({ error: checkError.message });
		}
		
		// Delete the job regardless of applications
		// Applications will remain but job will be deleted
		const { error } = await supabaseAdmin
			.from('jobs')
			.delete()
			.eq('id', id);
		
		if (error) {
			console.error('❌ Error deleting job:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Job deleted successfully');
		res.json({ ok: true, message: 'Job deleted successfully' });
	} catch (err) {
		console.error('❌ Exception deleting job:', err);
		res.status(500).json({ error: err.message });
	}
});

// ========== JOB APPLICATIONS ==========

// Public: Submit job application
router.post('/:jobId/apply', async (req, res) => {
	try {
		const { jobId } = req.params;
		const {
			applicant_name,
			applicant_email,
			applicant_phone,
			cover_letter
		} = req.body;
		
		// Validate required fields
		if (!applicant_name || !applicant_email || !applicant_phone) {
			return res.status(400).json({ error: 'Name, email, and phone are required' });
		}
		
		// Check if job exists and is active
		const { data: job, error: jobError } = await supabaseAdmin
			.from('jobs')
			.select('id, title')
			.eq('id', jobId)
			.eq('is_active', true)
			.single();
		
		if (jobError || !job) {
			return res.status(404).json({ error: 'Job not found or not available' });
		}
		
		// Get applicant_id if user is logged in
		const applicant_id = req.user?.id || null;
		
		// Create application
		const { data, error } = await supabaseAdmin
			.from('job_applications')
			.insert({
				job_id: jobId,
				applicant_id,
				applicant_name,
				applicant_email,
				applicant_phone,
				applicant_cv_url: null,
				cover_letter: cover_letter || null,
				status: 'pending'
			})
			.select('*')
			.single();
		
		if (error) {
			console.error('❌ Error creating application:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Application submitted successfully:', data);
		res.json({ application: data, message: 'Application submitted successfully' });
	} catch (err) {
		console.error('❌ Exception submitting application:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get applications for a specific job (admin)
router.get('/:jobId/applications', async (req, res) => {
	try {
		const { jobId } = req.params;
		
		const { data, error } = await supabaseAdmin
			.from('job_applications')
			.select('*, jobs(title)')
			.eq('job_id', jobId)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ applications: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all applications (admin)
router.get('/applications/all', async (req, res) => {
	try {
		// Check if user is authenticated (optional for now, but should be required for admin)
		if (!req.user && !req.headers.authorization) {
			// Allow for now, but in production this should require auth
			console.log('⚠️ Applications list accessed without auth - allowing for now');
		}
		
		const { status, job_id } = req.query;
		
		let query = supabaseAdmin
			.from('job_applications')
			.select('*, jobs(id, title, department)')
			.order('created_at', { ascending: false });
		
		if (status) {
			query = query.eq('status', status);
		}
		
		if (job_id) {
			query = query.eq('job_id', job_id);
		}
		
		const { data, error } = await query;
		
		if (error) {
			console.error('❌ Error fetching applications:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`✅ Fetched ${data?.length || 0} applications`);
		res.json({ applications: data || [] });
	} catch (err) {
		console.error('❌ Exception fetching applications:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get single application (admin)
router.get('/applications/:id', async (req, res) => {
	try {
		const { id } = req.params;
		
		const { data, error } = await supabaseAdmin
			.from('job_applications')
			.select('*, jobs(*)')
			.eq('id', id)
			.single();
		
		if (error) {
			if (error.code === 'PGRST116') {
				return res.status(404).json({ error: 'Application not found' });
			}
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ application: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update application status and add notes (admin)
router.put('/applications/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const {
			status,
			interview_date,
			interview_notes,
			admin_notes,
			contacted
		} = req.body;
		
		const updates = {};
		if (status) updates.status = status;
		if (interview_date !== undefined) updates.interview_date = interview_date || null;
		if (interview_notes !== undefined) updates.interview_notes = interview_notes || null;
		if (admin_notes !== undefined) updates.admin_notes = admin_notes || null;
		if (contacted !== undefined) {
			updates.contacted = contacted;
			if (contacted) {
				updates.contacted_at = new Date().toISOString();
			}
		}
		
		updates.updated_at = new Date().toISOString();
		
		const { data, error } = await supabaseAdmin
			.from('job_applications')
			.update(updates)
			.eq('id', id)
			.select('*, jobs(*)')
			.single();
		
		if (error) {
			console.error('❌ Error updating application:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Application updated successfully:', data);
		res.json({ application: data });
	} catch (err) {
		console.error('❌ Exception updating application:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get user's own applications
router.get('/my/applications', async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: 'Authentication required' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('job_applications')
			.select('*, jobs(id, title, department, location)')
			.eq('applicant_id', userId)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ applications: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

