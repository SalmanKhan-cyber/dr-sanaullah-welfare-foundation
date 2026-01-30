/**
 * Role Selection Component
 * Allows users to choose which role to access when they have multiple roles
 */

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export default function RoleSelector({ onRoleSelected, currentRole }) {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadAvailableRoles();
  }, []);

  async function loadAvailableRoles() {
    try {
      const res = await apiRequest('/api/auth/user-roles');
      setAvailableRoles(res.roles || []);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleSelect(role) {
    if (role === currentRole) {
      onRoleSelected?.(role);
      return;
    }

    setSwitching(true);
    try {
      await apiRequest('/api/auth/set-role', {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      
      onRoleSelected?.(role);
    } catch (err) {
      console.error('Failed to switch role:', err);
      alert('Failed to switch roles. Please try again.');
    } finally {
      setSwitching(false);
    }
  }

  const roleIcons = {
    admin: '🧑‍💼',
    patient: '👤',
    doctor: '👨‍⚕️',
    donor: '💰',
    lab: '🧪',
    blood_bank: '🩸',
    student: '🎓',
    teacher: '👨‍🏫',
    pharmacy: '💊'
  };

  const roleNames = {
    admin: 'Administrator',
    patient: 'Patient',
    doctor: 'Doctor',
    donor: 'Donor',
    lab: 'Laboratory',
    blood_bank: 'Blood Bank',
    student: 'Student',
    teacher: 'Teacher',
    pharmacy: 'Pharmacy'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your roles...</p>
        </div>
      </div>
    );
  }

  if (availableRoles.length <= 1) {
    // Only one role, auto-redirect
    const singleRole = availableRoles[0]?.role || 'patient';
    onRoleSelected?.(singleRole);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Role</h1>
          <p className="text-gray-600">You have access to multiple roles. Choose which one you want to use:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRoles.map((roleItem) => {
            const role = roleItem.role;
            const isActive = role === currentRole;
            
            return (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                disabled={switching}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }
                  ${switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{roleIcons[role] || '👤'}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {roleNames[role] || role}
                  </h3>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Current
                      </span>
                    </div>
                  )}
                  {switching && role !== currentRole && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Security Notice:</strong> Each role has different permissions and access levels. 
            Make sure you select the appropriate role for your current tasks.
          </p>
        </div>
      </div>
    </div>
  );
}
