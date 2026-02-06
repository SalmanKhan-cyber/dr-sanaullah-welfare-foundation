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
					
					// SIMPLIFIED: If user is not verified and role needs approval, redirect to pending
					if (!isVerified && !NO_APPROVAL_ROLES.includes(userRole)) {
						console.log(`⚠️ User role ${userRole} is not verified. Redirecting to pending approval.`);
						setVerified(false);
						setChecking(false);
						navigate('/pending-approval');
						return;
					}
					
					// SIMPLIFIED: If user is verified, allow access
					if (isVerified) {
						console.log(`✅ User verified successfully. Role: ${userRole}, Verified: ${isVerified}`);
						setVerified(true);
						setChecking(false);
						return;
					}
					
					// SIMPLIFIED: If user doesn't need approval, allow access
					if (NO_APPROVAL_ROLES.includes(userRole)) {
						console.log(`✅ User role ${userRole} doesn't need approval. Allowing access.`);
						setVerified(true);
						setChecking(false);
						return;
					}
					
					// If we get here, user is not verified and needs approval
					console.log(`⚠️ User role ${userRole} requires approval but is not verified. Redirecting to pending approval.`);
					setVerified(false);
					setChecking(false);
					navigate('/pending-approval');
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

