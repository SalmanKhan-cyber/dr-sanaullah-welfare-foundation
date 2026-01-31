import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import UserBookingForm from '../components/UserBookingForm';

export default function QuickBooking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await apiRequest('/api/doctors/public');
      setDoctors(response.doctors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = [...new Set(doctors.map(doctor => doctor.specialization))];

  const handleBookingComplete = () => {
    setSelectedDoctor(null);
    // Optionally show success message or redirect
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quick Doctor Booking
          </h1>
          <p className="text-xl text-gray-600">
            Book your appointment and get your printable appointment sheet instantly
          </p>
        </div>

        {!selectedDoctor ? (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctors</label>
                  <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('');
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Doctors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {doctor.image_url ? (
                        <img
                          src={doctor.image_url}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <span className="text-gray-500 text-xl">👨‍⚕️</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        {doctor.degrees && (
                          <p className="text-xs text-gray-500">{doctor.degrees}</p>
                        )}
                      </div>
                    </div>
                    
                    {doctor.experience && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Experience: </span>
                        <span className="text-sm font-medium">{doctor.experience} years</span>
                      </div>
                    )}
                    
                    {doctor.consultation_fee && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">Consultation Fee: </span>
                        <span className="text-lg font-bold text-green-600">PKR {doctor.consultation_fee}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        ) : (
          /* Booking Form */
          <div>
            <button
              onClick={() => setSelectedDoctor(null)}
              className="mb-6 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back to Doctors
            </button>
            <UserBookingForm 
              doctor={selectedDoctor} 
              onBookingComplete={handleBookingComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
