// A5 Portrait Appointment Sheet Generator - 148×210mm (1748×2480px at 300 DPI)
export function generateA5AppointmentHTML(appointmentData) {
    console.log('📄 A5 PORTRAIT APPOINTMENT SHEET - 148×210mm (1748×2480px)');
    const { doctor, patientDetails, appointmentDate, appointmentTime, reason } = appointmentData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>A5 Appointment Sheet - Dr. Sanaullah Welfare Foundation</title>
        <meta charset="UTF-8">
        <style>
            @page {
                size: 148mm 210mm portrait;
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
            
            .a5-sheet {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                position: relative;
                background: white;
            }
            
            /* Header Section - 25% of page height */
            .header {
                height: 52.5mm;
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 8mm;
                position: relative;
                border-bottom: 2mm solid #e74c3c;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .header-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4mm;
            }
            
            .logo-section {
                display: flex;
                align-items: center;
                gap: 6mm;
            }
            
            .logo {
                width: 16mm;
                height: 16mm;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8mm;
                color: #2c3e50;
                font-weight: bold;
            }
            
            .foundation-info h1 {
                font-size: 10pt;
                font-weight: bold;
                margin-bottom: 1mm;
                line-height: 1.1;
            }
            
            .foundation-info p {
                font-size: 7pt;
                opacity: 0.9;
                font-style: italic;
            }
            
            .slip-number {
                background: #e74c3c;
                color: white;
                padding: 2mm 6mm;
                border-radius: 10mm;
                font-weight: bold;
                font-size: 8pt;
                text-align: center;
            }
            
            /* Details Grid in Header */
            .header-details {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4mm;
                margin-top: 2mm;
            }
            
            .header-section {
                background: rgba(255, 255, 255, 0.1);
                padding: 3mm;
                border-radius: 2mm;
                backdrop-filter: blur(5px);
            }
            
            .header-section h3 {
                font-size: 6pt;
                font-weight: bold;
                margin-bottom: 2mm;
                opacity: 0.9;
                text-transform: uppercase;
                letter-spacing: 0.5mm;
            }
            
            .header-item {
                font-size: 5pt;
                margin: 1mm 0;
                display: flex;
                justify-content: space-between;
            }
            
            .header-label {
                opacity: 0.8;
            }
            
            .header-value {
                font-weight: bold;
            }
            
            /* Main Content Area - 50% of page height */
            .main-content {
                height: 105mm;
                padding: 8mm;
                display: flex;
                flex-direction: column;
            }
            
            /* Patient Information Section */
            .patient-section {
                background: #f8f9fa;
                border-left: 3mm solid #3498db;
                padding: 6mm;
                border-radius: 2mm;
                margin-bottom: 6mm;
            }
            
            .section-title {
                font-size: 8pt;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 3mm;
                display: flex;
                align-items: center;
                gap: 2mm;
            }
            
            .section-title::before {
                content: '👤';
                font-size: 6pt;
            }
            
            .patient-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2mm;
                font-size: 7pt;
            }
            
            .patient-item {
                display: flex;
                justify-content: space-between;
                padding: 1mm 0;
                border-bottom: 0.5px solid #ecf0f1;
            }
            
            .patient-label {
                font-weight: 600;
                color: #7f8c8d;
            }
            
            .patient-value {
                font-weight: 500;
                color: #2c3e50;
            }
            
            /* Doctor Information Section */
            .doctor-section {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
                padding: 6mm;
                border-radius: 2mm;
                margin-bottom: 6mm;
            }
            
            .doctor-title {
                font-size: 8pt;
                font-weight: bold;
                margin-bottom: 3mm;
                display: flex;
                align-items: center;
                gap: 2mm;
            }
            
            .doctor-title::before {
                content: '🩺';
                font-size: 6pt;
            }
            
            .doctor-info {
                display: flex;
                justify-content: space-between;
                font-size: 7pt;
            }
            
            /* Appointment Details - Highlighted */
            .appointment-highlight {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                padding: 6mm;
                border-radius: 2mm;
                margin-bottom: 6mm;
            }
            
            .appointment-title {
                font-size: 8pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 4mm;
                text-transform: uppercase;
                letter-spacing: 0.5mm;
            }
            
            .appointment-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4mm;
                text-align: center;
            }
            
            .appointment-item {
                background: rgba(255,255,255,0.1);
                padding: 3mm;
                border-radius: 1mm;
            }
            
            .appointment-label {
                font-size: 5pt;
                opacity: 0.9;
                margin-bottom: 1mm;
            }
            
            .appointment-value {
                font-size: 7pt;
                font-weight: bold;
            }
            
            /* Notes Section - 25% of page height */
            .notes-section {
                height: 52.5mm;
                border: 2mm dashed #bdc3c7;
                border-radius: 2mm;
                padding: 6mm;
                background: #fff;
                margin: 0 8mm 8mm 8mm;
            }
            
            .notes-title {
                font-size: 7pt;
                font-weight: bold;
                color: #7f8c8d;
                margin-bottom: 3mm;
                text-align: center;
            }
            
            .notes-area {
                height: 35mm;
                background: #fafafa;
                border-radius: 1mm;
                padding: 4mm;
                font-size: 6pt;
                color: #95a5a6;
                font-style: italic;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #ecf0f1;
            }
            
            /* Footer */
            .footer {
                background: #ecf0f1;
                padding: 4mm 8mm;
                border-top: 1px solid #bdc3c7;
                text-align: center;
                font-size: 5pt;
                color: #7f8c8d;
                margin-top: auto;
            }
            
            .footer-row {
                margin-bottom: 1mm;
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
                
                .a5-sheet {
                    page-break-after: always;
                }
                
                .notes-area {
                    background: transparent !important;
                    border: 1px solid #bdc3c7;
                }
            }
        </style>
    </head>
    <body>
        <div class="a5-sheet">
            <!-- Header Section -->
            <div class="header">
                <div class="header-top">
                    <div class="logo-section">
                        <div class="logo">🏥</div>
                        <div class="foundation-info">
                            <h1>Dr. Sanaullah Welfare Foundation</h1>
                            <p>Free Healthcare Services for Humanity</p>
                        </div>
                    </div>
                    <div class="slip-number">
                        APT #${Date.now().toString().slice(-6)}
                    </div>
                </div>
                
                <div class="header-details">
                    <div class="header-section">
                        <h3>PATIENT</h3>
                        <div class="header-item">
                            <span class="header-label">Name:</span>
                            <span class="header-value">${patientDetails.name}</span>
                        </div>
                        <div class="header-item">
                            <span class="header-label">Age:</span>
                            <span class="header-value">${patientDetails.age}</span>
                        </div>
                        <div class="header-item">
                            <span class="header-label">Phone:</span>
                            <span class="header-value">${patientDetails.phone}</span>
                        </div>
                    </div>
                    
                    <div class="header-section">
                        <h3>DOCTOR</h3>
                        <div class="header-item">
                            <span class="header-label">Name:</span>
                            <span class="header-value">${doctor.name}</span>
                        </div>
                        <div class="header-item">
                            <span class="header-label">Dept:</span>
                            <span class="header-value">${doctor.specialization}</span>
                        </div>
                        <div class="header-item">
                            <span class="header-label">Exp:</span>
                            <span class="header-value">10+ Years</span>
                        </div>
                    </div>
                    
                    <div class="header-section">
                        <h3>APPOINTMENT</h3>
                        <div class="header-item">
                            <span class="header-label">Date:</span>
                            <span class="header-value">${appointmentDate}</span>
                        </div>
                        <div class="header-item">
                            <span class="header-label">Time:</span>
                            <span class="header-value">${appointmentTime}</span>
                        </div>
                        <div class="header-item">
                            <span class="header-label">Token:</span>
                            <span class="header-value">${Math.floor(Math.random() * 100) + 1}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
                <!-- Patient Information -->
                <div class="patient-section">
                    <div class="section-title">PATIENT INFORMATION</div>
                    <div class="patient-grid">
                        <div class="patient-item">
                            <span class="patient-label">Full Name:</span>
                            <span class="patient-value">${patientDetails.name}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Age:</span>
                            <span class="patient-value">${patientDetails.age} years</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Gender:</span>
                            <span class="patient-value">${patientDetails.gender}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Phone:</span>
                            <span class="patient-value">${patientDetails.phone}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">CNIC:</span>
                            <span class="patient-value">${patientDetails.cnic}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Patient ID:</span>
                            <span class="patient-value">PT-${Date.now().toString().slice(-6)}</span>
                        </div>
                        ${patientDetails.history ? `
                        <div class="patient-item" style="grid-column: 1 / -1;">
                            <span class="patient-label">Medical History:</span>
                            <span class="patient-value">${patientDetails.history}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Doctor Information -->
                <div class="doctor-section">
                    <div class="doctor-title">DOCTOR INFORMATION</div>
                    <div class="doctor-info">
                        <div>
                            <strong>Name:</strong> ${doctor.name}
                        </div>
                        <div>
                            <strong>Department:</strong> ${doctor.specialization}
                        </div>
                        <div>
                            <strong>Experience:</strong> 10+ Years
                        </div>
                    </div>
                </div>
                
                <!-- Appointment Details -->
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
            </div>
            
            <!-- Notes Section -->
            <div class="notes-section">
                <div class="notes-title">📝 DOCTOR'S NOTES & OBSERVATIONS</div>
                <div class="notes-area">
                    This area is reserved for doctor's examination notes, diagnosis, prescriptions, and medical observations during consultation.
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
                    Please arrive 15 minutes before appointment time
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function downloadA5Appointment(appointmentData) {
    console.log('📄 Downloading A5 PORTRAIT Appointment Sheet - 148×210mm...');
    const html = generateA5AppointmentHTML(appointmentData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `A5-appointment-sheet-${Date.now()}-148x210mm.html`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

export function openA5Appointment(appointmentData) {
    console.log('📄 Opening A5 PORTRAIT Appointment Sheet - 148×210mm...');
    const html = generateA5AppointmentHTML(appointmentData);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
}
