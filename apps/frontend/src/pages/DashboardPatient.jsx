import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import AppointmentSheetModal from '../components/AppointmentSheetModal';
import { Link } from 'react-router-dom';
import { apiRequest, clearCache } from '../lib/api';

export default function DashboardPatient() {
	const [activeTab, setActiveTab] = useState('profile');
	const [profile, setProfile] = useState(null);
	const [doctors, setDoctors] = useState([]);
	const [reports, setReports] = useState([]);
	const [prescriptions, setPrescriptions] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [showAppointmentSheet, setShowAppointmentSheet] = useState(false);
	const [appointmentSheetData, setAppointmentSheetData] = useState(null);
	const [appointments, setAppointments] = useState([]);
	const [testBookings, setTestBookings] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedDoctor, setSelectedDoctor] = useState(null);
	const [viewDoctorProfile, setViewDoctorProfile] = useState(null);
	const [appointmentForm, setAppointmentForm] = useState({ appointment_date: '', appointment_time: '', reason: '' });
	const [bookingLoading, setBookingLoading] = useState(false);
	
	// Multiple profiles management
	const [allProfiles, setAllProfiles] = useState({ patients: [], doctors: [], teachers: [] });
	const [showCreateProfile, setShowCreateProfile] = useState(false);
	const [newProfileType, setNewProfileType] = useState(null);
	const [newProfileForm, setNewProfileForm] = useState({});
	
	// Profile edit
	const [editing, setEditing] = useState(false);
	const [profileForm, setProfileForm] = useState({
		name: '', phone: '', age: '', gender: 'male', cnic: '', history: ''
	});

	useEffect(() => {
		loadData();
		if (activeTab === 'profiles') {
			loadAllProfiles();
		}
	}, [activeTab]);

	async function loadData() {
		setLoading(true);
		try {
			if (activeTab === 'profile') {
				const res = await apiRequest('/api/patients/me');
				console.log('📋 Full API response:', res);
				console.log('📋 Patient profile data:', res.profile);
				
				if (!res.profile) {
					console.warn('⚠️ No profile found - user may need to create one');
					setProfile(null);
					setProfileForm({
						name: '',
						phone: '',
						age: '',
						gender: 'male',
						cnic: '',
						history: ''
					});
					return;
				}
				
				setProfile(res.profile);
				
				// Get name from patients table first, fallback to users table
				const patientName = res.profile?.name || res.profile?.users?.name || '';
				const patientPhone = res.profile?.phone || res.profile?.users?.phone || '';
				const patientAge = res.profile?.age || '';
				const patientGender = res.profile?.gender || 'male';
				const patientCnic = res.profile?.cnic || '';
				const patientHistory = res.profile?.history || '';
				
				console.log('📋 Extracted profile data:', {
					name: patientName,
					phone: patientPhone,
					age: patientAge,
					gender: patientGender,
					cnic: patientCnic
				});
				
				setProfileForm({
					name: patientName,
					phone: patientPhone,
					age: patientAge,
					gender: patientGender,
					cnic: patientCnic,
					history: patientHistory
				});
			} else if (activeTab === 'doctors') {
				const res = await apiRequest('/api/doctors');
				setDoctors(res.doctors || []);
			} else if (activeTab === 'reports') {
				const res = await apiRequest('/api/patients/me/reports');
				setReports(res.reports || []);
			} else if (activeTab === 'prescriptions') {
				const res = await apiRequest('/api/prescriptions/patient/' + 'me');
				setPrescriptions(res.prescriptions || []);
			} else if (activeTab === 'notifications') {
				const res = await apiRequest('/api/notifications');
				setNotifications(res.notifications || []);
			} else if (activeTab === 'appointments') {
				const res = await apiRequest('/api/appointments/patient/me');
				setAppointments(res.appointments || []);
			} else if (activeTab === 'test-bookings') {
				const res = await apiRequest('/api/test-bookings/patient/me');
				setTestBookings(res.bookings || []);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function loadAllProfiles() {
		try {
			const res = await apiRequest('/api/profiles/me');
			setAllProfiles(res.profiles || { patients: [], doctors: [], teachers: [] });
		} catch (err) {
			console.error('Failed to load profiles:', err);
		}
	}

	async function saveProfile() {
		try {
			// Validate required fields
			if (!profileForm.name || !profileForm.phone || !profileForm.age || !profileForm.gender || !profileForm.cnic) {
				alert('Please fill in all required fields (Name, Phone, Age, Gender, CNIC)');
				return;
			}
			
			await apiRequest('/api/patients/me', {
				method: 'PUT',
				body: JSON.stringify(profileForm)
			});
			setEditing(false);
			loadData();
			alert('Profile updated successfully!');
		} catch (err) {
			console.error('Error saving profile:', err);
			alert(err.message || 'Failed to update profile');
		}
	}

	async function createNewProfile() {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				alert('Please login to create a profile');
				return;
			}

			let endpoint = '';
			let body = { userId: user.id };

			if (newProfileType === 'patient') {
				endpoint = '/api/patients/profile';
				body = {
					...body,
					age: parseInt(newProfileForm.age) || null,
					gender: newProfileForm.gender || 'male',
					cnic: newProfileForm.cnic || null,
					history: newProfileForm.history || null
				};
			} else if (newProfileType === 'doctor') {
				endpoint = '/api/doctors/profile';
				body = {
					...body,
					name: newProfileForm.name || '',
					specialization: newProfileForm.specialization || '',
					degrees: newProfileForm.degrees || '',
					consultation_fee: parseFloat(newProfileForm.consultation_fee) || 0,
					discount_rate: parseFloat(newProfileForm.discount_rate) || 50,
					timing: newProfileForm.timing || ''
				};
			} else if (newProfileType === 'teacher') {
				endpoint = '/api/teachers/profile';
				body = {
					...body,
					specialization: newProfileForm.specialization || null,
					image_url: newProfileForm.image_url || null
				};
			}

			await apiRequest(endpoint, {
				method: 'POST',
				body: JSON.stringify(body)
			});

			alert(`${newProfileType.charAt(0).toUpperCase() + newProfileType.slice(1)} profile created successfully!`);
			setShowCreateProfile(false);
			setNewProfileType(null);
			setNewProfileForm({});
			loadAllProfiles();
		} catch (err) {
			alert('Failed to create profile: ' + err.message);
		}
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-6">
			<h1 className="text-3xl font-bold text-brand mb-6">🩺 Patient Dashboard</h1>
			
			{/* Welcome Card */}
			<div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow mb-6">
				<h2 className="text-2xl font-semibold">Welcome, {profileForm.name || 'Patient'}!</h2>
				<p className="text-gray-600 mt-2">Access discounted healthcare services through our foundation</p>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow mb-6">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6" aria-label="Tabs">
						{['profile', 'profiles', 'doctors', 'appointments', 'test-bookings', 'reports', 'prescriptions', 'notifications'].map(tab => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
									activeTab === tab
										? 'border-brand text-brand'
										: 'border-transparent text-gray-500 hover:text-gray-700'
								}`}
							>
								{tab === 'test-bookings' ? 'Test Bookings' : tab === 'profiles' ? 'My Profiles' : tab}
							</button>
						))}
					</nav>
				</div>

				{/* Tab Content */}
				<div className="p-6">
					{activeTab === 'profile' && (
						<div>
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">My Profile</h2>
								{!editing ? (
									<button 
										onClick={() => setEditing(true)}
										className="bg-brand text-white px-4 py-2 rounded"
									>
										Edit Profile
									</button>
								) : (
									<div className="space-x-2">
										<button 
											onClick={saveProfile}
											className="bg-brand text-white px-4 py-2 rounded"
										>
											Save
										</button>
										<button 
											onClick={() => setEditing(false)}
											className="bg-gray-200 px-4 py-2 rounded"
										>
											Cancel
										</button>
									</div>
								)}
							</div>

							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium mb-1">Name *</label>
									<input 
										className="w-full border p-2 rounded"
										value={profileForm.name}
										onChange={e => setProfileForm({...profileForm, name: e.target.value})}
										disabled={!editing}
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Phone Number *</label>
									<input 
										type="tel"
										className="w-full border p-2 rounded"
										value={profileForm.phone}
										onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
										disabled={!editing}
										placeholder="0300-1234567"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Email</label>
									<input 
										className="w-full border p-2 rounded bg-gray-100"
										value={profile?.users?.email || ''}
										disabled
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Age *</label>
									<input 
										type="number"
										className="w-full border p-2 rounded"
										value={profileForm.age}
										onChange={e => setProfileForm({...profileForm, age: e.target.value})}
										disabled={!editing}
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Gender *</label>
									<select 
										className="w-full border p-2 rounded"
										value={profileForm.gender}
										onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
										disabled={!editing}
										required
									>
										<option value="male">Male</option>
										<option value="female">Female</option>
										<option value="other">Other</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">CNIC *</label>
									<input 
										className="w-full border p-2 rounded"
										value={profileForm.cnic}
										onChange={e => setProfileForm({...profileForm, cnic: e.target.value})}
										placeholder="12345-6789012-3"
										disabled={!editing}
										required
									/>
								</div>
								<div className="md:col-span-2">
									<label className="block text-sm font-medium mb-1">Medical History</label>
									<textarea 
										className="w-full border p-2 rounded"
										rows="4"
										value={profileForm.history}
										onChange={e => setProfileForm({...profileForm, history: e.target.value})}
										placeholder="Any allergies, chronic conditions, previous surgeries..."
										disabled={!editing}
									></textarea>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'doctors' && (
						<div>
							<h2 className="text-xl font-semibold mb-4">Available Doctors (50% Discount)</h2>
							{loading ? (
								<div className="text-center py-20">
									<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand border-t-transparent"></div>
									<p className="text-gray-500 mt-4 text-lg">Loading doctors...</p>
								</div>
							) : doctors.length === 0 ? (
								<div className="text-center py-20 bg-white rounded-2xl shadow-lg">
									<div className="text-6xl mb-4">👨‍⚕️</div>
									<h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors available</h3>
									<p className="text-gray-600">Check back later for available doctors</p>
								</div>
							) : (
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
									{doctors.map(doctor => (
										<div key={doctor.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all transform hover:-translate-y-1">
											<div className="p-6">
												{/* Avatar */}
												<div className="mx-auto mb-4 relative w-24 h-24">
													{doctor.image_url ? (
														<div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white">
															<img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" onError={(e) => {
																e.target.style.display = 'none';
																e.target.nextElementSibling.style.display = 'flex';
															}} />
															<div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center text-4xl shadow-lg" style={{ display: 'none' }}>
																👨‍⚕️
															</div>
														</div>
													) : (
														<div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center text-4xl shadow-lg">
															👨‍⚕️
														</div>
													)}
													<div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white">
														<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
															<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
														</svg>
													</div>
												</div>

												{/* Content */}
												<div className="text-center">
													<div className="flex items-center justify-center gap-2 mb-2">
														<h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
														<span className="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
															✓ VERIFIED
														</span>
													</div>
													<p className="text-brand font-semibold mt-1">{doctor.specialization}</p>
													{doctor.degrees && (
														<p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
															<span>🎓</span>
															<span>{doctor.degrees}</span>
														</p>
													)}
													{doctor.timing && (
														<p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
															<span>⏰</span>
															<span>{doctor.timing}</span>
														</p>
													)}
													
													{/* Stats */}
													<div className="grid grid-cols-2 gap-3 mt-4">
														<div className="bg-blue-50 rounded-xl p-3 text-center">
															<div className="text-2xl font-bold text-blue-600">
																{doctor.discount_rate || 50}%
															</div>
															<div className="text-xs text-gray-600">Discount</div>
														</div>
														<div className="bg-purple-50 rounded-xl p-3 text-center">
															<div className="text-2xl font-bold text-purple-600">5⭐</div>
															<div className="text-xs text-gray-600">Rating</div>
														</div>
													</div>

													{/* Action Buttons */}
													<div className="mt-6 space-y-2">
														<button
															onClick={() => setSelectedDoctor(doctor)}
															className="block w-full bg-gradient-to-r from-brand to-green-600 text-white text-center py-3 rounded-xl font-semibold hover:shadow-lg transition"
														>
															Book Appointment
														</button>
														<button
															onClick={() => setViewDoctorProfile(doctor)}
															className="block w-full border-2 border-brand text-brand text-center py-2 rounded-xl font-semibold hover:bg-brand-light transition"
														>
															View Profile
														</button>
													</div>
												</div>
											</div>

											{/* Bottom Bar */}
											<div className="bg-gradient-to-r from-brand-light to-blue-100 px-6 py-3 flex items-center justify-between text-sm">
												<span className="text-gray-700 font-medium">Available Today</span>
												<span className="flex items-center text-brand">
													<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
													Online
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{activeTab === 'appointments' && (
						<div>
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">My Appointments</h2>
								<button
									onClick={() => setActiveTab('doctors')}
									className="bg-brand text-white px-4 py-2 rounded text-sm hover:bg-brand-dark"
								>
									+ Book New Appointment
								</button>
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
									<p className="text-blue-700 text-sm mb-4">Book appointments with discounted fees through the foundation</p>
									<button
										onClick={() => setActiveTab('doctors')}
										className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark font-semibold"
									>
										Browse Doctors
									</button>
								</div>
							) : (
								<div className="space-y-4">
									{appointments.map(apt => (
										<div key={apt.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-3">
														<div className="text-4xl">
															{apt.doctors?.specialization?.includes('Cardiologist') ? '❤️' :
															 apt.doctors?.specialization?.includes('Dermatologist') ? '👋' :
															 apt.doctors?.specialization?.includes('Gynecologist') ? '🤰' :
															 apt.doctors?.specialization?.includes('Dentist') ? '🪥' :
															 apt.doctors?.specialization?.includes('ENT') ? '👂' :
															 apt.doctors?.specialization?.includes('Orthopedic') ? '🦴' :
															 apt.doctors?.specialization?.includes('Neurologist') ? '🧠' :
															 apt.doctors?.specialization?.includes('Child') ? '👶' :
															 apt.doctors?.specialization?.includes('Eye') ? '👓' :
															 '👨‍⚕️'}
														</div>
														<div>
															<h3 className="font-bold text-lg text-gray-900">{apt.doctors?.name || 'Doctor'}</h3>
															<p className="text-gray-600 text-sm">{apt.doctors?.specialization || 'Specialist'}</p>
															{apt.doctors?.degrees && (
																<p className="text-xs text-gray-500 mt-1">{apt.doctors.degrees}</p>
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
														{apt.status === 'confirmed' && apt.video_call_link && (
															<div className="mt-4">
																<button
																	onClick={() => window.location.href = `/video-call/${apt.id}`}
																	className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
																>
																	<span>🎥</span>
																	<span>Join Video Call</span>
																</button>
															</div>
														)}
													</div>
												</div>
												<div className="text-right ml-6">
													{apt.final_fee && (
														<div className="bg-brand/10 rounded-lg p-3">
															<p className="text-xs text-gray-600 mb-1">Total Fee</p>
															<p className="text-brand font-bold text-xl">PKR {parseFloat(apt.final_fee).toFixed(2)}</p>
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

					{activeTab === 'reports' && (
						<div>
							<h2 className="text-xl font-semibold mb-4">Lab Test Reports</h2>
							{loading ? (
								<p>Loading...</p>
							) : reports.length === 0 ? (
								<p className="text-gray-500">No lab reports yet.</p>
							) : (
								<div className="space-y-3">
									{reports.map(report => (
										<div key={report.id} className="border rounded p-4 flex justify-between items-center">
											<div>
												<p className="font-semibold">Lab Report</p>
												<p className="text-sm text-gray-500">
													Date: {new Date(report.report_date).toLocaleDateString()}
												</p>
												{report.remarks && (
													<p className="text-sm text-gray-600 mt-1">{report.remarks}</p>
												)}
											</div>
											<a 
												href={`${import.meta.env.VITE_API_URL}/api/lab/reports/${report.id}/download`}
												target="_blank"
												rel="noreferrer"
												className="bg-brand text-white px-4 py-2 rounded text-sm"
											>
												Download
											</a>
										</div>
									))}
								</div>
							)}
							<div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
								<p className="text-sm text-yellow-900">
									<strong>💰 Discount:</strong> Get 60% off on all lab tests as a foundation member!
								</p>
							</div>
						</div>
					)}

					{activeTab === 'test-bookings' && (
						<div>
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">My Test Bookings</h2>
								<Link
									to="/lab-tests"
									className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark text-sm"
								>
									+ Book New Test
								</Link>
							</div>
							{loading ? (
								<div className="text-center py-8">
									<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent mb-4"></div>
									<p className="text-gray-600">Loading test bookings...</p>
								</div>
							) : testBookings.length === 0 ? (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
									<div className="text-6xl mb-4">🧪</div>
									<p className="text-blue-900 font-semibold text-lg mb-2">No test bookings yet</p>
									<p className="text-blue-700 text-sm mb-4">Book lab tests with 50% discount through the foundation</p>
									<Link
										to="/lab-tests"
										className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark font-semibold inline-block"
									>
										Book a Test
									</Link>
								</div>
							) : (
								<div className="space-y-4">
									{testBookings.map(booking => (
										<div key={booking.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-3">
														<div className="text-4xl">
															{booking.test_name?.includes('Blood') ? '🩸' :
															 booking.test_name?.includes('X-Ray') ? '🦴' :
															 booking.test_name?.includes('Ultrasound') ? '📡' :
															 booking.test_name?.includes('ECG') ? '💓' :
															 booking.test_name?.includes('CT') ? '🔬' :
															 '🧪'}
														</div>
														<div>
															<h3 className="font-bold text-lg text-gray-900">{booking.test_name}</h3>
															<p className="text-gray-600 text-sm">{booking.labs?.name}</p>
															{booking.labs?.location && (
																<p className="text-xs text-gray-500 mt-1">📍 {booking.labs.location}</p>
															)}
														</div>
													</div>
													<div className="mt-4 space-y-2">
														<div className="flex items-center gap-2">
															<span className="text-gray-500">🔢</span>
															<p className="text-sm">
																<span className="font-medium text-gray-700">Tracking Number:</span>{' '}
																<span className="text-brand font-bold text-lg">{booking.tracking_number}</span>
															</p>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-gray-500">📅</span>
															<p className="text-sm">
																<span className="font-medium text-gray-700">Booked:</span>{' '}
																<span className="text-gray-900">
																	{new Date(booking.booked_at || booking.created_at).toLocaleDateString('en-US', { 
																		year: 'numeric', 
																		month: 'long', 
																		day: 'numeric' 
																	})}
																</span>
															</p>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-gray-500">📊</span>
															<p className="text-sm">
																<span className="font-medium text-gray-700">Status:</span>{' '}
																<span className={`font-semibold ${
																	booking.status === 'completed' ? 'text-green-600' :
																	booking.status === 'in_progress' ? 'text-blue-600' :
																	booking.status === 'confirmed' ? 'text-purple-600' :
																	'text-yellow-600'
																}`}>
																	{booking.status === 'pending' ? '⏳ Pending' :
																	 booking.status === 'confirmed' ? '✅ Confirmed' :
																	 booking.status === 'in_progress' ? '🔬 In Progress' :
																	 booking.status === 'completed' ? '✓ Completed' :
																	 booking.status}
																</span>
															</p>
														</div>
														{booking.test_description && (
															<div className="mt-2">
																<p className="text-sm text-gray-600">{booking.test_description}</p>
															</div>
														)}
														{booking.remarks && (
															<div className="mt-2">
																<p className="text-sm text-gray-500 italic">Note: {booking.remarks}</p>
															</div>
														)}
													</div>
													{booking.test_result_url && (
														<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
															<p className="text-sm font-semibold text-green-900 mb-2">✓ Test Results Ready!</p>
															<a
																href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/lab/reports/download?path=${encodeURIComponent(booking.test_result_url)}`}
																target="_blank"
																rel="noreferrer"
																className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 inline-block"
															>
																📥 Download Results
															</a>
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

					{activeTab === 'prescriptions' && (
						<div>
							<h2 className="text-xl font-semibold mb-4">My Prescriptions</h2>
							{loading ? (
								<p>Loading...</p>
							) : prescriptions.length === 0 ? (
								<p className="text-gray-500">No prescriptions yet.</p>
							) : (
								<div className="space-y-3">
									{prescriptions.map(rx => (
										<div key={rx.id} className="border rounded p-4">
											<p className="font-semibold">Prescription</p>
											<p className="text-sm text-gray-500">
												Date: {new Date(rx.created_at).toLocaleDateString()}
											</p>
											{rx.file_url && (
												<button className="mt-2 bg-brand text-white px-4 py-2 rounded text-sm">
													View Prescription
												</button>
											)}
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
								<p className="text-gray-500">No notifications.</p>
							) : (
								<div className="space-y-2">
									{notifications.map(notif => (
										<div 
											key={notif.id} 
											className={`border rounded p-3 ${!notif.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
										>
											<p className="text-sm">{notif.message}</p>
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

			{/* Discount Information */}
			<div className="grid md:grid-cols-3 gap-4">
				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold text-brand mb-2">💊 Pharmacy Discount</h3>
					<p className="text-2xl font-bold">50% OFF</p>
					<p className="text-sm text-gray-600">On all medicines</p>
				</div>
				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold text-brand mb-2">🧪 Lab Tests</h3>
					<p className="text-2xl font-bold">60% OFF</p>
					<p className="text-sm text-gray-600">X-rays, MRI, CT scans</p>
				</div>
				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold text-brand mb-2">👨‍⚕️ Consultations</h3>
					<p className="text-2xl font-bold">50% OFF</p>
					<p className="text-sm text-gray-600">Doctor fees</p>
				</div>
			</div>

			{/* Booking Modal */}
			{selectedDoctor && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoctor(null)}>
					<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
						<div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
							<h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
							<button onClick={() => setSelectedDoctor(null)} className="text-gray-500 hover:text-gray-900 text-2xl">✕</button>
						</div>
						
						<div className="p-6">
							<div className="text-center mb-6">
								<h3 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h3>
								<p className="text-gray-600">{selectedDoctor.specialization}</p>
								{selectedDoctor.degrees && (
									<p className="text-sm text-gray-500 mt-1">{selectedDoctor.degrees}</p>
								)}
							</div>

							<form onSubmit={async (e) => {
								e.preventDefault();
								setBookingLoading(true);
								try {
									// Try booking first
									await apiRequest('/api/appointments', {
										method: 'POST',
										body: JSON.stringify({
											doctor_id: selectedDoctor.id,
											appointment_date: appointmentForm.appointment_date,
											appointment_time: appointmentForm.appointment_time,
											reason: appointmentForm.reason || null
										})
									});
									
									// Prepare appointment sheet data
									const sheetData = {
										patientDetails: {
											name: profile?.name || 'N/A',
											age: profile?.age || '',
											gender: profile?.gender || '',
											phone: profile?.phone || '',
											id: profile?.user_id || ''
										},
										doctorDetails: {
											name: selectedDoctor.name || 'N/A',
											specialization: selectedDoctor.specialization || 'N/A'
										},
										appointmentDetails: {
											date: appointmentForm.appointment_date,
											time: appointmentForm.appointment_time
										}
									};
									
									setAppointmentSheetData(sheetData);
									setShowAppointmentSheet(true);
									
									setSelectedDoctor(null);
									setAppointmentForm({ appointment_date: '', appointment_time: '', reason: '' });
									// Clear cache and reload data, then switch to appointments tab
									clearCache('/api/appointments/patient/me');
									// Switch to appointments tab first
									setActiveTab('appointments');
									// Then reload data (which will load appointments for the active tab)
									setTimeout(() => {
										loadData();
									}, 100);
								} catch (err) {
									// If profile missing, show error and suggest completing profile
									if (err.message?.includes('Patient profile not found')) {
										alert('Please complete your patient profile first. Go to Profile tab and fill in your details.');
										setSelectedDoctor(null);
									} else {
										alert(err.message || 'Failed to book appointment');
									}
								} finally {
									setBookingLoading(false);
								}
							}} className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-1">Appointment Date *</label>
									<input
										type="date"
										className="w-full border p-2 rounded"
										value={appointmentForm.appointment_date}
										onChange={e => setAppointmentForm({...appointmentForm, appointment_date: e.target.value})}
										required
										min={new Date().toISOString().split('T')[0]}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">Appointment Time *</label>
									<input
										type="time"
										className="w-full border p-2 rounded"
										value={appointmentForm.appointment_time}
										onChange={e => setAppointmentForm({...appointmentForm, appointment_time: e.target.value})}
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">Reason for Visit</label>
									<textarea
										className="w-full border p-2 rounded"
										rows="3"
										value={appointmentForm.reason}
										onChange={e => setAppointmentForm({...appointmentForm, reason: e.target.value})}
										placeholder="Brief description of your symptoms or concern..."
									/>
								</div>

								{selectedDoctor.consultation_fee && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<div className="flex justify-between items-center">
											<span className="text-gray-700">Consultation Fee:</span>
											<span className="font-semibold">PKR {selectedDoctor.consultation_fee}</span>
										</div>
										{selectedDoctor.discount_rate > 0 && (
											<div className="flex justify-between items-center mt-2">
												<span className="text-gray-700">Discount ({selectedDoctor.discount_rate}%):</span>
												<span className="text-green-600 font-semibold">
													- PKR {((selectedDoctor.consultation_fee * selectedDoctor.discount_rate) / 100).toFixed(2)}
												</span>
											</div>
										)}
										<div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-300">
											<span className="font-bold text-gray-900">Final Fee:</span>
											<span className="font-bold text-brand text-lg">
												PKR {(
													selectedDoctor.consultation_fee - 
													((selectedDoctor.consultation_fee * (selectedDoctor.discount_rate || 0)) / 100)
												).toFixed(2)}
											</span>
										</div>
									</div>
								)}

								<div className="flex gap-3 mt-6">
									<button
										type="submit"
										disabled={bookingLoading}
										className="flex-1 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50"
									>
										{bookingLoading ? 'Booking...' : 'Confirm Booking'}
									</button>
									<button
										type="button"
										onClick={() => {
											setSelectedDoctor(null);
											setAppointmentForm({ appointment_date: '', appointment_time: '', reason: '' });
										}}
										className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* View Doctor Profile Modal */}
			{viewDoctorProfile && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setViewDoctorProfile(null)}>
					<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-2xl font-bold text-gray-900">Doctor Profile</h3>
							<button
								onClick={() => setViewDoctorProfile(null)}
								className="text-gray-500 hover:text-gray-900 text-2xl"
							>
								✕
							</button>
						</div>

						<div className="space-y-6">
							{/* Profile Image */}
							<div className="flex justify-center">
								<div className="relative">
									{viewDoctorProfile.image_url ? (
										<div className="w-48 h-48 rounded-full overflow-hidden shadow-xl border-4 border-white">
											<img 
												src={viewDoctorProfile.image_url} 
												alt={viewDoctorProfile.name} 
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.style.display = 'none';
													e.target.nextElementSibling.style.display = 'flex';
												}}
											/>
											<div className="w-48 h-48 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center text-7xl shadow-xl border-4 border-white" style={{ display: 'none' }}>
												👨‍⚕️
											</div>
										</div>
									) : (
										<div className="w-48 h-48 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center text-7xl shadow-xl border-4 border-white">
											👨‍⚕️
										</div>
									)}
									<div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white">
										<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
										</svg>
									</div>
								</div>
							</div>

							{/* Doctor Information */}
							<div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 space-y-4">
								<div className="text-center mb-4">
									<h2 className="text-3xl font-bold text-gray-900 mb-2">{viewDoctorProfile.name}</h2>
									<span className="bg-gradient-to-r from-green-400 to-green-600 text-white text-sm px-3 py-1 rounded-full font-semibold inline-block">
										✓ VERIFIED
									</span>
								</div>

								<div className="grid md:grid-cols-2 gap-4">
									<div className="bg-white rounded-lg p-4 shadow-sm">
										<label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Specialization</label>
										<p className="text-lg font-semibold text-brand">{viewDoctorProfile.specialization || 'N/A'}</p>
									</div>

									<div className="bg-white rounded-lg p-4 shadow-sm">
										<label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Degrees</label>
										<p className="text-lg font-semibold text-gray-900">{viewDoctorProfile.degrees || 'N/A'}</p>
									</div>

									<div className="bg-white rounded-lg p-4 shadow-sm">
										<label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Discount Rate</label>
										<p className="text-2xl font-bold text-green-600">{viewDoctorProfile.discount_rate || 50}%</p>
									</div>

									<div className="bg-white rounded-lg p-4 shadow-sm">
										<label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Doctor ID</label>
										<p className="text-sm font-mono text-gray-600 break-all">{viewDoctorProfile.id}</p>
									</div>
								</div>

								{viewDoctorProfile.consultation_fee && (
									<div className="bg-white rounded-lg p-4 shadow-sm">
										<label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Consultation Fee</label>
										<p className="text-xl font-bold text-gray-900">PKR {Number(viewDoctorProfile.consultation_fee).toLocaleString()}</p>
										{viewDoctorProfile.discount_rate > 0 && (
											<div className="mt-2 pt-2 border-t border-gray-200">
												<div className="flex justify-between items-center">
													<span className="text-sm text-gray-600">Discount ({viewDoctorProfile.discount_rate}%):</span>
													<span className="text-green-600 font-semibold">
														- PKR {((viewDoctorProfile.consultation_fee * viewDoctorProfile.discount_rate) / 100).toFixed(2)}
													</span>
												</div>
												<div className="flex justify-between items-center mt-2">
													<span className="font-bold text-gray-900">Final Fee:</span>
													<span className="font-bold text-brand text-lg">
														PKR {(
															viewDoctorProfile.consultation_fee - 
															((viewDoctorProfile.consultation_fee * (viewDoctorProfile.discount_rate || 0)) / 100)
														).toFixed(2)}
													</span>
												</div>
											</div>
										)}
									</div>
								)}

								{viewDoctorProfile.timing && (
									<div className="bg-white rounded-lg p-4 shadow-sm">
										<label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Consultation Timing</label>
										<p className="text-sm text-gray-700">{viewDoctorProfile.timing}</p>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3">
								<button
									onClick={() => {
										setViewDoctorProfile(null);
										setSelectedDoctor(viewDoctorProfile);
									}}
									className="flex-1 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark transition"
								>
									📅 Book Appointment
								</button>
								<button
									onClick={() => setViewDoctorProfile(null)}
									className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Create Profile Modal */}
			{showCreateProfile && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
					setShowCreateProfile(false);
					setNewProfileType(null);
					setNewProfileForm({});
				}}>
					<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
						<div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
							<h2 className="text-2xl font-bold text-gray-900">Create New Profile</h2>
							<button onClick={() => {
								setShowCreateProfile(false);
								setNewProfileType(null);
								setNewProfileForm({});
							}} className="text-gray-500 hover:text-gray-900 text-2xl">✕</button>
						</div>

						<div className="p-6">
							{!newProfileType ? (
								<div className="space-y-4">
									<p className="text-gray-600 mb-4">Select the type of profile you want to create:</p>
									<button
										onClick={() => setNewProfileType('patient')}
										className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-brand hover:bg-brand-light transition text-left"
									>
										<div className="text-2xl mb-2">🩺</div>
										<div className="font-semibold">Patient Profile</div>
										<div className="text-sm text-gray-600">For accessing healthcare services</div>
									</button>
									<button
										onClick={() => setNewProfileType('doctor')}
										className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-brand hover:bg-brand-light transition text-left"
									>
										<div className="text-2xl mb-2">👨‍⚕️</div>
										<div className="font-semibold">Doctor Profile</div>
										<div className="text-sm text-gray-600">For providing medical consultations</div>
									</button>
									<button
										onClick={() => setNewProfileType('teacher')}
										className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-brand hover:bg-brand-light transition text-left"
									>
										<div className="text-2xl mb-2">👨‍🏫</div>
										<div className="font-semibold">Teacher Profile</div>
										<div className="text-sm text-gray-600">For teaching courses</div>
									</button>
								</div>
							) : (
								<form onSubmit={(e) => { e.preventDefault(); createNewProfile(); }} className="space-y-4">
									{newProfileType === 'patient' && (
										<>
											<div>
												<label className="block text-sm font-medium mb-1">Age *</label>
												<input
													type="number"
													className="w-full border p-2 rounded"
													value={newProfileForm.age || ''}
													onChange={e => setNewProfileForm({...newProfileForm, age: e.target.value})}
													required
													min="1"
													max="120"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Gender *</label>
												<select
													className="w-full border p-2 rounded"
													value={newProfileForm.gender || 'male'}
													onChange={e => setNewProfileForm({...newProfileForm, gender: e.target.value})}
													required
												>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="other">Other</option>
												</select>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">CNIC</label>
												<input
													type="text"
													className="w-full border p-2 rounded"
													placeholder="12345-6789012-3"
													value={newProfileForm.cnic || ''}
													onChange={e => setNewProfileForm({...newProfileForm, cnic: e.target.value})}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Medical History</label>
												<textarea
													className="w-full border p-2 rounded"
													rows="3"
													value={newProfileForm.history || ''}
													onChange={e => setNewProfileForm({...newProfileForm, history: e.target.value})}
													placeholder="Any allergies, chronic conditions, previous surgeries..."
												/>
											</div>
										</>
									)}

									{newProfileType === 'doctor' && (
										<>
											<div>
												<label className="block text-sm font-medium mb-1">Name *</label>
												<input
													type="text"
													className="w-full border p-2 rounded"
													value={newProfileForm.name || ''}
													onChange={e => setNewProfileForm({...newProfileForm, name: e.target.value})}
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Specialization *</label>
												<input
													type="text"
													className="w-full border p-2 rounded"
													value={newProfileForm.specialization || ''}
													onChange={e => setNewProfileForm({...newProfileForm, specialization: e.target.value})}
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Degrees *</label>
												<input
													type="text"
													className="w-full border p-2 rounded"
													value={newProfileForm.degrees || ''}
													onChange={e => setNewProfileForm({...newProfileForm, degrees: e.target.value})}
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Consultation Fee (PKR) *</label>
												<input
													type="number"
													className="w-full border p-2 rounded"
													value={newProfileForm.consultation_fee || ''}
													onChange={e => setNewProfileForm({...newProfileForm, consultation_fee: e.target.value})}
													required
													min="0"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Discount Rate (%) *</label>
												<input
													type="number"
													className="w-full border p-2 rounded"
													value={newProfileForm.discount_rate || '50'}
													onChange={e => setNewProfileForm({...newProfileForm, discount_rate: e.target.value})}
													required
													min="0"
													max="100"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Consultation Timing *</label>
												<input
													type="text"
													className="w-full border p-2 rounded"
													value={newProfileForm.timing || ''}
													onChange={e => setNewProfileForm({...newProfileForm, timing: e.target.value})}
													placeholder="e.g., Mon-Fri 9AM-5PM"
													required
												/>
											</div>
										</>
									)}

									{newProfileType === 'teacher' && (
										<>
											<div>
												<label className="block text-sm font-medium mb-1">Specialization</label>
												<input
													type="text"
													className="w-full border p-2 rounded"
													value={newProfileForm.specialization || ''}
													onChange={e => setNewProfileForm({...newProfileForm, specialization: e.target.value})}
													placeholder="e.g., Mathematics, Science, etc."
												/>
											</div>
										</>
									)}

									<div className="flex gap-3 mt-6">
										<button
											type="submit"
											className="flex-1 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark"
										>
											Create Profile
										</button>
										<button
											type="button"
											onClick={() => {
												setNewProfileType(null);
												setNewProfileForm({});
											}}
											className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
										>
											Back
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				</div>
			)}
			
			{/* Appointment Sheet Modal */}
			<AppointmentSheetModal
				isOpen={showAppointmentSheet}
				onClose={() => setShowAppointmentSheet(false)}
				patientDetails={appointmentSheetData?.patientDetails}
				doctorDetails={appointmentSheetData?.doctorDetails}
				appointmentDetails={appointmentSheetData?.appointmentDetails}
			/>
		</div>
	);
}
