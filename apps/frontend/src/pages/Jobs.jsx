import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Jobs() {
	const [jobs, setJobs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedDepartment, setSelectedDepartment] = useState('All');
	const [selectedType, setSelectedType] = useState('All');

	useEffect(() => {
		fetchJobs();
	}, []);

	const fetchJobs = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_URL}/api/jobs/public`);
			const data = await response.json();
			if (data.jobs) {
				setJobs(data.jobs);
			}
		} catch (error) {
			console.error('Error fetching jobs:', error);
		} finally {
			setLoading(false);
		}
	};

	// Get unique departments
	const departments = ['All', ...new Set(jobs.map(job => job.department).filter(Boolean))];
	
	// Get unique employment types
	const employmentTypes = ['All', ...new Set(jobs.map(job => job.employment_type).filter(Boolean))];

	// Filter jobs
	const filteredJobs = jobs.filter(job => {
		const matchesSearch = 
			job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			job.location?.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment;
		const matchesType = selectedType === 'All' || job.employment_type === selectedType;
		
		return matchesSearch && matchesDepartment && matchesType;
	});

	const getEmploymentTypeBadge = (type) => {
		const badges = {
			'full-time': { text: 'Full Time', color: 'bg-green-100 text-green-800' },
			'part-time': { text: 'Part Time', color: 'bg-blue-100 text-blue-800' },
			'contract': { text: 'Contract', color: 'bg-purple-100 text-purple-800' },
			'internship': { text: 'Internship', color: 'bg-orange-100 text-orange-800' }
		};
		return badges[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading jobs...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-brand to-brand-dark text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Career Opportunities</h1>
						<p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
							Join our team and make a difference in healthcare and education
						</p>
					</div>
				</div>
			</div>

			{/* Filters and Search */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Search */}
						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
							<input
								type="text"
								placeholder="Search jobs..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
							/>
						</div>

						{/* Department Filter */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
							<select
								value={selectedDepartment}
								onChange={(e) => setSelectedDepartment(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
							>
								{departments.map(dept => (
									<option key={dept} value={dept}>{dept}</option>
								))}
							</select>
						</div>

						{/* Employment Type Filter */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
							<select
								value={selectedType}
								onChange={(e) => setSelectedType(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
							>
								{employmentTypes.map(type => (
									<option key={type} value={type}>{type}</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Results Count */}
				<div className="mb-6">
					<p className="text-gray-600">
						Found <span className="font-semibold text-brand">{filteredJobs.length}</span> job{filteredJobs.length !== 1 ? 's' : ''}
					</p>
				</div>

				{/* Jobs List */}
				{filteredJobs.length === 0 ? (
					<div className="bg-white rounded-xl shadow-lg p-12 text-center">
						<div className="text-6xl mb-4">📋</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">No jobs found</h3>
						<p className="text-gray-600">
							{searchQuery || selectedDepartment !== 'All' || selectedType !== 'All'
								? 'Try adjusting your filters'
								: 'Check back soon for new opportunities'}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6">
						{filteredJobs.map((job) => {
							const badge = getEmploymentTypeBadge(job.employment_type);
							return (
								<Link
									key={job.id}
									to={`/jobs/${job.id}`}
									className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-brand/30 group"
								>
									<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
										<div className="flex-1">
											<div className="flex items-start justify-between mb-3">
												<div>
													<h3 className="text-2xl font-bold text-gray-900 group-hover:text-brand transition-colors mb-2">
														{job.title}
													</h3>
													{job.department && (
														<p className="text-brand font-semibold mb-2">{job.department}</p>
													)}
												</div>
												<span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
													{badge.text}
												</span>
											</div>
											
											<p className="text-gray-600 mb-4 line-clamp-2">
												{job.description}
											</p>

											<div className="flex flex-wrap gap-4 text-sm text-gray-600">
												{job.location && (
													<div className="flex items-center gap-1">
														<span>📍</span>
														<span>{job.location}</span>
													</div>
												)}
												{job.salary_range && (
													<div className="flex items-center gap-1">
														<span>💰</span>
														<span>{job.salary_range}</span>
													</div>
												)}
												{job.experience_required && (
													<div className="flex items-center gap-1">
														<span>💼</span>
														<span>{job.experience_required}</span>
													</div>
												)}
											</div>
										</div>

										<div className="flex items-center">
											<span className="text-brand font-semibold group-hover:translate-x-1 transition-transform">
												View Details →
											</span>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

