import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function DashboardStudent() {
	const [activeTab, setActiveTab] = useState('dashboard');
	const [availableCourses, setAvailableCourses] = useState([]);
	const [enrolledCourses, setEnrolledCourses] = useState([]);
	const [certificates, setCertificates] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [userInfo, setUserInfo] = useState(null);
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [enrolling, setEnrolling] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCourseId, setSelectedCourseId] = useState(null);
	const [materials, setMaterials] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [downloadingMaterialId, setDownloadingMaterialId] = useState(null);
	const [downloadingAssignmentId, setDownloadingAssignmentId] = useState(null);

	useEffect(() => {
		loadUserInfo();
		loadDashboardData();
	}, []);

	useEffect(() => {
		if (activeTab !== 'dashboard') {
			loadData();
		}
	}, [activeTab]);

	async function loadUserInfo() {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				setUserInfo({
					name: user.user_metadata?.name || user.email?.split('@')[0] || 'Student',
					email: user.email
				});
			}
		} catch (err) {
			console.error('Failed to load user info:', err);
		}
	}

	async function loadDashboardData() {
		setInitialLoading(true);
		try {
			await Promise.all([
				loadCourses(),
				loadEnrolledCourses(),
				loadCertificates(),
				loadNotifications()
			]);
		} catch (err) {
			console.error('Failed to load dashboard data:', err);
		} finally {
			setInitialLoading(false);
		}
	}

	async function loadCourses() {
		try {
			const res = await apiRequest('/api/courses');
			setAvailableCourses(res.courses || []);
		} catch (err) {
			console.error('Failed to load courses:', err);
		}
	}

	async function loadEnrolledCourses() {
		try {
			const res = await apiRequest('/api/courses/my');
			setEnrolledCourses(res.enrollments || []);
		} catch (err) {
			console.error('Failed to load enrolled courses:', err);
		}
	}

	async function loadCertificates() {
		try {
			const res = await apiRequest('/api/certificates/my');
			setCertificates(res.certificates || []);
		} catch (err) {
			console.error('Failed to load certificates:', err);
		}
	}

	async function loadNotifications() {
		try {
			const res = await apiRequest('/api/notifications');
			setNotifications(res.notifications || []);
		} catch (err) {
			console.error('Failed to load notifications:', err);
		}
	}

	async function loadData() {
		setLoading(true);
		try {
			if (activeTab === 'available') {
				await loadCourses();
			} else if (activeTab === 'my-courses') {
				await loadEnrolledCourses();
			} else if (activeTab === 'certificates') {
				await loadCertificates();
			} else if (activeTab === 'notifications') {
				await loadNotifications();
			}
		} catch (err) {
			console.error(err);
			alert(err.message || 'Failed to load data');
		} finally {
			setLoading(false);
		}
	}

	async function enrollInCourse(courseId) {
		if (!confirm('Are you sure you want to enroll in this course?')) return;
		
		setEnrolling(courseId);
		try {
			await apiRequest('/api/courses/enroll', {
				method: 'POST',
				body: JSON.stringify({ course_id: courseId })
			});
			alert('Successfully enrolled! Check "My Courses" tab.');
			await Promise.all([loadCourses(), loadEnrolledCourses()]);
		} catch (err) {
			alert(err.message || 'Failed to enroll');
		} finally {
			setEnrolling(null);
		}
	}

	async function downloadCertificate(courseId) {
		try {
			const res = await apiRequest(`/api/certificates/${courseId}/download`);
			if (res.url) {
				window.open(res.url, '_blank');
			}
		} catch (err) {
			alert(err.message || 'Failed to download certificate');
		}
	}

	async function loadCourseDetails(courseId) {
		if (!courseId) return;
		setLoading(true);
		try {
			const [materialsRes, assignmentsRes] = await Promise.all([
				apiRequest(`/api/courses/${courseId}/materials`).catch(() => ({ materials: [] })),
				apiRequest(`/api/courses/${courseId}/assignments`).catch(() => ({ assignments: [] }))
			]);
			setMaterials(materialsRes.materials || []);
			setAssignments(assignmentsRes.assignments || []);
		} catch (err) {
			console.error('Failed to load course details:', err);
		} finally {
			setLoading(false);
		}
	}

	async function downloadMaterial(material) {
		if (!material.file_url && !material.file_name) {
			alert('No file available to download');
			return;
		}
		
		if (downloadingMaterialId === material.id) return;
		setDownloadingMaterialId(material.id);
		
		try {
			let downloadUrl = material.file_url;
			
			if (material.file_url || material.file_name) {
				try {
					const res = await apiRequest(`/api/courses/materials/${material.id}/url`);
					if (res && res.url) {
						downloadUrl = res.url;
					}
				} catch (err) {
					console.warn('Could not get fresh URL:', err);
					if (!downloadUrl) {
						setDownloadingMaterialId(null);
						alert('Unable to get file URL. Please try again.');
						return;
					}
				}
			}
			
			if (!downloadUrl) {
				setDownloadingMaterialId(null);
				alert('File URL not available');
				return;
			}
			
			const fileName = material.file_name || `${material.title.replace(/[^a-z0-9]/gi, '_')}.${material.file_type?.split('/').pop() || 'file'}`;
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = fileName;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			link.style.display = 'none';
			document.body.appendChild(link);
			link.click();
			
			setTimeout(() => {
				document.body.removeChild(link);
				setDownloadingMaterialId(null);
			}, 500);
		} catch (err) {
			console.error('Download failed:', err);
			setDownloadingMaterialId(null);
			alert('Failed to download file. You can open the file in a new tab and download it from there.');
		}
	}

	async function downloadAssignment(assignment) {
		if (!assignment.file_url && !assignment.file_name) {
			alert('No file available to download');
			return;
		}
		
		if (downloadingAssignmentId === assignment.id) return;
		setDownloadingAssignmentId(assignment.id);
		
		try {
			let downloadUrl = assignment.file_url;
			
			if (assignment.file_url || assignment.file_name) {
				try {
					const res = await apiRequest(`/api/courses/assignments/${assignment.id}/url`);
					if (res && res.url) {
						downloadUrl = res.url;
					}
				} catch (err) {
					console.warn('Could not get fresh URL:', err);
					if (!downloadUrl) {
						setDownloadingAssignmentId(null);
						alert('Unable to get file URL. Please try again.');
						return;
					}
				}
			}
			
			if (!downloadUrl) {
				setDownloadingAssignmentId(null);
				alert('File URL not available');
				return;
			}
			
			const fileName = assignment.file_name || `${assignment.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = fileName;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			link.style.display = 'none';
			document.body.appendChild(link);
			link.click();
			
			setTimeout(() => {
				document.body.removeChild(link);
				setDownloadingAssignmentId(null);
			}, 500);
		} catch (err) {
			console.error('Download failed:', err);
			setDownloadingAssignmentId(null);
			alert('Failed to download file. You can open the file in a new tab and download it from there.');
		}
	}

	function calculatePrice(originalPrice, discountRate) {
		if (!originalPrice) return 'Free';
		const discounted = Math.round(originalPrice * (1 - (discountRate || 70) / 100));
		return {
			original: originalPrice,
			discounted: discounted,
			savings: originalPrice - discounted
		};
	}

	function isEnrolled(courseId) {
		return enrolledCourses.some(e => e.course_id === courseId);
	}

	const filteredCourses = availableCourses.filter(course => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			course.title?.toLowerCase().includes(query) ||
			course.description?.toLowerCase().includes(query)
		);
	});

	// Calculate statistics
	const stats = {
		totalCourses: availableCourses.length,
		enrolledCourses: enrolledCourses.length,
		completedCourses: enrolledCourses.filter(e => parseFloat(e.progress || 0) === 100).length,
		certificates: certificates.length,
		averageProgress: enrolledCourses.length > 0
			? Math.round(enrolledCourses.reduce((sum, e) => sum + parseFloat(e.progress || 0), 0) / enrolledCourses.length)
			: 0,
		inProgressCourses: enrolledCourses.filter(e => {
			const progress = parseFloat(e.progress || 0);
			return progress > 0 && progress < 100;
		}).length
	};

	// Get recent courses (top 3 by progress)
	const recentCourses = enrolledCourses
		.sort((a, b) => parseFloat(b.progress || 0) - parseFloat(a.progress || 0))
		.slice(0, 3);

	// Get recent notifications
	const recentNotifications = notifications.slice(0, 5);

	if (initialLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-6">
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
					<p className="mt-4 text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-brand mb-2">🎓 Student Dashboard</h1>
				{userInfo && (
					<p className="text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{userInfo.name}</span>!</p>
				)}
			</div>
			
			{/* Welcome Card */}
			<div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 rounded-lg shadow-lg mb-6 border border-blue-100">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Learning Journey!</h2>
						<p className="text-gray-700 mb-3">Enroll in courses and track your progress. All courses come with a 70% discount for registered students.</p>
						<div className="flex items-center gap-4 text-sm">
							<span className="flex items-center text-green-700 font-semibold">
								<span className="text-lg mr-1">✓</span>
								70% Student Discount
							</span>
							<span className="flex items-center text-blue-700 font-semibold">
								<span className="text-lg mr-1">📜</span>
								Certificates on Completion
							</span>
						</div>
					</div>
					<div className="hidden md:block text-6xl">🎓</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
				<div className="border-b border-gray-200 bg-gray-50">
					<nav className="flex space-x-1 px-2 overflow-x-auto" aria-label="Tabs">
						{[
							{ id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
							{ id: 'available', label: '📚 Available Courses', icon: '📚', count: availableCourses.length },
							{ id: 'my-courses', label: '🎯 My Courses', icon: '🎯', count: enrolledCourses.length },
							{ id: 'certificates', label: '🏆 Certificates', icon: '🏆', count: certificates.length },
							{ id: 'notifications', label: '🔔 Notifications', icon: '🔔', count: notifications.filter(n => !n.read && !n.is_read).length },
							{ id: 'profile', label: '👤 Profile', icon: '👤' }
						].map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
									activeTab === tab.id
										? 'border-brand text-brand bg-white'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								}`}
							>
								{tab.label}
								{tab.count !== undefined && tab.count > 0 && (
									<span className={`ml-2 text-xs px-2 py-1 rounded-full ${
										activeTab === tab.id 
											? 'bg-brand text-white' 
											: 'bg-gray-300 text-gray-700'
									}`}>
										{tab.count}
									</span>
								)}
							</button>
						))}
					</nav>
				</div>

				{/* Tab Content */}
				<div className="p-6">
					{/* Dashboard Overview Tab */}
					{activeTab === 'dashboard' && (
						<div className="space-y-6">
							{/* Statistics Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-blue-100 text-sm font-medium">Total Courses</p>
											<p className="text-3xl font-bold mt-1">{stats.totalCourses}</p>
										</div>
										<div className="text-4xl opacity-80">📚</div>
									</div>
								</div>
								<div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-green-100 text-sm font-medium">Enrolled</p>
											<p className="text-3xl font-bold mt-1">{stats.enrolledCourses}</p>
										</div>
										<div className="text-4xl opacity-80">🎯</div>
									</div>
								</div>
								<div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-purple-100 text-sm font-medium">Completed</p>
											<p className="text-3xl font-bold mt-1">{stats.completedCourses}</p>
										</div>
										<div className="text-4xl opacity-80">✅</div>
									</div>
								</div>
								<div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-lg shadow-lg">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-yellow-100 text-sm font-medium">Certificates</p>
											<p className="text-3xl font-bold mt-1">{stats.certificates}</p>
										</div>
										<div className="text-4xl opacity-80">🏆</div>
									</div>
								</div>
							</div>

							{/* Progress Overview */}
							<div className="grid md:grid-cols-2 gap-6">
								<div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
									<div className="space-y-4">
										<div>
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-gray-700">Average Progress</span>
												<span className="text-lg font-bold text-brand">{stats.averageProgress}%</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-4">
												<div
													className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
													style={{ width: `${stats.averageProgress}%` }}
												></div>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4 pt-4 border-t">
											<div className="text-center">
												<p className="text-2xl font-bold text-blue-600">{stats.inProgressCourses}</p>
												<p className="text-sm text-gray-600">In Progress</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-green-600">{stats.completedCourses}</p>
												<p className="text-sm text-gray-600">Completed</p>
											</div>
										</div>
									</div>
								</div>

								<div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
									<div className="space-y-3">
										<button
											onClick={() => setActiveTab('available')}
											className="w-full bg-brand text-white px-4 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition text-left flex items-center justify-between"
										>
											<span>Browse Available Courses</span>
											<span>→</span>
										</button>
										<button
											onClick={() => setActiveTab('my-courses')}
											className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition text-left flex items-center justify-between"
										>
											<span>View My Courses</span>
											<span>→</span>
										</button>
										{stats.certificates > 0 && (
											<button
												onClick={() => setActiveTab('certificates')}
												className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition text-left flex items-center justify-between"
											>
												<span>View Certificates ({stats.certificates})</span>
												<span>→</span>
											</button>
										)}
									</div>
								</div>
							</div>

							{/* Recent Courses */}
							{recentCourses.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
										<button
											onClick={() => setActiveTab('my-courses')}
											className="text-brand hover:underline text-sm font-medium"
										>
											View All →
										</button>
									</div>
									<div className="grid md:grid-cols-3 gap-4">
										{recentCourses.map(enrollment => {
											const course = enrollment.courses;
											const progress = parseFloat(enrollment.progress || 0);
											return (
												<div key={enrollment.course_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
													<h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">{course?.title || 'Course'}</h4>
													<div className="mb-3">
														<div className="flex items-center justify-between mb-1">
															<span className="text-xs text-gray-600">Progress</span>
															<span className="text-xs font-bold text-brand">{progress}%</span>
														</div>
														<div className="w-full bg-gray-200 rounded-full h-2">
															<div
																className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
																style={{ width: `${progress}%` }}
															></div>
														</div>
													</div>
													<button
														onClick={() => setActiveTab('my-courses')}
														className="text-sm text-brand hover:underline font-medium"
													>
														Continue Learning →
													</button>
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Recent Notifications */}
							{recentNotifications.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
										<button
											onClick={() => setActiveTab('notifications')}
											className="text-brand hover:underline text-sm font-medium"
										>
											View All →
										</button>
									</div>
									<div className="space-y-3">
										{recentNotifications.map((notif, idx) => (
											<div
												key={idx}
											className={`p-4 rounded-lg border ${
												(notif.read || notif.is_read)
													? 'bg-gray-50 border-gray-200'
													: 'bg-blue-50 border-blue-200'
											}`}
											>
												<p className="text-sm font-medium text-gray-900">{notif.message || notif.title}</p>
												{notif.created_at && (
													<p className="text-xs text-gray-500 mt-1">
														{new Date(notif.created_at).toLocaleDateString()}
													</p>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Profile Tab */}
					{activeTab === 'profile' && (
						<div className="max-w-2xl">
							<h2 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h2>
							<div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
										<input
											type="text"
											value={userInfo?.name || ''}
											disabled
											className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
										<input
											type="email"
											value={userInfo?.email || ''}
											disabled
											className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
										<input
											type="text"
											value="Student"
											disabled
											className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
										/>
									</div>
								</div>
								<div className="mt-6 pt-6 border-t border-gray-200">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Student Statistics</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="bg-blue-50 p-4 rounded-lg">
											<p className="text-sm text-gray-600">Courses Enrolled</p>
											<p className="text-2xl font-bold text-blue-600">{stats.enrolledCourses}</p>
										</div>
										<div className="bg-green-50 p-4 rounded-lg">
											<p className="text-sm text-gray-600">Certificates Earned</p>
											<p className="text-2xl font-bold text-green-600">{stats.certificates}</p>
										</div>
										<div className="bg-purple-50 p-4 rounded-lg">
											<p className="text-sm text-gray-600">Average Progress</p>
											<p className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</p>
										</div>
										<div className="bg-yellow-50 p-4 rounded-lg">
											<p className="text-sm text-gray-600">Courses Completed</p>
											<p className="text-2xl font-bold text-yellow-600">{stats.completedCourses}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Notifications Tab */}
					{activeTab === 'notifications' && (
						<div>
							<h2 className="text-2xl font-semibold text-gray-900 mb-6">Notifications</h2>
							{loading ? (
								<div className="text-center py-12">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
									<p className="mt-4 text-gray-600">Loading notifications...</p>
								</div>
							) : notifications.length === 0 ? (
								<div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
									<div className="text-6xl mb-4">🔔</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
									<p className="text-gray-600">You're all caught up! Check back later for updates.</p>
								</div>
							) : (
								<div className="space-y-3">
									{notifications.map((notif, idx) => (
										<div
											key={idx}
											className={`p-4 rounded-lg border transition ${
												(notif.read || notif.is_read)
													? 'bg-white border-gray-200'
													: 'bg-blue-50 border-blue-300 shadow-sm'
											}`}
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<p className="font-medium text-gray-900">{notif.message || notif.title || 'Notification'}</p>
													{notif.created_at && (
														<p className="text-sm text-gray-500 mt-1">
															{new Date(notif.created_at).toLocaleString()}
														</p>
													)}
												</div>
												{!(notif.read || notif.is_read) && (
													<span className="ml-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Available Courses Tab */}
					{activeTab === 'available' && (
						<div>
							<div className="mb-6">
								<div className="flex items-center gap-4 mb-4">
									<div className="flex-1 relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
										<input
											type="text"
											value={searchQuery}
											onChange={e => setSearchQuery(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
											placeholder="Search courses by name or description..."
										/>
									</div>
								</div>
							</div>

							{loading ? (
								<div className="text-center py-12">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
									<p className="mt-4 text-gray-600">Loading courses...</p>
								</div>
							) : filteredCourses.length === 0 ? (
								<div className="bg-gray-50 rounded-lg p-12 text-center">
									<div className="text-6xl mb-4">📖</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
									<p className="text-gray-600">
										{searchQuery ? 'Try adjusting your search query' : 'No courses available at the moment. Check back soon!'}
									</p>
								</div>
							) : (
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
									{filteredCourses.map(course => {
										const isAlreadyEnrolled = isEnrolled(course.id);
										return (
											<div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
												<div className="p-6">
													<div className="flex items-start justify-between mb-4">
														<div className="flex-1">
															<h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
															{course.description && (
																<p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
															)}
														</div>
													</div>
													
													<div className="space-y-2 mb-4">
														{course.duration && (
															<div className="flex items-center text-sm text-gray-600">
																<span className="mr-2">⏱️</span>
																<span>Duration: {course.duration}</span>
															</div>
														)}
														<div className="flex items-center justify-between">
															<span className="text-sm text-gray-600">Discount:</span>
															<span className="text-green-600 font-bold">
																{course.discount_rate || 70}% OFF
															</span>
														</div>
													</div>

													<div className="pt-4 border-t">
														{isAlreadyEnrolled ? (
															<div className="bg-green-50 border border-green-200 rounded p-3 text-center">
																<span className="text-green-700 font-semibold">✓ Already Enrolled</span>
															</div>
														) : (
															<button
																onClick={() => enrollInCourse(course.id)}
																disabled={enrolling === course.id}
																className="w-full bg-brand text-white px-4 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
															>
																{enrolling === course.id ? 'Enrolling...' : 'Enroll Now →'}
															</button>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}

					{/* My Courses Tab */}
					{activeTab === 'my-courses' && !selectedCourseId && (
						<div>
							<h2 className="text-xl font-semibold mb-4">My Enrolled Courses</h2>
							{loading ? (
								<div className="text-center py-12">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
									<p className="mt-4 text-gray-600">Loading your courses...</p>
								</div>
							) : enrolledCourses.length === 0 ? (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
									<div className="text-6xl mb-4">📚</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-2">No enrolled courses yet</h3>
									<p className="text-gray-600 mb-4">Browse available courses and enroll to get started!</p>
									<button
										onClick={() => setActiveTab('available')}
										className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
									>
										Browse Courses
									</button>
								</div>
							) : (
								<div className="space-y-4">
									{enrolledCourses.map(enrollment => {
										const course = enrollment.courses;
										const progress = parseFloat(enrollment.progress || 0);
										const hasCertificate = !!enrollment.certificate_url;
										
										return (
											<div key={enrollment.course_id} className="border rounded-lg p-6 hover:shadow-md transition">
												<div className="flex items-start justify-between mb-4">
													<div className="flex-1">
														<h3 className="text-xl font-bold text-gray-900 mb-2">
															{course?.title || 'Course'}
														</h3>
														{course?.description && (
															<p className="text-gray-600 text-sm mb-3">{course.description}</p>
														)}
														<div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
															{course?.duration && (
																<span className="flex items-center">
																	⏱️ {course.duration}
																</span>
															)}
															{course?.discount_rate && (
																<span className="flex items-center text-green-600 font-semibold">
																	💰 {course.discount_rate}% Discount Applied
																</span>
															)}
														</div>
													</div>
												</div>

												{/* Progress Bar */}
												<div className="mb-4">
													<div className="flex items-center justify-between mb-2">
														<span className="text-sm font-medium text-gray-700">Progress</span>
														<span className="text-sm font-bold text-brand">{progress}%</span>
													</div>
													<div className="w-full bg-gray-200 rounded-full h-3">
														<div
															className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
															style={{ width: `${progress}%` }}
														></div>
													</div>
												</div>

												{/* Actions */}
												<div className="flex items-center gap-3 pt-4 border-t">
													<button
														onClick={() => {
															setSelectedCourseId(enrollment.course_id);
															loadCourseDetails(enrollment.course_id);
														}}
														className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
													>
														📚 View Course Details
													</button>
													{hasCertificate && (
														<button
															onClick={() => downloadCertificate(enrollment.course_id)}
															className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
														>
															🏆 Download Certificate
														</button>
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}

					{/* Course Details View */}
					{activeTab === 'my-courses' && selectedCourseId && (
						<div>
							<button
								onClick={() => {
									setSelectedCourseId(null);
									setMaterials([]);
									setAssignments([]);
								}}
								className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
							>
								← Back to My Courses
							</button>
							{loading ? (
								<div className="text-center py-12">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
									<p className="mt-4 text-gray-600">Loading course details...</p>
								</div>
							) : (
								<div className="space-y-6">
									{/* Materials Section */}
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										<h3 className="text-xl font-semibold text-gray-900 mb-4">📚 Course Materials</h3>
										{materials.length === 0 ? (
											<p className="text-gray-500 text-center py-8">No materials available yet.</p>
										) : (
											<div className="grid md:grid-cols-2 gap-4">
												{materials.map(material => (
													<div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
														<div className="flex items-start justify-between mb-2">
															<div className="text-2xl">
																{material.material_type === 'video' ? '🎥' : 
																 material.material_type === 'link' ? '🔗' : '📄'}
															</div>
															{(material.file_url || material.file_name) && (
																<button
																	onClick={() => downloadMaterial(material)}
																	disabled={downloadingMaterialId === material.id}
																	className={`px-3 py-1 rounded text-sm font-semibold transition ${
																		downloadingMaterialId === material.id
																			? 'bg-gray-400 text-white cursor-not-allowed'
																			: 'bg-orange-600 text-white hover:bg-orange-700'
																	}`}
																>
																	{downloadingMaterialId === material.id ? '⏳...' : '⬇️ Download'}
																</button>
															)}
														</div>
														<h4 className="font-semibold text-gray-900 mb-1">{material.title}</h4>
														{material.description && (
															<p className="text-sm text-gray-600 mb-2 line-clamp-2">{material.description}</p>
														)}
														{material.file_name && (
															<p className="text-xs text-gray-500">📎 {material.file_name}</p>
														)}
													</div>
												))}
											</div>
										)}
									</div>

									{/* Assignments Section */}
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										<h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Assignments</h3>
										{assignments.length === 0 ? (
											<p className="text-gray-500 text-center py-8">No assignments available yet.</p>
										) : (
											<div className="space-y-4">
												{assignments.map(assignment => (
													<div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
														<div className="flex items-start justify-between mb-2">
															<div className="flex-1">
																<h4 className="font-semibold text-gray-900 mb-1">{assignment.title}</h4>
																{assignment.description && (
																	<p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
																)}
																{assignment.instructions && (
																	<p className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">{assignment.instructions}</p>
																)}
																<div className="flex flex-wrap gap-4 text-xs text-gray-500">
																	{assignment.due_date && (
																		<span>📅 Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
																	)}
																	{assignment.max_score && (
																		<span>💯 Max Score: {assignment.max_score}</span>
																	)}
																	{assignment.assignment_type && (
																		<span className="capitalize">📋 {assignment.assignment_type}</span>
																	)}
																</div>
															</div>
															{(assignment.file_url || assignment.file_name) && (
																<button
																	onClick={() => downloadAssignment(assignment)}
																	disabled={downloadingAssignmentId === assignment.id}
																	className={`ml-4 px-3 py-1 rounded text-sm font-semibold transition ${
																		downloadingAssignmentId === assignment.id
																			? 'bg-gray-400 text-white cursor-not-allowed'
																			: 'bg-green-600 text-white hover:bg-green-700'
																	}`}
																>
																	{downloadingAssignmentId === assignment.id ? '⏳...' : '⬇️ Download'}
																</button>
															)}
														</div>
														{assignment.file_name && (
															<p className="text-xs text-gray-500 mt-2">📎 {assignment.file_name}</p>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Certificates Tab */}
					{activeTab === 'certificates' && (
						<div>
							<h2 className="text-xl font-semibold mb-4">My Certificates</h2>
							{loading ? (
								<div className="text-center py-12">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
									<p className="mt-4 text-gray-600">Loading certificates...</p>
								</div>
							) : certificates.length === 0 ? (
								<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
									<div className="text-6xl mb-4">🏆</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-2">No certificates yet</h3>
									<p className="text-gray-600">
										Complete your enrolled courses to earn certificates!
									</p>
								</div>
							) : (
								<div className="grid md:grid-cols-2 gap-6">
									{certificates.map(cert => {
										const course = cert.courses;
										return (
											<div key={cert.course_id} className="border rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg transition">
												<div className="text-center mb-4">
													<div className="text-6xl mb-3">🎓</div>
													<h3 className="text-xl font-bold text-gray-900 mb-2">
														{course?.title || 'Course Certificate'}
													</h3>
													<p className="text-sm text-gray-600">Course Completion Certificate</p>
												</div>
												<div className="pt-4 border-t">
													<button
														onClick={() => downloadCertificate(cert.course_id)}
														className="w-full bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
													>
														⬇️ Download Certificate
													</button>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}