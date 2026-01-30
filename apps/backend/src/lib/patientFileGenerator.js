/**
 * Patient File Generator
 * Creates PDF patient files when appointments are booked
 * Includes doctor details, patient info, and space for medical notes
 */

import PDFDocument from 'pdfkit';

export function generatePatientFilePDF(appointmentData) {
  const {
    patient,
    doctor,
    appointment,
    hospitalInfo = {
      name: "Dr. Sanaullah Welfare Foundation",
      address: "Hospital Address, City",
      phone: "+92-XXX-XXXXXXX",
      email: "info@foundation.org"
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
      doc.fontSize(12).font('Helvetica').text(hospitalInfo.address, 50, 75, { align: 'center' });
      doc.fontSize(10).text(`Phone: ${hospitalInfo.phone} | Email: ${hospitalInfo.email}`, 50, 90, { align: 'center' });

      // Divider line
      doc.moveTo(50, 110).lineTo(545, 110).stroke();

      // Title
      doc.fontSize(16).font('Helvetica-Bold').text('PATIENT FILE', 50, 130, { align: 'center' });

      // Patient Details Section
      doc.fontSize(14).font('Helvetica-Bold').text('PATIENT INFORMATION', 50, 160);
      doc.fontSize(11).font('Helvetica');
      
      doc.text(`Name: ${patient.name || 'N/A'}`, 50, 180);
      doc.text(`Age: ${patient.age || 'N/A'} years`, 50, 195);
      doc.text(`Gender: ${patient.gender || 'N/A'}`, 50, 210);
      doc.text(`CNIC: ${patient.cnic || 'N/A'}`, 50, 225);
      doc.text(`Phone: ${patient.phone || 'N/A'}`, 50, 240);
      doc.text(`Email: ${patient.email || 'N/A'}`, 50, 255);

      // Doctor Details Section
      doc.fontSize(14).font('Helvetica-Bold').text('DOCTOR INFORMATION', 300, 160);
      doc.fontSize(11).font('Helvetica');
      
      doc.text(`Dr. ${doctor.name || 'N/A'}`, 300, 180);
      doc.text(`Specialization: ${doctor.specialization || 'N/A'}`, 300, 195);
      doc.text(`Appointment Date: ${appointment.date || 'N/A'}`, 300, 210);
      doc.text(`Appointment Time: ${appointment.time || 'N/A'}`, 300, 225);
      doc.text(`Appointment ID: ${appointment.id || 'N/A'}`, 300, 240);

      // Medical History Section
      doc.fontSize(14).font('Helvetica-Bold').text('MEDICAL HISTORY', 50, 290);
      doc.fontSize(11).font('Helvetica');
      doc.text(`${patient.history || 'No previous medical history recorded.'}`, 50, 310, { width: 495 });

      // Divider
      doc.moveTo(50, 350).lineTo(545, 350).stroke();

      // Consultation Notes Section
      doc.fontSize(14).font('Helvetica-Bold').text('CONSULTATION NOTES', 50, 370);
      doc.fontSize(11).font('Helvetica').text('(To be filled by doctor)', 50, 390);

      // Create lined area for notes
      let yPosition = 410;
      for (let i = 0; i < 15; i++) {
        doc.text(`${i + 1}. _________________________________________________________________`, 50, yPosition);
        yPosition += 15;
      }

      // Prescription Section
      doc.fontSize(14).font('Helvetica-Bold').text('PRESCRIPTION', 50, yPosition + 20);
      doc.fontSize(11).font('Helvetica').text('(To be filled by doctor)', 50, yPosition + 40);

      // Create prescription table
      yPosition += 60;
      doc.text('Medicine', 50, yPosition);
      doc.text('Dosage', 200, yPosition);
      doc.text('Frequency', 300, yPosition);
      doc.text('Duration', 400, yPosition);
      doc.text('Notes', 480, yPosition);

      // Table lines
      for (let i = 0; i < 10; i++) {
        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
        yPosition += 15;
        if (i < 9) {
          doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
        }
      }

      // Footer Section
      doc.fontSize(10).font('Helvetica');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 720);
      doc.text('Page 1 of 1', 480, 720);

      // Doctor signature area
      doc.fontSize(12).font('Helvetica-Bold').text('Doctor Signature:', 350, 680);
      doc.moveTo(350, 700).lineTo(500, 700).stroke();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generatePatientFileName(patient, appointment) {
  const date = new Date().toISOString().split('T')[0];
  const patientName = (patient.name || 'Unknown').replace(/\s+/g, '_').toLowerCase();
  return `patient_file_${patientName}_${appointment.id}_${date}.pdf`;
}
