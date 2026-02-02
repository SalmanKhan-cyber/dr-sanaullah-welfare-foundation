import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateAppointmentSheetPDF, generateAppointmentSheetFileName } from '../lib/appointmentSheetGenerator.js';

const router = express.Router();

// Health check for guest routes
router.get('/health', (req, res) => {
	console.log('🔍 Guest appointments health check accessed');
	res.json({ 
		status: 'OK', 
		message: 'Guest appointments router is working',
		timestamp: new Date().toISOString()
	});
});

// Test endpoint to verify routing
router.get('/test', (req, res) => {
	console.log('🔍 Guest appointments test endpoint accessed');
	res.json({ 
		status: 'OK', 
		message: 'Guest appointments test endpoint is working',
		timestamp: new Date().toISOString()
	});
});

// Public guest booking endpoint (no authentication required)
router.post('/', async (req, res) => {
	try {
		const { doctor_id, appointment_date, appointment_time, reason, patient_details } = req.body || {};
		
		if (!doctor_id || !appointment_date || !appointment_time) {
			return res.status(400).json({ error: 'doctor_id, appointment_date, and appointment_time are required' });
		}
		
		// Simplified validation - just need basic info for appointment sheet
		console.log('🔍 Debug - patient_details:', patient_details);
		console.log('🔍 Debug - patient_details.name:', patient_details?.name);
		
		// If patient_details is missing, try to create minimal patient info
		if (!patient_details) {
			patient_details = {
				name: 'Guest Patient',
				phone: 'Not Provided',
				age: 0,
				gender: 'other',
				cnic: 'Not Provided',
				history: null
			};
			console.log('🔍 Created minimal patient_details:', patient_details);
		}
		
		// Check if name exists, if not use default
		if (!patient_details.name || patient_details.name.trim() === '') {
			patient_details.name = 'Guest Patient';
			console.log('🔍 Using default name for patient');
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
		
		// Create appointment record with guest patient details (no patient account creation)
		const { data, error } = await supabaseAdmin
			.from('appointments')
			.insert({
				patient_id: null, // No patient record for guests
				doctor_id: doctor_id,
				appointment_date: appointment_date,
				appointment_time: appointment_time,
				reason: reason || null,
				consultation_fee: finalFee,
				payment_status: 'pending',
				status: 'scheduled',
				// Store guest patient details directly in appointment
				guest_patient_name: patient_details.name,
				guest_patient_phone: patient_details.phone,
				guest_patient_age: patient_details.age,
				guest_patient_gender: patient_details.gender,
				guest_patient_cnic: patient_details.cnic,
				guest_patient_history: patient_details.history || null
			})
			.select(`
				id,
				patient_id,
				doctor_id,
				appointment_date,
				appointment_time,
				reason,
				status,
				consultation_fee,
				payment_status,
				created_at,
				guest_patient_name,
				guest_patient_phone,
				guest_patient_age,
				guest_patient_gender,
				guest_patient_cnic,
				guest_patient_history,
				doctors!inner(name, specialization)
			`)
			.single();
		
		if (error) {
			console.error('❌ Error creating appointment:', error);
			return res.status(500).json({ error: 'Failed to create appointment' });
		}
		
		console.log('✅ Guest appointment created successfully:', data);
		
		// Generate appointment sheet PDF
		let appointmentSheetUrl = null;
		let appointmentSheetFilename = null;
		
		try {
			console.log('📄 Generating appointment sheet PDF for guest...');
			console.log('🔍 Guest appointment data:', data);
			
			// Prepare appointment data for PDF generation using guest details
			const appointmentData = {
				patient: {
					name: data.guest_patient_name,
					phone: data.guest_patient_phone,
					age: data.guest_patient_age,
					gender: data.guest_patient_gender,
					cnic: data.guest_patient_cnic,
					history: data.guest_patient_history
				},
				doctor: {
					name: doctor.name,
					specialization: doctor.specialization
				},
				appointment: {
					date: data.appointment_date,
					time: data.appointment_time,
					reason: data.reason,
					status: data.status,
					consultation_fee: data.consultation_fee
				},
				appointmentId: data.id
			};
			
			console.log('🔍 Appointment data for PDF:', appointmentData);
			
			// Generate PDF buffer
			const pdfBuffer = await generateAppointmentSheetPDF(appointmentData);
			console.log('🔍 PDF buffer generated, size:', pdfBuffer.length);
			
			// Generate filename
			const filename = generateAppointmentSheetFileName(appointmentData.patient, data.id);
			const filePath = `appointment-sheets/${filename}`;
			console.log('🔍 Generated filename:', filename);
			
			// Upload to Supabase storage
			const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
				.from('appointment-sheets')
				.upload(filePath, pdfBuffer, {
					contentType: 'application/pdf',
					upsert: true
				});
			
			if (uploadError) {
				console.error('❌ Failed to upload appointment sheet:', uploadError);
				throw uploadError;
			}
			
			console.log('✅ PDF uploaded successfully:', uploadData);
			
			// Generate signed URL for immediate download
			const { signedUrl } = await supabaseAdmin.storage
				.from('appointment-sheets')
				.createSignedUrl(filePath, 60 * 60 * 24); // 24 hours expiry
			
			console.log('🔍 Signed URL generated:', signedUrl);
			
			appointmentSheetUrl = signedUrl;
			appointmentSheetFilename = filename;
			
			// Update appointment with sheet URL
			await supabaseAdmin
				.from('appointments')
				.update({ appointment_sheet_url: signedUrl })
				.eq('id', data.id);
			
			console.log('✅ Appointment sheet generated and uploaded:', signedUrl);
		} catch (pdfError) {
			console.error('❌ Failed to generate appointment sheet:', pdfError);
			console.error('❌ PDF Error details:', pdfError.message);
			console.error('❌ PDF Error stack:', pdfError.stack);
			// Don't fail the booking if PDF generation fails
		}
		
		console.log('🔍 Final response data:', { 
			appointment: data,
			appointment_sheet_url: appointmentSheetUrl,
			appointment_sheet_filename: appointmentSheetFilename
		});
		
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

export default router;
