import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadFile } from '../lib/storage.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Get teacher's courses (optimized - removed unnecessary query)
router.get('/courses', async (req, res) => {
	try {
		const teacherId = req.user.id;
		
		// Direct query - no need to check all courses first
		const { data, error } = await supabaseAdmin
			.from('courses')
			.select('id, title, description, discount_rate, duration, trainer_id, created_at')
			.eq('trainer_id', teacherId)
			.order('title', { ascending: true });
		
		if (error) {
			console.error('❌ Error fetching courses:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ courses: data || [] });
	} catch (err) {
		console.error('❌ Exception in /api/teacher/courses:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get students enrolled in a course
router.get('/courses/:courseId/students', async (req, res) => {
	try {
		const { courseId } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the course
		const { data: course } = await supabaseAdmin
			.from('courses')
			.select('trainer_id')
			.eq('id', courseId)
			.single();
		
		if (!course || course.trainer_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('students')
			.select(`
				*,
				users:user_id (
					id,
					name,
					email,
					phone
				)
			`)
			.eq('course_id', courseId)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ students: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ========== COURSE MATERIALS ==========

// Get materials for a course
router.get('/courses/:courseId/materials', async (req, res) => {
	try {
		const { courseId } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the course
		const { data: course } = await supabaseAdmin
			.from('courses')
			.select('trainer_id')
			.eq('id', courseId)
			.single();
		
		if (!course || course.trainer_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		console.log('📚 Fetching materials for course:', courseId, 'by teacher:', teacherId);
		const { data, error } = await supabaseAdmin
			.from('course_materials')
			.select('*')
			.eq('course_id', courseId)
			.order('display_order', { ascending: true })
			.order('created_at', { ascending: false });
		
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		
		// Return materials directly - no need for unnecessary Promise.all
		res.json({ materials: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get fresh signed URL for a material file
router.get('/materials/:id/url', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		
		// Get material and verify ownership
		const { data: material, error: materialError } = await supabaseAdmin
			.from('course_materials')
			.select('*, courses!inner(trainer_id)')
			.eq('id', id)
			.single();
		
		if (materialError || !material) {
			return res.status(404).json({ error: 'Material not found' });
		}
		
		if (material.courses.trainer_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		if (!material.file_url) {
			return res.status(404).json({ error: 'No file attached to this material' });
		}
		
		// Check if it's already a public URL or signed URL
		const fileUrl = material.file_url;
		
		// Check if it's a Supabase public URL
		if (fileUrl.includes('/storage/v1/object/public/')) {
			// Public URL - return as-is
			return res.json({ url: fileUrl, isPublic: true });
		}
		
		// Check if it's a signed URL - extract path from it
		// Signed URLs have format: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[path]?token=...
		const signedUrlMatch = fileUrl.match(/\/storage\/v1\/object\/sign\/course-materials\/([^?]+)/);
		if (signedUrlMatch) {
			const filePath = signedUrlMatch[1];
			// Generate fresh signed URL (1 year expiry for videos)
			const { getSignedUrl } = await import('../lib/storage.js');
			try {
				const freshUrl = await getSignedUrl('course-materials', filePath, 60 * 60 * 24 * 365);
				return res.json({ url: freshUrl, isPublic: false });
			} catch (urlError) {
				console.error('Error generating fresh signed URL:', urlError);
				// Return original URL as fallback
				return res.json({ url: fileUrl, isPublic: false, error: 'Could not generate fresh URL' });
			}
		}
		
		// If we can't determine the format, return the stored URL
		return res.json({ url: fileUrl, isPublic: false });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Upload course material
router.post('/courses/:courseId/materials', upload.single('file'), async (req, res) => {
	try {
		const { courseId } = req.params;
		const teacherId = req.user.id;
		const teacherEmail = req.user.email;
		const { title, description, material_type, display_order } = req.body;
		
		console.log('📤 Uploading material for course:', courseId);
		console.log('   Teacher ID:', teacherId);
		console.log('   Teacher Email:', teacherEmail);
		
		// Verify teacher owns the course
		const { data: course, error: courseError } = await supabaseAdmin
			.from('courses')
			.select('id, title, trainer_id')
			.eq('id', courseId)
			.single();
		
		if (courseError || !course) {
			console.error('❌ Course not found:', courseError);
			return res.status(404).json({ error: `Course not found: ${courseError?.message || 'Invalid course ID'}` });
		}
		
		console.log('📋 Course found:', course.title);
		console.log('   Course trainer_id:', course.trainer_id);
		console.log('   Teacher user ID:', teacherId);
		console.log('   Match:', course.trainer_id === teacherId);
		
		if (!course.trainer_id) {
			console.error('❌ Course has no trainer_id assigned');
			return res.status(403).json({ 
				error: 'This course is not assigned to any teacher. Please contact admin to assign the course to you.' 
			});
		}
		
		if (course.trainer_id !== teacherId) {
			console.error('❌ Teacher ID mismatch!');
			console.error('   Expected:', course.trainer_id);
			console.error('   Got:', teacherId);
			return res.status(403).json({ 
				error: `Access denied. This course is assigned to a different teacher. Your ID: ${teacherId}, Course trainer_id: ${course.trainer_id}` 
			});
		}
		
		let fileUrl = null;
		let fileName = null;
		let fileType = null;
		let fileSize = null;
		
		if (req.file) {
			console.log('📁 File received:', {
				originalname: req.file.originalname,
				mimetype: req.file.mimetype,
				size: req.file.size,
				bufferLength: req.file.buffer?.length
			});
			
			try {
				const path = `course-materials/${courseId}/${Date.now()}-${req.file.originalname}`;
				console.log('📁 Uploading file to storage:', path);
				const uploadResult = await uploadFile('course-materials', path, req.file.buffer, req.file.mimetype);
				
				if (!uploadResult || !uploadResult.url) {
					throw new Error('Upload succeeded but no URL was returned');
				}
				
				fileUrl = uploadResult.url;
				fileName = req.file.originalname;
				fileType = req.file.mimetype;
				fileSize = req.file.size;
				
				console.log('✅ File uploaded successfully!');
				console.log('   File URL:', fileUrl);
				console.log('   File Name:', fileName);
				console.log('   File Type:', fileType);
				console.log('   File Size:', fileSize);
			} catch (uploadError) {
				console.error('❌ File upload error:', uploadError);
				console.error('   Error message:', uploadError.message);
				
				// If bucket doesn't exist, still allow material creation without file
				if (uploadError.message?.includes('Bucket') || uploadError.message?.includes('bucket') || uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
					console.warn('⚠️ Storage bucket "course-materials" may not exist. Creating material without file URL.');
					console.warn('   Please create the "course-materials" bucket in Supabase Storage.');
					// Continue without file - material can be created with just title/description
				} else {
					return res.status(500).json({ 
						error: `File upload failed: ${uploadError.message}. Please check: 1. The course-materials storage bucket exists in Supabase, 2. You have permission to upload files, 3. The file size is within limits` 
					});
				}
			}
		} else {
			console.log('⚠️ No file provided in request');
		}
		
		console.log('💾 Saving material to database:', {
			course_id: courseId,
			teacher_id: teacherId,
			title,
			has_file: !!fileUrl
		});
		
		const { data, error } = await supabaseAdmin
			.from('course_materials')
			.insert({
				course_id: courseId,
				teacher_id: teacherId,
				title,
				description,
				file_url: fileUrl,
				file_name: fileName,
				file_type: fileType,
				file_size: fileSize,
				material_type: material_type || 'document',
				display_order: display_order || 0
			})
			.select('*')
			.single();
		
		if (error) {
			console.error('❌ Error saving material:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Material saved successfully:', data?.id);
		console.log('   Material data:', JSON.stringify(data, null, 2));
		console.log('   File URL:', data?.file_url);
		console.log('   File Name:', data?.file_name);
		console.log('   File Type:', data?.file_type);
		console.log('   File Size:', data?.file_size);
		
		if (!data) {
			console.error('❌ No data returned from insert!');
			return res.status(500).json({ error: 'Material was created but data was not returned' });
		}
		
		res.json({ material: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update course material
router.put('/materials/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		const updates = req.body;
		
		// Verify teacher owns the material
		const { data: material } = await supabaseAdmin
			.from('course_materials')
			.select('teacher_id')
			.eq('id', id)
			.single();
		
		if (!material || material.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('course_materials')
			.update({
				...updates,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ material: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete course material
router.delete('/materials/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the material
		const { data: material } = await supabaseAdmin
			.from('course_materials')
			.select('teacher_id, file_url')
			.eq('id', id)
			.single();
		
		if (!material || material.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		// TODO: Delete file from storage if exists
		
		const { error } = await supabaseAdmin
			.from('course_materials')
			.delete()
			.eq('id', id);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ========== ANNOUNCEMENTS ==========

// Get announcements for a course
router.get('/courses/:courseId/announcements', async (req, res) => {
	try {
		const { courseId } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the course
		const { data: course } = await supabaseAdmin
			.from('courses')
			.select('trainer_id')
			.eq('id', courseId)
			.single();
		
		if (!course || course.trainer_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('course_announcements')
			.select('*')
			.eq('course_id', courseId)
			.order('is_pinned', { ascending: false })
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ announcements: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create announcement
router.post('/courses/:courseId/announcements', async (req, res) => {
	try {
		const { courseId } = req.params;
		const teacherId = req.user.id;
		const { title, message, priority, is_pinned } = req.body;
		
		// Verify teacher owns the course
		const { data: course } = await supabaseAdmin
			.from('courses')
			.select('trainer_id')
			.eq('id', courseId)
			.single();
		
		if (!course || course.trainer_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		// Get enrolled students
		const { data: students } = await supabaseAdmin
			.from('students')
			.select('user_id')
			.eq('course_id', courseId);
		
		// Create announcement
		const { data: announcement, error } = await supabaseAdmin
			.from('course_announcements')
			.insert({
				course_id: courseId,
				teacher_id: teacherId,
				title,
				message,
				priority: priority || 'normal',
				is_pinned: is_pinned || false
			})
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Create notifications for all enrolled students
		if (students && students.length > 0) {
			const notifications = students.map(s => ({
				user_id: s.user_id,
				message: `New announcement in ${course.title}: ${title}`
			}));
			
			await supabaseAdmin.from('notifications').insert(notifications);
		}
		
		res.json({ announcement });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update announcement
router.put('/announcements/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		const updates = req.body;
		
		// Verify teacher owns the announcement
		const { data: announcement } = await supabaseAdmin
			.from('course_announcements')
			.select('teacher_id')
			.eq('id', id)
			.single();
		
		if (!announcement || announcement.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('course_announcements')
			.update({
				...updates,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ announcement: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete announcement
router.delete('/announcements/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the announcement
		const { data: announcement } = await supabaseAdmin
			.from('course_announcements')
			.select('teacher_id')
			.eq('id', id)
			.single();
		
		if (!announcement || announcement.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { error } = await supabaseAdmin
			.from('course_announcements')
			.delete()
			.eq('id', id);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ========== ASSIGNMENTS ==========

// Get assignments for a course
router.get('/courses/:courseId/assignments', async (req, res) => {
	try {
		const { courseId } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the course
		const { data: course } = await supabaseAdmin
			.from('courses')
			.select('trainer_id')
			.eq('id', courseId)
			.single();
		
		if (!course || course.trainer_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
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

// Create assignment
router.post('/courses/:courseId/assignments', upload.single('file'), async (req, res) => {
	try {
		const { courseId } = req.params;
		const teacherId = req.user.id;
		const { title, description, instructions, due_date, max_score, assignment_type } = req.body;
		
		// Verify teacher owns the course
		const { data: course } = await supabaseAdmin
			.from('courses')
			.select('trainer_id')
			.eq('id', courseId)
			.single();
		
		if (!course || course.trainer_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		let fileUrl = null;
		let fileName = null;
		let fileType = null;
		let fileSize = null;
		
		if (req.file) {
			try {
				const path = `course-assignments/${courseId}/${Date.now()}-${req.file.originalname}`;
				console.log('📁 Uploading assignment file to storage:', path);
				const uploadResult = await uploadFile('course-assignments', path, req.file.buffer, req.file.mimetype);
				
				if (!uploadResult || !uploadResult.url) {
					throw new Error('Upload succeeded but no URL was returned');
				}
				
				fileUrl = uploadResult.url;
				fileName = req.file.originalname;
				fileType = req.file.mimetype;
				fileSize = req.file.size;
				
				console.log('✅ Assignment file uploaded successfully!');
			} catch (uploadError) {
				console.error('❌ Assignment file upload error:', uploadError);
				console.error('   Error message:', uploadError.message);
				
				// If bucket doesn't exist, allow assignment creation without file
				if (uploadError.message?.includes('Bucket') || uploadError.message?.includes('bucket') || uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
					console.warn('⚠️ Storage bucket "course-assignments" may not exist. Creating assignment without file.');
					console.warn('   Please create the "course-assignments" bucket in Supabase Storage.');
					// Continue without file - assignment can be created with just metadata
				} else {
					return res.status(500).json({ 
						error: `File upload failed: ${uploadError.message}. Please check: 1. The course-assignments storage bucket exists in Supabase, 2. You have permission to upload files, 3. The file size is within limits` 
					});
				}
			}
		}
		
		// Get enrolled students
		const { data: students } = await supabaseAdmin
			.from('students')
			.select('user_id')
			.eq('course_id', courseId);
		
		// Create assignment
		// Note: file_type and file_size columns may not exist in the database schema
		// Only include file_url and file_name which are the standard columns
		const { data: assignment, error } = await supabaseAdmin
			.from('course_assignments')
			.insert({
				course_id: courseId,
				teacher_id: teacherId,
				title,
				description,
				instructions,
				file_url: fileUrl,
				file_name: fileName,
				due_date: due_date || null,
				max_score: max_score || 100,
				assignment_type: assignment_type || 'homework'
			})
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Create notifications for all enrolled students
		if (students && students.length > 0) {
			const notifications = students.map(s => ({
				user_id: s.user_id,
				message: `New assignment in ${course.title}: ${title}`
			}));
			
			await supabaseAdmin.from('notifications').insert(notifications);
		}
		
		res.json({ assignment });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update assignment
router.put('/assignments/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		const updates = req.body;
		
		// Verify teacher owns the assignment
		const { data: assignment } = await supabaseAdmin
			.from('course_assignments')
			.select('teacher_id')
			.eq('id', id)
			.single();
		
		if (!assignment || assignment.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('course_assignments')
			.update({
				...updates,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ assignment: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete assignment
router.delete('/assignments/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the assignment
		const { data: assignment } = await supabaseAdmin
			.from('course_assignments')
			.select('teacher_id, file_url')
			.eq('id', id)
			.single();
		
		if (!assignment || assignment.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		// TODO: Delete file from storage if exists
		
		const { error } = await supabaseAdmin
			.from('course_assignments')
			.delete()
			.eq('id', id);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get submissions for an assignment
router.get('/assignments/:id/submissions', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		
		// Verify teacher owns the assignment
		const { data: assignment } = await supabaseAdmin
			.from('course_assignments')
			.select('teacher_id')
			.eq('id', id)
			.single();
		
		if (!assignment || assignment.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('assignment_submissions')
			.select(`
				*,
				student:student_id (
					id,
					name,
					email
				)
			`)
			.eq('assignment_id', id)
			.order('submitted_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ submissions: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Grade submission
router.put('/submissions/:id/grade', async (req, res) => {
	try {
		const { id } = req.params;
		const teacherId = req.user.id;
		const { score, feedback } = req.body;
		
		// Get submission with assignment
		const { data: submission, error: subError } = await supabaseAdmin
			.from('assignment_submissions')
			.select('*, assignment_id')
			.eq('id', id)
			.single();
		
		if (subError || !submission) {
			return res.status(404).json({ error: 'Submission not found' });
		}
		
		// Verify teacher owns the assignment
		const { data: assignment } = await supabaseAdmin
			.from('course_assignments')
			.select('teacher_id, title')
			.eq('id', submission.assignment_id)
			.single();
		
		if (!assignment || assignment.teacher_id !== teacherId) {
			return res.status(403).json({ error: 'Access denied' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('assignment_submissions')
			.update({
				score,
				feedback,
				status: 'graded',
				graded_at: new Date().toISOString()
			})
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Create notification for student
		await supabaseAdmin.from('notifications').insert({
			user_id: submission.student_id,
			message: `Your assignment "${assignment.title}" has been graded. Score: ${score}`
		});
		
		res.json({ submission: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Upload teacher image (admin only)
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
		const path = `teachers/${fileName}`;

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
		console.error('Teacher image upload error:', err);
		res.status(500).json({ error: err.message || 'Failed to upload image' });
	}
});

export default router;

