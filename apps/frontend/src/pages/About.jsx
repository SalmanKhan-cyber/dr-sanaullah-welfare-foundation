import { Link } from 'react-router-dom';

export default function About() {
	return (
		<div className="bg-white min-h-screen">
			{/* Hero Section with Image */}
			<section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-16">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div>
							<h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
								About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-600">Dr. Sanaullah</span> Welfare Foundation
							</h1>
							<p className="text-xl text-gray-700 leading-relaxed mb-6">
								Providing accessible healthcare, education, and welfare services with complete transparency and community impact
							</p>
							<div className="flex gap-4">
								<Link 
									to="/donation" 
									className="bg-brand text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-dark transition hover:shadow-lg"
								>
									Donate Now
								</Link>
								<Link 
									to="/contact" 
									className="border-2 border-brand text-brand px-8 py-3 rounded-lg font-semibold hover:bg-brand-lighter transition"
								>
									Contact Us
								</Link>
							</div>
						</div>
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
							<img 
								src="/about-image.png" 
								alt="Dr. Sanaullah Welfare Foundation" 
								className="relative w-full h-auto rounded-2xl shadow-2xl"
							/>
						</div>
					</div>
				</div>
			</section>

		{/* Mission Section */}
		<section className="py-20 bg-gradient-to-b from-white to-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				<div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100">
					{/* Decorative Elements */}
					<div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand via-blue-500 to-purple-600"></div>
					<div className="absolute top-20 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
					
					<div className="relative p-8 md:p-16">
						<div className="text-center mb-12">
							<div className="inline-block mb-4">
								<div className="bg-gradient-to-r from-brand to-blue-600 text-white px-8 py-3 rounded-full shadow-lg">
									<h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
								</div>
							</div>
							<div className="flex justify-center items-center gap-2 mt-4">
								<div className="w-16 h-1 bg-brand rounded-full"></div>
								<span className="text-2xl">⭐</span>
								<div className="w-16 h-1 bg-brand rounded-full"></div>
							</div>
						</div>
						
						<div className="grid md:grid-cols-2 gap-12 items-center">
							<div className="space-y-6">
								<div className="flex items-start gap-4 group">
									<div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
										<span className="text-3xl">🏥</span>
									</div>
									<div>
										<h3 className="text-xl font-bold text-gray-900 mb-2">Quality Healthcare</h3>
										<p className="text-gray-700 leading-relaxed">
											Dr. Sanaullah Welfare Foundation is dedicated to transforming lives by providing quality healthcare, affordable education, and essential welfare services to underserved communities across Pakistan.
										</p>
									</div>
								</div>
							</div>
							
							<div className="space-y-6">
								<div className="flex items-start gap-4 group">
									<div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
										<span className="text-3xl">❤️</span>
									</div>
									<div>
										<h3 className="text-xl font-bold text-gray-900 mb-2">Community Impact</h3>
										<p className="text-gray-700 leading-relaxed">
											We believe in the power of compassion, transparency, and community support to create lasting positive change. Every donation and contribution goes directly toward improving the lives of those who need it most.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

			{/* Certifications & Legal Documents Section */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-3">Certifications & Legal Compliance</h2>
						<p className="text-xl text-gray-600">We are fully registered and compliant with all regulatory requirements</p>
					</div>
					
					<div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
						{/* Certificate 1 from certificates1 folder */}
						<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-brand hover:shadow-xl transition-all group overflow-hidden">
							<div className="mb-4">
								<img 
									src="/certificates_page-0001.jpg" 
									alt="Certificate 1" 
									className="w-full h-auto rounded-lg shadow-md group-hover:scale-105 transition-transform cursor-pointer"
									onClick={() => window.open('/certificates_page-0001.jpg', '_blank')}
								/>
							</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Registration Certificate</h3>
							<p className="text-xs text-gray-600 text-center mb-4">Government registered welfare foundation</p>
							<button 
								onClick={() => window.open('/certificates_page-0001.jpg', '_blank')}
								className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
							>
								View Full
							</button>
						</div>

						{/* Certificate 2 from certificates1 folder */}
						<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-brand hover:shadow-xl transition-all group overflow-hidden">
							<div className="mb-4">
								<img 
									src="/certificates_page-0002.jpg" 
									alt="Certificate 2" 
									className="w-full h-auto rounded-lg shadow-md group-hover:scale-105 transition-transform cursor-pointer"
									onClick={() => window.open('/certificates_page-0002.jpg', '_blank')}
								/>
							</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Legal Compliance</h3>
							<p className="text-xs text-gray-600 text-center mb-4">Verified and compliant with regulations</p>
							<button 
								onClick={() => window.open('/certificates_page-0002.jpg', '_blank')}
								className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
							>
								View Full
							</button>
						</div>

						{/* Certificate 3 from certificates1 folder */}
						<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-brand hover:shadow-xl transition-all group overflow-hidden">
							<div className="mb-4">
								<img 
									src="/certificates_page-0003.jpg" 
									alt="Certificate 3" 
									className="w-full h-auto rounded-lg shadow-md transition-transform cursor-pointer"
									style={{ transform: 'rotate(180deg)' }}
									onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(180deg) scale(1.05)'}
									onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(180deg)'}
									onClick={() => window.open('/certificates_page-0003.jpg', '_blank')}
								/>
							</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Foundation Certificate</h3>
							<p className="text-xs text-gray-600 text-center mb-4">Official foundation documentation</p>
							<button 
								onClick={() => window.open('/certificates_page-0003.jpg', '_blank')}
								className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
							>
								View Full
							</button>
						</div>

						{/* Certificate 4 from certificates1 folder */}
						<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-brand hover:shadow-xl transition-all group overflow-hidden">
							<div className="mb-4">
								<img 
									src="/certificates_page-0004.jpg" 
									alt="Certificate 4" 
									className="w-full h-auto rounded-lg shadow-md group-hover:scale-105 transition-transform cursor-pointer"
									onClick={() => window.open('/certificates_page-0004.jpg', '_blank')}
								/>
							</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Compliance Document</h3>
							<p className="text-xs text-gray-600 text-center mb-4">Regulatory compliance verification</p>
							<button 
								onClick={() => window.open('/certificates_page-0004.jpg', '_blank')}
								className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
							>
								View Full
							</button>
						</div>

						{/* Certificate 5 from certificates1 folder */}
						<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-brand hover:shadow-xl transition-all group overflow-hidden">
							<div className="mb-4">
								<img 
									src="/certificates_page-0005.jpg" 
									alt="Certificate 5" 
									className="w-full h-auto rounded-lg shadow-md group-hover:scale-105 transition-transform cursor-pointer"
									onClick={() => window.open('/certificates_page-0005.jpg', '_blank')}
								/>
							</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Official Document</h3>
							<p className="text-xs text-gray-600 text-center mb-4">Foundation official documentation</p>
							<button 
								onClick={() => window.open('/certificates_page-0005.jpg', '_blank')}
								className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
							>
								View Full
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Services Overview */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">Our Comprehensive Services</h2>
						<p className="text-xl text-gray-600">Serving communities with excellence and care</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group">
							<div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏥</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">Healthcare Services</h3>
							<p className="text-gray-700 leading-relaxed">
								Up to 50% discount on consultations, diagnostics, and medicines for registered members.
							</p>
							<ul className="mt-4 space-y-2 text-sm text-gray-700">
								<li>✓ Doctor Consultations</li>
								<li>✓ Laboratory Tests</li>
								<li>✓ Prescription Medicine</li>
								<li>✓ Medical Reports</li>
							</ul>
						</div>

						<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group">
							<div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">Education Programs</h3>
							<p className="text-gray-700 leading-relaxed">
								Free and subsidized courses in IT, languages, and vocational skills with 70% discount.
							</p>
							<ul className="mt-4 space-y-2 text-sm text-gray-700">
								<li>✓ IT & Computer Courses</li>
								<li>✓ Language Training</li>
								<li>✓ Vocational Skills</li>
								<li>✓ Certificates</li>
							</ul>
						</div>

						<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group">
							<div className="text-6xl mb-4 group-hover:scale-110 transition-transform">💊</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">Pharmacy Services</h3>
							<p className="text-gray-700 leading-relaxed">
								Affordable medicines with 50% discount on all prescriptions.
							</p>
							<ul className="mt-4 space-y-2 text-sm text-gray-700">
								<li>✓ Quality Medicines</li>
								<li>✓ Prescription Management</li>
								<li>✓ Medicine Delivery</li>
								<li>✓ Health Consultations</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="py-16 bg-gradient-to-br from-brand-lighter to-blue-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
					</div>
					<div className="grid md:grid-cols-4 gap-6">
						<div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all">
							<div className="text-4xl mb-3">❤️</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2">Compassion</h3>
							<p className="text-sm text-gray-600">Caring for every individual with empathy and understanding</p>
						</div>
						<div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all">
							<div className="text-4xl mb-3">🔍</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2">Transparency</h3>
							<p className="text-sm text-gray-600">Complete openness in all our operations and finances</p>
						</div>
						<div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all">
							<div className="text-4xl mb-3">🤝</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2">Community</h3>
							<p className="text-sm text-gray-600">Building strong, supportive communities together</p>
						</div>
						<div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all">
							<div className="text-4xl mb-3">⚡</div>
							<h3 className="text-lg font-bold text-gray-900 mb-2">Impact</h3>
							<p className="text-sm text-gray-600">Creating measurable, lasting positive change</p>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="py-16 bg-gradient-to-r from-brand to-brand-dark">
				<div className="max-w-4xl mx-auto px-4 text-center text-white">
					<h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
					<p className="text-xl mb-8 opacity-90">
						Join thousands supporting our mission to transform lives
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<Link 
							to="/login" 
							className="bg-white text-brand px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
						>
							Get Started
						</Link>
						<Link 
							to="/donation" 
							className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand transition"
						>
							Donate Now
						</Link>
						<Link 
							to="/contact" 
							className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand transition"
						>
							Contact Us
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
