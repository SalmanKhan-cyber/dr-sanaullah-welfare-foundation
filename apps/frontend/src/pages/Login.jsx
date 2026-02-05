import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

export default function Login() {
	const [mode, setMode] = useState('login'); // 'login' or 'signup'
	const [method, setMethod] = useState('email'); // 'email' or 'phone'
	const [step, setStep] = useState(1); // 1: credentials, 2: role selection, 3: profile details (for some roles)
	
	// Form fields - Basic
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [phone, setPhone] = useState('');
	const [otp, setOtp] = useState('');
	const [selectedRole, setSelectedRole] = useState('');
	
	// Form fields - Patient Profile
	const [age, setAge] = useState('');
	const [gender, setGender] = useState('');
	const [cnic, setCnic] = useState('');
	const [medicalHistory, setMedicalHistory] = useState('');
	
	// Form fields - Doctor Profile
	const [specialization, setSpecialization] = useState('');
	const [degrees, setDegrees] = useState('');
	const [consultationFee, setConsultationFee] = useState('');
	const [discountRate, setDiscountRate] = useState('50');
	const [timing, setTiming] = useState('');
	const [profileImage, setProfileImage] = useState(null);
	const [profileImagePreview, setProfileImagePreview] = useState('');
	const [uploadingImage, setUploadingImage] = useState(false);
	
	// Lab registration fields
	const [labName, setLabName] = useState('');
	const [labLocation, setLabLocation] = useState('');
	const [labContactInfo, setLabContactInfo] = useState('');
	const [labServices, setLabServices] = useState('');
	
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [availableRoles, setAvailableRoles] = useState([]);
	const [showRoleSelection, setShowRoleSelection] = useState(false);
	const [selectedLoginRole, setSelectedLoginRole] = useState(''); // Role selected for login
	
	const navigate = useNavigate();

	const roles = [
		{ id: 'admin', name: 'Admin', icon: '🧑‍💼', desc: 'Manage all system features and users' },
		{ id: 'patient', name: 'Patient', icon: '🩺', desc: 'Access medical services with discounts' },
		{ id: 'doctor', name: 'Doctor', icon: '👨‍⚕️', desc: 'Register as a healthcare provider' },
		{ id: 'donor', name: 'Donor', icon: '💰', desc: 'Make donations and track impact' },
		{ id: 'lab', name: 'Laboratory', icon: '🧪', desc: 'Register your laboratory and manage reports' },
		{ id: 'student', name: 'Student', icon: '🎓', desc: 'Enroll in courses with discounts' },
		{ id: 'teacher', name: 'Teacher', icon: '👨‍🏫', desc: 'Create and manage courses' },
	];

	async function handleEmailLogin(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		
		try {
			// Validate inputs
			if (!email || !password) {
				setError('Please enter both email and password');
				setLoading(false);
				return;
			}

			const { data, error } = await supabase.auth.signInWithPassword({ 
				email: email.trim(), 
				password 
			});
			
			if (error) {
				console.error('Supabase login error:', error);
				throw error;
			}
			
		if (!data?.user) {
			throw new Error('Login failed: No user data received');
		}
		
		// Refresh session to get latest user data
		await supabase.auth.refreshSession();
		
		// Get fresh user data
		const { data: { user: freshUser } } = await supabase.auth.getUser();
		
		// Get user role from metadata and database; prefer database if present
		const roleFromMetadata = freshUser?.user_metadata?.role || data.user?.user_metadata?.role;
		let role = roleFromMetadata;
		console.log('🔍 Role from user_metadata:', roleFromMetadata);
		
		// Check if user has multiple roles/profiles
		let userRoles = [];
		try {
			const rolesRes = await apiRequest('/api/auth/user-roles');
			userRoles = rolesRes.roles || [];
			console.log('🔍 User roles found:', userRoles);
		} catch (rolesErr) {
			console.warn('Could not fetch user roles initially:', rolesErr);
		}
		
		// Always check users table for authoritative role
		try {
			const { data: userData, error: userError } = await supabase
				.from('users')
				.select('role')
				.eq('id', freshUser?.id || data.user.id)
				.single();
			
			console.log('🔍 Role from users table:', userData?.role, 'Error:', userError);
			if (!userError && userData?.role) {
				role = userData.role;
				// If metadata mismatches, try to sync it via backend
				if (roleFromMetadata && roleFromMetadata !== userData.role) {
					try {
						await apiRequest('/api/auth/set-role', {
							method: 'POST',
							body: JSON.stringify({ userId: freshUser?.id || data.user.id, role: userData.role, name: freshUser?.user_metadata?.name, email: freshUser?.email || data.user.email })
						});
						console.log('🔁 Synced mismatched role to auth metadata');
					} catch (syncErr) {
						console.warn('⚠️ Failed to sync role to auth metadata:', syncErr);
					}
				}
			} else if (userError) {
				console.warn('⚠️ Could not fetch role from users table:', userError.message);
			}
		} catch (err) {
			console.error('Error fetching role from users table:', err);
		}
		
		// Process role selection - automatically select primary role
		try {
			// Get role from users table (authoritative source)
			let dbRole = role;
			try {
				const { data: userData } = await supabase
					.from('users')
					.select('role')
					.eq('id', freshUser?.id || data.user.id)
					.single();
				if (userData?.role) {
					dbRole = userData.role;
					console.log('🔍 Database role:', dbRole);
				}
			} catch (dbErr) {
				console.warn('Could not fetch role from database:', dbErr);
			}
			
			// Normalize role names for comparison (handle both underscore and hyphen formats)
			const normalizeRole = (r) => {
				if (!r) return r;
				return r.replace(/-/g, '_').toLowerCase();
			};
			
			// PRIORITY 1: Use database role as primary (most reliable)
			if (dbRole) {
				role = dbRole;
				console.log('✅ Using primary database role:', role);
			}
			// PRIORITY 2: If user selected a specific role for login, verify and use it
			else if (selectedLoginRole) {
				const normalizedSelected = normalizeRole(selectedLoginRole);
				const normalizedUserRoles = userRoles.map(r => normalizeRole(r.role));
				
				// Convert selected role to database format (hyphen to underscore)
				const selectedRoleDbFormat = selectedLoginRole.replace(/-/g, '_');
				
				// Check if user has this role in their available roles
				const hasSelectedRole = normalizedUserRoles.includes(normalizedSelected);
				
				console.log('🔍 Role selection check:', {
					selectedLoginRole,
					selectedRoleDbFormat,
					hasSelectedRole,
					userRoles: userRoles.map(r => r.role)
				});
				
				if (hasSelectedRole) {
					role = selectedRoleDbFormat;
					console.log('✅ Using selected login role (found in available roles):', role);
					
					// Update database role to match selection
					try {
						await apiRequest('/api/auth/set-role', {
							method: 'POST',
							body: JSON.stringify({ 
								userId: freshUser?.id || data.user.id, 
								role: role,
								email: freshUser?.email || data.user.email
							})
						});
						console.log('✅ Role updated in database');
					} catch (switchErr) {
						console.warn('⚠️ Could not update role, but continuing:', switchErr);
					}
				} else {
					// User doesn't have this role, deny access
					throw new Error(`You do not have access to the ${selectedLoginRole} dashboard. Please contact an administrator.`);
				}
			}
			// PRIORITY 3: Use first available role if user has roles
			else if (userRoles.length > 0) {
				// Find primary role or use first available
				const primaryRole = userRoles.find(r => r.isPrimary) || userRoles[0];
				role = primaryRole.role;
				console.log('✅ Using available role:', role);
			}
			// PRIORITY 4: Fallback to metadata role or patient
			else {
				role = role || 'patient';
				console.log('✅ Using fallback role:', role);
			}
		} catch (rolesErr) {
			console.warn('Could not process user roles, using default:', rolesErr);
			role = role || 'patient';
		}
		
		// Convert role to URL format (underscore to hyphen for URLs)
		const roleToUrl = (r) => {
			if (!r) return r;
			return r.replace(/_/g, '-');
		};
		
		const dashboardPath = roleToUrl(role);
		console.log('✅ Final role determined:', role, 'Redirecting to:', `/dashboard/${dashboardPath}`);
		
		// Check for returnUrl in query params
		const urlParams = new URLSearchParams(window.location.search);
		const returnUrl = urlParams.get('returnUrl');
		
		setSuccess('Login successful! Redirecting...');
		// If returnUrl exists, redirect there; otherwise go to dashboard
		const redirectPath = returnUrl || `/dashboard/${dashboardPath}`;
		setTimeout(() => navigate(redirectPath), 1500);
		} catch (err) {
			console.error('Login error:', err);
			// Provide more helpful error messages
			if (err.message?.includes('fetch')) {
				setError('Network error: Unable to connect to authentication server. Please check your internet connection and try again.');
			} else if (err.message?.includes('Invalid login credentials')) {
				setError('Invalid email or password. Please check your credentials and try again.');
			} else {
				setError(err.message || 'Login failed. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleEmailSignup(e) {
		e.preventDefault();
		if (!selectedRole) {
			setError('Please select your role');
			return;
		}
		
		// Lab uses special registration endpoint
		if (selectedRole === 'lab') {
			await handleLabRegistration(e);
			return;
		}
		
		// For roles that need profile completion, validation is done in their specific handlers
		// For simple roles, create account directly
		if (selectedRole !== 'patient' && selectedRole !== 'doctor' && selectedRole !== 'teacher') {
			await createAccount();
		}
	}

	async function createAccount(profileData = {}) {
		setLoading(true);
		setError('');
		try {
			let userId;
			let isNewUser = false;

			// Determine if using email or phone
			const userIdentifier = method === 'email' ? email : phone;
			const isEmailMethod = method === 'email';
			
			console.log('🔐 Starting account creation:', { 
				method, 
				identifier: userIdentifier, 
				hasPassword: !!password, 
				passwordLength: password?.length,
				role: selectedRole,
				name
			});

			// Email is ALWAYS required (validation already checked this in handleProfileCompletion)
			if (!email || !email.trim()) {
				throw new Error('Email address is required for registration. Please enter your email address.');
			}
			
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const emailForSignup = email.trim();
			if (!emailRegex.test(emailForSignup)) {
				throw new Error('Invalid email format. Please enter a valid email address (e.g., name@example.com).');
			}
			
			// ALWAYS use backend endpoint (more reliable and consistent)
			console.log('📧 Using backend email signup endpoint with:', { 
				email: emailForSignup, 
				hasPassword: !!password, 
				passwordLength: password?.length,
				role: selectedRole, 
				name 
			});
			
			try {
				const backendRes = await apiRequest('/api/auth/signup-email', {
					method: 'POST',
					body: JSON.stringify({ 
						email: emailForSignup, 
						password, 
						role: selectedRole, 
						name: name || null
					})
				});
				
				userId = backendRes.user?.id;
				if (userId) {
					console.log('✅ User created via backend:', userId);
					isNewUser = true;
				} else {
					throw new Error('Backend signup succeeded but no user ID returned. Please contact support.');
				}
			} catch (backendErr) {
				console.error('❌ Backend signup error:', backendErr);
				
				// Extract error message from backend response
				const errorText = backendErr?.error || backendErr?.message || backendErr?.toString() || 'Unknown error';
				
				// Handle specific error cases
				if (errorText.includes('already registered') || errorText.includes('already exists') || errorText.includes('User already registered') || errorText.includes('Email already registered')) {
					// User already exists - the backend now handles this and creates additional profile
					// Try to sign in to get the user ID
					console.warn('⚠️ User already registered, backend should handle multi-role profile creation...');
					
					try {
						const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
							email: emailForSignup,
							password
						});
						
						if (signInError) {
							if (signInError.message?.includes('Invalid login credentials') || signInError.message?.includes('Invalid password')) {
								throw new Error('An account with this email already exists, but the password is incorrect. Please use the correct password or reset it.');
							} else if (signInError.message?.includes('Email not confirmed')) {
								throw new Error('An account with this email exists but is not verified. Please check your email for verification link or contact support.');
							}
							throw new Error('Account exists but sign-in failed: ' + signInError.message);
						}
						
						userId = signInData.user.id;
						console.log('✅ Using existing user for additional role profile:', userId);
						isNewUser = false; // This is an additional profile, not a new user
						
						// Note: Backend already created the profile, we just need to create role-specific profile data
						// Don't change the primary role in users table - allow multiple roles
					} catch (signInErr) {
						throw new Error(signInErr.message || 'Failed to sign in with existing account.');
					}
				} else if (errorText.includes('email') || errorText.includes('Email')) {
					throw new Error(`Invalid email address: "${emailForSignup}". Please check your email format and try again.`);
				} else if (errorText.includes('password') || errorText.includes('Password')) {
					throw new Error(`Password issue: ${errorText}. Please use a password with at least 6 characters.`);
				} else if (errorText.includes('Anonymous') || errorText.includes('sign-ins are disabled')) {
					throw new Error('Registration service configuration issue. Please try again in a few moments or contact support.');
				} else {
					// Generic error - provide helpful message
					const detailedError = errorText.replace(/^Error: /, '');
					throw new Error(`Registration failed: ${detailedError}. Please ensure all fields are filled correctly and try again.`);
				}
			}
			
			// Set role via backend API (this updates the users table)
			// CRITICAL: This must succeed to ensure correct role is set
			try {
				const roleRes = await apiRequest('/api/auth/set-role', {
					method: 'POST',
					body: JSON.stringify({ userId, role: selectedRole, name, email: emailForSignup })
				});
				console.log(`✅ Role set successfully to: ${selectedRole}`, roleRes);
			} catch (apiErr) {
				console.error('❌ Role setting via API failed:', apiErr);
				// If role setting fails, try to verify what role is in database
				try {
					const { data: userCheck } = await supabase
						.from('users')
						.select('role')
						.eq('id', userId)
						.single();
					
					if (userCheck?.role !== selectedRole) {
						console.error(`⚠️ Role mismatch! Database has: ${userCheck?.role}, Expected: ${selectedRole}`);
						// Try one more time with force update
						try {
							await apiRequest('/api/auth/set-role', {
								method: 'POST',
								body: JSON.stringify({ userId, role: selectedRole, name, email: emailForSignup })
							});
							console.log('✅ Role set on retry');
						} catch (retryErr) {
							console.error('❌ Role setting failed on retry:', retryErr);
							throw new Error(`Failed to set role to ${selectedRole}. Please contact support.`);
						}
					}
				} catch (checkErr) {
					console.error('Could not verify role:', checkErr);
					// Continue anyway - might work on next login
				}
			}
			
			// Create profile based on selected role
			if (selectedRole === 'patient' && Object.keys(profileData).length > 0) {
				try {
					// Include name and phone from registration form if available
					await apiRequest('/api/patients/profile', {
						method: 'POST',
						body: JSON.stringify({
							userId,
							name: name || null, // Include name from registration
							phone: phone || null, // Include phone from registration
							...profileData
						})
					});
					console.log('✅ Patient profile created with name and phone');
				} catch (apiErr) {
					console.error('Patient profile creation failed:', apiErr);
					// Don't throw - profile might already exist, which is fine for multiple profiles
				}
			}
			
			if (selectedRole === 'doctor' && Object.keys(profileData).length > 0) {
				try {
					// Upload image if provided
					let imageUrl = null;
					if (profileData.profileImage) {
						setUploadingImage(true);
						try {
							console.log('📸 Starting image upload for doctor registration:', {
								fileName: profileData.profileImage.name,
								fileSize: profileData.profileImage.size,
								fileType: profileData.profileImage.type,
								userId: userId
							});
							
							const formData = new FormData();
							formData.append('image', profileData.profileImage);
							formData.append('userId', userId);
							
							const uploadRes = await apiRequest('/api/upload/profile-image', {
								method: 'POST',
								body: formData
							});
							
							console.log('✅ Image upload successful:', uploadRes);
							imageUrl = uploadRes.url;
						} catch (uploadErr) {
							console.error('❌ Image upload failed:', uploadErr);
							console.warn('Image upload failed, backend will assign random avatar:', uploadErr);
							// Continue - backend will assign random avatar
						} finally {
							setUploadingImage(false);
						}
					} else {
						console.log('📸 No profile image provided, backend will assign random avatar');
					}
					
					// Remove profileImage from profileData before sending
					const { profileImage, ...doctorData } = profileData;
					
					await apiRequest('/api/doctors/profile', {
						method: 'POST',
						body: JSON.stringify({
							userId,
							name,
							...doctorData,
							image_url: imageUrl // Will be null if upload failed, backend assigns random
						})
					});
					console.log('✅ Doctor profile created with image_url:', imageUrl);
				} catch (apiErr) {
					console.error('Doctor profile creation failed:', apiErr);
					// Don't throw - profile might already exist, which is fine for multiple profiles
				}
			}

			if (selectedRole === 'teacher') {
				try {
					// Upload image if provided
					let imageUrl = null;
					if (profileData.profileImage) {
						setUploadingImage(true);
						try {
							const formData = new FormData();
							formData.append('image', profileData.profileImage);
							formData.append('userId', userId);
							
							const uploadRes = await apiRequest('/api/upload/profile-image', {
								method: 'POST',
								body: formData
							});
							imageUrl = uploadRes.url;
						} catch (uploadErr) {
							console.warn('Image upload failed, backend will assign random avatar:', uploadErr);
							// Continue - backend will assign random avatar
						} finally {
							setUploadingImage(false);
						}
					}
					
					await apiRequest('/api/teachers/profile', {
						method: 'POST',
						body: JSON.stringify({
							userId,
							specialization: profileData.specialization || null,
							image_url: imageUrl // Will be null if upload failed, backend assigns random
						})
					});
					console.log('✅ Teacher profile created');
				} catch (apiErr) {
					console.error('Teacher profile creation failed:', apiErr);
					// Don't throw - profile might already exist, which is fine for multiple profiles
				}
			}

			// Verify role was set correctly before redirecting
			let finalRole = selectedRole;
			try {
				// Wait a moment for database to update
				await new Promise(resolve => setTimeout(resolve, 500));
				
				const { data: userVerify, error: verifyError } = await supabase
					.from('users')
					.select('role')
					.eq('id', userId)
					.single();
				
				if (!verifyError && userVerify?.role) {
					finalRole = userVerify.role;
					console.log(`✅ Verified role in database: ${finalRole} (selected: ${selectedRole})`);
					
					// If role doesn't match, try to fix it
					if (finalRole !== selectedRole) {
						console.warn(`⚠️ Role mismatch! Database: ${finalRole}, Expected: ${selectedRole}. Attempting to fix...`);
						try {
							await apiRequest('/api/auth/set-role', {
								method: 'POST',
								body: JSON.stringify({ userId, role: selectedRole, name, email: emailForSignup })
							});
							finalRole = selectedRole;
							console.log('✅ Role corrected to:', finalRole);
						} catch (fixErr) {
							console.error('❌ Could not fix role:', fixErr);
							// Use database role as fallback
						}
					}
				} else {
					console.warn('⚠️ Could not verify role from database, using selected role');
				}
			} catch (verifyErr) {
				console.warn('Could not verify role:', verifyErr);
			}
			
			// Convert role to URL format (underscore to hyphen for URLs)
			const roleToUrl = (r) => {
				if (!r) return r;
				return r.replace(/_/g, '-');
			};
			
			const dashboardPath = roleToUrl(finalRole);
			
			if (isNewUser) {
				// Check if user needs approval (only teachers and admins need approval)
				const needsApproval = finalRole === 'teacher' || finalRole === 'admin';
				if (needsApproval) {
					setSuccess(`Account created successfully! Your registration is pending admin approval. Redirecting to approval page...`);
					setTimeout(() => navigate('/pending-approval'), 2000);
				} else {
					setSuccess(`Account created successfully! Redirecting to ${finalRole} dashboard...`);
					setTimeout(() => navigate(`/dashboard/${dashboardPath}`), 2000);
				}
			} else {
				setSuccess(`Additional ${finalRole} profile created! Redirecting to ${finalRole} dashboard...`);
				setTimeout(() => navigate(`/dashboard/${dashboardPath}`), 2000);
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	async function handleProfileCompletion(e) {
		e.preventDefault();
		
		// Debug: Log all form values
		console.log('🔍 Form validation check:', {
			name: name ? `${name.substring(0, 3)}...` : 'EMPTY',
			email: email ? `${email.substring(0, 3)}...` : 'EMPTY',
			phone: phone ? `${phone.substring(0, 3)}...` : 'EMPTY',
			password: password ? `${'*'.repeat(password.length)} (${password.length} chars)` : 'EMPTY',
			age: age || 'EMPTY',
			gender: gender || 'EMPTY',
			cnic: cnic ? `${cnic.substring(0, 5)}...` : 'EMPTY',
			method: method
		});
		
		// Validation - check each field and provide specific error message
		const missingFields = [];
		if (!name || name.trim() === '') missingFields.push('Full Name');
		// Email is ALWAYS required for password signup, regardless of method
		if (!email || email.trim() === '') {
			missingFields.push('Email Address');
		}
		// Phone is optional but recommended
		if (!password || password.trim() === '') {
			missingFields.push('Password');
		} else if (password.length < 6) {
			missingFields.push(`Password (must be at least 6 characters - you entered ${password.length})`);
		}
		if (!age || age.trim() === '' || isNaN(parseInt(age))) missingFields.push('Age');
		if (!gender || gender.trim() === '' || gender === 'Select Gender') missingFields.push('Gender (select Male, Female, or Other)');
		if (!cnic || cnic.trim() === '') missingFields.push('CNIC Number');
		
		if (missingFields.length > 0) {
			const errorMsg = `Please fill in the following required fields: ${missingFields.join(', ')}`;
			console.error('❌ Validation failed:', missingFields);
			setError(errorMsg);
			// Scroll to top to show the error and password field
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
				// Try to focus on password field if it's missing
				if (missingFields.some(f => f.includes('Password'))) {
					const passwordInput = document.querySelector('input[type="password"]');
					if (passwordInput) {
						passwordInput.focus();
						passwordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				}
			}, 100);
			return;
		}
		
		// Create account with profile data
		await createAccount({
			age: parseInt(age),
			gender,
			cnic,
			history: medicalHistory
		});
	}

	function handleImageChange(e) {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setError('Image size must be less than 5MB');
				return;
			}
			setProfileImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfileImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	}

	async function handleDoctorProfileCompletion(e) {
		e.preventDefault();
		
		// Validation
		if (!name || !email || !password || !specialization || !degrees || !consultationFee || !discountRate || !timing) {
			setError('Please fill all required fields');
			return;
		}
		
		// Validate discount rate
		const discount = parseFloat(discountRate);
		if (discount < 0 || discount > 100) {
			setError('Discount rate must be between 0 and 100');
			return;
		}
		
		// Validate consultation fee
		const fee = parseFloat(consultationFee);
		if (fee <= 0) {
			setError('Consultation fee must be greater than 0');
			return;
		}
		
		// Log the fee being sent for debugging
		console.log('💰 Sending consultation fee to backend:', {
			original: consultationFee,
			parsed: fee,
			type: typeof fee
		});
		
		// Upload image if provided (will be done after user creation in createAccount)
		// For now, just pass the file reference
		await createAccount({
			specialization,
			degrees,
			consultation_fee: fee, // Send exact value as entered
			discount_rate: discount,
			timing,
			profileImage: profileImage // Pass the file, will upload after user creation
		});
	}

	async function handleLabRegistration(e) {
		e.preventDefault();
		
		// Validation
		if (!name || !email || !password) {
			setError('Please fill all required fields');
			return;
		}
		
		setLoading(true);
		setError('');
		
		try {
			// Use the lab register endpoint which handles everything
			console.log('🚀 Starting lab registration with:', {
				email,
				name,
				labName: labName || name,
				labLocation,
				labContactInfo,
				labServices
			});
			
			console.log('🔍 API URL being used:', import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:4000' : 'https://dr-sanaullah-welfare-foundation-production-d17f.up.railway.app'));
			
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:4000' : 'https://dr-sanaullah-welfare-foundation-production-d17f.up.railway.app')}/api/labs/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					lab_name: labName || name,
					location: labLocation || null,
					contact_info: labContactInfo || null,
					services: labServices ? (Array.isArray(labServices) ? labServices : labServices.split(',').map(s => s.trim()).filter(s => s)) : [],
					user_name: name,
					email,
					password
				})
			});
			
			console.log('🔍 Raw response status:', response.status);
			console.log('🔍 Raw response ok:', response.ok);
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
				console.error('❌ Lab registration failed:', errorData);
				throw new Error(errorData.error || response.statusText);
			}
			
			const data = await response.json();
			console.log('✅ Lab registration successful:', data);
			
			setSuccess('Lab registration successful! Please check your email to verify your account.');
			setStep(1); // Back to login
		} catch (err) {
			setError(err.message || 'Lab registration failed');
		} finally {
			setLoading(false);
		}
	}

	async function handleTeacherRegistration(e) {
		e.preventDefault();
		
		// Validation
		if (!name || !email || !password) {
			setError('Please fill all required fields');
			return;
		}
		
		setLoading(true);
		setError('');
		
		try {
			// Upload image if provided
			let imageUrl = null;
			if (profileImage) {
				setUploadingImage(true);
				try {
					console.log('📸 Starting image upload for teacher registration:', {
						fileName: profileImage.name,
						fileSize: profileImage.size,
						fileType: profileImage.type,
						userId: 'teacher-' + Date.now()
					});
					
					const formData = new FormData();
					formData.append('image', profileImage);
					formData.append('userId', 'teacher-' + Date.now());
					
					const uploadRes = await apiRequest('/api/upload/profile-image', {
						method: 'POST',
						body: formData
					});
					
					console.log('✅ Teacher image upload successful:', uploadRes);
					imageUrl = uploadRes.url;
				} catch (uploadErr) {
					console.error('❌ Teacher image upload failed:', uploadErr);
					console.warn('Image upload failed, backend will assign random avatar:', uploadErr);
					// Continue - backend will assign random avatar
				} finally {
					setUploadingImage(false);
				}
			} else {
				console.log('📸 No teacher profile image provided, backend will assign random avatar');
			}
			
			// Use the auth signup endpoint which creates user in users table
			console.log('🚀 Starting teacher auth signup with:', {
				email,
				name,
				role: 'teacher'
			});
			
			console.log('🔍 API URL being used:', import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:4000' : 'https://dr-sanaullah-welfare-foundation-production-d17f.up.railway.app'));
			
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:4000' : 'https://dr-sanaullah-welfare-foundation-production-d17f.up.railway.app')}/api/auth/signup-email`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					role: 'teacher',
					name
				})
			});
			
			console.log('🔍 Raw response status:', response.status);
			console.log('🔍 Raw response ok:', response.ok);
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
				console.error('❌ Raw response error:', errorData);
				throw new Error(errorData.error || response.statusText);
			}
			
			const data = await response.json();
			console.log('🔍 Raw response data:', data);
			
			if (!data) {
				console.error('❌ No data received from auth endpoint');
				throw new Error('No response data from auth signup');
			}
			
			// The auth endpoint returns { user: { id, email }, isExistingUser, message }
			const userId = data.user?.id;
			if (!userId) {
				console.error('❌ Auth response structure:', data);
				throw new Error('No userId received from auth signup');
			}
			
			// Create teacher profile using the userId from auth response
			console.log('🚀 Creating teacher profile with userId:', userId);
			
			const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:4000' : 'https://dr-sanaullah-welfare-foundation-production-d17f.up.railway.app')}/api/teachers/profile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId,
					name,
					specialization: specialization || null,
					image_url: imageUrl
				})
			});
			
			console.log('🔍 Profile response status:', profileResponse.status);
			console.log('🔍 Profile response ok:', profileResponse.ok);
			
			if (!profileResponse.ok) {
				const profileError = await profileResponse.json().catch(() => ({ error: 'Profile creation failed' }));
				console.error('❌ Teacher profile creation failed:', profileError);
				throw new Error(profileError.error || profileResponse.statusText);
			}
			
			const profileData = await profileResponse.json();
			console.log('✅ Teacher profile created:', profileData);
			
			setSuccess('Teacher registration successful! Your account is pending admin approval. Please check your email to verify your account.');
			setStep(1); // Back to login
		} catch (err) {
			console.error('❌ Teacher registration error:', err);
			setError(err.message || 'Teacher registration failed');
		} finally {
			setLoading(false);
		}
	}


	async function handlePhoneOtp(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const { error } = await supabase.auth.signInWithOtp({ phone });
			if (error) throw error;
			setSuccess('OTP sent to your phone!');
			setStep(2);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	function handleRoleSelectionForSignup(role) {
		setSelectedRole(role);
		setStep(2); // Move to form with role-specific fields
		setError('');
	}

	async function handleRoleChoice(role) {
		setLoading(true);
		setError('');
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				throw new Error('User not found');
			}
			
			// Verify user has access to this role
			try {
				const rolesRes = await apiRequest('/api/auth/user-roles');
				const userRoles = rolesRes.roles || [];
				const hasRole = userRoles.some(r => r.role === role);
				
				if (!hasRole) {
					throw new Error(`You do not have access to the ${role} dashboard. Please contact an administrator.`);
				}
			} catch (roleCheckErr) {
				console.warn('Could not verify role access, continuing anyway:', roleCheckErr);
			}
			
			// Update the user's role in the users table
			try {
				await apiRequest('/api/auth/set-role', {
					method: 'POST',
					body: JSON.stringify({ 
						userId: user.id, 
						role: role 
					})
				});
				console.log('✅ Role updated successfully');
			} catch (err) {
				console.warn('Could not update role, continuing anyway:', err);
			}
			
			setSuccess('Redirecting...');
			setShowRoleSelection(false);
			// Convert role to URL format (underscore to hyphen)
			const roleToUrl = (r) => {
				if (!r) return r;
				return r.replace(/_/g, '-');
			};
			const dashboardPath = roleToUrl(role);
			setTimeout(() => {
				navigate(`/dashboard/${dashboardPath}`);
			}, 500);
		} catch (err) {
			setError(err.message || 'Failed to select role. Please try again.');
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
			<div className="max-w-md mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-brand mb-2">
						{mode === 'login' ? 'Welcome Back!' : 'Join Us Today'}
					</h1>
					<p className="text-gray-600">
						{mode === 'login' 
							? 'Sign in to access your dashboard' 
							: 'Create an account to get started'}
					</p>
				</div>

				{/* Mode Toggle */}
				<div className="flex bg-white rounded-lg p-1 mb-6 shadow">
					<button
						onClick={() => { setMode('login'); setStep(1); setError(''); }}
						className={`flex-1 py-2 rounded-md font-semibold transition ${
							mode === 'login' 
								? 'bg-brand text-white' 
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						Login
					</button>
					<button
						onClick={() => { setMode('signup'); setStep(1); setError(''); }}
						className={`flex-1 py-2 rounded-md font-semibold transition ${
							mode === 'signup' 
								? 'bg-brand text-white' 
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						Sign Up
					</button>
				</div>

				{/* Main Form */}
				<div className="bg-white rounded-lg shadow-lg p-8">
					{/* Step 1: Role Selection */}
					{mode === 'signup' && step === 1 && (
						<>
							<h2 className="text-xl font-semibold mb-2">Select Your Role</h2>
							<p className="text-sm text-gray-600 mb-6">Choose how you'll use the platform</p>
							
							<div className="space-y-3 max-h-96 overflow-y-auto mb-6">
								{roles.map(role => (
									<button
										key={role.id}
										onClick={() => handleRoleSelectionForSignup(role.id)}
										className={`w-full p-4 rounded-lg border-2 text-left transition ${
											selectedRole === role.id
												? 'border-brand bg-green-50'
												: 'border-gray-200 hover:border-brand'
										}`}
									>
										<div className="flex items-start">
											<span className="text-3xl mr-3">{role.icon}</span>
											<div className="flex-1">
												<h3 className="font-semibold text-lg">{role.name}</h3>
												<p className="text-sm text-gray-600">{role.desc}</p>
											</div>
											{selectedRole === role.id && (
												<span className="text-brand text-2xl">✓</span>
											)}
										</div>
									</button>
								))}
							</div>
						</>
					)}

					{/* Step 2: Expanded Form with Role-Specific Fields */}
					{mode === 'signup' && step === 2 && selectedRole && (
						<>
							<button 
								onClick={() => { setStep(1); setSelectedRole(''); setError(''); }}
								className="text-brand hover:underline mb-4 flex items-center"
							>
								← Back to Role Selection
							</button>
							<h2 className="text-xl font-semibold mb-2">
								Create {roles.find(r => r.id === selectedRole)?.name || 'Account'}
							</h2>
							<p className="text-sm text-gray-600 mb-6">
								Fill in your details to create your {roles.find(r => r.id === selectedRole)?.name?.toLowerCase() || 'account'}
							</p>
							
							<form onSubmit={selectedRole === 'patient' ? handleProfileCompletion : selectedRole === 'doctor' ? handleDoctorProfileCompletion : selectedRole === 'lab' ? handleLabRegistration : selectedRole === 'teacher' ? handleTeacherRegistration : handleEmailSignup} className="space-y-4">
								{/* Basic Info - All Roles */}
								<div className="border-b border-gray-200 pb-4 mb-4">
									<h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
									
									{/* Method Toggle */}
									<div className="flex gap-2 mb-4">
										<button
											type="button"
											onClick={() => setMethod('email')}
											className={`flex-1 py-2 px-4 rounded border ${
												method === 'email' 
													? 'border-brand bg-brand text-white' 
													: 'border-gray-300 hover:border-brand'
											}`}
										>
											📧 Email
										</button>
										<button
											type="button"
											onClick={() => setMethod('phone')}
											className={`flex-1 py-2 px-4 rounded border ${
												method === 'phone' 
													? 'border-brand bg-brand text-white' 
													: 'border-gray-300 hover:border-brand'
											}`}
										>
											📱 Phone
										</button>
									</div>

									<div>
										<label className="block text-sm font-medium mb-1">Full Name *</label>
										<input
											type="text"
											className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
											placeholder="Ahmed Khan"
											value={name}
											onChange={e => setName(e.target.value)}
											required
										/>
									</div>

									{/* Email is always required for password signup */}
									<div>
										<label className="block text-sm font-medium mb-1">Email Address *</label>
										<input
											type="email"
											className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
											placeholder="your@email.com"
											value={email}
											onChange={e => setEmail(e.target.value)}
											required
										/>
										<p className="text-xs text-gray-500 mt-1">Required for account creation and login</p>
									</div>
									
									{/* Phone is optional but recommended */}
									<div>
										<label className="block text-sm font-medium mb-1">
											Phone Number 
											{method === 'phone' && <span className="text-red-500">*</span>}
											{method === 'email' && <span className="text-gray-400 text-xs ml-1">(Optional)</span>}
										</label>
										<input
											type="tel"
											className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
											placeholder="+923001234567"
											value={phone}
											onChange={e => setPhone(e.target.value)}
											required={method === 'phone'}
										/>
										{method === 'phone' && (
											<p className="text-xs text-gray-500 mt-1">Optional: For account recovery</p>
										)}
									</div>
									
									{/* Password field - ALWAYS shown regardless of email/phone method */}
									<div>
										<label className="block text-sm font-medium mb-1">
											Password * 
											{password && password.length > 0 && (
												<span className={`ml-2 text-xs ${
													password.length < 6 ? 'text-red-600' : 'text-green-600'
												}`}>
													({password.length}/6)
												</span>
											)}
										</label>
										<input
											type="password"
											id="password-input"
											className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
												password && password.length > 0 && password.length < 6 
													? 'border-red-400 bg-red-50 ring-2 ring-red-200' 
													: password && password.length >= 6
													? 'border-green-400 bg-green-50'
													: 'border-gray-300'
											}`}
											placeholder="Enter at least 6 characters"
											value={password}
											onChange={e => {
												setPassword(e.target.value);
												setError(''); // Clear error when user types
											}}
											required
											minLength={6}
											autoComplete="new-password"
										/>
										{password && password.length > 0 && (
											<p className={`text-xs mt-1 font-medium ${
												password.length < 6 ? 'text-red-600' : 'text-green-600'
											}`}>
												{password.length < 6 
													? `⚠️ Password too short (${password.length}/6 characters) - Need ${6 - password.length} more` 
													: `✅ Password length OK (${password.length} characters)`
												}
											</p>
										)}
										{!password && (
											<p className="text-xs text-red-600 mt-1 font-medium">⚠️ Password is required - Enter at least 6 characters</p>
										)}
									</div>
								</div>

								{/* Role-Specific Fields */}
								{selectedRole === 'patient' && (
									<div className="border-b border-gray-200 pb-4 mb-4">
										<h3 className="text-sm font-semibold text-gray-700 mb-3">Patient Information</h3>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium mb-1">Age *</label>
												<input
													type="number"
													className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
													placeholder="25"
													value={age}
													onChange={e => setAge(e.target.value)}
													required
													min="1"
													max="120"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Gender *</label>
												<select
													className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
													value={gender}
													onChange={e => setGender(e.target.value)}
													required
												>
													<option value="">Select Gender</option>
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
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="12345-6789012-3"
												value={cnic}
												onChange={e => setCnic(e.target.value)}
												required
												pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}"
												title="Format: 12345-6789012-3"
											/>
											<p className="text-xs text-gray-500 mt-1">Format: 12345-6789012-3</p>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Medical History</label>
											<textarea
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="Any allergies, chronic conditions, previous surgeries..."
												value={medicalHistory}
												onChange={e => setMedicalHistory(e.target.value)}
												rows={3}
											/>
											<p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
										</div>
									</div>
								)}

								{selectedRole === 'doctor' && (
									<div className="border-b border-gray-200 pb-4 mb-4">
										<h3 className="text-sm font-semibold text-gray-700 mb-3">Professional Information</h3>
										
										{/* Profile Photo Upload */}
										<div>
											<label className="block text-sm font-medium mb-1">Profile Photo</label>
											<div className="flex items-center gap-4">
												<div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
													{profileImagePreview ? (
														<img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
													) : (
														<div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
															👤
														</div>
													)}
												</div>
												<div className="flex-1">
													<label
														htmlFor="doctor-profile-photo-input"
														className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
														style={{ pointerEvents: uploadingImage ? 'none' : 'auto' }}
													>
														Choose File
													</label>
													<input
														id="doctor-profile-photo-input"
														type="file"
														accept="image/*"
														onChange={handleImageChange}
														disabled={uploadingImage}
														style={{
															position: 'absolute',
															width: '1px',
															height: '1px',
															padding: 0,
															margin: '-1px',
															overflow: 'hidden',
															clip: 'rect(0, 0, 0, 0)',
															whiteSpace: 'nowrap',
															borderWidth: 0
														}}
													/>
													{profileImagePreview && (
														<p className="text-xs text-gray-600 mt-2">✓ Image selected</p>
													)}
													<p className="text-xs text-gray-500 mt-1">
														{uploadingImage ? 'Uploading...' : 'Optional - Random avatar will be assigned if not provided'}
													</p>
												</div>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Specialization *</label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., Cardiologist, General Physician, Pediatrician"
												value={specialization}
												onChange={e => setSpecialization(e.target.value)}
												required
											/>
											<p className="text-xs text-gray-500 mt-1">Your medical specialization</p>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Degrees & Qualifications *</label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., MBBS, FCPS (Cardiology), MS (Orthopedics)"
												value={degrees}
												onChange={e => setDegrees(e.target.value)}
												required
											/>
											<p className="text-xs text-gray-500 mt-1">Your medical degrees and qualifications</p>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium mb-1">Consultation Fee (PKR) *</label>
												<input
													type="number"
													className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
													placeholder="e.g., 2000"
													value={consultationFee}
													onChange={e => setConsultationFee(e.target.value)}
													required
													min="0"
													step="100"
												/>
												<p className="text-xs text-gray-500 mt-1">Per visit</p>
											</div>
											<div>
												<label className="block text-sm font-medium mb-1">Discount Rate (%) *</label>
												<input
													type="number"
													className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
													placeholder="50"
													value={discountRate}
													onChange={e => setDiscountRate(e.target.value)}
													required
													min="0"
													max="100"
												/>
												<p className="text-xs text-gray-500 mt-1">0-100%</p>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Availability & Timing *</label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., Mon-Fri 9AM-5PM, Sat 9AM-1PM"
												value={timing}
												onChange={e => setTiming(e.target.value)}
												required
											/>
											<p className="text-xs text-gray-500 mt-1">Your available hours</p>
										</div>
									</div>
								)}

								{selectedRole === 'teacher' && (
									<div className="border-b border-gray-200 pb-4 mb-4">
										<h3 className="text-sm font-semibold text-gray-700 mb-3">Teacher Information</h3>
										
										{/* Profile Photo Upload */}
										<div>
											<label className="block text-sm font-medium mb-1">Profile Photo</label>
											<div className="flex items-center gap-4">
												<div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
													{profileImagePreview ? (
														<img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
													) : (
														<div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
															👤
														</div>
													)}
												</div>
												<div className="flex-1">
													<label
														htmlFor="teacher-profile-photo-input"
														className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
														style={{ pointerEvents: uploadingImage ? 'none' : 'auto' }}
													>
														Choose File
													</label>
													<input
														id="teacher-profile-photo-input"
														type="file"
														accept="image/*"
														onChange={handleImageChange}
														disabled={uploadingImage}
														style={{
															position: 'absolute',
															width: '1px',
															height: '1px',
															padding: 0,
															margin: '-1px',
															overflow: 'hidden',
															clip: 'rect(0, 0, 0, 0)',
															whiteSpace: 'nowrap',
															borderWidth: 0
														}}
													/>
													{profileImagePreview && (
														<p className="text-xs text-gray-600 mt-2">✓ Image selected</p>
													)}
													<p className="text-xs text-gray-500 mt-1">
														{uploadingImage ? 'Uploading...' : 'Optional - Random avatar will be assigned if not provided'}
													</p>
												</div>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Specialization/Subject</label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., Mathematics, Computer Science, English"
												value={specialization}
												onChange={e => setSpecialization(e.target.value)}
											/>
											<p className="text-xs text-gray-500 mt-1">Optional - Your teaching specialization</p>
										</div>
									</div>
								)}

								{selectedRole === 'lab' && (
									<div className="border-b border-gray-200 pb-4 mb-4">
										<h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
											<span className="text-2xl">🧪</span>
											<span>Laboratory Information</span>
										</h3>
										
										<div>
											<label className="block text-sm font-medium mb-1">Lab Name <span className="text-red-500">*</span></label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., City Diagnostic Lab"
												value={labName}
												onChange={e => setLabName(e.target.value)}
												required
											/>
										</div>

										<div className="mt-3">
											<label className="block text-sm font-medium mb-1">Location</label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., Karachi, Pakistan"
												value={labLocation}
												onChange={e => setLabLocation(e.target.value)}
											/>
											<p className="text-xs text-gray-500 mt-1">Optional - Your laboratory location</p>
										</div>

										<div className="mt-3">
											<label className="block text-sm font-medium mb-1">Contact Info</label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., Tel: 021-12345678"
												value={labContactInfo}
												onChange={e => setLabContactInfo(e.target.value)}
											/>
											<p className="text-xs text-gray-500 mt-1">Optional - Phone number or contact details</p>
										</div>

										<div className="mt-3">
											<label className="block text-sm font-medium mb-1">Services</label>
											<input
												type="text"
												className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
												placeholder="e.g., Blood Tests, X-Ray, Ultrasound, ECG"
												value={labServices}
												onChange={e => setLabServices(e.target.value)}
											/>
											<p className="text-xs text-gray-500 mt-1">Optional - Comma-separated list of services offered</p>
										</div>
									</div>
								)}

								{/* Submit Button */}
								<button
									type="submit"
									disabled={loading || uploadingImage}
									className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? 'Creating Account...' : uploadingImage ? 'Uploading Photo...' : selectedRole === 'lab' ? 'Register Laboratory' : 'Create Account'}
								</button>
							</form>
						</>
					)}


					{mode === 'login' && (
						<>
							<h2 className="text-xl font-semibold mb-4">Sign In</h2>
							
							{/* Method Toggle */}
							<div className="flex gap-2 mb-6">
								<button
									onClick={() => setMethod('email')}
									className={`flex-1 py-2 px-4 rounded border ${
										method === 'email' 
											? 'border-brand bg-brand text-white' 
											: 'border-gray-300 hover:border-brand'
									}`}
								>
									📧 Email
								</button>
								<button
									onClick={() => setMethod('phone')}
									className={`flex-1 py-2 px-4 rounded border ${
										method === 'phone' 
											? 'border-brand bg-brand text-white' 
											: 'border-gray-300 hover:border-brand'
									}`}
								>
									📱 Phone OTP
								</button>
							</div>

							{/* Role Selection - Radio Buttons */}
							<div className="mb-6">
								<label className="block text-sm font-medium mb-3">Select Account Type (Optional)</label>
								<div className="grid grid-cols-2 gap-2">
									{roles.map(role => (
										<label
											key={role.id}
											className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
												selectedLoginRole === role.id
													? 'border-brand bg-green-50'
													: 'border-gray-200 hover:border-brand hover:bg-gray-50'
											}`}
										>
											<input
												type="radio"
												name="loginRole"
												value={role.id}
												checked={selectedLoginRole === role.id}
												onChange={(e) => setSelectedLoginRole(e.target.value)}
												className="mr-2 w-4 h-4 text-brand focus:ring-brand"
											/>
											<span className="text-lg mr-2">{role.icon}</span>
											<span className="text-sm font-medium">{role.name}</span>
										</label>
									))}
								</div>
								<p className="text-xs text-gray-500 mt-2">
									Select your account type to go directly to that dashboard. Leave empty if you're not sure.
								</p>
							</div>

							{method === 'email' ? (
								<form onSubmit={handleEmailLogin} className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-1">Email Address</label>
										<input
											type="email"
											className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
											placeholder="your@email.com"
											value={email}
											onChange={e => setEmail(e.target.value)}
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Password</label>
										<input
											type="password"
											className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
											placeholder="••••••••"
											value={password}
											onChange={e => setPassword(e.target.value)}
											required
										/>
									</div>
									<button
										type="submit"
										disabled={loading}
										className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition disabled:opacity-50"
									>
										{loading ? 'Signing in...' : 'Sign In'}
									</button>
								</form>
							) : (
								<form onSubmit={handlePhoneOtp} className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-1">Phone Number</label>
										<input
											type="tel"
											className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
											placeholder="+923001234567"
											value={phone}
											onChange={e => setPhone(e.target.value)}
											required
										/>
									</div>
									<button
										type="submit"
										disabled={loading}
										className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition disabled:opacity-50"
									>
										{loading ? 'Sending OTP...' : 'Send OTP'}
									</button>
								</form>
							)}

							<div className="mt-4 text-center">
								<a href="#" className="text-sm text-brand hover:underline">Forgot password?</a>
							</div>
						</>
					)}

					{/* Status Messages */}
					{error && (
						<div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
							{error}
						</div>
					)}
					{success && (
						<div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
							{success}
						</div>
					)}
				</div>

				{/* Demo Link */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Want to test? <a href="/demo" className="text-brand hover:underline font-semibold">View Demo Credentials</a>
					</p>
				</div>
			</div>

			{/* Role Selection Modal (only show when user explicitly has multiple active roles) */}
			{showRoleSelection && availableRoles.length > 1 && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Select Dashboard</h2>
						<p className="text-gray-600 mb-6">
							You have access to multiple dashboards. Please choose which one you want to access:
						</p>
						
						<div className="space-y-3 max-h-96 overflow-y-auto">
							{availableRoles.map((userRole) => {
								const roleInfo = roles.find(r => r.id === userRole.role);
								if (!roleInfo) return null;
								
								return (
									<button
										key={userRole.role}
										onClick={() => handleRoleChoice(userRole.role)}
										disabled={loading}
										className={`w-full p-4 rounded-lg border-2 text-left transition ${
											userRole.isPrimary
												? 'border-blue-500 bg-blue-50'
												: 'border-gray-200 hover:border-brand hover:bg-gray-50'
										} ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
									>
										<div className="flex items-start">
											<span className="text-3xl mr-3">{roleInfo.icon}</span>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h3 className="font-semibold text-lg">{roleInfo.name}</h3>
													{userRole.isPrimary && (
														<span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Primary</span>
													)}
												</div>
												<p className="text-sm text-gray-600">{roleInfo.desc}</p>
											</div>
											{loading ? (
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand"></div>
											) : (
												<span className="text-gray-400">→</span>
											)}
										</div>
									</button>
								);
							})}
						</div>
						
						{error && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}
						
						<div className="mt-6 flex justify-end">
							<button
								onClick={() => setShowRoleSelection(false)}
								disabled={loading}
								className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
