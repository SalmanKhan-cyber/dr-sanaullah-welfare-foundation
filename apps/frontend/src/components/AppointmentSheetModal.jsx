/**
 * Appointment Sheet Modal
 * Shows after successful appointment booking with printable sheet
 */

import React, { useState } from 'react';
import PrintableAppointmentSheet from './PrintableAppointmentSheet';

const AppointmentSheetModal = ({ 
  isOpen, 
  onClose, 
  patientDetails, 
  doctorDetails, 
  appointmentDetails 
}) => {
  const [sheetGenerated, setSheetGenerated] = useState(false);

  const handleDownload = () => {
    setSheetGenerated(true);
    setTimeout(() => {
      onClose();
    }, 2000); // Close modal after download
  };

  const handlePrint = () => {
    setSheetGenerated(true);
    setTimeout(() => {
      onClose();
    }, 2000); // Close modal after print
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Modal content */}
        <div className="inline-block w-full max-w-6xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  📋 Appointment Sheet Generated
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Your appointment has been booked successfully. Here's your printable appointment sheet.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Success Message */}
          {sheetGenerated && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Appointment sheet {sheetGenerated === 'downloaded' ? 'downloaded' : 'printed'} successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Printable Appointment Sheet */}
          <div className="bg-gray-50 p-4">
            <PrintableAppointmentSheet
              patientDetails={patientDetails}
              doctorDetails={doctorDetails}
              appointmentDetails={appointmentDetails}
              onDownload={handleDownload}
              onPrint={handlePrint}
            />
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                💡 Save this sheet for your medical records and bring it to your appointment.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSheetModal;
