/**
 * Secure Dashboard Router Component
 * Routes users to their correct dashboard based on role
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';
import RoleSelector from './RoleSelector';

export default function SecureDashboardRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  async function checkUserRole() {
    try {
      setLoading(true);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        navigate('/login');
        return;
      }

      // Get user data
      const userRes = await apiRequest('/api/users/me');
      
      if (!userRes.user) {
        navigate('/login');
        return;
      }

      const role = userRes.user.role;
      setUserRole(role);

      // Check if user has multiple roles
      try {
        const rolesRes = await apiRequest('/api/auth/user-roles');
        const availableRoles = rolesRes.roles || [];
        
        if (availableRoles.length > 1) {
          // User has multiple roles, show role selector
          setShowRoleSelector(true);
        } else {
          // Single role, redirect to appropriate dashboard
          redirectToDashboard(role);
        }
      } catch (err) {
        // If we can't check multiple roles, just redirect to main role
        redirectToDashboard(role);
      }

    } catch (err) {
      console.error('Error checking user role:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }

  function redirectToDashboard(role) {
    const dashboardMap = {
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

    const targetDashboard = dashboardMap[role] || '/dashboard/patient';
    
    // If we're already on the correct dashboard, don't redirect
    if (location.pathname === targetDashboard) {
      return;
    }

    navigate(targetDashboard, { replace: true });
  }

  async function handleRoleSelection(selectedRole) {
    try {
      // Switch role in backend
      await apiRequest('/api/auth/set-role', {
        method: 'POST',
        body: JSON.stringify({ role: selectedRole })
      });

      setUserRole(selectedRole);
      setShowRoleSelector(false);
      
      // Redirect to new dashboard
      redirectToDashboard(selectedRole);
    } catch (err) {
      console.error('Failed to switch role:', err);
      alert('Failed to switch roles. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showRoleSelector) {
    return (
      <RoleSelector 
        onRoleSelected={handleRoleSelection}
        currentRole={userRole}
      />
    );
  }

  // This component shouldn't render anything if not showing role selector
  // It just handles the routing logic
  return null;
}
