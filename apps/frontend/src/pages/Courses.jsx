import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

export default function Courses() {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');

	// Sample medical courses data (would be replaced with real API call)
	const allCourses = [
		{
			id: 1,
			title: 'Basic Nursing Care',
			description: 'Learn fundamental nursing skills including patient care, vital signs monitoring, and basic medical procedures.',
			duration: '3 months',
			discount_rate: 70,
			category: 'Medical',
			original_price: 50000,
			icon: '🩺'
		},
		{
			id: 2,
			title: 'Phlebotomy Training',
			description: 'Master blood drawing techniques, specimen collection, and lab safety protocols.',
			duration: '2 months',
			discount_rate: 70,
			category: 'Medical',
			original_price: 40000,
			icon: '🩸'
		},
		{
			id: 3,
			title: 'Medical Assistant Training',
			description: 'Comprehensive training in medical office administration, patient scheduling, and clinical support.',
			duration: '4 months',
			discount_rate: 70,
			category: 'Medical',
			original_price: 60000,
			icon: '👨‍⚕️'
		},
		{
			id: 4,
			title: 'Ultrasound Technician',
			description: 'Learn ultrasound imaging techniques, anatomy, and operation of ultrasound equipment.',
			duration: '6 months',
			discount_rate: 70,
			category: 'Medical',
			original_price: 80000,
			icon: '📡'
		},
		{
			id: 5,
			title: 'Pharmacy Assistant',
			description: 'Train in medication dispensing, inventory management, and customer service in pharmacy settings.',
			duration: '3 months',
			discount_rate: 70,
			category: 'Medical',
			original_price: 45000,
			icon: '💊'
		},
		{
			id: 6,
			title: 'X-Ray Technician',
			description: 'Learn diagnostic imaging, radiation safety, and X-ray machine operation.',
			duration: '5 months',
			discount_rate: 70,
			category: 'Medical',
			original_price: 70000,
			icon: '🦴'
		},
		{
			id: 7,
			title: 'ECG Technician',
			description: 'Master electrocardiogram procedures, heart monitoring, and cardiovascular health assessment.',
			duration: '2 months',
			discount_rate: 70,
			category: 'Medical',
			original_price: 35000,
			icon: '💓'
		},
		{
			id: 8,
			title: 'Medical Billing & Coding',
			description: 'Learn medical insurance coding, billing procedures, and healthcare documentation systems.',
			duration: '3 months',
			discount_rate: 70,
			category: 'Administrative',
			original_price: 55000,
			icon: '📋'
		},
		{
			id: 9,
			title: 'Dental Assistant',
			description: 'Comprehensive dental office skills including chairside assistance and dental procedures.',
			duration: '4 months',
			discount_rate: 70,
			category: 'Dental',
			original_price: 65000,
			icon: '🦷'
		},
		{
			id: 10,
			title: 'Emergency Medical Responder',
			description: 'Train in emergency medical response, CPR, first aid, and ambulance assistance.',
			duration: '2 months',
			discount_rate: 70,
			category: 'Emergency',
			original_price: 40000,
			icon: '🚑'
		},
		{
			id: 11,
			title: 'Health Information Technician',
			description: 'Learn electronic health records, medical databases, and healthcare information systems.',
			duration: '4 months',
			discount_rate: 70,
			category: 'Administrative',
			original_price: 60000,
			icon: '💻'
		},
		{
			id: 12,
			title: 'Physical Therapy Aide',
			description: 'Assist physical therapists, learn rehabilitation techniques, and patient mobility exercises.',
			duration: '3 months',
			discount_rate: 70,
			category: 'Therapy',
			original_price: 50000,
			icon: '🏃'
		}
	];

	const categories = ['All', 'Medical', 'Administrative', 'Dental', 'Emergency', 'Therapy'];

	useEffect(() => {
		loadCourses();
	}, []);

	async function loadCourses() {
		setLoading(true);
		try {
			// Fetch courses from public API endpoint
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/courses/public`);
			if (!response.ok) {
				throw new Error('Failed to fetch courses');
			}
			const res = await response.json();
			const apiCourses = res.courses || [];
			
			// Map API courses to match the expected format
			// If API has courses, use them; otherwise fallback to sample data
			if (apiCourses.length > 0) {
				const iconOptions = ['🩺', '🩸', '👨‍⚕️', '📡', '💊', '🦴', '💓', '📋', '🦷', '🚑', '💻', '🏃', '🏥', '⚕️', '🧪', '🔬'];
				const categoryOptions = ['Medical', 'Administrative', 'Emergency', 'Therapy', 'Dental'];
				
				const mappedCourses = apiCourses.map((course, idx) => ({
					id: course.id,
					title: course.title || 'Untitled Course',
					description: course.description || 'No description available',
					duration: course.duration || 'N/A',
					discount_rate: parseFloat(course.discount_rate) || 70,
					category: course.category || categoryOptions[idx % categoryOptions.length], // Default category if not in DB
					original_price: course.original_price || 50000, // Default price if not in DB
					icon: course.icon || iconOptions[idx % iconOptions.length] // Default icon
				}));
				setCourses(mappedCourses);
			} else {
				// Fallback to sample data if API returns empty
				setCourses(allCourses);
			}
		} catch (err) {
			console.error('Error loading courses:', err);
			// On error, use sample data as fallback
			setCourses(allCourses);
		} finally {
			setLoading(false);
		}
	}

	const filteredCourses = courses.filter(course => {
		const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			course.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const calculateDiscountedPrice = (originalPrice, discountRate) => {
		return Math.round(originalPrice * (1 - discountRate / 100));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 md:py-16">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight px-4">
						Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Courses</span>
					</h1>
					<p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
						Professional medical training programs with up to 70% discount for aspiring healthcare professionals
					</p>
					
					{/* Search Bar */}
					<div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-2 mx-4">
						<div className="flex flex-col sm:flex-row items-center gap-2">
							<div className="flex items-center gap-2 flex-1 w-full">
								<span className="text-xl sm:text-2xl ml-2">🔍</span>
								<input
									type="text"
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className="flex-1 px-2 sm:px-4 py-2 sm:py-3 outline-none text-gray-700 text-sm sm:text-base"
									placeholder="Search courses..."
								/>
							</div>
							<button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition w-full sm:w-auto text-sm sm:text-base">
								Search
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-8 md:py-16">
				<div className="max-w-7xl mx-auto px-4">
					{/* Category Filter */}
					<div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 md:mb-12 px-2">
						{categories.map((category, idx) => (
							<button
								key={idx}
								onClick={() => setSelectedCategory(category)}
								className={`px-4 sm:px-6 py-2 rounded-full font-semibold transition-all text-sm sm:text-base ${
									selectedCategory === category
										? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
										: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
								}`}
							>
								{category}
							</button>
						))}
					</div>

					{/* Courses Grid */}
					{loading ? (
						<div className="text-center py-12">
							<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
							<p className="mt-4 text-gray-600">Loading courses...</p>
						</div>
					) : filteredCourses.length === 0 ? (
						<div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center mx-4">
							<div className="text-4xl sm:text-6xl mb-4">🔍</div>
							<h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
							<p className="text-sm sm:text-base text-gray-600">Try adjusting your search or category filter</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
							{filteredCourses.map(course => (
								<div key={course.id} className="group relative bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
									<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
									<div className="relative p-6 md:p-8 flex flex-col h-full">
										<div className="mb-4 md:mb-6">
											<div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
												<span className="text-4xl md:text-5xl filter drop-shadow-lg">{course.icon}</span>
											</div>
											<h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 md:mb-3">{course.title}</h3>
											<p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">{course.description}</p>
										</div>
										
										<div className="mb-4 md:mb-6 space-y-2 md:space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-gray-500 text-xs md:text-sm font-medium">Duration:</span>
												<span className="text-gray-900 font-bold text-sm md:text-base">{course.duration}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-gray-500 text-xs md:text-sm font-medium">Original Price:</span>
												<span className="text-gray-400 line-through text-xs md:text-sm">PKR {course.original_price.toLocaleString()}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-gray-500 text-xs md:text-sm font-medium">Discount:</span>
												<span className="text-blue-600 font-bold text-sm md:text-lg">{course.discount_rate}% OFF</span>
											</div>
											<div className="border-t pt-2 md:pt-3 mt-2 md:mt-3">
												<div className="flex items-center justify-between">
													<span className="text-gray-900 font-bold text-sm md:text-lg">Your Price:</span>
													<span className="text-green-600 font-bold text-lg md:text-2xl">
														PKR {calculateDiscountedPrice(course.original_price, course.discount_rate).toLocaleString()}
													</span>
												</div>
											</div>
										</div>

										<Link 
											to="/login" 
											className="mt-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
										>
											Enroll Now →
										</Link>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Call to Action */}
			<section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
				<div className="max-w-4xl mx-auto px-4">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Start Your Medical Career Today</h2>
					<p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 px-4">
						Join thousands of students learning practical healthcare skills with our certified programs
					</p>
					<Link 
						to="/login" 
						className="bg-white text-blue-600 px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg inline-block text-sm md:text-base"
					>
						Register Now
					</Link>
				</div>
			</section>

			{/* Back to Home */}
			<div className="max-w-7xl mx-auto px-4 pb-16 text-center">
				<Link to="/" className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-2">
					← Back to Home
				</Link>
			</div>
		</div>
	);
}

