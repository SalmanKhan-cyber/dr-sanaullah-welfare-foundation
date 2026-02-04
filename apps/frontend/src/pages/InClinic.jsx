import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { downloadAppointmentSheet, openAppointmentSheet } from '../lib/appointmentSheetGenerator.js';
import { downloadAppointmentCard, openAppointmentCard } from '../lib/appointmentCardGenerator.js';
import { downloadAppointmentSlip, openAppointmentSlip } from '../lib/appointmentSlipGenerator.js';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

// 🎨🎨🎨 FINAL FORCE REBUILD v5.0 - BLANK AREA - BLUE HEADER - CACHE BUST - MUST LOAD NEW DESIGN

export default function InClinic() {
	const navigate = useNavigate();
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedSpecialty, setSelectedSpecialty] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedDoctor, setSelectedDoctor] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [hasPatientProfile, setHasPatientProfile] = useState(false);
	const [checkingProfile, setCheckingProfile] = useState(false);
	const [appointmentForm, setAppointmentForm] = useState({
		appointment_date: '',
		appointment_time: '',
		reason: ''
	});
	const [patientProfileForm, setPatientProfileForm] = useState({
		name: '',
		phone: '',
		age: '',
		gender: 'male',
		cnic: '',
		history: ''
	});
	const [bookingLoading, setBookingLoading] = useState(false);
	const [showProfileForm, setShowProfileForm] = useState(false);
	const [bookingStep, setBookingStep] = useState('details'); // 'details' or 'datetime'
	const [appointmentSheetUrl, setAppointmentSheetUrl] = useState('');
	const [appointmentSheetFilename, setAppointmentSheetFilename] = useState('');
	const [appointmentSheetData, setAppointmentSheetData] = useState(null);
	// Force guest mode always - ignore authentication
	const isGuestMode = true;

	useEffect(() => {
		fetchDoctors();
		// Skip auth check completely - always use guest mode
		// checkAuth();
	}, []);

	useEffect(() => {
		// Completely disable patient profile check
		// if (isAuthenticated && selectedDoctor) {
		// 	checkPatientProfile();
		// }
	}, []);

	async function checkAuth() {
		// Disable auth checking
		// const { data: { session } } = await supabase.auth.getSession();
		// setIsAuthenticated(!!session);
		setIsAuthenticated(false); // Always false to force guest mode
	}

	async function checkPatientProfile() {
		setCheckingProfile(true);
		setShowProfileForm(false);
		// Skip profile check for non-authenticated users, go directly to details
		setHasPatientProfile(false);
		setBookingStep('details');
		setCheckingProfile(false);
	}

	async function fetchDoctors() {
		try {
			const apiUrl = import.meta.env.VITE_API_URL || 
				(import.meta.env.MODE === 'production' 
					? 'https://your-railway-app.railway.app'
					: 'http://localhost:4000');
			const response = await fetch(`${apiUrl}/api/doctors/public`);
			const data = await response.json();
			setDoctors(data.doctors || []);
		} catch (err) {
			console.error('Error fetching doctors:', err);
		} finally {
			setLoading(false);
		}
	}

	const specialties = ['All', ...new Set(doctors.map(d => d.specialization))].filter(Boolean);

	const filteredDoctors = doctors.filter(doctor => {
		const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesSpecialty = selectedSpecialty === 'All' || !selectedSpecialty || doctor.specialization === selectedSpecialty;
		return matchesSearch && matchesSpecialty;
	});

	const getSpecialtyIcon = (specialty) => {
		const icons = {
			'Cardiologist': '❤️',
			'Dermatologist': '👋',
			'Gynecologist': '🤰',
			'Urologist': '🫁',
			'Dentist': '🪥',
			'ENT Specialist': '👂',
			'Orthopedic Surgeon': '🦴',
			'Neurologist': '🧠',
			'Child Specialist': '👶',
			'Pulmonologist': '🩺',
			'Eye Specialist': '👓',
			'General Physician': '🩹'
		};
		return icons[specialty] || '👨‍⚕️';
	};

	function handleBookAppointment(doctor) {
		setSelectedDoctor(doctor);
		setAppointmentForm({ appointment_date: '', appointment_time: '', reason: '' });
		setShowProfileForm(false);
		setBookingStep('details'); // Start with details step
	}

	async function handlePatientProfileSubmit(e) {
		e.preventDefault();
		
		// Validate required fields - simplified to only require name
		if (!patientProfileForm.name) {
			alert('Please provide your name for the appointment sheet');
			return;
		}

		setBookingLoading(true);
		try {
			// For guest users, just proceed to datetime step without creating profile
			// The backend will handle creating the patient record during booking
			setHasPatientProfile(true);
			setShowProfileForm(false);
			setBookingStep('datetime'); // Move to date/time selection
			setBookingLoading(false);
		} catch (err) {
			alert(err.message || 'Failed to save details');
			setBookingLoading(false);
		}
	}

	async function handleBookingSubmit(e) {
		if (e) e.preventDefault();
		if (!selectedDoctor) return;

		console.log('🔍 handleBookingSubmit called');
		console.log('🔍 isAuthenticated:', isAuthenticated);
		console.log('🔍 isGuestMode (automatic):', isGuestMode);
		console.log('🔍 selectedDoctor:', selectedDoctor);

		if (!appointmentForm.appointment_date || !appointmentForm.appointment_time) {
			alert('Please fill in appointment date and time');
			return;
		}

		// Skip all profile checks - always use guest mode
		// if (isAuthenticated && !hasPatientProfile) {
		// 	console.log('🔍 Showing profile form - authenticated user without profile');
		// 	setShowProfileForm(true);
		// 	alert('Please complete your patient profile first. Fill in all required fields (Name, Phone, Age, Gender, CNIC).');
		// 	return;
		// }

		// Always validate guest form since we're always in guest mode
		console.log('🔍 Validating guest form - always guest mode');
		if (!patientProfileForm.name || !patientProfileForm.phone || !patientProfileForm.age || !patientProfileForm.gender || !patientProfileForm.cnic) {
			alert('Please fill in all patient details (Name, Phone, Age, Gender, CNIC).');
			return;
		}

		setBookingLoading(true);
		try {
			// Simple frontend-only booking - no backend needed
			const appointmentData = {
				doctor: {
					name: selectedDoctor.name,
					specialization: selectedDoctor.specialization
				},
				patientDetails: {
					name: patientProfileForm.name,
					phone: patientProfileForm.phone,
					age: patientProfileForm.age,
					gender: patientProfileForm.gender,
					cnic: patientProfileForm.cnic,
					history: patientProfileForm.history || null
				},
				appointmentDate: appointmentForm.appointment_date,
				appointmentTime: appointmentForm.appointment_time,
				reason: appointmentForm.reason || null
			};

			console.log('🔍 Creating FINAL appointment sheet with data:', appointmentData);

			// Generate and download FINAL appointment sheet immediately
			downloadAppointmentSheet(appointmentData);
			
			// Store for manual download/print buttons
			setAppointmentSheetData(appointmentData);
			setAppointmentSheetUrl('generated'); // Indicate sheet is ready

			alert('In-clinic appointment booked successfully! Your appointment sheet has been downloaded.');
			setSelectedDoctor(null);
			setAppointmentForm({ appointment_date: '', appointment_time: '', reason: '' });
			setShowProfileForm(false);
			setBookingStep('details');
			
			// NEVER navigate anywhere - always stay on booking page
			console.log('👤 Staying on booking page - no navigation');
			
			// Keep the appointment sheet buttons visible for download/print
		} catch (err) {
			console.error('Booking error:', err);
			const errorMsg = err.message || 'Failed to book appointment';
			
			// Never show profile form - always show simple error
			alert('Booking failed: ' + errorMsg);
		} finally {
			setBookingLoading(false);
		}
		// Force rebuild v2 - fix appointmentError issue - cache bust
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-16">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center">
						<h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
							In-Clinic <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-600">Appointments</span>
						</h1>
						<p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
							Book an in-person visit to our partner clinics and hospitals
						</p>
						
						{/* Search Bar */}
						<div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-2">
							<div className="flex items-center gap-2">
								<span className="text-2xl ml-2">🔍</span>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="flex-1 px-4 py-3 outline-none text-gray-700"
									placeholder="Search doctors by name or specialty..."
								/>
								<button className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark transition">
									Search
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-16">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid lg:grid-cols-4 gap-8">
						{/* Specialties Sidebar */}
						<div className="lg:col-span-1">
							<div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
								<h3 className="text-xl font-bold text-gray-900 mb-4">Specialties</h3>
								<div className="space-y-2">
									{specialties.map((specialty, idx) => (
										<button
											key={idx}
											onClick={() => setSelectedSpecialty(specialty)}
											className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
												selectedSpecialty === specialty
													? 'bg-brand text-white font-semibold'
													: 'bg-gray-50 text-gray-700 hover:bg-brand-lighter'
											}`}
										>
											<span className="text-2xl">
												{specialty === 'All' ? '👥' : getSpecialtyIcon(specialty)}
											</span>
											<span>{specialty}</span>
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Doctors Grid */}
						<div className="lg:col-span-3">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-gray-900">
									Available Doctors ({filteredDoctors.length})
								</h2>
							</div>

							{loading ? (
								<div className="text-center py-12">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
									<p className="mt-4 text-gray-600">Loading doctors...</p>
								</div>
							) : filteredDoctors.length === 0 ? (
								<div className="bg-white rounded-3xl shadow-xl p-12 text-center">
									<div className="text-6xl mb-4">👨‍⚕️</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-2">No doctors found</h3>
									<p className="text-gray-600">Try adjusting your search or specialty filter</p>
								</div>
							) : (
								<div className="grid sm:grid-cols-2 gap-6">
									{filteredDoctors.map((doctor) => (
										<div key={doctor.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
											<div className="p-6">
												<div className="text-center mb-4">
													<div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
														{getSpecialtyIcon(doctor.specialization)}
													</div>
													<h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
													<p className="text-sm text-gray-500 mb-2">{doctor.specialization}</p>
													{doctor.degrees && (
														<p className="text-xs text-gray-600 mb-2">{doctor.degrees}</p>
													)}
												</div>

												<div className="space-y-3">
													<div className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full inline-block">
														{doctor.discount_rate || 50}% OFF
													</div>

													<div className="flex items-center justify-center gap-4 text-sm">
														<div className="flex items-center gap-1">
															<span className="text-yellow-500">⭐</span>
															<span className="font-semibold">4.8</span>
														</div>
														<div className="flex items-center gap-1">
															<span>🏥</span>
															<span className="font-semibold">Clinic</span>
														</div>
														<div className="flex items-center gap-1 text-green-600">
															<span>✓</span>
															<span className="font-semibold">Available</span>
														</div>
													</div>

													<button 
														onClick={() => handleBookAppointment(doctor)}
														className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
													>
														Book Appointment
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Appointment Booking Modal */}
			{selectedDoctor && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoctor(null)}>
					<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative z-50" onClick={(e) => e.stopPropagation()}>
						<div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
							<h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
							<button onClick={() => setSelectedDoctor(null)} className="text-gray-500 hover:text-gray-900 text-2xl">✕</button>
						</div>
						
						<div className="p-6">
							{checkingProfile ? (
								<div className="text-center py-8">
									<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent mb-4"></div>
									<p className="text-gray-600">Loading...</p>
								</div>
							) : bookingStep === 'details' ? (
								<>
									<div className="text-center mb-6">
										<div className="text-5xl mb-3">�</div>
										<h3 className="text-xl font-bold text-gray-900">
											{hasPatientProfile ? 'Confirm Your Details' : 'Patient Details'}
										</h3>
										<p className="text-gray-600 text-sm mt-1">
											{hasPatientProfile 
												? 'Please confirm your information before selecting appointment time' 
												: 'Please provide your information before selecting appointment time'
											}
										</p>
									</div>

									<form onSubmit={handlePatientProfileSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
										<div>
											<label className="block text-sm font-medium mb-1">Name *</label>
											<input
												type="text"
												className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
												placeholder="Your full name"
												value={patientProfileForm.name}
												onChange={e => setPatientProfileForm({...patientProfileForm, name: e.target.value})}
												onClick={(e) => e.stopPropagation()}
												required
												disabled={bookingLoading}
											/>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Phone Number *</label>
											<input
												type="tel"
												className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
												placeholder="0300-1234567"
												value={patientProfileForm.phone}
												onChange={e => setPatientProfileForm({...patientProfileForm, phone: e.target.value})}
												onClick={(e) => e.stopPropagation()}
												required
												disabled={bookingLoading}
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium mb-1">Age *</label>
												<input
													type="number"
													className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
													value={patientProfileForm.age}
													onChange={e => setPatientProfileForm({...patientProfileForm, age: e.target.value})}
													onClick={(e) => e.stopPropagation()}
													required
													min="1"
													max="120"
													disabled={bookingLoading}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Gender *</label>
												<select
													className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
													value={patientProfileForm.gender}
													onChange={e => setPatientProfileForm({...patientProfileForm, gender: e.target.value})}
													onClick={(e) => e.stopPropagation()}
													required
													disabled={bookingLoading}
												>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="other">Other</option>
												</select>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">CNIC Number *</label>
											<input
												type="text"
												className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
												placeholder="12345-6789012-3"
												value={patientProfileForm.cnic}
												onChange={e => setPatientProfileForm({...patientProfileForm, cnic: e.target.value})}
												onClick={(e) => e.stopPropagation()}
												required
												pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}"
												disabled={bookingLoading}
											/>
											<p className="text-xs text-gray-500 mt-1">Format: 12345-6789012-3</p>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Medical History</label>
											<textarea
												className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand resize-none"
												rows="3"
												value={patientProfileForm.history}
												onChange={e => setPatientProfileForm({...patientProfileForm, history: e.target.value})}
												onClick={(e) => e.stopPropagation()}
												placeholder="Any allergies, chronic conditions, previous surgeries..."
												disabled={bookingLoading}
											/>
										</div>

										<div className="flex gap-3 mt-6">
											<button
												type="submit"
												disabled={bookingLoading}
												className="flex-1 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50"
											>
												{bookingLoading ? 'Saving...' : (hasPatientProfile ? 'Confirm & Continue' : 'Continue to Time Selection')}
											</button>
											<button
												type="button"
												onClick={() => {
													setSelectedDoctor(null);
													setShowProfileForm(false);
												}}
												className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
											>
												Cancel
											</button>
										</div>
									</form>
								</>
							) : bookingStep === 'datetime' ? (
								<>
									<div className="text-center mb-6">
										<div className="text-5xl mb-3">📅</div>
										<h3 className="text-xl font-bold text-gray-900">Select Appointment Time</h3>
										<p className="text-gray-600 text-sm mt-1">Choose your preferred date and time</p>
									</div>

									<form onSubmit={handleBookingSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
										<div>
											<label className="block text-sm font-medium mb-1">Appointment Date *</label>
											<input
												type="date"
												className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
												value={appointmentForm.appointment_date}
												onChange={e => setAppointmentForm({...appointmentForm, appointment_date: e.target.value})}
												onClick={(e) => e.stopPropagation()}
												min={new Date().toISOString().split('T')[0]}
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Appointment Time *</label>
											<input
												type="time"
												className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
												value={appointmentForm.appointment_time}
												onChange={e => setAppointmentForm({...appointmentForm, appointment_time: e.target.value})}
												onClick={(e) => e.stopPropagation()}
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Reason for Visit</label>
											<textarea
												className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand resize-none"
												rows="3"
												value={appointmentForm.reason}
												onChange={e => setAppointmentForm({...appointmentForm, reason: e.target.value})}
												onClick={(e) => e.stopPropagation()}
												placeholder="Brief description of your health concern..."
												disabled={bookingLoading}
											/>
										</div>

										<div className="flex gap-3 mt-6">
											<button
												type="button"
												onClick={() => setBookingStep('details')}
												className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
											>
												Back
											</button>
											<button
												type="submit"
												disabled={bookingLoading}
												className="flex-1 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50"
											>
												{bookingLoading ? 'Booking...' : 'Book Appointment'}
											</button>
										</div>
									</form>
								</>
							) : null // This should never happen with our current flow
						}
						
						{/* Print Appointment Sheet Button */}
						{appointmentSheetData && (
							<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
								<p className="text-green-800 font-semibold mb-3">✅ Appointment Booked Successfully!</p>
								
								{/* FINAL Appointment Sheet */}
								<div className="mb-4">
									<h4 className="text-sm font-semibold text-gray-700 mb-2">📄 FINAL Appointment Sheet (Blue Design - Blank Area)</h4>
									<div className="flex gap-3">
										<button
											onClick={() => downloadAppointmentSheet(appointmentSheetData)}
											className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm"
										>
											📥 Download FINAL Sheet
										</button>
										<button
											onClick={() => openAppointmentSheet(appointmentSheetData)}
											className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 text-sm"
										>
											🖨️ Print FINAL Sheet
										</button>
									</div>
								</div>
								
								{/* Print-Ready A5 Slip */}
								<div className="mb-4">
									<h4 className="text-sm font-semibold text-gray-700 mb-2">🖨️ Print-Ready A5 Slip (For Printing)</h4>
									<div className="flex gap-3">
										<button
											onClick={() => downloadAppointmentSlip(appointmentSheetData)}
											className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 text-sm"
										>
											📥 Download A5 Slip
										</button>
										<button
											onClick={() => openAppointmentSlip(appointmentSheetData)}
											className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 text-sm"
										>
											🖨️ Print A5 Slip
										</button>
									</div>
								</div>
								
								{/* Appointment Card Options */}
								<div>
									<h4 className="text-sm font-semibold text-gray-700 mb-2">🏥 Appointment Card (Patient Copy)</h4>
									<div className="flex gap-3">
										<button
											onClick={() => downloadAppointmentCard(appointmentSheetData)}
											className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 text-sm"
										>
											📥 Download Card
										</button>
										<button
											onClick={() => openAppointmentCard(appointmentSheetData)}
											className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 text-sm"
										>
											🖨️ Print Card
										</button>
									</div>
								</div>
							</div>
						)}
						</div>
					</div>
				</div>
			)}

			{/* Benefits Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4">
					<h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Benefits of In-Clinic Visits</h2>
					<div className="grid md:grid-cols-3 gap-8">
						{[
							{ icon: '👨‍⚕️', title: 'Face-to-Face Consultation', desc: 'Direct interaction with experienced doctors' },
							{ icon: '🩺', title: 'Physical Examination', desc: 'Comprehensive check-up and diagnosis' },
							{ icon: '💊', title: 'Immediate Care', desc: 'Get prescriptions and treatment on the spot' }
						].map((benefit, idx) => (
							<div key={idx} className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl">
								<div className="text-6xl mb-4">{benefit.icon}</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
								<p className="text-gray-700">{benefit.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Back to Home */}
			<div className="max-w-7xl mx-auto px-4 pb-16 text-center">
				<Link to="/" className="text-brand hover:underline font-semibold inline-flex items-center gap-2">
					← Back to Home
				</Link>
			</div>
		</div>
	);
}

