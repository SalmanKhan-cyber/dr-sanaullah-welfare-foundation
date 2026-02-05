import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

/**
 * Hook to check user verification status
 * Returns { verified, checking, userInfo }
 * Redirects to pending approval if not verified (except patients, donors, labs, pharmacy, blood_bank)
 */
export function useVerification(role = null) {
	const [verified, setVerified] = useState(null);
	const [checking, setChecking] = useState(true);
	const [userInfo, setUserInfo] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();

	// Roles that don't need approval (can access immediately)
	const NO_APPROVAL_ROLES = ['patient', 'donor', 'lab', 'pharmacy', 'blood_bank'];

	useEffect(() => {
		checkVerification();
	}, [location.pathname]); // Re-check when route changes

	async function checkVerification() {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				navigate('/login');
				return;
			}

			// Get user verification status
			try {
				const userRes = await apiRequest('/api/users/me');
				
				if (userRes.user) {
					setUserInfo(userRes.user);
					const userRole = userRes.user.role;
					const isVerified = userRes.user.verified;
					
					// CRITICAL: Check if user's role matches the dashboard they're trying to access
					// Extract role from URL path as fallback if role parameter not provided
					const pathRole = location.pathname.match(/\/dashboard\/([^/]+)/)?.[1];
					const expectedRole = role || pathRole;
					
					// Normalize role names (e.g., 'blood-bank' -> 'blood_bank')
					const normalizeRole = (r) => {
						if (!r) return r;
						return r.replace(/-/g, '_');
					};
					
					const normalizedUserRole = normalizeRole(userRole);
					const normalizedExpectedRole = normalizeRole(expectedRole);
					
					// CRITICAL: If user's role in database matches expected role, allow access
					if (normalizedUserRole === normalizedExpectedRole) {
						console.log(`✅ User role (${userRole}) matches expected role (${expectedRole}) - allowing access`);
						// Continue with verification check below
					} else if (userRole && expectedRole && normalizedUserRole !== normalizedExpectedRole) {
						console.warn(`⚠️ Role mismatch detected! User role: ${userRole}, Dashboard role: ${expectedRole}.`);
						
						// Check if user has multiple roles/profiles that might allow access to this dashboard
						try {
							const rolesRes = await apiRequest('/api/auth/user-roles');
							const userRoles = rolesRes.roles || [];
							const availableRoles = userRoles.map(r => normalizeRole(r.role));
							
							// If user has the expected role in their available roles, allow access
							if (availableRoles.includes(normalizedExpectedRole)) {
								console.log(`✅ User has ${expectedRole} role available, switching role to allow access.`);
								// Update the role for this session
								try {
									await apiRequest('/api/auth/set-role', {
										method: 'POST',
										body: JSON.stringify({ 
											userId: user.id, 
											role: expectedRole.replace(/-/g, '_') // Use underscore format for database
										})
									});
									console.log(`✅ Switched role to ${expectedRole} for this session.`);
									// Reload user data to get updated role
									const updatedUserRes = await apiRequest('/api/users/me');
									if (updatedUserRes.user) {
										setUserInfo(updatedUserRes.user);
										// Continue with verification using the new role
										const newUserRole = updatedUserRes.user.role;
										const newIsVerified = updatedUserRes.user.verified;
										
										// Students and patients don't need approval
										if (NO_APPROVAL_ROLES.includes(newUserRole)) {
											setVerified(true);
											setChecking(false);
											return;
										}

										// Other roles need approval
										if (!newIsVerified) {
											setVerified(false);
											setChecking(false);
											navigate('/pending-approval');
											return;
										}

										setVerified(true);
										setChecking(false);
										return;
									}
								} catch (switchErr) {
									console.warn('⚠️ Could not switch role, but allowing access:', switchErr);
									// Allow access anyway - the role might be correct in database
								}
							} else {
								// User doesn't have this role - redirect to their actual role dashboard
								console.warn(`⚠️ User doesn't have ${expectedRole} role. Redirecting to ${userRole} dashboard.`);
								// Convert role to URL format (underscore to hyphen)
								const dashboardPath = userRole.replace(/_/g, '-');
								navigate(`/dashboard/${dashboardPath}`, { replace: true });
								return;
							}
						} catch (rolesErr) {
							console.warn('Could not check user roles:', rolesErr);
							// If checking roles fails, check if roles match (with normalization)
							if (normalizedUserRole === normalizedExpectedRole) {
								console.log('✅ User role matches expected role, allowing access despite role check failure');
								// Continue with verification below
							} else {
								// Redirect to user's actual role dashboard
								const dashboardPath = userRole.replace(/_/g, '-');
								navigate(`/dashboard/${dashboardPath}`, { replace: true });
								return;
							}
						}
					}
					
					// If user doesn't have a role but we're on a specific dashboard, redirect to login
					if (!userRole && expectedRole) {
						console.warn('⚠️ User has no role assigned. Redirecting to login.');
						navigate('/login');
						return;
					}
					
					// Students and patients don't need approval
					if (NO_APPROVAL_ROLES.includes(userRole)) {
						setVerified(true);
						setChecking(false);
						return;
					}

					// Other roles need approval
					if (!isVerified) {
						console.log(`⚠️ User role ${userRole} is not verified. verified status: ${isVerified}`);
						setVerified(false);
						setChecking(false);
						// Redirect to pending approval page
						navigate('/pending-approval');
						return;
					}

					console.log(`✅ User verified successfully. Role: ${userRole}, Verified: ${isVerified}`);
					setVerified(true);
				}
			} catch (err) {
				console.error('Failed to check verification:', err);
				// If API fails, allow access (fail open for better UX)
				setVerified(true);
			}
		} catch (err) {
			console.error('Failed to get user:', err);
			navigate('/login');
		} finally {
			setChecking(false);
		}
	}

	return { verified, checking, userInfo, checkVerification };
}

