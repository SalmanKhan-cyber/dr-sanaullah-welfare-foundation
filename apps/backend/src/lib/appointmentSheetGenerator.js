/**
 * Appointment Sheet Generator
 * Creates PDF appointment sheets for patients and doctors
 * Enhanced with professional medical document design
 */

import PDFDocument from 'pdfkit';

export function generateAppointmentSheetPDF(appointmentData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Collect PDF chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { patient, doctor, appointment } = appointmentData;

      // Header Section with Foundation Name
      doc.fontSize(18).font('Helvetica-Bold').text('Dr. Sanaullah Welfare Foundation', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Healthcare Excellence', { align: 'center' });
      doc.moveDown();

      // Appointment Sheet Title
      doc.fontSize(16).font('Helvetica-Bold').text('APPOINTMENT SHEET', { align: 'center' });
      doc.moveDown();

      // Horizontal line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Two-column layout for Patient and Doctor details
      const patientX = 50;
      const doctorX = 300;
      const startY = doc.y;

      // Patient Details Section (Left Column)
      doc.fontSize(14).font('Helvetica-Bold').text('PATIENT DETAILS', patientX, startY);
      doc.font('Helvetica').fontSize(11);
      doc.text(`Name: ${patient?.name || 'N/A'}`, patientX, startY + 20);
      doc.text(`Age: ${patient?.age || 'N/A'}`, patientX, startY + 35);
      doc.text(`Gender: ${patient?.gender || 'N/A'}`, patientX, startY + 50);
      doc.text(`Contact: ${patient?.phone || patient?.contact || 'N/A'}`, patientX, startY + 65);
      doc.text(`Patient ID: ${patient?.id || patient?.patient_id || 'N/A'}`, patientX, startY + 80);

      // Doctor Details Section (Right Column)
      doc.fontSize(14).font('Helvetica-Bold').text('DOCTOR DETAILS', doctorX, startY);
      doc.font('Helvetica').fontSize(11);
      doc.text(`Name: ${doctor?.name || 'N/A'}`, doctorX, startY + 20);
      doc.text(`Specialization: ${doctor?.specialization || 'N/A'}`, doctorX, startY + 35);
      doc.text(`Date: ${appointment?.appointment_date || appointment?.date || 'N/A'}`, doctorX, startY + 50);
      doc.text(`Time: ${appointment?.appointment_time || appointment?.time || 'N/A'}`, doctorX, startY + 65);
      doc.text(`Status: ${appointment?.status || 'Scheduled'}`, doctorX, startY + 80);

      // Move down after details
      doc.moveDown(3);

      // Main Body - Empty Space for Notes
      doc.fontSize(12).font('Helvetica-Bold').text('DOCTOR NOTES, DIAGNOSIS & PRESCRIPTION:', 50, doc.y);
      doc.moveDown();

      // Draw empty space with subtle lines
      const notesStartY = doc.y;
      const notesHeight = 300; // Large space for notes
      const lineSpacing = 20;
      
      for (let i = 0; i < Math.floor(notesHeight / lineSpacing); i++) {
        const y = notesStartY + (i * lineSpacing);
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#e0e0e0').lineWidth(0.5);
      }

      // Position cursor after notes section
      doc.y = notesStartY + notesHeight + 20;

      // Footer Section
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Footer content
      doc.fontSize(10).font('Helvetica').text('Dr. Sanaullah Welfare Foundation', { align: 'center' });
      doc.text('Main Hospital Building, Peshawar, Pakistan', { align: 'center' });
      doc.text('Phone: +92-XXX-XXXXXXX | Email: info@drsanaullahwelfarefoundation.com', { align: 'center' });
      doc.moveDown();
      
      // Generation timestamp
      doc.fontSize(8).text(
        `Generated on: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        { align: 'center' }
      );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

export function generateAppointmentSheetFileName(appointmentData) {
  const patientName = appointmentData.patient?.name || 'Unknown';
  const doctorName = appointmentData.doctor?.name || 'Unknown';
  const date = appointmentData.appointment?.appointment_date || new Date().toISOString().split('T')[0];
  
  // Clean names for filename
  const cleanPatientName = patientName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const cleanDoctorName = doctorName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const cleanDate = date.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `appointment_sheet_${cleanPatientName}_${cleanDoctorName}_${cleanDate}.pdf`;
}
