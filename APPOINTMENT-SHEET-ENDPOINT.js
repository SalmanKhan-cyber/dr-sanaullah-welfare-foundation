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
