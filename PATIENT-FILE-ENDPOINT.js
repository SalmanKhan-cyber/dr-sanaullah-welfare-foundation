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
