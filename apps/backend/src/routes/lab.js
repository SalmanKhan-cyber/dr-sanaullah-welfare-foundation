import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadFile, getSignedUrl } from '../lib/storage.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Get lab info for logged-in user
router.get('/me', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get lab associations for this user
		const { data: labUsers, error: labUsersError } = await supabaseAdmin
			.from('lab_users')
			.select('lab_id, labs(*)')
			.eq('user_id', userId);
		
		if (labUsersError) return res.status(400).json({ error: labUsersError.message });
		
		if (!labUsers || labUsers.length === 0) {
			return res.status(404).json({ error: 'No lab associated with this user' });
		}
		
		// Return the first lab (if user has multiple labs, use the first one)
		const lab = labUsers[0].labs;
		res.json({ lab, lab_id: labUsers[0].lab_id });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update lab profile
router.put('/profile', async (req, res) => {
	try {
		const userId = req.user.id;
		const { name, location, contact_info, services } = req.body || {};
		
		// Get lab_id for this user
		const { data: labUsers, error: labUsersError } = await supabaseAdmin
			.from('lab_users')
			.select('lab_id')
			.eq('user_id', userId)
			.limit(1)
			.single();
		
		if (labUsersError || !labUsers) {
			return res.status(404).json({ error: 'No lab associated with this user' });
		}
		
		const labId = labUsers.lab_id;
		
		// Update lab
		const updates = {};
		if (name !== undefined) updates.name = name;
		if (location !== undefined) updates.location = location;
		if (contact_info !== undefined) updates.contact_info = contact_info;
		if (services !== undefined) updates.services = services;
		
		const { data: updatedLab, error } = await supabaseAdmin
			.from('labs')
			.update(updates)
			.eq('id', labId)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ lab: updatedLab });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get lab tasks/reports
router.get('/tasks', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get lab_id for this user
		const { data: labUsers, error: labUsersError } = await supabaseAdmin
			.from('lab_users')
			.select('lab_id')
			.eq('user_id', userId)
			.limit(1)
			.single();
		
		if (labUsersError || !labUsers) {
			return res.status(404).json({ error: 'No lab associated with this user. Please contact admin to assign you to a lab.' });
		}
		
		const labId = labUsers.lab_id;
		
		console.log(`🔍 Loading tasks for lab_id: ${labId}, user_id: ${userId}`);
		
		// Get only reports for this lab, including patient user info
		let { data: reportsData, error } = await supabaseAdmin
			.from('lab_reports')
			.select('*')
			.eq('lab_id', labId)
			.order('assigned_at', { ascending: false });
		
		if (error) {
			console.error('❌ Error loading lab tasks (basic query):', error);
			return res.status(400).json({ error: error.message });
		}
		
		// Enrich with patient info
		if (reportsData && reportsData.length > 0) {
			const patientIds = [...new Set(reportsData.map(r => r.patient_id).filter(Boolean))];
			
			if (patientIds.length > 0) {
				const { data: patientsData, error: patientsError } = await supabaseAdmin
					.from('patients')
					.select(`
						id,
						users(name, email, phone),
						age,
						gender
					`)
					.in('id', patientIds);
				
				if (!patientsError && patientsData) {
					const patientsMap = {};
					patientsData.forEach(p => {
						patientsMap[p.id] = p;
					});
					
					reportsData = reportsData.map(report => ({
						...report,
						patients: report.patient_id ? patientsMap[report.patient_id] : null
					}));
				}
			}
		}
		
		console.log(`✅ Loaded ${reportsData?.length || 0} tasks for lab ${labId}`);
		res.json({ tasks: reportsData || [] });
	} catch (err) {
		console.error('❌ Error in /api/lab/tasks:', err);
		res.status(500).json({ error: err.message });
	}
});

// Assign lab test (admin only - creates lab report)
// Note: This endpoint should be protected with authMiddleware and rbac(['admin'])
// but it's defined here for consistency. The middleware is applied in index.js
router.post('/assign', upload.single('test_paper'), async (req, res) => {
	try {
		const { patient_name, lab_id, test_type, remarks } = req.body || {};
		
		console.log('📥 Received assign request:', { 
			patient_name, 
			lab_id, 
			test_type, 
			remarks,
			hasFile: !!req.file,
			bodyKeys: Object.keys(req.body || {})
		});
		
		// Validate required fields
		if (!patient_name || (typeof patient_name === 'string' && !patient_name.trim())) {
			return res.status(400).json({ error: 'patient_name is required. Please enter a patient name.' });
		}
		
		if (!lab_id || (typeof lab_id === 'string' && !lab_id.trim())) {
			return res.status(400).json({ error: 'lab_id is required. Please select a lab.' });
		}
		
		// Verify lab exists
		const { data: lab, error: labError } = await supabaseAdmin
			.from('labs')
			.select('id, name')
			.eq('id', lab_id)
			.single();
		
		if (labError || !lab) {
			return res.status(404).json({ error: 'Lab not found' });
		}
		
		// Upload test paper if provided
		let testPaperUrl = null;
		if (req.file) {
			try {
				// Use patient name (sanitized) for folder structure
				const sanitizedPatientName = patient_name.trim().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
				const path = `test-papers/${sanitizedPatientName}/${Date.now()}-${req.file.originalname}`;
				const uploadResult = await uploadFile('lab-reports', path, req.file.buffer, req.file.mimetype);
				testPaperUrl = uploadResult.url || path;
				console.log('✅ Test paper uploaded:', testPaperUrl);
			} catch (uploadErr) {
				console.error('❌ Test paper upload failed:', uploadErr);
				return res.status(500).json({ error: 'Failed to upload test paper: ' + uploadErr.message });
			}
		}
		
		// Create lab report - handle missing columns gracefully
		// Start with basic required fields
		let reportData = {
			patient_id: null, // Allow null for unregistered patients
			lab_id,
			test_type: test_type || 'General Test',
			remarks: remarks || null,
			status: 'pending',
			assigned_at: new Date().toISOString()
		};
		
		// Add optional columns only if they might exist (will be handled by retry logic)
		if (testPaperUrl) {
			reportData.test_paper_url = testPaperUrl;
		}
		reportData.patient_name = patient_name.trim();
		
		let report = null;
		
		// Try to insert with all fields first
		const { data: insertedReport, error: insertError } = await supabaseAdmin
			.from('lab_reports')
			.insert(reportData)
			.select('*')
			.single();
		
		if (insertError) {
			console.error('❌ Error creating lab report:', insertError);
			// If error is about missing columns, try without optional columns
			if (insertError.message?.includes('column') || insertError.code === '42703') {
				console.log('⚠️ Some columns not found, retrying with only required fields...');
				// Remove optional columns and try again with only required fields
				const reportDataMinimal = {
					patient_id: null,
					lab_id,
					test_type: test_type || 'General Test',
					remarks: remarks || null,
					status: 'pending',
					assigned_at: new Date().toISOString()
				};
				
				// If test paper was uploaded, try to use file_url instead of test_paper_url
				if (testPaperUrl) {
					reportDataMinimal.file_url = testPaperUrl;
				}
				
				const { data: retryReport, error: retryError } = await supabaseAdmin
					.from('lab_reports')
					.insert(reportDataMinimal)
					.select('*')
					.single();
				
				if (retryError) {
					return res.status(500).json({ 
						error: 'Failed to create lab report: ' + retryError.message 
					});
				}
				// Success with minimal fields
				report = retryReport;
			} else {
				return res.status(400).json({ error: insertError.message });
			}
		} else {
			report = insertedReport;
		}
		
		// Send notification to lab users
		const { data: labUsers } = await supabaseAdmin
			.from('lab_users')
			.select('user_id')
			.eq('lab_id', lab_id);
		
		if (labUsers && labUsers.length > 0) {
			for (const labUser of labUsers) {
				await supabaseAdmin.from('notifications').insert({
					user_id: labUser.user_id,
					message: `New test assigned: ${test_type || 'General Test'} for ${patient_name}`
				});
			}
		}
		
		console.log(`✅ Lab test assigned: Report ID ${report.id} to Lab ${lab_id} for Patient ${patient_name}`);
		res.json({ report, message: 'Test assigned successfully' });
	} catch (err) {
		console.error('❌ Error assigning lab test:', err);
		res.status(500).json({ error: err.message || 'Failed to assign test' });
	}
});

// Upload lab report
router.post('/reports/upload', upload.single('file'), async (req, res) => {
	try {
		const { reportId, patientId, remarks } = req.body || {};
		if (!req.file) return res.status(400).json({ error: 'file is required' });
		
		const userId = req.user.id;
		
		// Get lab_id for this user
		const { data: labUsers, error: labUsersError } = await supabaseAdmin
			.from('lab_users')
			.select('lab_id')
			.eq('user_id', userId)
			.limit(1)
			.single();
		
		if (labUsersError || !labUsers) {
			return res.status(404).json({ error: 'No lab associated with this user. Please contact admin to assign you to a lab.' });
		}
		
		const labId = labUsers.lab_id;
		
		// Find the lab report to update
		let reportToUpdate = null;
		
		if (reportId) {
			const { data: report } = await supabaseAdmin
				.from('lab_reports')
				.select('*')
				.eq('id', reportId)
				.eq('lab_id', labId)
				.single();
			reportToUpdate = report;
		} else if (patientId) {
			const { data: reports } = await supabaseAdmin
				.from('lab_reports')
				.select('*')
				.eq('patient_id', patientId)
				.eq('lab_id', labId)
				.order('assigned_at', { ascending: false })
				.limit(1);
			reportToUpdate = reports && reports.length > 0 ? reports[0] : null;
		}
		
		if (!reportToUpdate) {
			return res.status(404).json({ error: 'Lab report not found. Please ensure the test was assigned to your lab.' });
		}
		
		// Upload file
		const path = `${reportToUpdate.patient_id || 'unknown'}/${Date.now()}-${req.file.originalname}`;
		const { url } = await uploadFile('lab-reports', path, req.file.buffer, req.file.mimetype);
		
		// Update existing report
		const { data: updatedReport, error: updateError } = await supabaseAdmin
			.from('lab_reports')
			.update({ 
				file_url: path,
				status: 'in_progress',
				remarks: remarks || reportToUpdate.remarks || null
			})
			.eq('id', reportToUpdate.id)
			.select('*')
			.single();
		
		if (updateError) {
			console.error('❌ Error updating lab report:', updateError);
			return res.status(400).json({ error: updateError.message });
		}
		
		console.log('✅ Lab report uploaded (in_progress):', updatedReport.id);
		
		res.json({ url, path, report: updatedReport });
	} catch (err) {
		console.error('❌ Error uploading lab report:', err);
		res.status(500).json({ error: err.message });
	}
});

// Confirm/complete lab report
router.post('/reports/:reportId/confirm', async (req, res) => {
	try {
		const { reportId } = req.params;
		const userId = req.user.id;
		
		// Get lab_id for this user
		const { data: labUsers, error: labUsersError } = await supabaseAdmin
			.from('lab_users')
			.select('lab_id')
			.eq('user_id', userId)
			.limit(1)
			.single();
		
		if (labUsersError || !labUsers) {
			return res.status(404).json({ error: 'No lab associated with this user.' });
		}
		
		const labId = labUsers.lab_id;
		
		// Check if report exists and belongs to this lab
		const { data: reportCheck, error: checkError } = await supabaseAdmin
			.from('lab_reports')
			.select('id, lab_id, status, file_url')
			.eq('id', reportId)
			.single();
		
		if (checkError || !reportCheck) {
			return res.status(404).json({ error: 'Lab report not found.' });
		}
		
		if (reportCheck.lab_id !== labId) {
			return res.status(403).json({ error: 'You do not have permission to update this report.' });
		}
		
		if (!reportCheck.file_url) {
			return res.status(400).json({ error: 'Cannot confirm report without uploaded file.' });
		}
		
		// Update report status to completed
		const { data: updatedReport, error: updateError } = await supabaseAdmin
			.from('lab_reports')
			.update({
				status: 'completed'
			})
			.eq('id', reportId)
			.select('*')
			.single();
		
		if (updateError) {
			return res.status(400).json({ error: updateError.message });
		}
		
		console.log(`✅ Report ${reportId} confirmed as completed by lab ${labId}`);
		res.json({ report: updatedReport });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get report download URL
router.get('/reports/:reportId/url', async (req, res) => {
	try {
		const { reportId } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;
		
		console.log(`🔍 [View Report] Request for report ID: ${reportId}, User: ${userId}, Role: ${userRole}`);
		
		// Admins can view any report, lab users can only view their lab's reports
		let labId = null;
		
		if (userRole !== 'admin') {
			// Get lab_id for this user (non-admin)
			const { data: labUsers, error: labUsersError } = await supabaseAdmin
				.from('lab_users')
				.select('lab_id')
				.eq('user_id', userId)
				.limit(1)
				.single();
			
			if (labUsersError || !labUsers) {
				console.error('❌ [View Report] No lab associated with user:', userId);
				return res.status(404).json({ error: 'No lab associated with this user.' });
			}
			
			labId = labUsers.lab_id;
			console.log(`🔍 [View Report] User lab_id: ${labId}`);
		}
		
		// Get report - use maybeSingle() to handle cases where report might not exist
		// First try with test_paper_url, if that fails (column doesn't exist), try without it
		let { data: report, error } = await supabaseAdmin
			.from('lab_reports')
			.select('file_url, lab_id, id, status, test_paper_url')
			.eq('id', reportId)
			.maybeSingle();
		
		// If error is about missing column, retry without test_paper_url
		if (error && (error.message?.includes('test_paper_url') || error.code === '42703')) {
			console.log('⚠️ test_paper_url column not found, querying without it');
			const { data: reportWithoutTestPaper, error: retryError } = await supabaseAdmin
				.from('lab_reports')
				.select('file_url, lab_id, id, status')
				.eq('id', reportId)
				.maybeSingle();
			
			if (retryError) {
				console.error('❌ [View Report] Database error on retry:', retryError);
				return res.status(400).json({ error: `Database error: ${retryError.message}` });
			}
			
			report = reportWithoutTestPaper;
			error = null;
			// Set test_paper_url to null since column doesn't exist
			if (report) {
				report.test_paper_url = null;
			}
		}
		
		if (error) {
			console.error('❌ [View Report] Database error:', error);
			return res.status(400).json({ error: `Database error: ${error.message}` });
		}
		
		if (!report) {
			console.error(`❌ [View Report] Report not found: ${reportId}`);
			return res.status(404).json({ error: 'Report not found' });
		}
		
		console.log(`✅ [View Report] Found report: ${report.id}, lab_id: ${report.lab_id}, has file_url: ${!!report.file_url}, has test_paper_url: ${!!report.test_paper_url}`);
		
		// Check access: admins can view any, lab users can only view their lab's reports
		if (userRole !== 'admin' && report.lab_id !== labId) {
			console.error(`❌ [View Report] Access denied: User lab_id (${labId}) != Report lab_id (${report.lab_id})`);
			return res.status(403).json({ error: 'Access denied' });
		}
		
		// Try test_paper_url first, then file_url
		const filePath = report.test_paper_url || report.file_url;
		
		if (!filePath) {
			console.error(`❌ [View Report] No file path found for report: ${reportId}`);
			return res.status(404).json({ error: 'Report file not found. The report may not have been uploaded yet.' });
		}
		
		console.log(`🔍 [View Report] Getting signed URL for path: ${filePath}`);
		const signedUrl = await getSignedUrl('lab-reports', filePath);
		console.log(`✅ [View Report] Generated signed URL for report: ${reportId}`);
		res.json({ url: signedUrl });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all lab reports (admin only)
router.get('/reports/all', async (req, res) => {
	try {
		const userRole = req.user.role;
		
		// Only admins can view all reports
		if (userRole !== 'admin') {
			return res.status(403).json({ error: 'Access denied. Admin access required.' });
		}
		
		// Get all lab reports - try with relations first, fallback to basic query
		let { data: reports, error } = await supabaseAdmin
			.from('lab_reports')
			.select(`
				*,
				patients:patient_id (
					id,
					user_id,
					users:user_id (
						id,
						name,
						email,
						phone
					)
				),
				labs:lab_id (
					id,
					name,
					location
				)
			`)
			.order('assigned_at', { ascending: false });
		
		// If the query fails due to missing relations, try a simpler query
		if (error && (error.message?.includes('relation') || error.code === '42703')) {
			console.log('⚠️ Relations query failed, trying basic query...');
			const { data: basicReports, error: basicError } = await supabaseAdmin
				.from('lab_reports')
				.select('*')
				.order('assigned_at', { ascending: false });
			
			if (basicError) {
				console.error('❌ Error loading lab reports:', basicError);
				return res.status(400).json({ error: basicError.message });
			}
			
			// Enrich with lab info
			if (basicReports && basicReports.length > 0) {
				const labIds = [...new Set(basicReports.map(r => r.lab_id).filter(Boolean))];
				const { data: labsData } = await supabaseAdmin
					.from('labs')
					.select('id, name, location')
					.in('id', labIds);
				
				const labsMap = {};
				if (labsData) {
					labsData.forEach(lab => {
						labsMap[lab.id] = lab;
					});
				}
				
				reports = basicReports.map(report => ({
					...report,
					labs: report.lab_id ? labsMap[report.lab_id] : null,
					patients: report.patient_id ? { 
						id: report.patient_id,
						users: { name: report.patient_name || 'Unknown' }
					} : null
				}));
			} else {
				reports = [];
			}
		} else if (error) {
			console.error('❌ Error loading all lab reports:', error);
			return res.status(400).json({ error: error.message });
		}
		
		// Handle patient_name for reports without patient_id
		if (reports) {
			reports = reports.map(report => {
				// If no patient relation but patient_name exists, create a mock patient object
				if (!report.patients && report.patient_name) {
					report.patients = {
						users: {
							name: report.patient_name,
							email: null,
							phone: null
						}
					};
				}
				return report;
			});
		}
		
		console.log(`✅ Loaded ${reports?.length || 0} lab reports for admin`);
		res.json({ reports: reports || [] });
	} catch (err) {
		console.error('❌ Error in /api/lab/reports/all:', err);
		res.status(500).json({ error: err.message });
	}
});

export default router;
