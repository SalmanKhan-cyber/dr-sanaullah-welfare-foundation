/**
 * Enhanced Login Component with Strict Role-Based Routing
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

export default function SecureLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Invalid email or password');
        return;
      }

      if (!data.user) {
        setError('Login failed');
        return;
      }

      // Step 2: Get user's role from database
      const userRes = await apiRequest('/api/users/me');
      
      if (!userRes.user) {
        setError('User account not found in system');
        await supabase.auth.signOut();
        return;
      }

      const userRole = userRes.user.role;
      const isVerified = userRes.user.verified;

      console.log(`🔐 Login successful: ${email} -> Role: ${userRole}, Verified: ${isVerified}`);

      // Step 3: Check verification status for roles that need approval
      const needsApproval = !['patient', 'donor', 'student'].includes(userRole);
      
      if (needsApproval && !isVerified) {
        console.log(`⏳ User ${userRole} needs approval`);
        navigate('/pending-approval');
        return;
      }

      // Step 4: Check if user has multiple roles
      try {
        const rolesRes = await apiRequest('/api/auth/user-roles');
        const availableRoles = rolesRes.roles || [];
        
        if (availableRoles.length > 1) {
          // User has multiple roles, redirect to role selector
          console.log(`👥 User has ${availableRoles.length} roles, showing selector`);
          navigate('/select-role');
          return;
        }
      } catch (err) {
        console.warn('Could not check multiple roles:', err);
      }

      // Step 5: Redirect to correct dashboard based on role
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

      const targetDashboard = dashboardMap[userRole] || '/dashboard/patient';
      
      console.log(`✅ Redirecting ${userRole} to: ${targetDashboard}`);
      navigate(targetDashboard);

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Security Notice:</strong> You will only be able to access the dashboard corresponding to your assigned role.
          </p>
        </div>
      </div>
    </div>
  );
}
