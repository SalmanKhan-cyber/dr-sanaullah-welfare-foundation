import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useVerification } from '../hooks/useVerification';

export default function DashboardDoctor() {
	const { verified, checking } = useVerification('doctor');
	const [activeTab, setActiveTab] = useState('profile');
	const [doctor, setDoctor] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [changeTimeModal, setChangeTimeModal] = useState(null);
	const [newTime, setNewTime] = useState('');
	const [newDate, setNewDate] = useState('');
	const [saving, setSaving] = useState(false);
	const [showPatientHistory, setShowPatientHistory] = useState(null);
	const [patientHistoryData, setPatientHistoryData] = useState({ labReports: [], prescriptions: [], appointments: [] });
	const [loadingHistory, setLoadingHistory] = useState(false);
	
	// Profile edit
	const [editing, setEditing] = useState(false);
	const [profileForm, setProfileForm] = useState({
		name: '',
		specialization: '',
		degrees: '',
		consultation_fee: '',
		discount_rate: '',
		timing: ''
	});

	useEffect(() => {
		if (!checking && verified) {
			loadData();
		}
	}, [activeTab, verified, checking]);

	async function loadData() {
		setLoading(true);
		try {
			if (activeTab === 'profile') {
				try {
					const res = await apiRequest('/api/doctors/me');
					console.log('📋 Doctor profile API response:', res);
					
					if (res.profile_missing || !res.doctor) {
						console.log('⚠️ Doctor profile not found - showing create form');
						setDoctor(null);
						// Initialize form with empty values
						setProfileForm({
							name: '',
							specialization: '',
							degrees: '',
							consultation_fee: '',
							discount_rate: '50',
							timing: ''
						});
					} else {
						setDoctor(res.doctor);
						setProfileForm({
							name: res.doctor.name || '',
							specialization: res.doctor.specialization || '',
							degrees: res.doctor.degrees || '',
							consultation_fee: res.doctor.consultation_fee || '',
							discount_rate: res.doctor.discount_rate || '50',
							timing: res.doctor.timing || ''
						});
					}
				} catch (err) {
					// If profile doesn't exist, doctor will be null and UI will show create form
					console.error('❌ Error loading doctor profile:', err);
					setDoctor(null);
					setProfileForm({
						name: '',
						specialization: '',
						degrees: '',
						consultation_fee: '',
						discount_rate: '50',
						timing: ''
					});
				}
			} else if (activeTab === 'notifications') {
				const res = await apiRequest('/api/notifications');
				setNotifications(res.notifications || []);
			} else if (activeTab === 'appointments') {
				try {
					console.log('Loading doctor appointments...');
					const res = await apiRequest('/api/appointments/doctor/me');
					console.log('✅ Doctor appointments API response:', res);
					const appointmentsList = res.appointments || [];
					console.log('✅ Doctor appointments list:', appointmentsList);
					console.log('✅ Doctor appointments count:', appointmentsList.length);
					setAppointments(appointmentsList);
					
					// If profile is missing, show a helpful message (no error alert)
					if (res.profile_missing && !doctor) {
						console.log('⚠️ Doctor profile not found - user should create profile');
						// Don't show error - user can create profile from Profile tab
					}
				} catch (err) {
					console.error('❌ Error fetching doctor appointments:', err);
					// Handle 403 Forbidden - user doesn't have doctor role
					if (err.status === 403) {
						alert('Access denied: You need to be logged in as a doctor to view appointments. Please contact an administrator if you believe this is an error.');
					} else if (err.status !== 404) {
						// Only show error if it's not a 404 (profile missing)
						alert('Error loading appointments: ' + (err.message || 'Unknown error'));
					}
					setAppointments([]);
				}
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function saveProfile() {
		try {
			// Validate required fields
			if (!profileForm.name) {
				alert('Please enter your name');
				return;
			}
			
			const res = await apiRequest('/api/doctors/me', {
				method: 'PUT',
				body: JSON.stringify(profileForm)
			});
			
			setEditing(false);
			setDoctor(res.doctor); // Update doctor state
			loadData();
			
			if (res.doctor && !doctor) {
				// Profile was just created
				alert('Profile created successfully!');
			} else {
				// Profile was updated
				alert('Profile updated successfully!');
			}
		} catch (err) {
			alert(err.message || 'Failed to save profile');
		}
	}

	async function handleAcceptAppointment(appointmentId) {
		if (!confirm('Are you sure you want to accept this appointment?')) return;
		
		try {
			setSaving(true);
			await apiRequest(`/api/appointments/${appointmentId}/status`, {
				method: 'PUT',
				body: JSON.stringify({ status: 'confirmed' })
			});
			alert('Appointment accepted successfully!');
			loadData();
		} catch (err) {
			alert(err.message || 'Failed to accept appointment');
		} finally {
			setSaving(false);
		}
	}

	async function handleDeclineAppointment(appointmentId) {
		if (!confirm('Are you sure you want to decline this appointment?')) return;
		
		try {
			setSaving(true);
			await apiRequest(`/api/appointments/${appointmentId}/status`, {
				method: 'PUT',
				body: JSON.stringify({ status: 'cancelled' })
			});
			alert('Appointment declined successfully!');
			loadData();
		} catch (err) {
			alert(err.message || 'Failed to decline appointment');
		} finally {
			setSaving(false);
		}
	}

	function openChangeTimeModal(appointment) {
		setChangeTimeModal(appointment);
		setNewDate(appointment.appointment_date);
		setNewTime(appointment.appointment_time);
	}

	function closeChangeTimeModal() {
		setChangeTimeModal(null);
		setNewDate('');
		setNewTime('');
	}

	async function handleChangeTime() {
		if (!newTime) {
			alert('Please enter a new time');
			return;
		}

		try {
			setSaving(true);
			await apiRequest(`/api/appointments/${changeTimeModal.id}/time`, {
				method: 'PUT',
				body: JSON.stringify({
					appointment_time: newTime,
					appointment_date: newDate || changeTimeModal.appointment_date
				})
			});
			alert('Appointment time updated successfully!');
			closeChangeTimeModal();
			loadData();
		} catch (err) {
			alert(err.message || 'Failed to change appointment time');
		} finally {
			setSaving(false);
		}
	}

	async function loadPatientHistory(patientId) {
		setLoadingHistory(true);
		try {
			const [labReports, prescriptions, appointments] = await Promise.all([
				supabase.from('lab_reports').select('*').eq('patient_id', patientId).order('report_date', { ascending: false }),
				supabase.from('prescriptions').select('*, doctors(name, specialization)').eq('patient_id', patientId).order('created_at', { ascending: false }),
				supabase.from('appointments').select('*, doctors(name, specialization, degrees)').eq('patient_id', patientId).order('appointment_date', { ascending: false }).order('appointment_time', { ascending: false })
			]);
			setPatientHistoryData({
				labReports: labReports.data || [],
				prescriptions: prescriptions.data || [],
				appointments: appointments.data || []
			});
		} catch (err) {
			console.error('Error loading patient history:', err);
		} finally {
			setLoadingHistory(false);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold text-brand mb-6">👨‍⚕️ Doctor Dashboard</h1>
				
				{/* Welcome Card */}
				<div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow mb-6">
					<h2 className="text-2xl font-semibold">Welcome, {profileForm.name || 'Doctor'}!</h2>
					<p className="text-gray-600 mt-2">Manage your profile and professional information</p>
				</div>

				{/* Tabs */}
				<div className="bg-white rounded-lg shadow mb-6">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
							{['profile', 'appointments', 'notifications'].map(tab => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
										activeTab === tab
											? 'border-brand text-brand'
											: 'border-transparent text-gray-500 hover:text-gray-700'
									}`}
								>
									{tab}
								</button>
							))}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-6">
						{activeTab === 'profile' && (
							<div>
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-xl font-semibold">My Profile</h2>
									<button
										onClick={() => {
											if (editing) {
												saveProfile();
											} else {
												setEditing(true);
											}
										}}
										className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark"
									>
										{editing ? '💾 Save Changes' : '✏️ Edit Profile'}
									</button>
								</div>

								{loading ? (
									<p>Loading...</p>
								) : !doctor ? (
									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
										<p className="text-yellow-800 font-semibold mb-3">👋 Welcome to Your Doctor Dashboard</p>
										<p className="text-yellow-700 text-sm mb-4">
											Let's set up your doctor profile to get started. This will only take a moment.
										</p>
										<button
											onClick={() => setEditing(true)}
											className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark font-semibold"
										>
											Create Profile
										</button>
									</div>
								) : (
									<div className="grid md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium mb-1">Full Name</label>
											<input
												type="text"
												className="w-full border p-2 rounded"
												value={profileForm.name}
												onChange={e => setProfileForm({...profileForm, name: e.target.value})}
												disabled={!editing}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Specialization</label>
											<input
												type="text"
												className="w-full border p-2 rounded"
												value={profileForm.specialization}
												onChange={e => setProfileForm({...profileForm, specialization: e.target.value})}
												disabled={!editing}
												placeholder="e.g., Cardiologist"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Degrees & Qualifications</label>
											<input
												type="text"
												className="w-full border p-2 rounded"
												value={profileForm.degrees}
												onChange={e => setProfileForm({...profileForm, degrees: e.target.value})}
												disabled={!editing}
												placeholder="e.g., MBBS, FCPS (Cardiology)"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Consultation Fee (PKR)</label>
											<input
												type="number"
												className="w-full border p-2 rounded"
												value={profileForm.consultation_fee}
												onChange={e => setProfileForm({...profileForm, consultation_fee: e.target.value})}
												disabled={!editing}
												placeholder="e.g., 2000"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Discount Rate (%)</label>
											<input
												type="number"
												className="w-full border p-2 rounded"
												value={profileForm.discount_rate}
												onChange={e => setProfileForm({...profileForm, discount_rate: e.target.value})}
												disabled={!editing}
												min="0"
												max="100"
											/>
										</div>
										<div className="md:col-span-2">
											<label className="block text-sm font-medium mb-1">Availability & Timing</label>
											<textarea
												className="w-full border p-2 rounded"
												rows="3"
												value={profileForm.timing}
												onChange={e => setProfileForm({...profileForm, timing: e.target.value})}
												disabled={!editing}
												placeholder="e.g., Monday-Friday: 9 AM - 5 PM"
											/>
										</div>
									</div>
								)}
							</div>
						)}

						{activeTab === 'appointments' && (
							<div>
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold">My Appointments</h2>
								</div>
								{loading ? (
									<div className="text-center py-8">
										<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent mb-4"></div>
										<p className="text-gray-600">Loading appointments...</p>
									</div>
								) : appointments.length === 0 ? (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
										<div className="text-6xl mb-4">📅</div>
										<p className="text-blue-900 font-semibold text-lg mb-2">No appointments yet</p>
										<p className="text-blue-700 text-sm mb-4">Patient appointments will appear here when they book with you</p>
									</div>
								) : (
									<div className="space-y-4">
										{appointments.map(apt => (
											<div key={apt.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-3">
															<div className="text-4xl">👤</div>
															<div>
																<h3 className="font-bold text-lg text-gray-900">{apt.patients?.users?.name || 'Patient'}</h3>
																{apt.patients && (
																	<p className="text-gray-600 text-sm">
																		{apt.patients.age && `Age: ${apt.patients.age}`}
																		{apt.patients.age && apt.patients.gender && ' | '}
																		{apt.patients.gender && apt.patients.gender}
																	</p>
																)}
															</div>
														</div>
														<div className="mt-4 space-y-2">
															<div className="flex items-center gap-2">
																<span className="text-gray-500">📅</span>
																<p className="text-sm">
																	<span className="font-medium text-gray-700">Date:</span>{' '}
																	<span className="text-gray-900">
																		{new Date(apt.appointment_date).toLocaleDateString('en-US', { 
																			weekday: 'long', 
																			year: 'numeric', 
																			month: 'long', 
																			day: 'numeric' 
																		})}
																	</span>
																</p>
															</div>
															<div className="flex items-center gap-2">
																<span className="text-gray-500">⏰</span>
																<p className="text-sm">
																	<span className="font-medium text-gray-700">Time:</span>{' '}
																	<span className="text-gray-900">{apt.appointment_time}</span>
																</p>
															</div>
															{apt.reason && (
																<div className="flex items-start gap-2">
																	<span className="text-gray-500">📝</span>
																	<p className="text-sm">
																		<span className="font-medium text-gray-700">Reason:</span>{' '}
																		<span className="text-gray-900">{apt.reason}</span>
																	</p>
																</div>
															)}
															<div className="flex items-center gap-2 mt-3">
																<span className="font-medium text-gray-700 text-sm">Status:</span>
																<span className={`px-3 py-1 rounded-full text-xs font-semibold ${
																	apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
																	apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
																	apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
																	apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
																	'bg-gray-100 text-gray-800'
																}`}>
																	{apt.status ? apt.status.toUpperCase() : 'PENDING'}
																</span>
															</div>
														</div>
													</div>
													<div className="text-right ml-6 flex flex-col items-end gap-3">
														{apt.final_fee && (
															<div className="bg-brand/10 rounded-lg p-3">
																<p className="text-xs text-gray-600 mb-1">Fee</p>
																<p className="text-brand font-bold text-xl">PKR {parseFloat(apt.final_fee).toFixed(2)}</p>
															</div>
														)}
														
														{/* View History Button */}
														<button
															onClick={async () => {
																if (apt.patients?.user_id) {
																	setShowPatientHistory(apt.patients);
																	await loadPatientHistory(apt.patients.user_id);
																}
															}}
															className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition w-full"
														>
															📋 View Patient History
														</button>
														
														{/* Action Buttons */}
														{apt.status === 'pending' && (
															<div className="flex flex-col gap-2 mt-2">
																<button
																	onClick={() => handleAcceptAppointment(apt.id)}
																	disabled={saving}
																	className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
																>
																	✅ Accept
																</button>
																<button
																	onClick={() => handleDeclineAppointment(apt.id)}
																	disabled={saving}
																	className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
																>
																	❌ Decline
																</button>
																<button
																	onClick={() => openChangeTimeModal(apt)}
																	disabled={saving}
																	className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
																>
																	⏰ Change Time
																</button>
															</div>
														)}
														{apt.status === 'confirmed' && (
															<div className="flex flex-col gap-2 mt-2">
																{apt.video_call_link && (
																	<button
																		onClick={() => window.location.href = `/video-call/${apt.id}`}
																		className="bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
																	>
																		<span>🎥</span>
																		<span>Join Video Call</span>
																	</button>
																)}
																<button
																	onClick={() => openChangeTimeModal(apt)}
																	disabled={saving}
																	className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
																>
																	⏰ Change Time
																</button>
																<button
																	onClick={async () => {
																		try {
																			setSaving(true);
																			await apiRequest(`/api/appointments/${apt.id}/status`, {
																				method: 'PUT',
																				body: JSON.stringify({ status: 'completed' })
																			});
																			alert('Appointment marked as completed!');
																			loadData();
																		} catch (err) {
																			alert(err.message || 'Failed to mark as completed');
																		} finally {
																			setSaving(false);
																		}
																	}}
																	disabled={saving}
																	className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
																>
																	✓ Mark Complete
																</button>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{activeTab === 'notifications' && (
							<div>
								<h2 className="text-xl font-semibold mb-4">Notifications</h2>
								{loading ? (
									<p>Loading...</p>
								) : notifications.length === 0 ? (
									<div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
										<p className="text-gray-600">No notifications</p>
									</div>
								) : (
									<div className="space-y-3">
										{notifications.map(notif => (
											<div key={notif.id} className="bg-white border rounded-lg p-4">
												<p className="text-gray-800">{notif.message}</p>
												<p className="text-xs text-gray-500 mt-1">
													{new Date(notif.created_at).toLocaleString()}
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Change Time Modal */}
			{changeTimeModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-xl font-bold mb-4">Change Appointment Time</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Date</label>
								<input
									type="date"
									className="w-full border p-2 rounded"
									value={newDate}
									onChange={e => setNewDate(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Time</label>
								<input
									type="time"
									className="w-full border p-2 rounded"
									value={newTime}
									onChange={e => setNewTime(e.target.value)}
									required
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									onClick={handleChangeTime}
									disabled={saving || !newTime}
									className="flex-1 bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{saving ? 'Saving...' : 'Save Changes'}
								</button>
								<button
									onClick={closeChangeTimeModal}
									disabled={saving}
									className="flex-1 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Patient History Modal */}
			{showPatientHistory && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-2xl font-bold text-gray-900">Patient Medical History</h3>
							<button
								onClick={() => {
									setShowPatientHistory(null);
									setPatientHistoryData({ labReports: [], prescriptions: [], appointments: [] });
								}}
								className="text-gray-500 hover:text-gray-900 text-2xl"
							>
								✕
							</button>
						</div>

						<div id="patient-receipt" className="space-y-6">
							{/* Patient Info */}
							<div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
								<h4 className="font-bold text-lg text-gray-900 mb-4">Patient Information</h4>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<p className="text-xs text-gray-600 mb-1">Full Name</p>
										<p className="font-semibold text-gray-900 text-lg">{showPatientHistory.users?.name || 'N/A'}</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-1">Email Address</p>
										<p className="font-semibold text-gray-900">{showPatientHistory.users?.email || 'N/A'}</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-1">Age</p>
										<p className="font-semibold text-gray-900">{showPatientHistory.age || 'N/A'} years</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-1">Gender</p>
										<p className="font-semibold text-gray-900 capitalize">{showPatientHistory.gender || 'N/A'}</p>
									</div>
									<div className="md:col-span-2">
										<p className="text-xs text-gray-600 mb-1">CNIC Number</p>
										<p className="font-semibold text-gray-900 font-mono">{showPatientHistory.cnic || 'N/A'}</p>
									</div>
									<div className="md:col-span-2">
										<p className="text-xs text-gray-600 mb-1">Medical History</p>
										<p className="font-semibold text-gray-900">{showPatientHistory.history || 'No medical history recorded'}</p>
									</div>
								</div>
							</div>

							{/* Lab Reports Section */}
							<div className="mb-6">
								<h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
									<span className="text-2xl">🧪</span>
									Lab Reports ({patientHistoryData.labReports.length})
								</h4>
								{loadingHistory ? (
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
										<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
										<p className="text-sm text-gray-600 mt-2">Loading lab reports...</p>
									</div>
								) : patientHistoryData.labReports.length === 0 ? (
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
										<p className="text-sm text-gray-600">No lab reports available for this patient.</p>
									</div>
								) : (
									<div className="space-y-3">
										{patientHistoryData.labReports.map(report => (
											<div key={report.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200 flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-2xl">
														🧪
													</div>
													<div>
														<p className="font-bold text-gray-900">Report #{report.id.substring(0, 12)}...</p>
														<p className="text-sm text-gray-600">
															{new Date(report.report_date).toLocaleDateString('en-US', {
																year: 'numeric',
																month: 'long',
																day: 'numeric'
															})}
														</p>
														{report.remarks && (
															<p className="text-xs text-gray-500 mt-1">{report.remarks}</p>
														)}
													</div>
												</div>
												<button
													onClick={async () => {
														const res = await apiRequest(`/api/lab/reports/${report.id}/download`);
														window.open(res.url, '_blank');
													}}
													className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
													disabled={!report.file_url}
												>
													📥 Download
												</button>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Prescriptions Section */}
							<div className="mb-6">
								<h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
									<span className="text-2xl">📋</span>
									Prescriptions ({patientHistoryData.prescriptions.length})
								</h4>
								{loadingHistory ? (
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
										<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
										<p className="text-sm text-gray-600 mt-2">Loading prescriptions...</p>
									</div>
								) : patientHistoryData.prescriptions.length === 0 ? (
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
										<p className="text-sm text-gray-600">No prescriptions available for this patient.</p>
									</div>
								) : (
									<div className="space-y-3">
										{patientHistoryData.prescriptions.map(prescription => (
											<div key={prescription.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-2xl">
															📋
														</div>
														<div>
															<p className="font-bold text-gray-900">Prescription #{prescription.id.substring(0, 12)}...</p>
															<p className="text-sm text-gray-600">
																{new Date(prescription.created_at).toLocaleDateString('en-US', {
																	year: 'numeric',
																	month: 'long',
																	day: 'numeric'
																})}
															</p>
															{prescription.doctors && (
																<p className="text-xs text-gray-500 mt-1">
																	👨‍⚕️ Dr. {prescription.doctors.name} - {prescription.doctors.specialization}
																</p>
															)}
														</div>
													</div>
													<button
														onClick={() => {
															if (prescription.file_url) {
																window.open(prescription.file_url, '_blank');
															}
														}}
														className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
														disabled={!prescription.file_url}
													>
														📥 Download
													</button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Appointments/Doctor Visits Section */}
							<div className="mb-6">
								<h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
									<span className="text-2xl">👨‍⚕️</span>
									Doctor Visits & Appointments ({patientHistoryData.appointments.length})
								</h4>
								{loadingHistory ? (
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
										<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
										<p className="text-sm text-gray-600 mt-2">Loading appointments...</p>
									</div>
								) : patientHistoryData.appointments.length === 0 ? (
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
										<p className="text-sm text-gray-600">No appointments or doctor visits recorded for this patient.</p>
									</div>
								) : (
									<div className="space-y-3">
										{patientHistoryData.appointments.map(appointment => (
											<div key={appointment.id} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
												<div className="flex items-start justify-between">
													<div className="flex items-start gap-3">
														<div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl">
															👨‍⚕️
														</div>
														<div className="flex-1">
															<p className="font-bold text-gray-900">
																{appointment.doctors?.name || 'Unknown Doctor'}
															</p>
															<p className="text-sm text-gray-600 mt-1">
																{appointment.doctors?.specialization && (
																	<span className="text-brand font-semibold">{appointment.doctors.specialization}</span>
																)}
																{appointment.doctors?.degrees && ` - ${appointment.doctors.degrees}`}
															</p>
															<div className="mt-2 space-y-1">
																<p className="text-sm text-gray-700">
																	📅 <strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
																		year: 'numeric',
																		month: 'long',
																		day: 'numeric'
																	})}
																</p>
																<p className="text-sm text-gray-700">
																	🕐 <strong>Time:</strong> {appointment.appointment_time}
																</p>
																{appointment.reason && (
																	<p className="text-sm text-gray-700">
																		📝 <strong>Reason:</strong> {appointment.reason}
																	</p>
																)}
																<p className="text-sm">
																	<span className={`px-2 py-1 rounded-full text-xs font-semibold ${
																		appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
																		appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
																		appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
																		'bg-red-100 text-red-800'
																	}`}>
																		{appointment.status?.toUpperCase() || 'PENDING'}
																	</span>
																</p>
																{appointment.final_fee && (
																	<p className="text-sm text-gray-700 mt-1">
																		💰 <strong>Fee:</strong> PKR {Number(appointment.final_fee).toLocaleString()}
																		{appointment.discount_applied && ` (${appointment.discount_applied}% discount applied)`}
																	</p>
																)}
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="flex gap-3 mt-8 border-t border-gray-200 pt-6">
							<button
								onClick={() => {
									setShowPatientHistory(null);
									setPatientHistoryData({ labReports: [], prescriptions: [], appointments: [] });
								}}
								className="flex-1 bg-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

