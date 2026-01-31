import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';
import { openAppointmentSheetWindow } from '../services/appointmentSheetService';

const UserBookingForm = ({ doctor, onBookingComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userType, setUserType] = useState('existing'); // 'existing' or 'new'
  
  // Existing user form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // New user registration form
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: 'male',
    cnic: ''
  });
  
  // Appointment form
  const [appointmentForm, setAppointmentForm] = useState({
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });
      
      if (error) throw error;
      
      // Check if user has patient profile
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (!patientProfile) {
        setShowRegistration(true);
        setUserType('new');
        // Pre-fill registration form with user data
        setRegistrationForm(prev => ({
          ...prev,
          name: data.user.user_metadata?.name || '',
          email: data.user.email || ''
        }));
      }
      
      setIsLoading(false);
    } catch (error) {
      alert('Login failed: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate passwords match
      if (registrationForm.password !== registrationForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Register user
      const { data, error } = await supabase.auth.signUp({
        email: registrationForm.email,
        password: registrationForm.password,
        options: {
          data: {
            name: registrationForm.name,
            role: 'patient'
          }
        }
      });
      
      if (error) throw error;
      
      // Create patient profile
      const { error: profileError } = await apiRequest('/api/patients/profile', {
        method: 'POST',
        body: JSON.stringify({
          userId: data.user.id,
          name: registrationForm.name,
          email: registrationForm.email,
          phone: registrationForm.phone,
          age: parseInt(registrationForm.age),
          gender: registrationForm.gender,
          cnic: registrationForm.cnic
        })
      });
      
      if (profileError) throw profileError;
      
      alert('Registration successful! Please login to continue.');
      setUserType('existing');
      setIsLoading(false);
    } catch (error) {
      alert('Registration failed: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate appointment form
      if (!appointmentForm.appointment_date || !appointmentForm.appointment_time) {
        throw new Error('Please select appointment date and time');
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please login first');
      }
      
      // Get patient profile
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!patientData) {
        throw new Error('Patient profile not found');
      }
      
      // Book appointment
      const response = await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: doctor.id,
          appointment_date: appointmentForm.appointment_date,
          appointment_time: appointmentForm.appointment_time,
          reason: appointmentForm.reason || null
        })
      });
      
      // Prepare appointment data for sheet
      const appointmentData = {
        ...response.appointment,
        appointment_date: appointmentForm.appointment_date,
        appointment_time: appointmentForm.appointment_time,
        reason: appointmentForm.reason || null
      };
      
      // Generate and download appointment sheet
      openAppointmentSheetWindow(appointmentData, doctor, patientData);
      
      // Show success message
      alert('Session booked successfully! Your appointment sheet has been generated.');
      
      // Reset forms
      setAppointmentForm({ appointment_date: '', appointment_time: '', reason: '' });
      
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      setIsLoading(false);
    } catch (error) {
      alert('Booking failed: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Session with Dr. {doctor.name}</h2>
      
      {/* User Type Selection */}
      {!showRegistration && (
        <div className="mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setUserType('existing')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                userType === 'existing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Existing User
            </button>
            <button
              onClick={() => setUserType('new')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                userType === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              New User
            </button>
          </div>
        </div>
      )}
      
      {/* Existing User Login */}
      {userType === 'existing' && !showRegistration && (
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
      
      {/* New User Registration */}
      {(userType === 'new' || showRegistration) && (
        <form onSubmit={handleRegistration} className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Account</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={registrationForm.name}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={registrationForm.email}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={registrationForm.password}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={registrationForm.confirmPassword}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={registrationForm.phone}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+92 300 1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                required
                value={registrationForm.age}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                required
                value={registrationForm.gender}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
              <input
                type="text"
                required
                value={registrationForm.cnic}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, cnic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345-1234567-1"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}
      
      {/* Appointment Booking Form */}
      {userType === 'existing' && !showRegistration && (
        <form onSubmit={handleBookSession} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Appointment</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
              <input
                type="date"
                required
                value={appointmentForm.appointment_date}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time</label>
              <input
                type="time"
                required
                value={appointmentForm.appointment_time}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit (Optional)</label>
            <textarea
              value={appointmentForm.reason}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Describe your symptoms or reason for visit..."
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg"
          >
            {isLoading ? 'Booking Session...' : '📋 Book Session & Download Appointment Sheet'}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserBookingForm;
