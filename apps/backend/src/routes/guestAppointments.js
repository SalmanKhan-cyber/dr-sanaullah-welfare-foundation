import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateAppointmentSheet } from '../lib/appointmentSheetGenerator.js';

const router = express.Router();

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
		
		// Create patient record for guest user
		const { data: newPatient, error: patientCreateError } = await supabaseAdmin
			.from('patients')
			.insert({
				user_id: '00000000-0000-0000-0000-000000000000', // Special UUID for guest users
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
				doctor_id: doctor_id,
				appointment_date: appointment_date,
				appointment_time: appointment_time,
				reason: reason || null,
				status: 'scheduled',
				consultation_fee: finalFee,
				payment_status: 'pending'
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
				patients!inner(name, phone, age, gender),
				doctors!inner(name, specialization)
			`)
			.single();
		
		if (error) {
			console.error('❌ Error creating appointment:', error);
			return res.status(500).json({ error: 'Failed to create appointment' });
		}
		
		console.log('✅ Guest appointment created successfully:', data);
		
		// Generate appointment sheet
		let appointmentSheetUrl = null;
		let appointmentSheetFilename = null;
		
		try {
			console.log('📄 Generating appointment sheet for guest appointment...');
			
			// Prepare appointment data for PDF generation
			const appointmentData = {
				id: data.id,
				appointment_date: data.appointment_date,
				appointment_time: data.appointment_time,
				reason: data.reason,
				status: data.status,
				consultation_fee: data.consultation_fee,
				payment_status: data.payment_status,
				created_at: data.created_at,
				patient: {
					name: patient_details.name,
					phone: patient_details.phone,
					age: patient_details.age,
					gender: patient_details.gender,
					cnic: patient_details.cnic
				},
				doctor: {
					name: doctor.name,
					specialization: doctor.specialization
				}
			};
			
			// Generate PDF
			const { filename, filePath } = await generateAppointmentSheet(appointmentData);
			
			// Generate signed URL for immediate download
			const { signedUrl } = await supabaseAdmin.storage
				.from('appointment-sheets')
				.createSignedUrl(filePath, 60 * 60 * 24); // 24 hours expiry
			
			appointmentSheetUrl = signedUrl;
			appointmentSheetFilename = filename;
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

export default router;
