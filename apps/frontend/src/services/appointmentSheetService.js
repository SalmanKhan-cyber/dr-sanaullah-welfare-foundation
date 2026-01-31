import React from 'react';
import ReactDOMServer from 'react-dom/server';
import AppointmentSheet from './AppointmentSheet';

export const generateAppointmentSheetHTML = (appointmentData, doctorData, patientData) => {
  const appointmentSheetHTML = ReactDOMServer.renderToString(
    <AppointmentSheet 
      appointmentData={appointmentData}
      doctorData={doctorData}
      patientData={patientData}
    />
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Sheet - Dr. Sanaullah Welfare Foundation</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page {
          margin: 20mm;
          size: A4;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-break {
            page-break-inside: avoid;
          }
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        
        .max-w-\\[210mm\\] {
          max-width: 210mm;
        }
        
        .min-h-\\[297mm\\] {
          min-height: 297mm;
        }
      </style>
    </head>
    <body>
      ${appointmentSheetHTML}
      
      <script>
        // Auto-print functionality
        window.onload = function() {
          // Add print button
          const printButton = document.createElement('div');
          printButton.className = 'no-print fixed top-4 right-4 z-50';
          printButton.innerHTML = \`
            <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
              🖨️ Print Appointment Sheet
            </button>
            <button onclick="window.close()" class="ml-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-lg">
              ✖️ Close
            </button>
          \`;
          document.body.appendChild(printButton);
        };
      </script>
    </body>
    </html>
  `;
};

export const openAppointmentSheetWindow = (appointmentData, doctorData, patientData) => {
  const htmlContent = generateAppointmentSheetHTML(appointmentData, doctorData, patientData);
  
  const newWindow = window.open('', '_blank', 'width=800,height=1000,scrollbars=yes,resizable=yes');
  
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // Focus on the new window
    newWindow.focus();
    
    return newWindow;
  } else {
    // If popup is blocked, open in same tab
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  }
};

export const downloadAppointmentSheetPDF = async (appointmentData, doctorData, patientData) => {
  try {
    // For PDF generation, we'll use the browser's print functionality
    // which allows users to save as PDF
    const htmlContent = generateAppointmentSheetHTML(appointmentData, doctorData, patientData);
    
    const newWindow = window.open('', '_blank', 'width=800,height=1000');
    
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  } catch (error) {
    console.error('Error generating appointment sheet:', error);
    alert('Failed to generate appointment sheet. Please try again.');
  }
};
