// Print-ready A5 appointment slip generator for Dr. Sanaullah Welfare Foundation
export function generateAppointmentSlipHTML(appointmentData) {
    const { doctor, patientDetails, appointmentDate, appointmentTime, reason } = appointmentData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dr. Sanaullah Welfare Foundation - Appointment Slip</title>
        <meta charset="UTF-8">
        <style>
            @page {
                size: A5 portrait;
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                width: 148mm;
                height: 210mm;
                background: white;
                color: #2c3e50;
                overflow: hidden;
                position: relative;
            }
            
            .slip-container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            
            /* Header Section */
            .header {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 15mm 10mm;
                position: relative;
                border-bottom: 3px solid #e74c3c;
            }
            
            .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .logo-section {
                display: flex;
                align-items: center;
                gap: 8mm;
            }
            
            .logo {
                width: 20mm;
                height: 20mm;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-shadow: 0 2mm 4mm rgba(0,0,0,0.2);
            }
            
            .logo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .foundation-info h1 {
                font-size: 14pt;
                font-weight: bold;
                margin-bottom: 2mm;
                line-height: 1.2;
            }
            
            .foundation-info p {
                font-size: 9pt;
                opacity: 0.9;
                font-style: italic;
            }
            
            .slip-number {
                background: #e74c3c;
                color: white;
                padding: 4mm 8mm;
                border-radius: 20mm;
                font-weight: bold;
                font-size: 10pt;
                text-align: center;
                box-shadow: 0 1mm 2mm rgba(0,0,0,0.2);
            }
            
            /* Main Content */
            .content {
                flex: 1;
                padding: 10mm;
                display: flex;
                flex-direction: column;
            }
            
            /* Patient Info Section */
            .section {
                margin-bottom: 8mm;
                padding: 6mm;
                border-radius: 2mm;
                border-left: 4mm solid #3498db;
                background: #f8f9fa;
            }
            
            .section-title {
                font-size: 12pt;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 4mm;
                display: flex;
                align-items: center;
                gap: 3mm;
            }
            
            .section-title::before {
                content: '';
                width: 8mm;
                height: 8mm;
                background: #3498db;
                border-radius: 50%;
                display: inline-block;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 3mm;
                font-size: 10pt;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 2mm 0;
                border-bottom: 1px solid #ecf0f1;
            }
            
            .info-label {
                font-weight: 600;
                color: #7f8c8d;
            }
            
            .info-value {
                font-weight: 500;
                color: #2c3e50;
            }
            
            /* Appointment Details - Highlighted */
            .appointment-highlight {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                padding: 8mm;
                border-radius: 3mm;
                margin: 8mm 0;
                box-shadow: 0 2mm 4mm rgba(231, 76, 60, 0.3);
            }
            
            .appointment-title {
                font-size: 12pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 6mm;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .appointment-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 6mm;
                text-align: center;
            }
            
            .appointment-item {
                background: rgba(255,255,255,0.1);
                padding: 4mm;
                border-radius: 2mm;
            }
            
            .appointment-label {
                font-size: 8pt;
                opacity: 0.9;
                margin-bottom: 2mm;
            }
            
            .appointment-value {
                font-size: 11pt;
                font-weight: bold;
            }
            
            /* Doctor Section */
            .doctor-section {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
                padding: 6mm;
                border-radius: 2mm;
                margin-bottom: 8mm;
            }
            
            .doctor-title {
                font-size: 11pt;
                font-weight: bold;
                margin-bottom: 3mm;
                display: flex;
                align-items: center;
                gap: 3mm;
            }
            
            .doctor-info {
                display: flex;
                justify-content: space-between;
                font-size: 10pt;
            }
            
            /* Notes Section */
            .notes-section {
                flex: 1;
                border: 2mm dashed #bdc3c7;
                border-radius: 2mm;
                padding: 6mm;
                background: #fff;
                margin-bottom: 8mm;
            }
            
            .notes-title {
                font-size: 10pt;
                font-weight: bold;
                color: #7f8c8d;
                margin-bottom: 3mm;
                text-align: center;
            }
            
            .notes-area {
                min-height: 30mm;
                background: #fafafa;
                border-radius: 1mm;
                padding: 4mm;
                font-size: 9pt;
                color: #95a5a6;
                font-style: italic;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Footer */
            .footer {
                background: #ecf0f1;
                padding: 6mm 10mm;
                border-top: 2px solid #bdc3c7;
                text-align: center;
                font-size: 8pt;
                color: #7f8c8d;
            }
            
            .footer-row {
                margin-bottom: 2mm;
            }
            
            .footer-emphasis {
                font-weight: bold;
                color: #2c3e50;
            }
            
            /* Print Optimization */
            @media print {
                body {
                    margin: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .slip-container {
                    page-break-after: always;
                }
                
                .notes-area {
                    background: transparent !important;
                    border: 1mm solid #bdc3c7;
                }
            }
        </style>
    </head>
    <body>
        <div class="slip-container">
            <!-- Header -->
            <div class="header">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo">
                            <img src="/logo1.jpeg" alt="Dr. Sanaullah Welfare Foundation Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:16mm; color:#16a085; font-weight:bold;">🏥</div>
                        </div>
                        <div class="foundation-info">
                            <h1>Dr. Sanaullah Welfare Foundation</h1>
                            <p>Free Healthcare Services for Humanity</p>
                        </div>
                    </div>
                    <div class="slip-number">
                        SLIP #${Date.now().toString().slice(-6)}
                    </div>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <!-- Patient Information -->
                <div class="section">
                    <div class="section-title">PATIENT INFORMATION</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${patientDetails.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Age:</span>
                            <span class="info-value">${patientDetails.age}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Gender:</span>
                            <span class="info-value">${patientDetails.gender}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">${patientDetails.phone}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">CNIC:</span>
                            <span class="info-value">${patientDetails.cnic}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Patient ID:</span>
                            <span class="info-value">PT-${Date.now().toString().slice(-6)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Appointment Details - Highlighted -->
                <div class="appointment-highlight">
                    <div class="appointment-title">Appointment Details</div>
                    <div class="appointment-grid">
                        <div class="appointment-item">
                            <div class="appointment-label">DATE</div>
                            <div class="appointment-value">${appointmentDate}</div>
                        </div>
                        <div class="appointment-item">
                            <div class="appointment-label">TIME</div>
                            <div class="appointment-value">${appointmentTime}</div>
                        </div>
                        <div class="appointment-item">
                            <div class="appointment-label">TOKEN</div>
                            <div class="appointment-value">${Math.floor(Math.random() * 100) + 1}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Doctor Information -->
                <div class="doctor-section">
                    <div class="doctor-title">🩺 DOCTOR INFORMATION</div>
                    <div class="doctor-info">
                        <div>
                            <strong>Name:</strong> ${doctor.name}
                        </div>
                        <div>
                            <strong>Department:</strong> ${doctor.specialization}
                        </div>
                    </div>
                </div>
                
                <!-- Notes Section -->
                <div class="notes-section">
                    <div class="notes-title">📝 DOCTOR'S NOTES & OBSERVATIONS</div>
                    <div class="notes-area">
                        This area is reserved for doctor's examination notes, diagnosis, prescriptions, and medical observations during consultation.
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-row">
                    <span class="footer-emphasis">Dr. Sanaullah Welfare Foundation</span> | 
                    📍 Karachi, Pakistan | 
                    📞 Emergency: 021-1234567
                </div>
                <div class="footer-row">
                    🌐 www.drsanaullahwelfarefoundation.com | 
                    Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                </div>
                <div class="footer-row footer-emphasis">
                    Please arrive 15 minutes before appointment time | Bring this slip and previous medical records
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function downloadAppointmentSlip(appointmentData) {
    console.log('🏥 Generating PRINT-READY A5 Appointment Slip...');
    const html = generateAppointmentSlipHTML(appointmentData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-slip-${Date.now()}-A5-PRINT-READY.html`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

export function openAppointmentSlip(appointmentData) {
    console.log('🏥 Opening PRINT-READY A5 Appointment Slip...');
    const html = generateAppointmentSlipHTML(appointmentData);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
}
