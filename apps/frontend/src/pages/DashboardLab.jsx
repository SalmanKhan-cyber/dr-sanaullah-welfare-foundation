import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiRequest, clearCache } from '../lib/api';
import { useVerification } from '../hooks/useVerification';

export default function DashboardLab() {
	const { verified, checking } = useVerification('lab');
	const [labInfo, setLabInfo] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedTask, setSelectedTask] = useState(null);
	const [remarks, setRemarks] = useState('');
	const [uploading, setUploading] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [profileForm, setProfileForm] = useState({
		name: '',
		location: '',
		contact_info: '',
		services: ''
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState('all');
	const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'profile', 'analytics'

	useEffect(() => {
		if (!checking && verified) {
			loadLabInfo();
		}
	}, [verified, checking]);

	useEffect(() => {
		if (labInfo?.lab) {
			loadTasks();
			loadProfileData();
		}
	}, [labInfo?.lab]);

	async function loadLabInfo() {
		setLoading(true);
		try {
			const res = await apiRequest('/api/lab/me');
			if (res && res.lab) {
				setLabInfo(res);
			} else {
				setLabInfo(null);
			}
		} catch (err) {
			console.error('Failed to load lab info:', err);
			setLabInfo(null);
		} finally {
			setLoading(false);
		}
	}

	function loadProfileData() {
		if (labInfo?.lab) {
			setProfileForm({
				name: labInfo.lab.name || '',
				location: labInfo.lab.location || '',
				contact_info: labInfo.lab.contact_info || '',
				services: Array.isArray(labInfo.lab.services) 
					? labInfo.lab.services.join(', ') 
					: (labInfo.lab.services || '')
			});
		}
	}

	async function loadTasks() {
		setLoading(true);
		try {
			const res = await apiRequest('/api/lab/tasks');
			setTasks(res.tasks || []);
		} catch (err) {
			console.error('Failed to load tasks:', err);
			setTasks([]);
		} finally {
			setLoading(false);
		}
	}

	async function handleProfileUpdate(e) {
		e.preventDefault();
		setLoading(true);
		try {
			const servicesArray = profileForm.services
				.split(',')
				.map(s => s.trim())
				.filter(s => s);
			
			await apiRequest('/api/lab/profile', {
				method: 'PUT',
				body: JSON.stringify({
					name: profileForm.name,
					location: profileForm.location,
					contact_info: profileForm.contact_info,
					services: servicesArray
				})
			});
			
			alert('Profile updated successfully!');
			setShowProfileModal(false);
			clearCache('/api/lab/me');
			loadLabInfo();
		} catch (err) {
			alert('Failed to update profile: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	function handleFileSelect(e) {
		const file = e.target.files[0];
		if (file) {
			setSelectedTask({ ...selectedTask, file: file });
		}
	}

	async function handleFileUpload() {
		if (!selectedTask || !selectedTask.file) {
			alert('Please select a file to upload');
			return;
		}

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', selectedTask.file);
			formData.append('reportId', selectedTask.id);
			if (selectedTask.patient_id) {
				formData.append('patientId', selectedTask.patient_id);
			}
			if (remarks) {
				formData.append('remarks', remarks);
			}

			const { data: { session } } = await supabase.auth.getSession();
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/lab/reports/upload`, {
				method: 'POST',
				headers: { 'Authorization': `Bearer ${session?.access_token}` },
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Upload failed');
			}
			
			alert('Report uploaded successfully! Please confirm it to mark as completed.');
			setShowUploadModal(false);
			setSelectedTask(null);
			setRemarks('');
			clearCache('/api/lab/tasks');
			loadTasks();
		} catch (err) {
			alert('Upload failed: ' + err.message);
		} finally {
			setUploading(false);
		}
	}

	async function handleConfirmReport(reportId) {
		if (!confirm('Are you sure you want to mark this report as completed?')) {
			return;
		}

		setLoading(true);
		try {
			await apiRequest(`/api/lab/reports/${reportId}/confirm`, {
				method: 'POST'
			});
			
			alert('Report confirmed and marked as completed!');
			clearCache('/api/lab/tasks');
			loadTasks();
		} catch (err) {
			alert('Failed to confirm report: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	function openUploadModal(task) {
		setSelectedTask({ ...task, file: null });
		setRemarks(task.remarks || '');
		setShowUploadModal(true);
	}

	function closeUploadModal() {
		setShowUploadModal(false);
		setSelectedTask(null);
		setRemarks('');
	}

	function getStatusBadge(status) {
		const statusMap = {
			pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending' },
			in_progress: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'In Progress' },
			completed: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Completed' }
		};
		const statusInfo = statusMap[status] || statusMap.pending;
		return (
			<span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
				{statusInfo.text}
			</span>
		);
	}

	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return dateString;
		}
	}

	if (checking) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Verifying access...</p>
				</div>
			</div>
		);
	}

	if (!verified) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
					<div className="text-6xl mb-4">🔒</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
					<p className="text-gray-600 mb-6">
						You don't have access to the lab dashboard. Please contact an administrator.
					</p>
					<button
						onClick={() => window.location.href = '/login'}
						className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	if (loading && !labInfo) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading lab information...</p>
				</div>
			</div>
		);
	}

	if (!labInfo || !labInfo.lab) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
				<div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
					<div className="text-6xl mb-4">🧪</div>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">Lab Not Found</h2>
					<p className="text-gray-600 mb-6">
						Your lab registration is being processed. Once approved by an administrator, you will be able to see and manage your laboratory here.
					</p>
					<button
						onClick={() => {
							clearCache('/api/lab/me');
							loadLabInfo();
						}}
						className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
					>
						🔄 Retry Loading
					</button>
				</div>
			</div>
		);
	}

	const lab = labInfo.lab;
	const filteredTasks = tasks.filter(task => {
		const matchesSearch = 
			task.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
			task.patient_id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
			task.test_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			task.patients?.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			task.patients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesStatus = 
			filterStatus === 'all' || 
			(filterStatus === 'completed' && task.status === 'completed') ||
			(filterStatus === 'pending' && (!task.status || task.status === 'pending')) ||
			(filterStatus === 'in_progress' && task.status === 'in_progress');
		
		return matchesSearch && matchesStatus;
	});

	const completedCount = tasks.filter(t => t.status === 'completed').length;
	const pendingCount = tasks.filter(t => !t.status || t.status === 'pending').length;
	const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
								🧪
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Laboratory Dashboard</h1>
								<p className="text-sm text-gray-600">{lab.name}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<button
								onClick={() => setShowProfileModal(true)}
								className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
							>
								⚙️ Settings
							</button>
							<button
								onClick={() => supabase.auth.signOut()}
								className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>
			
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Tabs */}
				<div className="bg-white rounded-xl shadow-md p-2 mb-6 border border-gray-100">
					<div className="flex gap-2">
						<button
							onClick={() => setActiveTab('tasks')}
							className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
								activeTab === 'tasks'
									? 'bg-green-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							📋 Tasks & Reports
						</button>
						<button
							onClick={() => setActiveTab('profile')}
							className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
								activeTab === 'profile'
									? 'bg-green-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							🏢 Lab Profile
						</button>
						<button
							onClick={() => setActiveTab('analytics')}
							className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
								activeTab === 'analytics'
									? 'bg-green-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							📊 Analytics
						</button>
					</div>
				</div>

				{/* Tasks Tab */}
				{activeTab === 'tasks' && (
					<>
						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
							<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 mb-1">Pending Tasks</p>
										<p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
									</div>
									<div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
										<span className="text-2xl">⏳</span>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 mb-1">In Progress</p>
										<p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
									</div>
									<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
										<span className="text-2xl">🔄</span>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 mb-1">Completed</p>
										<p className="text-3xl font-bold text-green-600">{completedCount}</p>
									</div>
									<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
										<span className="text-2xl">✅</span>
									</div>
								</div>
							</div>
						</div>

						{/* Search and Filter */}
						<div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
							<div className="flex flex-col md:flex-row gap-4">
								<div className="flex-1">
									<input
										type="text"
										placeholder="Search by test type, patient name, or ID..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => setFilterStatus('all')}
										className={`px-4 py-2 rounded-lg font-medium transition ${
											filterStatus === 'all'
												? 'bg-green-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										All
									</button>
									<button
										onClick={() => setFilterStatus('pending')}
										className={`px-4 py-2 rounded-lg font-medium transition ${
											filterStatus === 'pending'
												? 'bg-yellow-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										Pending
									</button>
									<button
										onClick={() => setFilterStatus('in_progress')}
										className={`px-4 py-2 rounded-lg font-medium transition ${
											filterStatus === 'in_progress'
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										In Progress
									</button>
									<button
										onClick={() => setFilterStatus('completed')}
										className={`px-4 py-2 rounded-lg font-medium transition ${
											filterStatus === 'completed'
												? 'bg-green-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										Completed
									</button>
								</div>
							</div>
						</div>

						{/* Tasks List */}
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-xl font-bold text-gray-900">Lab Tasks & Reports</h2>
								<p className="text-sm text-gray-600 mt-1">Manage assigned tests and upload reports</p>
							</div>
							
							{loading ? (
								<div className="p-12 text-center">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
									<p className="text-gray-600">Loading tasks...</p>
								</div>
							) : filteredTasks.length === 0 ? (
								<div className="p-12 text-center">
									<div className="text-6xl mb-4">📋</div>
									<p className="text-gray-600 text-lg">No tasks found</p>
									<p className="text-gray-500 text-sm mt-2">
										{searchQuery || filterStatus !== 'all' 
											? 'Try adjusting your search or filter'
											: 'New tasks will appear here when assigned by administrators'}
									</p>
								</div>
							) : (
								<div className="divide-y divide-gray-200">
									{filteredTasks.map((task) => (
										<div key={task.id} className="p-6 hover:bg-gray-50 transition">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className="text-lg font-semibold text-gray-900">
															{task.test_type || 'Test Report'}
														</h3>
														{getStatusBadge(task.status || 'pending')}
													</div>
													
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
														{task.patients?.users?.name && (
															<div>
																<p className="text-xs text-gray-500 mb-1">Patient Name</p>
																<p className="text-sm font-medium text-gray-900">{task.patients.users.name}</p>
															</div>
														)}
														{task.patient_id && (
															<div>
																<p className="text-xs text-gray-500 mb-1">Patient ID</p>
																<p className="text-sm font-medium text-gray-900">{task.patient_id}</p>
															</div>
														)}
														{task.report_date && (
															<div>
																<p className="text-xs text-gray-500 mb-1">Report Date</p>
																<p className="text-sm font-medium text-gray-900">{formatDate(task.report_date)}</p>
															</div>
														)}
														{task.assigned_at && (
															<div>
																<p className="text-xs text-gray-500 mb-1">Assigned At</p>
																<p className="text-sm font-medium text-gray-900">{formatDate(task.assigned_at)}</p>
															</div>
														)}
													</div>
													
													{task.remarks && (
														<div className="mt-3">
															<p className="text-xs text-gray-500 mb-1">Remarks</p>
															<p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{task.remarks}</p>
														</div>
													)}
													
													{task.file_url && (
														<div className="mt-3">
															<p className="text-xs text-gray-500 mb-1">Report File</p>
															<button
																type="button"
																onClick={async (e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	try {
																		// Get and verify session with token
																		let { data: { session }, error: sessionError } = await supabase.auth.getSession();
																		
																		// If no session, try to refresh
																		if (!session || !session.access_token) {
																			console.log('🔄 No session found, attempting refresh...');
																			const refreshResult = await supabase.auth.refreshSession();
																			session = refreshResult.data?.session;
																			sessionError = refreshResult.error;
																		}
																		
																		// If still no valid session/token, redirect to login
																		if (sessionError || !session || !session.access_token) {
																			console.error('❌ No valid session/token found:', sessionError);
																			alert('You are not logged in. Please log in to view reports.');
																			window.location.href = '/login';
																			return;
																		}
																		
																		// Check if token is expired
																		if (session.expires_at && session.expires_at * 1000 < Date.now()) {
																			const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
																			if (refreshError || !refreshedSession || !refreshedSession.access_token) {
																				console.error('❌ Failed to refresh session:', refreshError);
																				alert('Your session has expired. Please log in again.');
																				window.location.href = '/login';
																				return;
																			}
																			session = refreshedSession;
																		}
																		
																		// Now make the request with the verified token
																		const token = session.access_token;
																		console.log('🔍 Fetching report URL for report:', task.id);
																		
																		const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
																		const response = await fetch(`${API_URL}/api/lab/reports/${task.id}/url`, {
																			method: 'GET',
																			headers: {
																				'Content-Type': 'application/json',
																				'Authorization': `Bearer ${token}`
																			}
																		});
																		
																		if (!response.ok) {
																			const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
																			if (response.status === 401 || errorData.error?.includes('token') || errorData.error?.includes('Unauthorized')) {
																				alert('Your session has expired. Please log in again.');
																				window.location.href = '/login';
																				return;
																			}
																			throw new Error(errorData.error || `HTTP ${response.status}`);
																		}
																		
																		const res = await response.json();
																		console.log('✅ Got report URL:', res);
																		if (res && res.url) {
																			window.open(res.url, '_blank');
																		} else {
																			alert('Failed to get report URL. Please try again.');
																		}
																	} catch (err) {
																		console.error('❌ Failed to load report:', err);
																		const errorMessage = err.message || 'Unknown error';
																		if (errorMessage.includes('Missing token') || errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
																			alert('Your session has expired or you are not logged in. Please log in again.');
																			window.location.href = '/login';
																		} else {
																			alert('Failed to load report: ' + errorMessage);
																		}
																	}
																}}
																className="text-sm text-green-600 hover:text-green-700 underline cursor-pointer bg-transparent border-none p-0"
															>
																📄 View Report
															</button>
														</div>
													)}
												</div>
												
												<div className="flex flex-col gap-2 ml-4">
													{(!task.status || task.status === 'pending' || task.status === 'in_progress') && (
														<button
															onClick={() => openUploadModal(task)}
															className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
														>
															{task.status === 'in_progress' ? 'Update Report' : 'Upload Report'}
														</button>
													)}
													{task.status === 'in_progress' && (
														<button
															onClick={() => handleConfirmReport(task.id)}
															className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
														>
															✅ Confirm Complete
														</button>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</>
				)}

				{/* Profile Tab */}
				{activeTab === 'profile' && (
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-gray-900">Lab Profile</h2>
							<button
								onClick={() => setShowProfileModal(true)}
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
							>
								✏️ Edit Profile
							</button>
						</div>
						
						<div className="space-y-4">
							<div>
								<p className="text-sm text-gray-500 mb-1">Lab Name</p>
								<p className="text-lg font-semibold text-gray-900">{lab.name}</p>
							</div>
							{lab.location && (
								<div>
									<p className="text-sm text-gray-500 mb-1">Location</p>
									<p className="text-lg text-gray-900">📍 {lab.location}</p>
								</div>
							)}
							{lab.contact_info && (
								<div>
									<p className="text-sm text-gray-500 mb-1">Contact Information</p>
									<p className="text-lg text-gray-900">📞 {lab.contact_info}</p>
								</div>
							)}
							{lab.services && lab.services.length > 0 && (
								<div>
									<p className="text-sm text-gray-500 mb-2">Services Offered</p>
									<div className="flex flex-wrap gap-2">
										{Array.isArray(lab.services) ? lab.services.map((service, idx) => (
											<span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
												{service}
											</span>
										)) : (
											<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
												{lab.services}
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Analytics Tab */}
				{activeTab === 'analytics' && (
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Statistics</h2>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Task Overview</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Total Tasks</span>
										<span className="text-2xl font-bold text-green-600">{tasks.length}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Completion Rate</span>
										<span className="text-2xl font-bold text-green-600">
											{tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
										</span>
									</div>
								</div>
							</div>
							
							<div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Pending</span>
										<span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-600">In Progress</span>
										<span className="text-2xl font-bold text-blue-600">{inProgressCount}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Upload Modal */}
			{showUploadModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-gray-900">Upload Lab Report</h2>
								<button
									onClick={closeUploadModal}
									className="text-gray-400 hover:text-gray-600 transition"
								>
									✕
								</button>
							</div>
							<p className="text-sm text-gray-600 mt-2">
								Test: {selectedTask?.test_type || 'N/A'}
							</p>
						</div>
						
						<div className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Upload Report File *
								</label>
								<label className="cursor-pointer inline-block">
									<span className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer">
										Choose File
									</span>
									<input
										type="file"
										onChange={handleFileSelect}
										accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
										className="hidden"
									/>
								</label>
								<p className="text-xs text-gray-500 mt-1">
									Accepted formats: PDF, Images, Word documents (Max 20MB)
								</p>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Remarks (Optional)
								</label>
								<textarea
									value={remarks}
									onChange={(e) => setRemarks(e.target.value)}
									rows={4}
									placeholder="Add any remarks or notes about this report..."
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							
							<div className="flex gap-3 pt-4">
								<button
									onClick={handleFileUpload}
									disabled={!selectedTask?.file || uploading}
									className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{uploading ? 'Uploading...' : 'Upload Report'}
								</button>
								<button
									onClick={closeUploadModal}
									className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Profile Modal */}
			{showProfileModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-gray-900">Edit Lab Profile</h2>
								<button
									onClick={() => {
										setShowProfileModal(false);
										loadProfileData();
									}}
									className="text-gray-400 hover:text-gray-600 transition"
								>
									✕
								</button>
							</div>
						</div>
						
						<form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Lab Name *
								</label>
								<input
									type="text"
									value={profileForm.name}
									onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Location
								</label>
								<input
									type="text"
									value={profileForm.location}
									onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Contact Information
								</label>
								<input
									type="text"
									value={profileForm.contact_info}
									onChange={(e) => setProfileForm({...profileForm, contact_info: e.target.value})}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Services (comma-separated)
								</label>
								<input
									type="text"
									value={profileForm.services}
									onChange={(e) => setProfileForm({...profileForm, services: e.target.value})}
									placeholder="e.g., Blood Tests, X-Ray, Ultrasound, ECG"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Separate multiple services with commas
								</p>
							</div>
							
							<div className="flex gap-3 pt-4">
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? 'Saving...' : 'Save Changes'}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowProfileModal(false);
										loadProfileData();
									}}
									className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

