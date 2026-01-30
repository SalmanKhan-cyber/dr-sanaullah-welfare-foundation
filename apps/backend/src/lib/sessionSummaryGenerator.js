/**
 * Session Summary PDF Generator
 * Creates a professional PDF for appointment session summaries
 */

import PDFDocument from 'pdfkit';

export function generateSessionSummaryPDF(appointmentData) {
  const {
    patient,
    doctor,
    appointment,
    appointmentId,
    hospitalInfo = {
      name: "Dr. Sanaullah Welfare Foundation",
      address: "[Hospital Address], Peshawar, Pakistan",
      phone: "+92-XXX-XXXXXXX",
      email: "info@dswf.org"
    }
  } = appointmentData;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Helper function for adding text
      const addText = (text, x, y, options = {}) => {
        doc.fontSize(options.fontSize || 12)
           .font(options.font || 'Helvetica')
           .text(text, x, y, options);
      };

      // Header Section
      doc.fontSize(20).font('Helvetica-Bold').text(hospitalInfo.name, 50, 50, { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('Session Summary / Appointment Sheet', 50, 75, { align: 'center' });
      
      // Header line
      doc.moveTo(50, 100).lineTo(545, 100).stroke();

      // Patient Details (Left Column)
      doc.fontSize(14).font('Helvetica-Bold').text('PATIENT DETAILS', 50, 120);
      doc.fontSize(11).font('Helvetica');
      
      let yPosition = 140;
      addText(`Name: ${patient?.name || 'N/A'}`, 50, yPosition);
      yPosition += 18;
      addText(`Age: ${patient?.age || 'N/A'} years`, 50, yPosition);
      yPosition += 18;
      addText(`Gender: ${patient?.gender || 'N/A'}`, 50, yPosition);
      yPosition += 18;
      addText(`Contact: ${patient?.phone || patient?.email || 'N/A'}`, 50, yPosition);
      yPosition += 18;
      addText(`Patient ID: ${patient?.id || patient?.user_id || 'N/A'}`, 50, yPosition);

      // Doctor Details (Right Column)
      doc.fontSize(14).font('Helvetica-Bold').text('DOCTOR DETAILS', 300, 120);
      doc.fontSize(11).font('Helvetica');
      
      yPosition = 140;
      addText(`Name: Dr. ${doctor?.name || 'N/A'}`, 300, yPosition);
      yPosition += 18;
      addText(`Specialization: ${doctor?.specialization || 'N/A'}`, 300, yPosition);
      yPosition += 18;
      addText(`Session Date: ${appointment?.date || 'N/A'}`, 300, yPosition);
      yPosition += 18;
      addText(`Session Time: ${appointment?.time || 'N/A'}`, 300, yPosition);
      yPosition += 18;
      addText(`Appointment ID: ${appointmentId || 'N/A'}`, 300, yPosition);

      // Main Body - Empty Space for Notes
      yPosition += 30;
      doc.fontSize(12).font('Helvetica-Oblique').text('(Space for Doctor Notes, Diagnosis & Prescription)', 50, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Create lined area for notes
      for (let i = 0; i < 25; i++) {
        yPosition += 15;
        doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
      }

      // Footer Section
      const footerY = 720;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke();
      
      doc.fontSize(10).font('Helvetica');
      doc.text(hospitalInfo.name, 50, footerY + 10, { align: 'center' });
      doc.text(hospitalInfo.address, 50, footerY + 25, { align: 'center' });
      doc.text(`Phone: ${hospitalInfo.phone} | Email: ${hospitalInfo.email}`, 50, footerY + 40, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, footerY + 55, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateSessionSummaryFileName(patient, appointmentId) {
  const date = new Date().toISOString().split('T')[0];
  const patientName = (patient?.name || 'Unknown').replace(/\s+/g, '_').toLowerCase();
  return `session-summary_${patientName}_${appointmentId}_${date}.pdf`;
}
