import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

export default function DoctorsList() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const specialty = searchParams.get('specialty') || '';
	const urlSearch = searchParams.get('search') || '';
	const location = searchParams.get('location') || '';
	const [loading, setLoading] = useState(true);
	const [doctors, setDoctors] = useState([]);
	const [search, setSearch] = useState(urlSearch);
	const [sort, setSort] = useState('name-asc');
	const [view, setView] = useState('grid'); // 'grid' or 'list'
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

	// Check authentication and patient profile
	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		if (isAuthenticated && selectedDoctor) {
			checkPatientProfile();
		}
	}, [isAuthenticated, selectedDoctor]);

	async function checkAuth() {
		const { data: { session } } = await supabase.auth.getSession();
		setIsAuthenticated(!!session);
	}

	async function checkPatientProfile() {
		setCheckingProfile(true);
		setShowProfileForm(false);
		// Skip profile check for non-authenticated users, go directly to details
		setHasPatientProfile(false);
		setBookingStep('details');
		setCheckingProfile(false);
	}

	// Initialize search from URL
	useEffect(() => {
		if (urlSearch) {
			setSearch(urlSearch);
		}
	}, [urlSearch]);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:4000' 
  : 'https://api.drsanaullahwelfarefoundation.com';
				const response = await fetch(`${API_BASE_URL}/api/doctors/public`);
				const data = await response.json();
				let doctors = data.doctors || [];
				if (specialty) {
					doctors = doctors.filter(d => d.specialization && d.specialization.toLowerCase().includes(specialty.toLowerCase()));
				}
				setDoctors(doctors);
			} finally {
				setLoading(false);
			}
		})();
	}, [specialty]);

	const filtered = useMemo(() => {
		let list = doctors;
		if (search.trim()) {
			const s = search.toLowerCase();
			// Enhanced search: search through name, specialization, degrees, and any hospital/clinic mentions
			list = list.filter(d => {
				const name = (d.name || '').toLowerCase();
				const specialization = (d.specialization || '').toLowerCase();
				const degrees = (d.degrees || '').toLowerCase();
				const timing = (d.timing || '').toLowerCase();
				
				// Search keywords for hospitals/clinics
				const hospitalKeywords = ['hospital', 'clinic', 'medical center', 'healthcare', 'center', 'institute'];
				const isHospitalSearch = hospitalKeywords.some(keyword => s.includes(keyword));
				
				// If searching for hospitals, also match against common hospital-related terms
				const matchesHospital = isHospitalSearch && (
					name.includes('hospital') || 
					name.includes('clinic') ||
					name.includes('medical') ||
					name.includes('center') ||
					timing.includes('hospital') ||
					timing.includes('clinic')
				);
				
				// General search: name, specialization, degrees
				const matchesGeneral = name.includes(s) || 
					specialization.includes(s) || 
					degrees.includes(s) ||
					timing.includes(s);
				
				return matchesGeneral || matchesHospital;
			});
		}
		if (sort === 'name-asc') list = [...list].sort((a,b)=> (a.name||'').localeCompare(b.name||''));
		if (sort === 'name-desc') list = [...list].sort((a,b)=> (b.name||'').localeCompare(a.name||''));
		if (sort === 'discount-desc') list = [...list].sort((a,b)=> (b.discount_rate||0) - (a.discount_rate||0));
		return list;
	}, [doctors, search, sort]);

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

		if (!appointmentForm.appointment_date || !appointmentForm.appointment_time) {
			alert('Please fill in appointment date and time');
			return;
		}

		// Always proceed with booking - patient details will be included below
		// Don't return early even if no patient profile

		setBookingLoading(true);
		try {
			const requestBody = {
				doctor_id: selectedDoctor.id,
				appointment_date: appointmentForm.appointment_date,
				appointment_time: appointmentForm.appointment_time,
				reason: appointmentForm.reason || null
			};

			// Always include patient details for appointment sheet generation
			const patientDetails = {
				name: patientProfileForm.name || 'Guest Patient',
				phone: patientProfileForm.phone || 'Not Provided',
				age: parseInt(patientProfileForm.age) || 0,
				gender: patientProfileForm.gender || 'other',
				cnic: patientProfileForm.cnic || 'Not Provided',
				history: patientProfileForm.history || null
			};
			
			const finalRequestBody = {
				...requestBody,
				patient_details: patientDetails
			};
			
			console.log('🔍 Frontend Debug - Sending patient_details:', patientDetails);
			console.log('🔍 Frontend Debug - Name value:', patientProfileForm.name);
			console.log('🔍 Frontend Debug - Complete request body:', finalRequestBody);

			const response = await apiRequest('/api/appointments/guest', {
				method: 'POST',
				body: JSON.stringify(finalRequestBody)
			});
			
			// Handle appointment sheet download if available
			if (response.appointment_sheet_url) {
				const link = document.createElement('a');
				link.href = response.appointment_sheet_url;
				link.download = response.appointment_sheet_filename || 'appointment-sheet.pdf';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}

			alert('Appointment booked successfully! Your appointment sheet has been downloaded.');
			setSelectedDoctor(null);
			setAppointmentForm({ appointment_date: '', appointment_time: '', reason: '' });
			setShowProfileForm(false);
			setBookingStep('details');
			// Optionally redirect to patient dashboard
			navigate('/dashboard/patient');
		} catch (err) {
			if (err.message?.includes('Patient profile not found')) {
				setHasPatientProfile(false);
				setShowProfileForm(true);
				setBookingLoading(false);
			} else {
				alert(err.message || 'Failed to book appointment');
				setBookingLoading(false);
			}
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<div className="max-w-7xl mx-auto px-4 py-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
							{specialty ? `${specialty}s` : 'All Doctors'}
						</h1>
						<p className="text-gray-600">
							{specialty ? `Find the best ${specialty.toLowerCase()}s near you` : 'Find and book the best doctors'}
						</p>
					</div>
					<Link to="/" className="mt-4 md:mt-0 text-brand hover:underline font-semibold flex items-center">
						← Back to Home
					</Link>
				</div>

				{/* Enhanced Filters */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
					<div className="grid md:grid-cols-3 gap-4">
						{/* Search */}
						<div className="relative">
							<input
								value={search}
								onChange={e=>setSearch(e.target.value)}
								className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-11 focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
								placeholder="Search doctors, hospitals, clinics, or specialization..."
							/>
							<span className="absolute left-3 top-3.5 text-gray-400 text-xl">🔍</span>
							{search && (
								<button
									onClick={() => setSearch('')}
									className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 text-xl"
								>
									×
								</button>
							)}
						</div>

						{/* Sort */}
						<select 
							value={sort} 
							onChange={e=>setSort(e.target.value)} 
							className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
						>
							<option value="name-asc">Sort: Name (A→Z)</option>
							<option value="name-desc">Sort: Name (Z→A)</option>
							<option value="discount-desc">Sort: Highest Discount</option>
						</select>

						{/* View Toggle & Total */}
						<div className="flex items-center gap-3">
							<div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
								<div className="text-2xl font-bold text-brand">{filtered.length}</div>
								<div className="text-xs text-gray-500">Doctors</div>
							</div>
							<div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
								<button
									onClick={() => setView('grid')}
									className={`px-4 py-2 ${view === 'grid' ? 'bg-brand text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
								>
									⊞
								</button>
								<button
									onClick={() => setView('list')}
									className={`px-4 py-2 ${view === 'list' ? 'bg-brand text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
								>
									☰
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Loading State */}
				{loading ? (
					<div className="text-center py-20">
						<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand border-t-transparent"></div>
						<p className="text-gray-500 mt-4 text-lg">Loading doctors...</p>
					</div>
				) : filtered.length === 0 ? (
					<div className="text-center py-20 bg-white rounded-2xl shadow-lg">
						<div className="text-6xl mb-4">👨‍⚕️</div>
						<h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
						<p className="text-gray-600">Try adjusting your search or filters</p>
					</div>
				) : (
					<div className={view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
						{filtered.map((d) => (
							<div key={d.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all transform hover:-translate-y-1">
								<div className={view === 'grid' ? 'p-6' : 'flex p-6'}>
									{/* Avatar */}
									<div className={`${view === 'grid' ? 'mx-auto mb-4' : 'mr-4 shrink-0'} relative`}>
										{d.image_url ? (
											<div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white">
												<img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
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
									<div className={view === 'grid' ? 'text-center' : 'flex-1'}>
										<div className={`flex items-center gap-2 ${view === 'grid' ? 'justify-center' : ''}`}>
											<h2 className="text-xl font-bold text-gray-800">{d.name}</h2>
											<span className="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
												✓ VERIFIED
											</span>
										</div>
										<p className="text-brand font-semibold mt-1">{d.specialization}</p>
										{d.degrees && (
											<p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
												<span>🎓</span>
												<span>{d.degrees}</span>
											</p>
										)}
										
										{/* Stats */}
										<div className={`grid grid-cols-2 gap-3 mt-4 ${view === 'grid' ? '' : 'max-w-xs'}`}>
											<div className="bg-blue-50 rounded-xl p-3 text-center">
												<div className="text-2xl font-bold text-blue-600">
													{d.discount_rate || 50}%
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
												onClick={() => handleBookAppointment(d)}
												className="block w-full bg-gradient-to-r from-brand to-green-600 text-white text-center py-3 rounded-xl font-semibold hover:shadow-lg transition"
											>
												Book Appointment
											</button>
											<Link 
												to="/login" 
												className="block w-full border-2 border-brand text-brand text-center py-2 rounded-xl font-semibold hover:bg-brand-light transition"
											>
												View Profile
											</Link>
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

			{/* Booking Modal */}
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
										<div className="text-5xl mb-3">👤</div>
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
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium mb-1">Name *</label>
												<input
													type="text"
													className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
													value={patientProfileForm.name}
													onChange={e => setPatientProfileForm({...patientProfileForm, name: e.target.value})}
													onClick={(e) => e.stopPropagation()}
													required
													disabled={bookingLoading}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Phone *</label>
												<input
													type="tel"
													className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
													value={patientProfileForm.phone}
													onChange={e => setPatientProfileForm({...patientProfileForm, phone: e.target.value})}
													onClick={(e) => e.stopPropagation()}
													required
													disabled={bookingLoading}
												/>
											</div>
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
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
