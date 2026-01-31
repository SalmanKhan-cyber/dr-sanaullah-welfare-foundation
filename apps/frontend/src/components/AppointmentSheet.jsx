import React from 'react';

const AppointmentSheet = ({ appointmentData, doctorData, patientData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Handle time format (HH:MM or 12-hour format)
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 min-h-[297mm] flex flex-col print:p-6">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center mb-3">
          <img 
            src="/logo.jpeg" 
            alt="DSWF Logo" 
            className="h-16 w-auto mr-4"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2310b981'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='12' font-weight='bold'%3EDSWF%3C/text%3E%3C/svg%3E";
            }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dr. Sanaullah Welfare Foundation</h1>
            <p className="text-sm text-gray-600">Healthcare Excellence Since 2020</p>
          </div>
        </div>
        <div className="border-t-2 border-gray-300"></div>
      </div>

      {/* Patient and Doctor Details Side by Side */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Patient Details Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            Patient Details
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Name:</span>
              <span className="text-gray-900">{patientData?.name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Age:</span>
              <span className="text-gray-900">
                {patientData?.age || patientData?.date_of_birth ? 
                  (patientData?.age || new Date().getFullYear() - new Date(patientData.date_of_birth).getFullYear()) + ' years' : 
                  'N/A'
                }
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Gender:</span>
              <span className="text-gray-900 capitalize">{patientData?.gender || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Contact:</span>
              <span className="text-gray-900">{patientData?.phone || patientData?.contact || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Patient ID:</span>
              <span className="text-gray-900">{patientData?.id || appointmentData?.patient_id || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Doctor Details Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            Doctor Details
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Name:</span>
              <span className="text-gray-900">{doctorData?.name || appointmentData?.doctors?.name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Specialization:</span>
              <span className="text-gray-900 capitalize">{doctorData?.specialization || appointmentData?.doctors?.specialization || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Date:</span>
              <span className="text-gray-900">{formatDate(appointmentData?.appointment_date)}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Time:</span>
              <span className="text-gray-900">{formatTime(appointmentData?.appointment_time)}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-28">Status:</span>
              <span className="text-gray-900 capitalize">{appointmentData?.status || 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body - Intentionally Empty for Notes */}
      <div className="flex-grow mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[200mm]">
          <p className="text-center text-gray-400 text-sm mb-4">
            Doctor's Notes, Diagnosis, and Prescription Area
          </p>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Notes / Observations:</h3>
              <div className="h-32 border border-gray-100 rounded"></div>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Diagnosis:</h3>
              <div className="h-32 border border-gray-100 rounded"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Prescription:</h3>
              <div className="h-32 border border-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto">
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold">Dr. Sanaullah Welfare Foundation</p>
            <p>Hayatabad, Peshawar, Pakistan</p>
            <p>Phone: +92-XXX-XXXXXXX | Email: info@drsanaullahwelfarefoundation.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSheet;
