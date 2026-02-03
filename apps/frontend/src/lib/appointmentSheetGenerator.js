// Simple frontend appointment sheet generator
export function generateAppointmentSheetHTML(appointmentData) {
    const { doctor, patientDetails, appointmentDate, appointmentTime, reason } = appointmentData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Appointment Sheet</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
            }
            .sheet {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border: 1px solid #ddd;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #333;
                margin: 0;
                font-size: 28px;
            }
            .section {
                margin-bottom: 25px;
            }
            .section h2 {
                color: #555;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 200px 1fr;
                gap: 10px;
                margin-bottom: 10px;
            }
            .info-label {
                font-weight: bold;
                color: #666;
            }
            .info-value {
                color: #333;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            @media print {
                body { background: white; }
                .sheet { box-shadow: none; border: none; }
            }
        </style>
    </head>
    <body>
        <div class="sheet">
            <div class="header">
                <h1>APPOINTMENT SHEET</h1>
                <p>Dr. Sanaullah Welfare Foundation</p>
            </div>
            
            <div class="section">
                <h2>PATIENT INFORMATION</h2>
                <div class="info-grid">
                    <div class="info-label">Name:</div>
                    <div class="info-value">${patientDetails.name}</div>
                    
                    <div class="info-label">Phone:</div>
                    <div class="info-value">${patientDetails.phone}</div>
                    
                    <div class="info-label">Age:</div>
                    <div class="info-value">${patientDetails.age}</div>
                    
                    <div class="info-label">Gender:</div>
                    <div class="info-value">${patientDetails.gender}</div>
                    
                    <div class="info-label">CNIC:</div>
                    <div class="info-value">${patientDetails.cnic}</div>
                    
                    ${patientDetails.history ? `
                    <div class="info-label">Medical History:</div>
                    <div class="info-value">${patientDetails.history}</div>
                    ` : ''}
                </div>
            </div>
            
            <div class="section">
                <h2>DOCTOR INFORMATION</h2>
                <div class="info-grid">
                    <div class="info-label">Doctor Name:</div>
                    <div class="info-value">${doctor.name}</div>
                    
                    <div class="info-label">Specialization:</div>
                    <div class="info-value">${doctor.specialization}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>APPOINTMENT DETAILS</h2>
                <div class="info-grid">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${appointmentDate}</div>
                    
                    <div class="info-label">Time:</div>
                    <div class="info-value">${appointmentTime}</div>
                    
                    <div class="info-label">Reason:</div>
                    <div class="info-value">${reason || 'General consultation'}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Please arrive 15 minutes before your appointment time.</p>
                <p>Bring this appointment sheet and any previous medical records.</p>
                <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function downloadAppointmentSheet(appointmentData) {
    const html = generateAppointmentSheetHTML(appointmentData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-sheet-${Date.now()}.html`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

export function openAppointmentSheet(appointmentData) {
    const html = generateAppointmentSheetHTML(appointmentData);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
}
