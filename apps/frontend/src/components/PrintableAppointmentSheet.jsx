/**
 * Printable Appointment Sheet Component
 * Generates a professional A4-style appointment sheet when booking sessions
 */

import React from 'react';

const PrintableAppointmentSheet = ({ 
  patientDetails, 
  doctorDetails, 
  appointmentDetails,
  onDownload,
  onPrint 
}) => {
  const {
    name: patientName = '',
    age = '',
    gender = '',
    phone = '',
    id: patientId = ''
  } = patientDetails || {};

  const {
    name: doctorName = '',
    specialization = ''
  } = doctorDetails || {};

  const {
    date = '',
    time = ''
  } = appointmentDetails || {};

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  const handleDownload = () => {
    // Create a temporary window for download
    const printWindow = window.open('', '_blank');
    const content = document.getElementById('appointment-sheet-content').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment Sheet - Dr. Sanaullah Welfare Foundation</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; }
            }
          </style>
        </head>
        <body class="bg-white">
          ${content}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    if (onDownload) onDownload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Print Controls - Hidden when printing */}
      <div className="no-print max-w-4xl mx-auto mb-4">
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Appointment Sheet Generated</h3>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
            >
              🖨️ Print Sheet
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
            >
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Sheet Content - A4 Style */}
      <div className="max-w-4xl mx-auto">
        <div 
          id="appointment-sheet-content"
          className="bg-white shadow-lg" 
          style={{ minHeight: '1123px', width: '210mm' }}
        >
          {/* Header Section */}
          <div className="border-b border-gray-300 pb-6 mb-8 px-8 pt-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/last-logo.png" 
                alt="DSWF Logo" 
                className="h-16 w-auto mr-4"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM0Rjc5NDIiLz4KPHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNiIgeT0iMTYiPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDE2VjE2SDhWMTZaTTE2IDhIMjRWMTZIMTZWOFpNOCAxNkgxNlYyNEgxNlYxNkg4VjE2Wk0xNiAxNkgyNFYyNEgxNlYxNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4=';
                }}
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Dr. Sanaullah Welfare Foundation
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Session Summary / Appointment Sheet
                </p>
              </div>
            </div>
          </div>

          {/* Patient and Doctor Details - Side by Side */}
          <div className="px-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Patient Details Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                  Patient Details
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Name:</span>
                    <span className="text-gray-900">{patientName || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Age:</span>
                    <span className="text-gray-900">{age ? `${age} years` : 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Gender:</span>
                    <span className="text-gray-900 capitalize">{gender || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Contact:</span>
                    <span className="text-gray-900">{phone || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Patient ID:</span>
                    <span className="text-gray-900 text-sm">{patientId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Doctor Details Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                  Doctor Details
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Name:</span>
                    <span className="text-gray-900">Dr. {doctorName || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Specialization:</span>
                    <span className="text-gray-900">{specialization || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Session Date:</span>
                    <span className="text-gray-900">
                      {date ? 
                        new Date(date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Session Time:</span>
                    <span className="text-gray-900">{time || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-32">Appointment ID:</span>
                    <span className="text-gray-900 text-sm">Generated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Body - Intentionally Empty for Notes */}
          <div className="px-8 mb-8" style={{ minHeight: '400px' }}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 h-full">
              <div className="text-center text-gray-400 mb-6">
                <p className="text-sm">Space for Doctor Notes, Diagnosis & Prescription</p>
              </div>
              
              {/* Subtle lines for writing guidance */}
              <div className="space-y-4">
                {[...Array(15)].map((_, index) => (
                  <div key={index} className="border-b border-gray-200" style={{ height: '24px' }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Section - Fixed at Bottom */}
          <div className="mt-auto border-t border-gray-300 pt-6 px-8 pb-8">
            <div className="text-center text-sm text-gray-600">
              <p className="font-semibold">Dr. Sanaullah Welfare Foundation</p>
              <p className="mt-1">
                [Hospital Address], Peshawar, Pakistan
              </p>
              <p className="mt-1">
                Phone: +92-XXX-XXXXXXX | Email: info@dswf.org
              </p>
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

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          
          .bg-white {
            background: white !important;
          }
          
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          
          .text-gray-800 {
            color: #1f2937 !important;
          }
          
          .text-gray-700 {
            color: #374151 !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .text-gray-900 {
            color: #111827 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableAppointmentSheet;
