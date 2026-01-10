import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

export default function SurgeryPlanning() {
	const [selectedSurgery, setSelectedSurgery] = useState('');
	const [formData, setFormData] = useState({
		patientName: '',
		phone: '',
		city: ''
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	const surgeries = [
		{ name: 'Piles Surgery', icon: '🔴' },
		{ name: 'Hip Replacement Surgery', icon: '🦴' },
		{ name: 'Spinal Surgery', icon: '🫀' },
		{ name: 'Tonsillectomy', icon: '👄' },
		{ name: 'Appendectomy', icon: '🍑' },
		{ name: 'Cyst Removal', icon: '🔴' },
		{ name: 'TURP', icon: '👨' },
		{ name: 'Hydrocele Surgery', icon: '💧' },
		{ name: 'Lithotripsy', icon: '🫘' },
		{ name: 'Open Heart Surgery', icon: '❤️' },
		{ name: 'Tummy Tuck Surgery', icon: '🏋️' },
		{ name: 'Liver Transplant', icon: '🫀' },
		{ name: 'Gall Bladder Surgery', icon: '🟡' },
		{ name: 'Heart Transplant', icon: '❤️‍🩹' },
		{ name: 'Prostatectomy', icon: '⚕️' },
		{ name: 'Laser Lithotripsy', icon: '💎' },
		{ name: 'Penile Implants', icon: '🔵' },
		{ name: 'Anal Fissure Treatment', icon: '🔴' },
		{ name: 'Vasectomy', icon: '⚪' },
		{ name: 'Hernia Surgery', icon: '🟢' },
		{ name: 'Circumcision', icon: '🔵' },
		{ name: 'Fistula', icon: '🔴' },
		{ name: 'Cataract Eye Surgery', icon: '👁️' },
		{ name: 'Renal Transplant', icon: '🫘' }
	];

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		
		try {
			await apiRequest('/api/surgery-bookings', {
				method: 'POST',
				body: JSON.stringify({
					patient_name: formData.patientName,
					phone: formData.phone,
					city: formData.city,
					surgery_type: selectedSurgery
				})
			});
			
			setSuccess('Surgery planning request submitted successfully! We will contact you soon.');
			// Reset form
			setFormData({ patientName: '', phone: '', city: '' });
			setSelectedSurgery('');
		} catch (err) {
			setError(err.message || 'Failed to submit booking. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
		{/* Hero Section */}
		<section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 md:py-16">
			<div className="max-w-7xl mx-auto px-4">
				<div className="grid md:grid-cols-2 items-center gap-6 md:gap-12">
					<div className="text-center md:text-left">
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 md:mb-6 px-4 md:px-0">
							Discounted booking with
							<span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Leading</span>
							<span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Surgeons</span>
							<span className="block text-gray-900 text-xl sm:text-2xl md:text-3xl mt-2">Anytime, Anywhere</span>
						</h1>
					</div>
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
						<img 
							src="/surgery-section.webp" 
							alt="Surgeon" 
							className="relative w-full rounded-2xl shadow-2xl"
						/>
					</div>
				</div>
			</div>
		</section>

			{/* Main Content */}
			<section className="py-8 md:py-16">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid lg:grid-cols-3 gap-6 md:gap-8">
						{/* Surgery Selection Grid */}
						<div className="lg:col-span-2">
							<div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-8">
								<div className="mb-6 md:mb-8">
									<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">
										Specializing in surgical expertise for over 50 health issues
									</h2>
								</div>
								
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
									{surgeries.map((surgery, idx) => (
										<button
											key={idx}
											onClick={() => setSelectedSurgery(surgery.name)}
											className={`group relative bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-all border-2 ${
												selectedSurgery === surgery.name ? 'border-brand shadow-md bg-brand-lighter' : 'border-transparent hover:border-brand/50'
											}`}
										>
											<div className="text-center">
												<div className={`text-4xl mb-2 group-hover:scale-125 transition-transform ${
													selectedSurgery === surgery.name ? 'scale-110' : ''
												}`}>
													{surgery.icon}
												</div>
												<div className="text-xs font-medium text-gray-700 group-hover:text-brand transition-colors">
													{surgery.name}
												</div>
											</div>
											{selectedSurgery === surgery.name && (
												<div className="absolute top-1 right-1 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
													<span className="text-white text-xs">✓</span>
												</div>
											)}
										</button>
									))}
								</div>

								<div className="mt-8 text-center">
									<button className="bg-brand text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-dark transition-all hover:shadow-lg flex items-center gap-2 mx-auto">
										<span>🔍</span>
										<span>Find more surgeries</span>
									</button>
								</div>
							</div>
						</div>

						{/* Booking Form */}
						<div className="lg:col-span-1">
							<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-8 lg:sticky lg:top-24">
								<h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
									Plan your Surgery with DSWF!
								</h3>
								
								<form onSubmit={handleSubmit} className="space-y-4">
									{error && (
										<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
											{error}
										</div>
									)}
									{success && (
										<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
											{success}
										</div>
									)}
									
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Patient Name *
										</label>
										<input
											type="text"
											required
											value={formData.patientName}
											onChange={(e) => setFormData({...formData, patientName: e.target.value})}
											className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
											placeholder="Enter patient name"
											disabled={loading}
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Phone No *
										</label>
										<input
											type="tel"
											required
											value={formData.phone}
											onChange={(e) => setFormData({...formData, phone: e.target.value})}
											className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
											placeholder="Enter phone no"
											disabled={loading}
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											City *
										</label>
										<select
											required
											value={formData.city}
											onChange={(e) => setFormData({...formData, city: e.target.value})}
											className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
											disabled={loading}
										>
											<option value="">Select City</option>
											<option>Lahore</option>
											<option>Karachi</option>
											<option>Islamabad</option>
											<option>Multan</option>
											<option>Faisalabad</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Surgery *
										</label>
										<select
											required
											value={selectedSurgery}
											onChange={(e) => setSelectedSurgery(e.target.value)}
											className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
											disabled={loading}
										>
											<option value="">Select Surgery</option>
											{surgeries.map((surgery, idx) => (
												<option key={idx} value={surgery.name}>
													{surgery.icon} {surgery.name}
												</option>
											))}
										</select>
									</div>

									<button
										type="submit"
										disabled={loading}
										className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{loading ? 'Submitting...' : 'Book Surgery Consultation'}
									</button>
								</form>

								<div className="mt-6 p-4 bg-white/50 rounded-xl text-center">
									<p className="text-xs text-gray-600">
										📞 Call us: <span className="font-semibold text-brand">+92-XXX-XXXXXXX</span>
									</p>
								</div>
							</div>
						</div>
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

