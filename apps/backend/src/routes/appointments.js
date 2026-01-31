import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadFile } from '../lib/storage.js';
import { generatePatientFilePDF, generatePatientFileName } from '../lib/patientFileGenerator.js';
import { generateSessionSummaryPDF, generateSessionSummaryFileName } from '../lib/sessionSummaryGenerator.js';
import { generateAppointmentSheetPDF, generateAppointmentSheetFileName } from '../lib/appointmentSheetGenerator.js';

const router = Router();

// Get patient's appointments
router.get('/patient/me', async (req, res) => {
	try {
		const userId = req.user.id;
		
		console.log('🔍 Fetching appointments for user:', userId);
		
		// Appointments store patients.id (not users.id) in patient_id
		// First, find the patient profile to get patients.id
		const { data: patientProfile, error: patientError } = await supabaseAdmin
			.from('patients')
			.select('id, user_id')
			.eq('user_id', userId)
			.maybeSingle();
		
		if (patientError && patientError.code !== 'PGRST116') {
			console.error('❌ Error fetching patient profile:', patientError);
			// Return empty array instead of error - user might not have profile yet
			return res.json({ appointments: [] });
		}
		
		if (!patientProfile || !patientProfile.id) {
			console.log('⚠️ No patient profile found for user:', userId);
			// Try legacy method: query by userId directly (in case patient_id = user_id)
			console.log('🔄 Trying legacy query method...');
			const { data: legacyData, error: legacyError } = await supabaseAdmin
				.from('appointments')
				.select('*, doctors(name, specialization, degrees, consultation_fee, discount_rate, user_id)')
				.eq('patient_id', userId)
				.order('appointment_date', { ascending: false })
				.order('appointment_time', { ascending: false });
			
			if (!legacyError && legacyData) {
				console.log(`✅ Found ${legacyData.length} appointments using legacy method`);
				return res.json({ appointments: legacyData || [] });
			}
			
			return res.json({ appointments: [] });
		}
		
		// Query appointments by patients.id
		console.log('✅ Patient profile found, querying appointments by patient_id:', patientProfile.id);
		const { data, error } = await supabaseAdmin
			.from('appointments')
			.select('*, doctors(name, specialization, degrees, consultation_fee, discount_rate, user_id)')
			.eq('patient_id', patientProfile.id)
			.order('appointment_date', { ascending: false })
			.order('appointment_time', { ascending: false });
		
		if (error) {
			console.error('❌ Error fetching appointments:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`✅ Found ${data?.length || 0} appointments`);
		res.json({ appointments: data || [] });
	} catch (err) {
		console.error('❌ Error in appointments endpoint:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get doctor's appointments
router.get('/doctor/me', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get doctor_id from doctors table using user_id
		const { data: doctor, error: doctorError } = await supabaseAdmin
			.from('doctors')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		// If doctor profile doesn't exist, return empty array instead of error
		// This allows the dashboard to load and prompt user to create profile
		if (!doctor || doctorError) {
			console.log(`⚠️ Doctor profile not found for user ${userId} - returning empty appointments`);
			return res.json({ appointments: [], profile_missing: true });
		}
		
		const { data, error } = await supabaseAdmin
			.from('appointments')
			.select('*, patients(users(name, email, phone), age, gender, cnic, user_id)')
			.eq('doctor_id', doctor.id)
			.order('appointment_date', { ascending: true })
			.order('appointment_time', { ascending: true });
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ appointments: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Public guest booking endpoint (no authentication required)
router.post('/guest', async (req, res) => {
	try {
		const { doctor_id, appointment_date, appointment_time, reason, patient_details } = req.body || {};
		
		if (!doctor_id || !appointment_date || !appointment_time) {
			return res.status(400).json({ error: 'doctor_id, appointment_date, and appointment_time are required' });
		}
		
		// Simplified validation - just need basic info for appointment sheet
		console.log('🔍 Debug - patient_details:', patient_details);
		console.log('🔍 Debug - patient_details.name:', patient_details?.name);
		
		if (!patient_details || !patient_details.name || patient_details.name.trim() === '') {
			return res.status(400).json({ error: 'Patient name is required for appointment sheet generation' });
		}
		
		console.log('👤 Processing guest booking with patient details:', patient_details);
		
		// Get doctor details for fee calculation
		const { data: doctor } = await supabaseAdmin
			.from('doctors')
			.select('consultation_fee, discount_rate, name, specialization')
			.eq('id', doctor_id)
			.single();
		
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor not found' });
		}
		
		// Calculate final fee with discount
		const consultationFee = parseFloat(doctor.consultation_fee) || 0;
		const discountRate = parseFloat(doctor.discount_rate) || 0;
		const discountAmount = (consultationFee * discountRate) / 100;
		const finalFee = consultationFee - discountAmount;
		
		// Create a simple patient record with minimal required fields
		console.log('👤 Creating minimal patient record for guest user');
		
		const { data: newPatient, error: patientCreateError } = await supabaseAdmin
			.from('patients')
			.insert({
				user_id: null, // Guest users don't have user_id
				name: patient_details.name || 'Guest Patient',
				phone: patient_details.phone || 'Not Provided',
				age: patient_details.age || 0,
				gender: patient_details.gender || 'other',
				cnic: patient_details.cnic || 'Not Provided',
				history: patient_details.history || null
			})
			.select('id')
			.single();
		
		if (patientCreateError) {
			console.error('❌ Error creating patient record for guest:', patientCreateError);
			return res.status(500).json({ error: 'Failed to create patient record' });
		}
		
		const patientIdForAppointment = newPatient.id;
		console.log('✅ Created patient record for guest:', newPatient.id);
		
		console.log('📅 Creating appointment for guest patient:', patientIdForAppointment);
		
		// Create appointment
		const { data, error } = await supabaseAdmin
			.from('appointments')
			.insert({
				patient_id: patientIdForAppointment,
				doctor_id,
				appointment_date,
				appointment_time,
				reason: reason || null,
				consultation_fee: consultationFee,
				discount_applied: discountRate,
				final_fee: finalFee,
				status: 'pending'
			})
			.select(`
				*, 
				doctors(name, specialization, degrees, consultation_fee, discount_rate)
			`)
			.single();
		
		if (error) {
			console.error('❌ Appointment creation failed:', error);
			return res.status(500).json({ error: error.message });
		}
		
		console.log('✅ Guest appointment created:', data);
		
		// Generate appointment sheet PDF
		let appointmentSheetUrl = null;
		let appointmentSheetFilename = null;
		
		try {
			console.log('📄 Generating appointment sheet PDF...');
			
			const pdfBuffer = await generateAppointmentSheetPDF({
				patientName: patient_details.name || 'Guest Patient',
				patientAge: patient_details.age || 'Not Specified',
				patientGender: patient_details.gender || 'Not Specified',
				patientContact: patient_details.phone || 'Not Provided',
				patientId: patient_details.cnic || 'Not Provided',
				doctorName: doctor.name,
				doctorSpecialization: doctor.specialization,
				appointmentDate: appointment_date,
				appointmentTime: appointment_time,
				reason: reason || null
			});
			
			const filename = generateAppointmentSheetFileName(patient_details.name || 'Guest', data.id);
			const filePath = `appointment-sheets/${filename}`;
			
			// Upload to Supabase storage
			const { error: uploadError } = await uploadFile(filePath, pdfBuffer, 'application/pdf');
			
			if (uploadError) {
				console.error('❌ Failed to upload appointment sheet:', uploadError);
			} else {
				console.log('✅ Appointment sheet uploaded successfully');
				
				// Update appointment with sheet URL
				const { error: updateError } = await supabaseAdmin
					.from('appointments')
					.update({ appointment_sheet_url: filePath })
					.eq('id', data.id);
				
				if (updateError) {
					console.error('❌ Failed to update appointment sheet URL:', updateError);
				} else {
					console.log('✅ Appointment sheet URL updated');
					
					// Generate signed URL for immediate download
					const { signedUrl } = await supabaseAdmin.storage
						.from('appointment-sheets')
						.createSignedUrl(filePath, 60 * 60 * 24); // 24 hours expiry
					
					appointmentSheetUrl = signedUrl;
					appointmentSheetFilename = filename;
				}
			}
		} catch (pdfError) {
			console.error('❌ Failed to generate appointment sheet:', pdfError);
			// Don't fail the booking if PDF generation fails
		}
		
		res.json({ 
			appointment: data,
			appointment_sheet_url: appointmentSheetUrl,
			appointment_sheet_filename: appointmentSheetFilename
		});
		
	} catch (err) {
		console.error('❌ Guest booking error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Book appointment (patient only)
router.post('/', async (req, res) => {
	try {
		const userId = req.user?.id; // Optional for guest users
		const { doctor_id, appointment_date, appointment_time, reason, patient_details } = req.body || {};
		
		if (!doctor_id || !appointment_date || !appointment_time) {
			return res.status(400).json({ error: 'doctor_id, appointment_date, and appointment_time are required' });
		}
		
		let patient = null;
		
		// Handle guest users (no authentication)
		if (!userId && patient_details) {
			console.log('👤 Processing guest booking with patient details:', patient_details);
			
			// Create a temporary patient object from guest details
			patient = {
				name: patient_details.name,
				phone: patient_details.phone,
				age: patient_details.age,
				gender: patient_details.gender,
				cnic: patient_details.cnic,
				user_id: null // Guest users don't have a user_id
			};
		} else {
			// Authenticated user - find existing patient profile
			// Verify patient exists and get the correct patient_id to use
			// Handle both cases: constraint might reference patients(user_id) or patients(id)
			
			// Try to find patient profile (with retry if not found immediately - handles race condition)
			for (let attempt = 0; attempt < 3; attempt++) {
				const { data, error } = await supabaseAdmin
					.from('patients')
					.select('id, user_id, name, phone, age, gender, cnic')
					.eq('user_id', userId)
					.maybeSingle(); // Use maybeSingle() to return null instead of error
				
				if (data && data.user_id) {
					patient = data;
					console.log(`✅ Patient profile found on attempt ${attempt + 1}:`, { id: patient.id, user_id: patient.user_id });
					break;
				}
				
				// If patient not found and this is not the last attempt, wait a bit
				if (attempt < 2) {
					console.log(`⏳ Patient profile not found on attempt ${attempt + 1}, retrying...`);
					await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
				}
			}
			
			if (!patient || !patient.user_id) {
				console.error('❌ Patient profile not found for userId:', userId);
				return res.status(404).json({ 
					error: 'Patient profile not found. Please complete your profile first and wait a moment before booking.' 
				});
			}
		}
		
		// Verify profile has required fields
		// If name/phone are missing from patients table, try to get from users table
		let patientName = patient.name;
		let patientPhone = patient.phone;
		
		if (!patientName || !patientPhone) {
			console.log('⚠️ Name or phone missing from patients table, checking users table...');
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('name, phone')
				.eq('id', userId)
				.single();
			
			if (userData) {
				if (!patientName && userData.name) {
					patientName = userData.name;
					console.log('✅ Using name from users table:', patientName);
				}
				if (!patientPhone && userData.phone) {
					patientPhone = userData.phone;
					console.log('✅ Using phone from users table:', patientPhone);
				}
			}
		}
		
		// Check for missing required fields
		const missingFields = [];
		if (!patientName) missingFields.push('name');
		if (!patientPhone) missingFields.push('phone');
		if (!patient.age) missingFields.push('age');
		if (!patient.gender) missingFields.push('gender');
		if (!patient.cnic) missingFields.push('CNIC');
		
		if (missingFields.length > 0) {
			console.log('⚠️ Patient profile exists but missing required fields:', { 
				patient, 
				patientName, 
				patientPhone,
				missingFields 
			});
			return res.status(400).json({ 
				error: `Patient profile is incomplete. Missing fields: ${missingFields.join(', ')}. Please complete your profile in the Patient Dashboard → Profile tab.` 
			});
		}
		
		console.log('✅ Patient profile found:', patient);
		
		// Get doctor details for fee calculation
		const { data: doctor } = await supabaseAdmin
			.from('doctors')
			.select('consultation_fee, discount_rate')
			.eq('id', doctor_id)
			.single();
		
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor not found' });
		}
		
		// Calculate final fee with discount
		const consultationFee = parseFloat(doctor.consultation_fee) || 0;
		const discountRate = parseFloat(doctor.discount_rate) || 0;
		const discountAmount = (consultationFee * discountRate) / 100;
		const finalFee = consultationFee - discountAmount;
		
		// Determine which patient_id to use based on schema
		// If patients table has 'id' column (migrated schema), use it
		// Otherwise, use user_id (original schema)
		// Foreign key constraint will reference patients(id) or patients(user_id) accordingly
		let patientIdForAppointment = patient.id || patient.user_id;
		
		// For guest users, create a patient record first
		if (!userId && patient_details) {
			console.log('👤 Creating patient record for guest user');
			
			const { data: newPatient, error: patientCreateError } = await supabaseAdmin
				.from('patients')
				.insert({
					user_id: null, // Guest users don't have user_id
					name: patient.name,
					phone: patient.phone,
					age: patient.age,
					gender: patient.gender,
					cnic: patient.cnic,
					history: patient_details.history || null
				})
				.select('id')
				.single();
			
			if (patientCreateError) {
				console.error('❌ Error creating patient record for guest:', patientCreateError);
				return res.status(500).json({ error: 'Failed to create patient record' });
			}
			
			patientIdForAppointment = newPatient.id;
			console.log('✅ Created patient record for guest:', newPatient.id);
		}
		
		console.log('📅 Creating appointment - patient:', { id: patient.id, user_id: patient.user_id, using: patientIdForAppointment });
		
		// Create appointment
		const { data, error } = await supabaseAdmin
			.from('appointments')
			.insert({
				patient_id: patientIdForAppointment, // Uses patient.id if migrated, patient.user_id if original
				doctor_id,
				appointment_date,
				appointment_time,
				reason: reason || null,
				consultation_fee: consultationFee,
				discount_applied: discountRate,
				final_fee: finalFee,
				status: 'pending'
			})
			.select('*, doctors(name, specialization)')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Send notification to doctor
		if (doctor.user_id) {
			await supabaseAdmin.from('notifications').insert({
				user_id: doctor.user_id,
				message: `New appointment request for ${appointment_date} at ${appointment_time}`
			});
		}
		
		// Send notification to patient (only if they're not a student)
		// Check if user is a student
		const { data: userData } = await supabaseAdmin
			.from('users')
			.select('role')
			.eq('id', userId)
			.single();
		
		// Only send appointment notifications to non-students (patients)
		if (userData?.role !== 'student') {
			await supabaseAdmin.from('notifications').insert({
				user_id: userId,
				message: `Appointment booked with ${data.doctors?.name || 'Doctor'} on ${appointment_date} at ${appointment_time}`
			});
		}
		
		// Generate patient file for the appointment
		try {
			console.log('📄 Generating patient file for appointment:', data.id);
			
			// Get complete patient data
			const { data: completePatient } = await supabaseAdmin
				.from('patients')
				.select('*')
				.eq('user_id', userId)
				.single();
			
			// Get complete doctor data
			const { data: completeDoctor } = await supabaseAdmin
				.from('doctors')
				.select('*')
				.eq('id', doctor_id)
				.single();
			
			// Prepare appointment data for PDF generation
			const appointmentData = {
				patient: {
					...completePatient,
					email: patient.email
				},
				doctor: completeDoctor || { name: data.doctors?.name },
				appointment: {
					...data,
					date: appointment_date,
					time: appointment_time
				}
			};
			
			// Generate patient file PDF
			const pdfBuffer = await generatePatientFilePDF(appointmentData);
			
			// Generate filename
			const fileName = generatePatientFileName(appointmentData.patient, appointmentData.appointment);
			
			// Upload to storage
			const fileUrl = await uploadFile('patient-files', pdfBuffer, fileName, 'application/pdf');
			
			// Update appointment with patient file URL
			await supabaseAdmin
				.from('appointments')
				.update({ patient_file_url: fileUrl })
				.eq('id', data.id);
			
			console.log('✅ Patient file generated and uploaded:', fileUrl);
		} catch (fileError) {
			console.error('❌ Error generating patient file:', fileError);
			// Don't fail the appointment booking if file generation fails
		}

		// Generate appointment sheet for immediate download
		try {
			console.log('📋 Generating appointment sheet for immediate download:', data.id);
			
			// Get complete patient data
			const { data: completePatient } = await supabaseAdmin
				.from('patients')
				.select('*')
				.eq('user_id', userId)
				.single();
			
			// Get complete doctor data
			const { data: completeDoctor } = await supabaseAdmin
				.from('doctors')
				.select('*')
				.eq('id', doctor_id)
				.single();
			
			// Prepare appointment data for sheet generation
			const sheetData = {
				patient: {
					...completePatient,
					email: patient.email
				},
				doctor: completeDoctor || { name: data.doctors?.name },
				appointment: {
					...data,
					date: appointment_date,
					time: appointment_time
				},
				appointmentId: data.id
			};
			
			// Generate appointment sheet PDF
			const sheetPdfBuffer = await generateAppointmentSheetPDF(sheetData);
			
			// Generate filename
			const sheetFileName = generateAppointmentSheetFileName(sheetData.patient, sheetData.appointmentId);
			
			// Upload appointment sheet to storage
			const sheetFileUrl = await uploadFile('appointment-sheets', sheetPdfBuffer, sheetFileName, 'application/pdf');
			
			// Update appointment with sheet URL
			await supabaseAdmin
				.from('appointments')
				.update({ appointment_sheet_url: sheetFileUrl })
				.eq('id', data.id);
			
			console.log('✅ Appointment sheet generated and uploaded:', sheetFileUrl);
			
			// Include appointment sheet URL in response for immediate download
			data.appointment_sheet_url = sheetFileUrl;
			data.appointment_sheet_filename = sheetFileName;
		} catch (sheetError) {
			console.error('❌ Error generating appointment sheet:', sheetError);
			// Don't fail the appointment booking if sheet generation fails
		}
		
		res.json({ appointment: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update appointment status (doctor or patient)
router.put('/:id/status', async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body || {};
		const userId = req.user.id;
		
		if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
			return res.status(400).json({ error: 'Valid status required' });
		}
		
		// Get appointment
		const { data: appointment, error: fetchError } = await supabaseAdmin
			.from('appointments')
			.select('*, doctors(user_id)')
			.eq('id', id)
			.single();
		
		if (fetchError || !appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		// Check if user is authorized (patient or doctor)
		const isPatient = appointment.patient_id === userId;
		const isDoctor = appointment.doctors?.user_id === userId;
		
		if (!isPatient && !isDoctor) {
			return res.status(403).json({ error: 'Not authorized to update this appointment' });
		}
		
		// Prepare update data
		const updateData = {
			status,
			updated_at: new Date().toISOString()
		};
		
		// If status is being set to 'confirmed', generate video call link
		if (status === 'confirmed' && !appointment.video_call_link) {
			// Generate unique room name: Foundation-Appointment-{appointment_id}
			const roomName = `Foundation-Appointment-${id.replace(/-/g, '').substring(0, 20)}`;
			const videoCallLink = `https://meet.jit.si/${roomName}`;
			updateData.video_call_link = videoCallLink;
			console.log(`✅ Generated video call link for appointment ${id}: ${videoCallLink}`);
		}
		
		// Update status
		const { data, error } = await supabaseAdmin
			.from('appointments')
			.update(updateData)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Send notification
		const notifyUserId = isPatient ? appointment.doctors?.user_id : appointment.patient_id;
		const statusMessages = {
			'confirmed': 'Your appointment has been confirmed',
			'cancelled': 'Your appointment has been cancelled',
			'completed': 'Your appointment has been marked as completed',
			'pending': 'Your appointment status has been changed to pending'
		};
		
		if (notifyUserId) {
			// Check if user is a student - don't send appointment notifications to students
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('role')
				.eq('id', notifyUserId)
				.single();
			
			// Only send appointment notifications to non-students
			if (userData?.role !== 'student') {
				await supabaseAdmin.from('notifications').insert({
					user_id: notifyUserId,
					message: statusMessages[status] || `Appointment status updated to ${status}`
				});
			}
		}
		
		res.json({ appointment: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update appointment time (doctor only)
router.put('/:id/time', async (req, res) => {
	try {
		const { id } = req.params;
		const { appointment_date, appointment_time } = req.body || {};
		const userId = req.user.id;
		
		if (!appointment_time) {
			return res.status(400).json({ error: 'appointment_time is required' });
		}
		
		// Get appointment and verify doctor
		const { data: appointment, error: fetchError } = await supabaseAdmin
			.from('appointments')
			.select('*, doctors(user_id), patients(users(name))')
			.eq('id', id)
			.single();
		
		if (fetchError || !appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		// Verify user is the doctor for this appointment
		if (appointment.doctors?.user_id !== userId) {
			return res.status(403).json({ error: 'Only the doctor can change appointment time' });
		}
		
		// Update time (and date if provided)
		const updateData = {
			appointment_time,
			updated_at: new Date().toISOString()
		};
		
		if (appointment_date) {
			updateData.appointment_date = appointment_date;
		}
		
		const { data, error } = await supabaseAdmin
			.from('appointments')
			.update(updateData)
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Send notification to patient (only if they're not a student)
		if (appointment.patient_id) {
			// Check if user is a student - don't send appointment notifications to students
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('role')
				.eq('id', appointment.patient_id)
				.single();
			
			// Only send appointment notifications to non-students
			if (userData?.role !== 'student') {
				const dateStr = appointment_date 
					? new Date(appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
					: new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
				
				await supabaseAdmin.from('notifications').insert({
					user_id: appointment.patient_id,
					message: `Your appointment time has been changed to ${dateStr} at ${appointment_time}. Please check your appointments.`
				});
			}
		}
		
		res.json({ appointment: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get patient file download URL
router.get('/:appointmentId/patient-file', async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;
		
		console.log(`🔍 [Patient File] Request for appointment: ${appointmentId}, User: ${userId}, Role: ${userRole}`);
		
		// Get appointment with patient file URL
		const { data: appointment, error } = await supabaseAdmin
			.from('appointments')
			.select('patient_file_url, patient_id, doctors(user_id)')
			.eq('id', appointmentId)
			.single();
		
		if (error || !appointment) {
			console.error('❌ [Patient File] Appointment not found:', error);
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		// Check access permissions
		const isPatient = appointment.patient_id === userId;
		const isDoctor = appointment.doctors?.user_id === userId;
		const isAdmin = userRole === 'admin';
		
		if (!isPatient && !isDoctor && !isAdmin) {
			console.error(`❌ [Patient File] Access denied for user: ${userId}`);
			return res.status(403).json({ error: 'Access denied' });
		}
		
		if (!appointment.patient_file_url) {
			console.error(`❌ [Patient File] No patient file found for appointment: ${appointmentId}`);
			return res.status(404).json({ error: 'Patient file not found' });
		}
		
		console.log(`🔍 [Patient File] Getting signed URL for: ${appointment.patient_file_url}`);
		
		// Extract file path from URL
		const filePath = appointment.patient_file_url.split('/').pop();
		
		// Generate signed URL
		const { getSignedUrl } = await import('../lib/storage.js');
		const signedUrl = await getSignedUrl('patient-files', filePath);
		
		console.log(`✅ [Patient File] Generated signed URL for appointment: ${appointmentId}`);
		res.json({ url: signedUrl });
	} catch (err) {
		console.error('❌ [Patient File] Error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get session summary data
router.get('/:appointmentId/session-summary', async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;
		
		console.log(`🔍 [Session Summary] Request for appointment: ${appointmentId}, User: ${userId}, Role: ${userRole}`);
		
		// Get appointment with all related data
		const { data: appointment, error } = await supabaseAdmin
			.from('appointments')
			.select(`
				*,
				patients(user_id, name, age, gender, phone, email),
				doctors(name, specialization)
			`)
			.eq('id', appointmentId)
			.single();
		
		if (error || !appointment) {
			console.error('❌ [Session Summary] Appointment not found:', error);
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		// Check access permissions
		const isPatient = appointment.patient_id === userId;
		const isDoctor = appointment.doctors?.user_id === userId;
		const isAdmin = userRole === 'admin';
		
		if (!isPatient && !isDoctor && !isAdmin) {
			console.error(`❌ [Session Summary] Access denied for user: ${userId}`);
			return res.status(403).json({ error: 'Access denied' });
		}
		
		// Format response data
		const responseData = {
			patient: appointment.patients,
			doctor: appointment.doctors,
			appointment: {
				date: appointment.appointment_date,
				time: appointment.appointment_time,
				status: appointment.status
			}
		};
		
		console.log(`✅ [Session Summary] Data retrieved for appointment: ${appointmentId}`);
		res.json(responseData);
	} catch (err) {
		console.error('❌ [Session Summary] Error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Generate and download session summary PDF
router.get('/:appointmentId/session-summary/pdf', async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;
		
		console.log(`🔍 [Session Summary PDF] Request for appointment: ${appointmentId}, User: ${userId}, Role: ${userRole}`);
		
		// Get appointment with all related data
		const { data: appointment, error } = await supabaseAdmin
			.from('appointments')
			.select(`
				*,
				patients(user_id, name, age, gender, phone, email),
				doctors(name, specialization)
			`)
			.eq('id', appointmentId)
			.single();
		
		if (error || !appointment) {
			console.error('❌ [Session Summary PDF] Appointment not found:', error);
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		// Check access permissions
		const isPatient = appointment.patient_id === userId;
		const isDoctor = appointment.doctors?.user_id === userId;
		const isAdmin = userRole === 'admin';
		
		if (!isPatient && !isDoctor && !isAdmin) {
			console.error(`❌ [Session Summary PDF] Access denied for user: ${userId}`);
			return res.status(403).json({ error: 'Access denied' });
		}
		
		// Prepare data for PDF generation
		const appointmentData = {
			patient: appointment.patients,
			doctor: appointment.doctors,
			appointment: {
				date: appointment.appointment_date,
				time: appointment.appointment_time,
				status: appointment.status
			},
			appointmentId
		};
		
		// Generate PDF
		const pdfBuffer = await generateSessionSummaryPDF(appointmentData);
		
		// Set response headers
		const fileName = generateSessionSummaryFileName(appointment.patients, appointmentId);
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
		res.setHeader('Content-Length', pdfBuffer.length);
		
		console.log(`✅ [Session Summary PDF] Generated for appointment: ${appointmentId}`);
		res.send(pdfBuffer);
	} catch (err) {
		console.error('❌ [Session Summary PDF] Error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get appointment sheet download URL
router.get('/:appointmentId/appointment-sheet', async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;
		
		console.log(`🔍 [Appointment Sheet] Request for appointment: ${appointmentId}, User: ${userId}, Role: ${userRole}`);
		
		// Get appointment with appointment sheet URL
		const { data: appointment, error } = await supabaseAdmin
			.from('appointments')
			.select('appointment_sheet_url, patient_id, doctors(user_id)')
			.eq('id', appointmentId)
			.single();
		
		if (error || !appointment) {
			console.error('❌ [Appointment Sheet] Appointment not found:', error);
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		// Check access permissions
		const isPatient = appointment.patient_id === userId;
		const isDoctor = appointment.doctors?.user_id === userId;
		const isAdmin = userRole === 'admin';
		
		if (!isPatient && !isDoctor && !isAdmin) {
			console.error(`❌ [Appointment Sheet] Access denied for user: ${userId}`);
			return res.status(403).json({ error: 'Access denied' });
		}
		
		if (!appointment.appointment_sheet_url) {
			console.error(`❌ [Appointment Sheet] No appointment sheet found for appointment: ${appointmentId}`);
			return res.status(404).json({ error: 'Appointment sheet not found' });
		}
		
		console.log(`🔍 [Appointment Sheet] Getting signed URL for: ${appointment.appointment_sheet_url}`);
		
		// Extract file path from URL
		const filePath = appointment.appointment_sheet_url.split('/').pop();
		
		// Generate signed URL
		const { getSignedUrl } = await import('../lib/storage.js');
		const signedUrl = await getSignedUrl('appointment-sheets', filePath);
		
		console.log(`✅ [Appointment Sheet] Generated signed URL for appointment: ${appointmentId}`);
		res.json({ url: signedUrl });
	} catch (err) {
		console.error('❌ [Appointment Sheet] Error:', err);
		res.status(500).json({ error: err.message });
	}
});

export default router;
