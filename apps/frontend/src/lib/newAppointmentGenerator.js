// NEW APPOINTMENT GENERATOR - COMPLETELY DIFFERENT FILE TO BYPASS CACHE
export function generateNewAppointmentHTML(appointmentData) {
    console.log('🔥🔥🔥 NEW DESIGN LOADING - TOTALLY DIFFERENT FILE!!!');
    const { doctor, patientDetails, appointmentDate, appointmentTime, reason } = appointmentData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>NEW Appointment Sheet</title>
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
                background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
                color: white;
                padding: 20px;
                border-bottom: 3px solid #FF6B6B;
            }
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .logo-section {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .logo {
                width: 60px;
                height: 60px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .logo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .organization-name {
                font-size: 24px;
                font-weight: bold;
            }
            .tagline {
                font-size: 14px;
                opacity: 0.9;
            }
            .appointment-id {
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 15px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 20px;
                margin-top: 15px;
            }
            .detail-section {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
            }
            .detail-section h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                opacity: 0.9;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .detail-item {
                margin: 5px 0;
                font-size: 13px;
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
                padding: 0;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 33vh;
            }
            .blank-area {
                width: 100%;
                height: 100%;
                background: white;
            }
            .footer {
                background: #f9fafb;
                padding: 15px 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
            }
            @media print {
                body { margin: 0; }
                .sheet { height: 100vh; }
                .main-body { 
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="sheet">
            <div class="header">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo">
                            <img src="./logo1.jpeg" alt="Dr. Sanaullah Welfare Foundation Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:24px; color:#FF6B6B; font-weight:bold;">🏥</div>
                        </div>
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
                <div class="blank-area">
                </div>
            </div>
            
            <div class="footer">
                <strong>Dr. Sanaullah Welfare Foundation</strong> | 
                📍 Main Hospital Address, Karachi, Pakistan | 
                📞 Emergency: 021-1234567 | 
                🌐 www.drsanaullahwelfarefoundation.com | 
                Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
        </div>
    </body>
    </html>
    `;
}

export function downloadNewAppointment(appointmentData) {
    console.log('🔥🔥🔥 DOWNLOADING NEW DESIGN - TOTALLY DIFFERENT FILE!!!');
    const html = generateNewAppointmentHTML(appointmentData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `NEW-appointment-sheet-${Date.now()}.html`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

export function openNewAppointment(appointmentData) {
    console.log('🔥🔥🔥 OPENING NEW DESIGN - TOTALLY DIFFERENT FILE!!!');
    const html = generateNewAppointmentHTML(appointmentData);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
}
