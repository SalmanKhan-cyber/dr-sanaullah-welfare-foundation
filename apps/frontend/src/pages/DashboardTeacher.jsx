import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useVerification } from '../hooks/useVerification';

export default function DashboardTeacher() {
	const { verified, checking } = useVerification('teacher');
	const [activeTab, setActiveTab] = useState('dashboard');
	const [courses, setCourses] = useState([]);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [materials, setMaterials] = useState([]);
	const [announcements, setAnnouncements] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [students, setStudents] = useState([]);
	const [submissions, setSubmissions] = useState([]);
	const [userInfo, setUserInfo] = useState(null);
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	
	// Form states
	const [showMaterialModal, setShowMaterialModal] = useState(false);
	const [showViewMaterialModal, setShowViewMaterialModal] = useState(false);
	const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
	const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
	const [showAssignmentModal, setShowAssignmentModal] = useState(false);
	const [showGradeModal, setShowGradeModal] = useState(false);
	const [selectedSubmission, setSelectedSubmission] = useState(null);
	const [selectedMaterial, setSelectedMaterial] = useState(null);
	
	const [materialForm, setMaterialForm] = useState({ title: '', description: '', material_type: 'document', file: null });
	const [uploadingMaterial, setUploadingMaterial] = useState(false);
	const [updatingMaterial, setUpdatingMaterial] = useState(false);
	const [downloadingMaterialId, setDownloadingMaterialId] = useState(null);
	const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', priority: 'normal', is_pinned: false });
	const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', instructions: '', due_date: '', max_score: 100, assignment_type: 'homework', file: null });
	const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

	useEffect(() => {
		if (!checking && verified) {
			async function initialize() {
				// Wait for session to be ready
				const { data: { session } } = await supabase.auth.getSession();
				if (!session) return;
				
				// Load user info and dashboard data in parallel for better performance
				await Promise.all([
					loadUserInfo(),
					loadDashboardData()
				]);
				
				// Restore selected course from localStorage
				const savedCourse = localStorage.getItem('teacher_selected_course');
				if (savedCourse) {
					setSelectedCourse(savedCourse);
				}
			}
			
			initialize();
		}
	}, [verified, checking]);

	useEffect(() => {
		// Save selected course to localStorage
		if (selectedCourse) {
			localStorage.setItem('teacher_selected_course', selectedCourse);
		}
	}, [selectedCourse]);

	useEffect(() => {
		if (selectedCourse) {
			if (activeTab !== 'dashboard') {
			loadCourseData();
			} else {
				// Even on dashboard, load materials for stats
				loadMaterials();
			}
		}
	}, [selectedCourse, activeTab]);

	// Ensure materials are loaded when Materials tab is active
	useEffect(() => {
		if (activeTab === 'materials' && selectedCourse) {
			console.log('📚 Materials tab active, ensuring materials are loaded for course:', selectedCourse);
			loadMaterials();
		}
	}, [activeTab, selectedCourse]);

	async function loadUserInfo() {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				setUserInfo({
					name: user.user_metadata?.name || user.email?.split('@')[0] || 'Teacher',
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
			await loadCourses();
		} catch (err) {
			console.error('Failed to load dashboard data:', err);
		} finally {
			setInitialLoading(false);
		}
	}

	async function loadCourses() {
		try {
			const res = await apiRequest('/api/teacher/courses');
			const coursesList = res.courses || [];
			setCourses(coursesList);
			
			// Restore saved course or select first course
			if (coursesList.length > 0) {
				const savedCourse = localStorage.getItem('teacher_selected_course');
				const courseToSelect = savedCourse && coursesList.find(c => c.id === savedCourse)
					? savedCourse
					: coursesList[0].id;
				
				if (courseToSelect !== selectedCourse) {
					setSelectedCourse(courseToSelect);
				}
			}
		} catch (err) {
			console.error('Failed to load courses:', err);
			alert('Failed to load courses: ' + (err.message || 'Unknown error'));
		}
	}

	async function loadCourseData() {
		if (!selectedCourse) return;
		setLoading(true);
		try {
			await Promise.all([
				loadMaterials(),
				loadAnnouncements(),
				loadAssignments(),
				loadStudents()
			]);
		} catch (err) {
			console.error('Failed to load course data:', err);
		} finally {
			setLoading(false);
		}
	}

	async function loadMaterials() {
		if (!selectedCourse) {
			console.log('⚠️ Cannot load materials: no course selected');
			return;
		}
		try {
			console.log('📚 Loading materials for course:', selectedCourse);
			const res = await apiRequest(`/api/teacher/courses/${selectedCourse}/materials`);
			console.log('✅ Materials loaded:', res.materials?.length || 0, 'materials');
			
			// Log each material's file info for debugging
			if (res.materials && res.materials.length > 0) {
				res.materials.forEach((material, index) => {
					console.log(`   Material ${index + 1}:`, {
						id: material.id,
						title: material.title,
						has_file: !!material.file_url,
						file_url: material.file_url,
						file_name: material.file_name
					});
				});
			}
			
			setMaterials(res.materials || []);
		} catch (err) {
			console.error('❌ Failed to load materials:', err);
			// Don't show alert, just log - materials might not exist yet
		}
	}

	async function loadAnnouncements() {
		if (!selectedCourse) return;
		try {
			const res = await apiRequest(`/api/teacher/courses/${selectedCourse}/announcements`);
			setAnnouncements(res.announcements || []);
		} catch (err) {
			console.error('Failed to load announcements:', err);
		}
	}

	async function loadAssignments() {
		if (!selectedCourse) return;
		try {
			const res = await apiRequest(`/api/teacher/courses/${selectedCourse}/assignments`);
			setAssignments(res.assignments || []);
		} catch (err) {
			console.error('Failed to load assignments:', err);
		}
	}

	async function loadStudents() {
		if (!selectedCourse) return;
		try {
			const res = await apiRequest(`/api/teacher/courses/${selectedCourse}/students`);
			setStudents(res.students || []);
		} catch (err) {
			console.error('Failed to load students:', err);
		}
	}

	async function loadSubmissions(assignmentId) {
		try {
			const res = await apiRequest(`/api/teacher/assignments/${assignmentId}/submissions`);
			setSubmissions(res.submissions || []);
		} catch (err) {
			console.error('Failed to load submissions:', err);
		}
	}

	async function addMaterial(e) {
		e.preventDefault();
		
		// Validation
		if (!selectedCourse) {
			alert('Please select a course first');
			return;
		}
		
		if (!materialForm.title.trim()) {
			alert('Please enter a title');
			return;
		}
		
		setUploadingMaterial(true);
		
		try {
			const formData = new FormData();
			formData.append('title', materialForm.title.trim());
			formData.append('description', materialForm.description || '');
			formData.append('material_type', materialForm.material_type);
			
			if (materialForm.file) {
				formData.append('file', materialForm.file);
			}
			
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.access_token) {
				throw new Error('Not authenticated. Please log in again.');
			}
			
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teacher/courses/${selectedCourse}/materials`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`
				},
				body: formData
			});
			
			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to add material');
			}
			
			// Log the response to debug
			console.log('✅ Material added successfully:', result);
			console.log('📦 Material data:', {
				id: result.material?.id,
				title: result.material?.title,
				file_url: result.material?.file_url,
				file_name: result.material?.file_name,
				file_type: result.material?.file_type
			});
			
			// Success - reset form and reload materials
			setShowMaterialModal(false);
			setMaterialForm({ title: '', description: '', material_type: 'document', file: null });
			
			// Small delay to ensure backend has saved
			await new Promise(resolve => setTimeout(resolve, 500));
			
			await loadMaterials();
			
			if (result.material?.file_url || result.material?.file_name) {
				alert('Material added successfully!\n\nFile: ' + (result.material.file_name || 'Uploaded') + '\nThe file is now available for download.');
			} else if (materialForm.file) {
				alert('⚠️ Material added, but file upload may have failed.\n\nPlease check:\n1. The "course-materials" storage bucket exists in Supabase\n2. Check the backend console for error messages\n3. Try uploading the file again');
			} else {
				alert('Material added successfully! (No file attached)');
			}
		} catch (err) {
			console.error('Failed to add material:', err);
			alert(`Failed to add material: ${err.message || 'Unknown error'}`);
		} finally {
			setUploadingMaterial(false);
		}
	}

	async function deleteMaterial(id) {
		if (!confirm('Are you sure you want to delete this material?')) return;
		
		try {
			await apiRequest(`/api/teacher/materials/${id}`, { method: 'DELETE' });
			await loadMaterials();
			alert('Material deleted successfully!');
		} catch (err) {
			console.error('Failed to delete material:', err);
			alert('Failed to delete material: ' + (err.message || 'Unknown error'));
		}
	}

	async function updateMaterial(e) {
		e.preventDefault();
		if (!selectedMaterial) return;
		
		if (!materialForm.title.trim()) {
			alert('Please enter a title');
			return;
		}
		
		setUpdatingMaterial(true);
		
		try {
			// Update metadata only (title, description, type)
			// Note: File updates require deleting and re-adding
			const updateData = {
				title: materialForm.title.trim(),
				description: materialForm.description || '',
				material_type: materialForm.material_type
			};
			
			await apiRequest(`/api/teacher/materials/${selectedMaterial.id}`, {
				method: 'PUT',
				body: JSON.stringify(updateData)
			});
			
			setShowEditMaterialModal(false);
			setSelectedMaterial(null);
			setMaterialForm({ title: '', description: '', material_type: 'document', file: null });
			await loadMaterials();
			alert('Material updated successfully!');
		} catch (err) {
			console.error('Failed to update material:', err);
			alert('Failed to update material: ' + (err.message || 'Unknown error'));
		} finally {
			setUpdatingMaterial(false);
		}
	}

	function handleViewMaterial(material) {
		setSelectedMaterial(material);
		setShowViewMaterialModal(true);
	}

	function handleEditMaterial(material) {
		setSelectedMaterial(material);
		setMaterialForm({
			title: material.title,
			description: material.description || '',
			material_type: material.material_type || 'document',
			file: null
		});
		setShowEditMaterialModal(true);
	}

	async function downloadMaterial(material) {
		if (!material.file_url && !material.file_name) {
			alert('No file available to download');
			return;
		}
		
		if (downloadingMaterialId === material.id) {
			return;
		}
		
		setDownloadingMaterialId(material.id);
		
		try {
			// Get fresh signed URL from API
			let downloadUrl = material.file_url;
			
			if (material.file_url || material.file_name) {
				try {
					const res = await apiRequest(`/api/teacher/materials/${material.id}/url`);
					if (res && res.url) {
						downloadUrl = res.url;
					}
				} catch (err) {
					console.warn('Could not get fresh URL, using stored URL:', err);
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
			
			// Create download link
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

	async function addAnnouncement(e) {
		e.preventDefault();
		if (!selectedCourse) return;
		
		try {
			await apiRequest(`/api/teacher/courses/${selectedCourse}/announcements`, {
				method: 'POST',
				body: JSON.stringify(announcementForm)
			});
			setShowAnnouncementModal(false);
			setAnnouncementForm({ title: '', message: '', priority: 'normal', is_pinned: false });
			await loadAnnouncements();
		} catch (err) {
			console.error('Failed to add announcement:', err);
			alert('Failed to add announcement: ' + (err.message || 'Unknown error'));
		}
	}

	async function deleteAnnouncement(id) {
		if (!confirm('Are you sure you want to delete this announcement?')) return;
		
		try {
			await apiRequest(`/api/teacher/announcements/${id}`, { method: 'DELETE' });
			await loadAnnouncements();
		} catch (err) {
			console.error('Failed to delete announcement:', err);
			alert('Failed to delete announcement');
		}
	}

	async function addAssignment(e) {
		e.preventDefault();
		if (!selectedCourse) return;
		
		try {
			const formData = new FormData();
			formData.append('title', assignmentForm.title);
			formData.append('description', assignmentForm.description || '');
			formData.append('instructions', assignmentForm.instructions || '');
			formData.append('due_date', assignmentForm.due_date || '');
			formData.append('max_score', assignmentForm.max_score);
			formData.append('assignment_type', assignmentForm.assignment_type);
			if (assignmentForm.file) {
				formData.append('file', assignmentForm.file);
			}
			
			const { data: { session } } = await supabase.auth.getSession();
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teacher/courses/${selectedCourse}/assignments`, {
				method: 'POST',
				headers: {
					...(session?.access_token && { Authorization: `Bearer ${session.access_token}` })
				},
				body: formData
			});
			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: 'Upload failed' }));
				throw new Error(error.error || response.statusText);
			}
			await response.json();
			setShowAssignmentModal(false);
			setAssignmentForm({ title: '', description: '', instructions: '', due_date: '', max_score: 100, assignment_type: 'homework', file: null });
			await loadAssignments();
		} catch (err) {
			console.error('Failed to add assignment:', err);
			alert('Failed to add assignment: ' + (err.message || 'Unknown error'));
		}
	}

	async function deleteAssignment(id) {
		if (!confirm('Are you sure you want to delete this assignment?')) return;
		
		try {
			await apiRequest(`/api/teacher/assignments/${id}`, { method: 'DELETE' });
			await loadAssignments();
		} catch (err) {
			console.error('Failed to delete assignment:', err);
			alert('Failed to delete assignment');
		}
	}

	async function gradeSubmission(e) {
		e.preventDefault();
		if (!selectedSubmission) return;
		
		try {
			await apiRequest(`/api/teacher/submissions/${selectedSubmission.id}/grade`, {
				method: 'PUT',
				body: JSON.stringify({
					score: parseFloat(gradeForm.score),
					feedback: gradeForm.feedback || ''
				})
			});
			setShowGradeModal(false);
			setSelectedSubmission(null);
			setGradeForm({ score: '', feedback: '' });
			await loadSubmissions(selectedSubmission.assignment_id);
		} catch (err) {
			console.error('Failed to grade submission:', err);
			alert('Failed to grade submission: ' + (err.message || 'Unknown error'));
		}
	}

	const currentCourse = courses.find(c => c.id === selectedCourse);
	const stats = {
		totalCourses: courses.length,
		totalStudents: students.length,
		totalMaterials: materials.length,
		totalAssignments: assignments.length,
		pendingGrading: submissions.filter(s => s.status === 'submitted').length
	};

	if (initialLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					<p className="mt-4 text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
				{/* Header */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
								👨‍🏫 Teacher Dashboard
							</h1>
							{userInfo && (
								<p className="text-gray-600">Welcome back, {userInfo.name}!</p>
							)}
						</div>
						<div className="flex flex-col gap-2 min-w-[250px]">
							<label className="text-sm font-semibold text-gray-700">Select Course *</label>
							{courses.length === 0 ? (
								<div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
									<p className="text-sm text-gray-600 text-center">
										No courses assigned yet
									</p>
									<p className="text-xs text-gray-500 text-center mt-1">
										Contact admin to get assigned to a course
									</p>
								</div>
							) : (
								<select
									value={selectedCourse || ''}
									onChange={(e) => setSelectedCourse(e.target.value)}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
									required
								>
									<option value="">-- Select a Course --</option>
									{courses.map(course => (
										<option key={course.id} value={course.id}>{course.title}</option>
									))}
								</select>
							)}
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-white rounded-2xl shadow-lg mb-6 overflow-x-auto">
					<div className="flex gap-2 p-2 border-b border-gray-200">
						{['dashboard', 'materials', 'announcements', 'assignments', 'students'].map(tab => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
									activeTab === tab
										? 'bg-blue-600 text-white shadow-md'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								{tab === 'dashboard' && '📊 Dashboard'}
								{tab === 'materials' && '📚 Materials'}
								{tab === 'announcements' && '📢 Announcements'}
								{tab === 'assignments' && '📝 Assignments'}
								{tab === 'students' && '👥 Students'}
							</button>
						))}
					</div>
				</div>

				{/* Dashboard Tab */}
				{activeTab === 'dashboard' && (
					<div className="space-y-6">
						{/* Stats Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
							<div className="bg-white rounded-xl shadow-md p-6">
								<div className="text-3xl mb-2">📚</div>
								<div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
								<div className="text-sm text-gray-600">Total Courses</div>
							</div>
							<div className="bg-white rounded-xl shadow-md p-6">
								<div className="text-3xl mb-2">👥</div>
								<div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
								<div className="text-sm text-gray-600">Total Students</div>
							</div>
							<div className="bg-white rounded-xl shadow-md p-6">
								<div className="text-3xl mb-2">📄</div>
								<div className="text-2xl font-bold text-gray-900">{stats.totalMaterials}</div>
								<div className="text-sm text-gray-600">Materials</div>
							</div>
							<div className="bg-white rounded-xl shadow-md p-6">
								<div className="text-3xl mb-2">📝</div>
								<div className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</div>
								<div className="text-sm text-gray-600">Assignments</div>
							</div>
							<div className="bg-white rounded-xl shadow-md p-6">
								<div className="text-3xl mb-2">✅</div>
								<div className="text-2xl font-bold text-orange-600">{stats.pendingGrading}</div>
								<div className="text-sm text-gray-600">Pending Grading</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<button
									onClick={() => { setActiveTab('materials'); setShowMaterialModal(true); }}
									className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
								>
									<div className="text-2xl mb-2">📄</div>
									<div className="font-semibold text-gray-900">Add Material</div>
									<div className="text-sm text-gray-600">Upload course materials</div>
								</button>
								<button
									onClick={() => { setActiveTab('announcements'); setShowAnnouncementModal(true); }}
									className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
								>
									<div className="text-2xl mb-2">📢</div>
									<div className="font-semibold text-gray-900">Make Announcement</div>
									<div className="text-sm text-gray-600">Notify all students</div>
								</button>
								<button
									onClick={() => { setActiveTab('assignments'); setShowAssignmentModal(true); }}
									className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
								>
									<div className="text-2xl mb-2">📝</div>
									<div className="font-semibold text-gray-900">Create Assignment</div>
									<div className="text-sm text-gray-600">Add new assignment</div>
								</button>
							</div>
						</div>

						{/* Recent Activity */}
						{courses.length > 0 && (
							<div className="bg-white rounded-2xl shadow-lg p-6">
								<h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>
								<div className="space-y-3">
									{courses.map(course => (
										<div key={course.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-semibold text-gray-900">{course.title}</h3>
													<p className="text-sm text-gray-600">{course.description || 'No description'}</p>
												</div>
												<button
													onClick={() => {
														setSelectedCourse(course.id);
														setActiveTab('materials');
													}}
													className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
												>
													Manage
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Materials Tab */}
				{activeTab === 'materials' && (
					<div className="space-y-6">
						{!selectedCourse ? (
							<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
								<div className="text-6xl mb-4">📚</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">No Course Selected</h2>
								<p className="text-gray-600 mb-4">Please select a course from the dropdown at the top of the page to manage materials.</p>
							</div>
						) : (
							<div className="space-y-6">
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<h2 className="text-xl font-bold text-gray-900">Course Materials</h2>
										<button
											onClick={() => {
												if (!selectedCourse) {
													alert('Please select a course from the dropdown at the top of the page first');
													return;
												}
												setShowMaterialModal(true);
											}}
											className={`px-4 py-2 rounded-lg transition ${
												selectedCourse 
													? 'bg-blue-600 text-white hover:bg-blue-700' 
													: 'bg-gray-300 text-gray-500 cursor-not-allowed'
											}`}
											disabled={!selectedCourse}
										>
											+ Add Material
										</button>
									</div>
									{loading ? (
										<div className="text-center py-8">
											<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										</div>
									) : materials.length === 0 ? (
										<div className="text-center py-8 text-gray-500">
											No materials yet. Add your first material!
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{materials.map(material => (
												<div key={material.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
													<div className="flex items-start justify-between mb-3">
														<div className="text-3xl">
															{material.material_type === 'video' ? '🎥' : 
															 material.material_type === 'link' ? '🔗' : '📄'}
														</div>
														<div className="flex flex-wrap gap-2">
															<button
																type="button"
																onClick={() => handleViewMaterial(material)}
																className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs"
																title="View Details"
															>
																👁️ View
															</button>
															<button
																type="button"
																onClick={() => handleEditMaterial(material)}
																className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs"
																title="Edit Material"
															>
																✏️ Edit
															</button>
															{(material.file_url || material.file_name) && (
																<button
																	type="button"
																	onClick={(e) => {
																		e.preventDefault();
																		e.stopPropagation();
																		downloadMaterial(material);
																	}}
																	disabled={downloadingMaterialId === material.id}
																	className={`p-2 rounded-lg transition text-xs ${
																		downloadingMaterialId === material.id
																			? 'bg-gray-400 text-white cursor-not-allowed'
																			: 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer'
																	}`}
																	title={downloadingMaterialId === material.id ? "Downloading..." : "Download File"}
																>
																	{downloadingMaterialId === material.id ? '⏳...' : '⬇️ Download'}
																</button>
															)}
															<button
																type="button"
																onClick={() => deleteMaterial(material.id)}
																className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs"
																title="Delete Material"
															>
																🗑️ Delete
															</button>
														</div>
													</div>
													<h3 className="font-semibold text-gray-900 mb-2">{material.title}</h3>
													{material.description && (
														<p className="text-sm text-gray-600 mb-2 line-clamp-2">{material.description}</p>
													)}
													{material.file_name && (
														<div className="flex items-center gap-2 text-sm text-gray-600">
															<span>📎</span>
															<span className="truncate">{material.file_name}</span>
															{material.file_size && (
																<span className="text-xs text-gray-500">
																	({(material.file_size / 1024 / 1024).toFixed(2)} MB)
																</span>
															)}
														</div>
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

				{/* Announcements Tab */}
				{activeTab === 'announcements' && (
					<div className="space-y-6">
						{!selectedCourse ? (
							<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
								<div className="text-6xl mb-4">📢</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">No Course Selected</h2>
								<p className="text-gray-600 mb-4">Please select a course from the dropdown at the top of the page to create announcements.</p>
							</div>
						) : (
							<div className="space-y-6">
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<h2 className="text-xl font-bold text-gray-900">Announcements</h2>
										<button
											onClick={() => setShowAnnouncementModal(true)}
											className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
										>
											+ New Announcement
										</button>
									</div>
									{loading ? (
										<div className="text-center py-8">
											<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										</div>
									) : announcements.length === 0 ? (
										<div className="text-center py-8 text-gray-500">
											No announcements yet. Create your first announcement!
										</div>
									) : (
										<div className="space-y-4">
											{announcements.map(announcement => (
												<div key={announcement.id} className={`border rounded-xl p-4 ${announcement.is_pinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
													<div className="flex items-start justify-between mb-2">
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-1">
																{announcement.is_pinned && <span className="text-yellow-500">📌</span>}
																<h3 className="font-semibold text-gray-900">{announcement.title}</h3>
																<span className={`text-xs px-2 py-1 rounded ${
																	announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
																	announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
																	'bg-gray-100 text-gray-800'
																}`}>
																	{announcement.priority}
																</span>
															</div>
															<p className="text-gray-700 mb-2">{announcement.message}</p>
															<p className="text-xs text-gray-500">
																{new Date(announcement.created_at).toLocaleString()}
															</p>
														</div>
														<button
															onClick={() => deleteAnnouncement(announcement.id)}
															className="text-red-600 hover:text-red-800 ml-4"
														>
															🗑️
														</button>
													</div>
												</div>
											))}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}

				{/* Assignments Tab */}
				{activeTab === 'assignments' && (
					<div className="space-y-6">
						{!selectedCourse ? (
							<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
								<div className="text-6xl mb-4">📝</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">No Course Selected</h2>
								<p className="text-gray-600 mb-4">Please select a course from the dropdown at the top of the page to create assignments.</p>
							</div>
						) : (
							<div className="space-y-6">
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<h2 className="text-xl font-bold text-gray-900">Assignments</h2>
										<button
											onClick={() => setShowAssignmentModal(true)}
											className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
										>
											+ Create Assignment
										</button>
									</div>
									{loading ? (
										<div className="text-center py-8">
											<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										</div>
									) : assignments.length === 0 ? (
										<div className="text-center py-8 text-gray-500">
											No assignments yet. Create your first assignment!
										</div>
									) : (
										<div className="space-y-4">
											{assignments.map(assignment => (
												<div key={assignment.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
													<div className="flex items-start justify-between mb-2">
														<div className="flex-1">
															<h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
															{assignment.description && (
																<p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
															)}
															<div className="flex flex-wrap gap-2 text-xs text-gray-500">
																{assignment.due_date && (
																	<span>📅 Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
																)}
																<span>Max Score: {assignment.max_score}</span>
																<span>Type: {assignment.assignment_type}</span>
															</div>
														</div>
														<div className="flex gap-2">
															<button
																onClick={async () => {
																	setSelectedSubmission(null);
																	await loadSubmissions(assignment.id);
																	setActiveTab('students');
																}}
																className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
															>
																View Submissions
															</button>
															<button
																onClick={() => deleteAssignment(assignment.id)}
																className="text-red-600 hover:text-red-800"
															>
																🗑️
															</button>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Students Tab */}
				{activeTab === 'students' && (
					<div className="space-y-6">
						{!selectedCourse ? (
							<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
								<div className="text-6xl mb-4">👥</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">No Course Selected</h2>
								<p className="text-gray-600 mb-4">Please select a course from the dropdown at the top of the page to view students.</p>
							</div>
						) : (
							<div className="space-y-6">
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<h2 className="text-xl font-bold text-gray-900 mb-4">Enrolled Students</h2>
									{loading ? (
										<div className="text-center py-8">
											<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										</div>
									) : students.length === 0 ? (
										<div className="text-center py-8 text-gray-500">
											No students enrolled yet.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead>
													<tr className="border-b border-gray-200">
														<th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
														<th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
														<th className="text-left p-3 text-sm font-semibold text-gray-700">Progress</th>
													</tr>
												</thead>
												<tbody>
													{students.map((student) => (
														<tr key={student.user_id} className="border-b border-gray-100 hover:bg-gray-50">
															<td className="p-3 text-sm text-gray-900">{student.users?.name || 'N/A'}</td>
															<td className="p-3 text-sm text-gray-600">{student.users?.email || 'N/A'}</td>
															<td className="p-3 text-sm text-gray-600">{student.progress || 0}%</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</div>

								{/* Submissions */}
								{submissions.length > 0 && (
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Submissions</h2>
										<div className="space-y-4">
											{submissions.map(submission => (
												<div key={submission.id} className="border border-gray-200 rounded-xl p-4">
													<div className="flex items-start justify-between mb-2">
														<div className="flex-1">
															<h3 className="font-semibold text-gray-900 mb-1">
																{submission.student?.name || 'Unknown Student'}
															</h3>
															<p className="text-sm text-gray-600 mb-2">
																Submitted: {new Date(submission.submitted_at).toLocaleString()}
															</p>
															{submission.submission_text && (
																<p className="text-sm text-gray-700 mb-2">{submission.submission_text}</p>
															)}
															{submission.file_name && (
																<a
																	href={submission.file_url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-sm text-blue-600 hover:underline"
																>
																	📎 {submission.file_name}
																</a>
															)}
															{submission.status === 'graded' && (
																<div className="mt-2">
																	<p className="text-sm font-semibold text-green-600">
																		Score: {submission.score} / {submission.max_score || 100}
																	</p>
																	{submission.feedback && (
																		<p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
																	)}
																</div>
															)}
														</div>
														{submission.status === 'submitted' && (
															<button
																onClick={() => {
																	setSelectedSubmission(submission);
																	setGradeForm({ score: '', feedback: '' });
																	setShowGradeModal(true);
																}}
																className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
															>
																Grade
															</button>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Modals */}
				{/* View Material Modal */}
				{showViewMaterialModal && selectedMaterial && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-2xl font-bold text-gray-900">Material Details</h2>
									<button
										onClick={() => {
											setShowViewMaterialModal(false);
											setSelectedMaterial(null);
										}}
										className="text-gray-500 hover:text-gray-700 text-2xl"
									>
										✕
									</button>
								</div>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
										<p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">{selectedMaterial.title}</p>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
										<p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[60px]">
											{selectedMaterial.description || 'No description provided'}
										</p>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
										<p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 capitalize">{selectedMaterial.material_type}</p>
									</div>
									{selectedMaterial.file_name && (
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">File</label>
											<div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<span className="text-2xl">
															{selectedMaterial.file_type?.includes('video') ? '🎥' : 
															 selectedMaterial.file_type?.includes('pdf') ? '📕' :
															 selectedMaterial.file_type?.includes('image') ? '🖼️' : '📎'}
														</span>
														<div>
															<p className="font-medium text-gray-900">{selectedMaterial.file_name}</p>
															{selectedMaterial.file_size && (
																<p className="text-xs text-gray-500">
																	{(selectedMaterial.file_size / 1024 / 1024).toFixed(2)} MB
																</p>
															)}
														</div>
													</div>
												</div>
												<div className="flex gap-2">
													<button
														type="button"
														onClick={async () => {
															if (selectedMaterial.file_url) {
																try {
																	const res = await apiRequest(`/api/teacher/materials/${selectedMaterial.id}/url`);
																	window.open(res.url, '_blank', 'noopener,noreferrer');
																} catch (err) {
																	window.open(selectedMaterial.file_url, '_blank', 'noopener,noreferrer');
																}
															} else {
																alert('File URL not available');
															}
														}}
														className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
													>
														🔓 Open File
													</button>
													{(selectedMaterial.file_url || selectedMaterial.file_name) && (
														<button
															type="button"
															onClick={(e) => {
																e.preventDefault();
																downloadMaterial(selectedMaterial);
															}}
															disabled={downloadingMaterialId === selectedMaterial.id}
															className={`flex-1 px-4 py-2 rounded-lg transition font-semibold ${
																downloadingMaterialId === selectedMaterial.id
																	? 'bg-gray-400 text-white cursor-not-allowed'
																	: 'bg-green-600 text-white hover:bg-green-700'
															}`}
														>
															{downloadingMaterialId === selectedMaterial.id ? '⏳...' : '⬇️ Download'}
														</button>
													)}
												</div>
											</div>
										</div>
									)}
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Created</label>
										<p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
											{new Date(selectedMaterial.created_at).toLocaleString()}
										</p>
									</div>
									<div className="flex gap-4 pt-4">
										<button
											type="button"
											onClick={() => {
												setShowViewMaterialModal(false);
												handleEditMaterial(selectedMaterial);
											}}
											className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
										>
											✏️ Edit Material
										</button>
										<button
											type="button"
											onClick={() => {
												setShowViewMaterialModal(false);
												setSelectedMaterial(null);
											}}
											className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
										>
											Close
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Edit Material Modal */}
				{showEditMaterialModal && selectedMaterial && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-2xl font-bold text-gray-900">Edit Course Material</h2>
									<button
										onClick={() => {
											setShowEditMaterialModal(false);
											setSelectedMaterial(null);
											setMaterialForm({ title: '', description: '', material_type: 'document', file: null });
										}}
										className="text-gray-500 hover:text-gray-700 text-2xl"
									>
										✕
									</button>
								</div>
								{selectedCourse && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
										<p className="text-blue-800 text-sm">
											📚 Editing material for: <strong>{courses.find(c => c.id === selectedCourse)?.title || 'Selected Course'}</strong>
										</p>
									</div>
								)}
								{selectedMaterial.file_name && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
										<p className="text-yellow-800 text-sm">
											⚠️ <strong>Note:</strong> To change the file, please delete this material and add a new one. You can only update the title, description, and type.
										</p>
										<p className="text-yellow-700 text-xs mt-1">
											Current file: {selectedMaterial.file_name}
										</p>
									</div>
								)}
								<form onSubmit={updateMaterial} className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
										<input
											type="text"
											required
											value={materialForm.title}
											onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
										<textarea
											value={materialForm.description}
											onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows="3"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
										<select
											value={materialForm.material_type}
											onChange={(e) => setMaterialForm({...materialForm, material_type: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="document">Document</option>
											<option value="video">Video</option>
											<option value="link">Link</option>
											<option value="other">Other</option>
										</select>
									</div>
									<div className="flex gap-4">
										<button
											type="submit"
											disabled={updatingMaterial}
											className={`flex-1 px-4 py-2 rounded-lg transition ${
												updatingMaterial
													? 'bg-gray-300 text-gray-500 cursor-not-allowed'
													: 'bg-green-600 text-white hover:bg-green-700'
											}`}
										>
											{updatingMaterial ? 'Updating...' : 'Update Material'}
										</button>
										<button
											type="button"
											onClick={() => {
												setShowEditMaterialModal(false);
												setSelectedMaterial(null);
												setMaterialForm({ title: '', description: '', material_type: 'document', file: null });
											}}
											className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}

				{/* Add Material Modal */}
				{showMaterialModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-2xl font-bold text-gray-900">Add Course Material</h2>
									<button
										onClick={() => setShowMaterialModal(false)}
										className="text-gray-500 hover:text-gray-700 text-2xl"
									>
										✕
									</button>
								</div>
								{!selectedCourse ? (
									<div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
										<p className="text-yellow-800 font-semibold mb-2">⚠️ No Course Selected</p>
										<p className="text-yellow-700 text-sm mb-3">
											You must select a course from the dropdown at the top of the page before adding materials.
										</p>
										{courses.length > 0 ? (
											<div className="mt-3 p-3 bg-white rounded border border-yellow-300">
												<p className="text-xs text-yellow-700 mb-2 font-semibold">Quick Select:</p>
												<select
													value={selectedCourse || ''}
													onChange={(e) => {
														setSelectedCourse(e.target.value);
													}}
													className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-sm"
												>
													<option value="">-- Select a Course --</option>
													{courses.map(course => (
														<option key={course.id} value={course.id}>{course.title}</option>
													))}
												</select>
											</div>
										) : (
											<p className="text-xs text-yellow-600 italic">
												No courses available. Contact admin to get assigned to a course.
											</p>
										)}
									</div>
								) : (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
										<p className="text-blue-800 text-sm">
											📚 Adding material to: <strong>{courses.find(c => c.id === selectedCourse)?.title || 'Selected Course'}</strong>
										</p>
									</div>
								)}
								<form onSubmit={addMaterial} className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
										<input
											type="text"
											required
											value={materialForm.title}
											onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
										<textarea
											value={materialForm.description}
											onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows="3"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
										<select
											value={materialForm.material_type}
											onChange={(e) => setMaterialForm({...materialForm, material_type: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="document">Document</option>
											<option value="video">Video</option>
											<option value="link">Link</option>
											<option value="other">Other</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">File (Optional)</label>
										<label className="cursor-pointer inline-block">
											<span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
												Choose File
											</span>
											<input
												type="file"
												onChange={(e) => setMaterialForm({...materialForm, file: e.target.files[0]})}
												className="hidden"
												accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.txt,.zip"
											/>
										</label>
										{materialForm.file && (
											<p className="mt-2 text-sm text-gray-600">
												Selected: {materialForm.file.name} ({(materialForm.file.size / 1024 / 1024).toFixed(2)} MB)
											</p>
										)}
									</div>
									<div className="flex gap-4">
										<button
											type="submit"
											disabled={uploadingMaterial || !selectedCourse}
											className={`flex-1 px-4 py-2 rounded-lg transition ${
												uploadingMaterial || !selectedCourse
													? 'bg-gray-300 text-gray-500 cursor-not-allowed'
													: 'bg-blue-600 text-white hover:bg-blue-700'
											}`}
										>
											{uploadingMaterial ? 'Adding...' : 'Add Material'}
										</button>
										<button
											type="button"
											onClick={() => {
												setShowMaterialModal(false);
												setMaterialForm({ title: '', description: '', material_type: 'document', file: null });
											}}
											className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}

				{/* Announcement Modal */}
				{showAnnouncementModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Create Announcement</h2>
								<form onSubmit={addAnnouncement} className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
										<input
											type="text"
											required
											value={announcementForm.title}
											onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
										<textarea
											required
											value={announcementForm.message}
											onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows="5"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
											<select
												value={announcementForm.priority}
												onChange={(e) => setAnnouncementForm({...announcementForm, priority: e.target.value})}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											>
												<option value="low">Low</option>
												<option value="normal">Normal</option>
												<option value="high">High</option>
												<option value="urgent">Urgent</option>
											</select>
										</div>
										<div className="flex items-center pt-8">
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={announcementForm.is_pinned}
													onChange={(e) => setAnnouncementForm({...announcementForm, is_pinned: e.target.checked})}
													className="w-4 h-4"
												/>
												<span className="text-sm font-semibold text-gray-700">Pin to top</span>
											</label>
										</div>
									</div>
									<div className="flex gap-4">
										<button
											type="submit"
											className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
										>
											Post Announcement
										</button>
										<button
											type="button"
											onClick={() => {
												setShowAnnouncementModal(false);
												setAnnouncementForm({ title: '', message: '', priority: 'normal', is_pinned: false });
											}}
											className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}

				{/* Assignment Modal */}
				{showAssignmentModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Create Assignment</h2>
								<form onSubmit={addAssignment} className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
										<input
											type="text"
											required
											value={assignmentForm.title}
											onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
										<textarea
											value={assignmentForm.description}
											onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows="3"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
										<textarea
											value={assignmentForm.instructions}
											onChange={(e) => setAssignmentForm({...assignmentForm, instructions: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows="4"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
											<input
												type="datetime-local"
												value={assignmentForm.due_date}
												onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											/>
										</div>
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">Max Score</label>
											<input
												type="number"
												value={assignmentForm.max_score}
												onChange={(e) => setAssignmentForm({...assignmentForm, max_score: e.target.value})}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											/>
										</div>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
										<select
											value={assignmentForm.assignment_type}
											onChange={(e) => setAssignmentForm({...assignmentForm, assignment_type: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="homework">Homework</option>
											<option value="quiz">Quiz</option>
											<option value="project">Project</option>
											<option value="exam">Exam</option>
											<option value="other">Other</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Assignment File (Optional)</label>
										<input
											type="file"
											onChange={(e) => setAssignmentForm({...assignmentForm, file: e.target.files[0]})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div className="flex gap-4">
										<button
											type="submit"
											className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
										>
											Create Assignment
										</button>
										<button
											type="button"
											onClick={() => {
												setShowAssignmentModal(false);
												setAssignmentForm({ title: '', description: '', instructions: '', due_date: '', max_score: 100, assignment_type: 'homework', file: null });
											}}
											className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}

				{/* Grade Modal */}
				{showGradeModal && selectedSubmission && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
							<div className="p-6">
								<h2 className="text-2xl font-bold text-gray-900 mb-4">Grade Submission</h2>
								<form onSubmit={gradeSubmission} className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Score *</label>
										<input
											type="number"
											required
											min="0"
											value={gradeForm.score}
											onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
										<textarea
											value={gradeForm.feedback}
											onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows="5"
										/>
									</div>
									<div className="flex gap-4">
										<button
											type="submit"
											className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
										>
											Submit Grade
										</button>
										<button
											type="button"
											onClick={() => {
												setShowGradeModal(false);
												setSelectedSubmission(null);
												setGradeForm({ score: '', feedback: '' });
											}}
											className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
