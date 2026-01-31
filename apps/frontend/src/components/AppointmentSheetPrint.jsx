import React from 'react';

const AppointmentSheet = ({ 
  patient = {}, 
  doctor = {}, 
  appointment = {},
  logoUrl = "/logo.jpeg",
  isPrintMode = false
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would trigger PDF download via backend API
    if (appointment.id) {
      window.open(`/api/appointments/${appointment.id}/appointment-sheet/pdf`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Only show when not in print mode */}
      {!isPrintMode && (
        <div className="bg-gray-100 p-4 border-b no-print">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Sheet</h2>
            <div className="space-x-4">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isPrintMode ? 'p-6' : 'p-8'} max-w-4xl mx-auto`} style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <img 
              src={logoUrl} 
              alt="DSWF Logo" 
              className="h-16 mr-4"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dr. Sanaullah Welfare Foundation</h1>
              <p className="text-sm text-gray-600">Healthcare Excellence</p>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-4">
            <h2 className="text-xl font-semibold text-gray-700">Appointment Sheet</h2>
          </div>
        </div>

        {/* Patient and Doctor Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Patient Details (Left) */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">
              Patient Details
            </h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Name:</span>
                <span className="text-gray-800">{patient.name || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Age:</span>
                <span className="text-gray-800">{patient.age || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Gender:</span>
                <span className="text-gray-800">{patient.gender || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Contact:</span>
                <span className="text-gray-800">{patient.phone || patient.contact || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Patient ID:</span>
                <span className="text-gray-800">{patient.id || patient.patient_id || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Doctor Details (Right) */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">
              Doctor Details
            </h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Name:</span>
                <span className="text-gray-800">{doctor.name || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Specialization:</span>
                <span className="text-gray-800">{doctor.specialization || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Date:</span>
                <span className="text-gray-800">{formatDate(appointment.appointment_date || appointment.date)}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Time:</span>
                <span className="text-gray-800">{formatTime(appointment.appointment_time || appointment.time)}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Status:</span>
                <span className="text-gray-800 capitalize">{appointment.status || 'Scheduled'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Body - Intentionally Empty for Notes */}
        <div className="mb-8">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 min-h-[400px]">
            <div className="text-center text-gray-400 mb-4">
              <p className="text-sm">Space for Doctor Notes, Diagnosis & Prescription</p>
            </div>
            
            {/* Subtle lines for handwriting guidance */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
              <div className="border-b border-gray-200 pb-4"></div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto">
          <div className="border-t border-gray-300 pt-4">
            <div className="text-center text-sm text-gray-600">
              <p className="font-semibold">Dr. Sanaullah Welfare Foundation</p>
              <p className="mt-1">Main Hospital Building, Peshawar, Pakistan</p>
              <p className="mt-1">Phone: +92-XXX-XXXXXXX | Email: info@drsanaullahwelfarefoundation.com</p>
              <p className="mt-2 text-xs text-gray-500">
                Generated on: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact;
          }
          .border-gray-200 {
            border-color: #e5e7eb !important;
            -webkit-print-color-adjust: exact;
          }
          .text-gray-800 {
            color: #1f2937 !important;
            -webkit-print-color-adjust: exact;
          }
          .text-gray-600 {
            color: #4b5563 !important;
            -webkit-print-color-adjust: exact;
          }
          .border-dashed {
            border-style: dashed !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentSheet;
