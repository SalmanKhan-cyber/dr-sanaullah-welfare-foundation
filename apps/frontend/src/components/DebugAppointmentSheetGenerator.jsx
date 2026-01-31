import React, { useState } from 'react';
import { apiRequest } from '../lib/api';

const DebugAppointmentSheetGenerator = ({ appointmentId, onGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateSheet = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiRequest(`/api/debug/generate-appointment-sheet/${appointmentId}`, {
        method: 'POST'
      });

      setResult(response);
      if (onGenerated) {
        onGenerated(response);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate appointment sheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Debug: Generate Appointment Sheet</h3>
      
      <button
        onClick={handleGenerateSheet}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        {loading ? 'Generating...' : '🔧 Generate Appointment Sheet'}
      </button>

      {result && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ Success!</h4>
          <p className="text-sm text-green-700 mb-1">{result.message}</p>
          {result.appointment_sheet_url && (
            <div className="mt-2">
              <a
                href={result.appointment_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                📄 Download Generated Sheet
              </a>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">❌ Error</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DebugAppointmentSheetGenerator;
