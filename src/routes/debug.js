import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateAppointmentSheetPDF, generateAppointmentSheetFileName } from '../lib/appointmentSheetGenerator.js';
import { uploadFile } from '../lib/storage.js';

const router = Router();

// Manual trigger to generate appointment sheet for existing appointment
// POST /api/debug/generate-appointment-sheet/:appointmentId
router.post('/generate-appointment-sheet/:appointmentId', async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;
		
		console.log(`🔧 Manual appointment sheet generation requested for appointment: ${appointmentId} by user: ${userId} (${userRole})`);
		
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
			console.error('❌ Appointment not found:', error);
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		// Check access permissions
		const isPatient = appointment.patient_id === userId;
		const isDoctor = appointment.doctors?.user_id === userId;
		const isAdmin = userRole === 'admin';
		
		if (!isPatient && !isDoctor && !isAdmin) {
			console.error(`❌ Access denied for user: ${userId}`);
			return res.status(403).json({ error: 'Access denied' });
		}
		
		// Get complete patient data
		const { data: completePatient } = await supabaseAdmin
			.from('patients')
			.select('*')
			.or(`id.eq.${appointment.patient_id},user_id.eq.${appointment.patient_id}`)
			.single();
		
		// Get complete doctor data
		const { data: completeDoctor } = await supabaseAdmin
			.from('doctors')
			.select('*')
			.eq('id', appointment.doctor_id)
			.single();
		
		// Prepare appointment data for appointment sheet
		const appointmentSheetData = {
			patient: {
				...completePatient,
				email: appointment.patients.email
			},
			doctor: completeDoctor || { name: appointment.doctors?.name },
			appointment: {
				...appointment,
				date: appointment.appointment_date,
				time: appointment.appointment_time,
				reason: appointment.reason,
				type: 'In-Clinic',
				status: appointment.status,
				consultationFee: appointment.consultation_fee
			}
		};
		
		console.log('📄 Generating PDF with data:', {
			patient: appointmentSheetData.patient.name,
			doctor: appointmentSheetData.doctor.name,
			date: appointmentSheetData.appointment.date,
			time: appointmentSheetData.appointment.time
		});
		
		// Generate appointment sheet PDF
		const appointmentSheetBuffer = await generateAppointmentSheetPDF(appointmentSheetData);
		console.log('✅ PDF generated successfully, size:', appointmentSheetBuffer.length, 'bytes');
		
		// Generate filename
		const appointmentSheetFileName = generateAppointmentSheetFileName(appointmentSheetData);
		console.log('📝 Generated filename:', appointmentSheetFileName);
		
		// Upload to storage
		const uploadResult = await uploadFile('appointment-sheets', appointmentSheetBuffer, appointmentSheetFileName, 'application/pdf');
		const appointmentSheetUrl = uploadResult.url;
		console.log('✅ File uploaded successfully:', appointmentSheetUrl);
		
		// Update appointment with appointment sheet URL
		const { data: updatedAppointment, error: updateError } = await supabaseAdmin
			.from('appointments')
			.update({ appointment_sheet_url: appointmentSheetUrl })
			.eq('id', appointmentId)
			.select('*, doctors(name, specialization)')
			.single();
		
		if (updateError) {
			console.error('❌ Error updating appointment with sheet URL:', updateError);
			throw updateError;
		}
		
		console.log('✅ Appointment sheet generated and uploaded:', appointmentSheetUrl);
		
		res.json({ 
			success: true,
			message: 'Appointment sheet generated successfully',
			appointment: updatedAppointment,
			appointment_sheet_url: appointmentSheetUrl
		});
		
	} catch (err) {
		console.error('❌ Error generating appointment sheet:', err);
		console.error('❌ Full error details:', {
			message: err.message,
			stack: err.stack
		});
		res.status(500).json({ 
			error: err.message,
			details: err.stack
		});
	}
});

export default router;
