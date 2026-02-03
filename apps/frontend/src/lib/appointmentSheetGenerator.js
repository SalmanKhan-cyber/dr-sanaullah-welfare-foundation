// Simple frontend appointment sheet generator - VERSION 4.0 - EXACT MATCH DESIGN
export function generateAppointmentSheetHTML(appointmentData) {
    console.log('🎨 LOADING EXACT MATCH DESIGN v4.0');
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
                padding: 0;
                background: white;
            }
            .sheet {
                max-width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
            }
            .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 15px 20px;
                border-bottom: 3px solid #1e40af;
            }
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            .logo-section {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .logo {
                width: 50px;
                height: 50px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: #1e40af;
                font-weight: bold;
            }
            .organization-name {
                font-size: 20px;
                font-weight: bold;
            }
            .tagline {
                font-size: 12px;
                opacity: 0.9;
            }
            .appointment-id {
                background: rgba(255, 255, 255, 0.2);
                padding: 6px 12px;
                border-radius: 15px;
                font-weight: bold;
                font-size: 12px;
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 15px;
                margin-top: 10px;
            }
            .detail-section {
                background: rgba(255, 255, 255, 0.1);
                padding: 12px;
                border-radius: 8px;
                backdrop-filter: blur(10px);
            }
            .detail-section h3 {
                margin: 0 0 8px 0;
                font-size: 12px;
                opacity: 0.9;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .detail-item {
                margin: 4px 0;
                font-size: 11px;
                display: flex;
                justify-content: space-between;
            }
            .detail-label {
                opacity: 0.8;
            }
            .detail-value {
                font-weight: bold;
            }
            .main-body {
                flex: 1;
                background: white;
                padding: 20px;
                border: 2px dashed #e5e7eb;
                margin: 15px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                min-height: 40vh;
            }
            .notes-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
            }
            .notes-header h3 {
                color: #374151;
                font-size: 16px;
                margin: 0 0 5px 0;
            }
            .notes-header p {
                color: #6b7280;
                font-size: 12px;
                margin: 0;
            }
            .notes-area {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .notes-column {
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 15px;
            }
            .notes-column h4 {
                color: #374151;
                font-size: 13px;
                margin: 0 0 10px 0;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 5px;
            }
            .notes-content {
                min-height: 150px;
                background: #f9fafb;
                border-radius: 4px;
                padding: 10px;
                font-size: 11px;
                color: #6b7280;
            }
            .footer {
                background: #f9fafb;
                padding: 10px 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                font-size: 10px;
                color: #6b7280;
            }
            @media print {
                body { margin: 0; }
                .sheet { height: 100vh; }
                .main-body { 
                    border: 2px dashed #333;
                    background: white !important;
                }
                .notes-content {
                    background: white !important;
                    border: 1px solid #333;
                }
            }
        </style>
    </head>
    <body>
        <div class="sheet">
            <div class="header">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo">DSWF</div>
                        <div>
                            <div class="organization-name">Dr. Sanaullah Welfare Foundation</div>
                            <div class="tagline">Access discounted healthcare services</div>
                        </div>
                    </div>
                    <div class="appointment-id">
                        #APT-${Date.now().toString().slice(-6)}
                    </div>
                </div>
                
                <div class="details-grid">
                    <div class="detail-section">
                        <h3>👤 PATIENT INFORMATION</h3>
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${patientDetails.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">${patientDetails.phone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Age:</span>
                            <span class="detail-value">${patientDetails.age}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Gender:</span>
                            <span class="detail-value">${patientDetails.gender}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">CNIC:</span>
                            <span class="detail-value">${patientDetails.cnic}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>🩺 DOCTOR INFORMATION</h3>
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${doctor.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Specialization:</span>
                            <span class="detail-value">${doctor.specialization}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Department:</span>
                            <span class="detail-value">General Medicine</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Experience:</span>
                            <span class="detail-value">10+ Years</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>📅 APPOINTMENT DETAILS</h3>
                        <div class="detail-item">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${appointmentDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${appointmentTime}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Reason:</span>
                            <span class="detail-value">${reason || 'General consultation'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">Confirmed</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">In-Clinic Visit</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="main-body">
                <div class="notes-header">
                    <h3>📝 Medical Notes & Observations</h3>
                    <p>This section is reserved for doctor's examination, diagnosis, and treatment notes</p>
                </div>
                
                <div class="notes-area">
                    <div class="notes-column">
                        <h4>🩺 Examination & Diagnosis</h4>
                        <div class="notes-content">
                            Patient's symptoms, vital signs, physical examination findings, and diagnosis...
                        </div>
                    </div>
                    
                    <div class="notes-column">
                        <h4>💊 Treatment & Prescription</h4>
                        <div class="notes-content">
                            Prescribed medications, dosage instructions, treatment plan, and follow-up recommendations...
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <strong>Dr. Sanaullah Welfare Foundation</strong> | 
                📍 Main Hospital Address | 
                📞 Emergency: 123-456-7890 | 
                🌐 www.drsanaullahwelfarefoundation.com | 
                Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
        </div>
    </body>
    </html>
    `;
}

export function downloadAppointmentSheet(appointmentData) {
    console.log('🎨 Generating EXACT MATCH appointment sheet design v4.0...');
    const html = generateAppointmentSheetHTML(appointmentData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-sheet-${Date.now()}-v4-EXACT-MATCH.html`;
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
