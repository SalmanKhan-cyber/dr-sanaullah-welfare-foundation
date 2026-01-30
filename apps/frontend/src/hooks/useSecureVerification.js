/**
 * Enhanced Role-Based Security Hook
 * STRICT role enforcement - no auto-switching, no cross-role access
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

// Roles that don't need admin approval
const NO_APPROVAL_ROLES = ['patient', 'donor', 'student'];

// Role to dashboard mapping
const ROLE_DASHBOARD_MAP = {
  'admin': '/dashboard/admin',
  'patient': '/dashboard/patient',
  'doctor': '/dashboard/doctor',
  'donor': '/dashboard/donor',
  'lab': '/dashboard/lab',
  'blood_bank': '/dashboard/blood-bank',
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'pharmacy': '/dashboard/pharmacy'
};

export function useSecureVerification(role = null) {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    verifyUserAccess();
  }, [role, location.pathname]);

  async function verifyUserAccess() {
    try {
      setChecking(true);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('❌ No session found, redirecting to login');
        navigate('/login');
        return;
      }

      // Get user data with role
      const userRes = await apiRequest('/api/users/me');
      
      if (!userRes.user) {
        console.log('❌ User not found in database, redirecting to login');
        navigate('/login');
        return;
      }

      setUserInfo(userRes.user);
      const userRole = userRes.user.role;
      const isVerified = userRes.user.verified;

      console.log(`🔍 Verifying access: User role = ${userRole}, Expected role = ${role}`);

      // CRITICAL SECURITY CHECK: Verify user role matches expected dashboard
      if (role && userRole !== role) {
        console.warn(`🚨 SECURITY VIOLATION: User with role '${userRole}' trying to access '${role}' dashboard`);
        
        // Get the correct dashboard for this user
        const correctDashboard = ROLE_DASHBOARD_MAP[userRole] || '/dashboard/patient';
        
        alert(`Access denied! You are logged in as a ${userRole}. Redirecting to your correct dashboard.`);
        navigate(correctDashboard);
        return;
      }

      // Additional check: Verify URL path matches user role
      const pathRole = location.pathname.match(/\/dashboard\/([^/]+)/)?.[1];
      const normalizedPathRole = pathRole?.replace(/-/g, '_');
      
      if (pathRole && normalizedPathRole !== userRole) {
        console.warn(`🚨 PATH MISMATCH: User role '${userRole}' but accessing '${pathRole}' path`);
        
        const correctDashboard = ROLE_DASHBOARD_MAP[userRole] || '/dashboard/patient';
        alert(`Access denied! This page is for ${pathRole}s only. Redirecting to your dashboard.`);
        navigate(correctDashboard);
        return;
      }

      // Check verification status
      if (NO_APPROVAL_ROLES.includes(userRole)) {
        console.log(`✅ ${userRole} role doesn't need approval`);
        setVerified(true);
        setChecking(false);
        return;
      }

      if (!isVerified) {
        console.log(`⏳ ${userRole} role needs approval but not verified`);
        setVerified(false);
        setChecking(false);
        navigate('/pending-approval');
        return;
      }

      console.log(`✅ User verified: ${userRole}`);
      setVerified(true);
      setChecking(false);

    } catch (err) {
      console.error('❌ Verification error:', err);
      setChecking(false);
      navigate('/login');
    }
  }

  // Function to manually switch roles (for users with multiple roles)
  async function switchToRole(newRole) {
    try {
      // First check if user actually has this role available
      const rolesRes = await apiRequest('/api/auth/user-roles');
      const userRoles = rolesRes.roles || [];
      const hasRole = userRoles.some(r => r.role === newRole);
      
      if (!hasRole) {
        alert(`You don't have access to the ${newRole} role.`);
        return false;
      }

      // Switch the role
      await apiRequest('/api/auth/set-role', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: userInfo.id, 
          role: newRole 
        })
      });

      // Navigate to the new dashboard
      const newDashboard = ROLE_DASHBOARD_MAP[newRole];
      if (newDashboard) {
        navigate(newDashboard);
        window.location.reload(); // Force reload to update verification
      }
      
      return true;
    } catch (err) {
      console.error('Failed to switch role:', err);
      alert('Failed to switch roles. Please try again.');
      return false;
    }
  }

  return { verified, checking, userInfo, switchToRole };
}
