// Professional Welfare Foundation Appointment Card Generator
export function generateAppointmentCardHTML(appointmentData) {
    const { doctor, patientDetails, appointmentDate, appointmentTime, reason } = appointmentData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dr. Sanaullah Welfare Foundation - Appointment Card</title>
        <meta charset="UTF-8">
        <style>
            @page {
                size: A5 portrait;
                margin: 15mm;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: white;
                color: #2c3e50;
                line-height: 1.4;
            }
            
            .card-container {
                width: 148mm;
                height: 210mm;
                background: white;
                position: relative;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            /* Watermark Logo */
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 120px;
                color: rgba(52, 152, 219, 0.08);
                font-weight: bold;
                z-index: 1;
                pointer-events: none;
            }
            
            /* Top Banner */
            .top-banner {
                background: linear-gradient(135deg, #16a085 0%, #3498db 100%);
                color: white;
                padding: 8px 20px;
                text-align: center;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 1px;
                position: relative;
                z-index: 2;
            }
            
            /* Main Content */
            .content {
                display: flex;
                min-height: calc(210mm - 60px);
                position: relative;
                z-index: 2;
            }
            
            .column {
                flex: 1;
                padding: 20px;
                position: relative;
            }
            
            .left-column {
                border-right: 2px dashed #e8f4f8;
                direction: ltr;
            }
            
            .right-column {
                direction: rtl;
                text-align: right;
            }
            
            /* Foundation Header */
            .foundation-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e8f4f8;
            }
            
            .foundation-name {
                font-size: 18px;
                font-weight: bold;
                color: #16a085;
                margin-bottom: 5px;
            }
            
            .service-heading {
                font-size: 14px;
                color: #3498db;
                font-weight: 600;
            }
            
            /* Service Description */
            .service-description {
                background: #f0fbff;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 11px;
                line-height: 1.5;
                border-left: 4px solid #3498db;
            }
            
            /* Patient Information */
            .info-section {
                margin-bottom: 20px;
            }
            
            .section-title {
                font-size: 13px;
                font-weight: bold;
                color: #16a085;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #e8f4f8;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                font-size: 11px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
            }
            
            .info-label {
                font-weight: 600;
                color: #7f8c8d;
            }
            
            .info-value {
                font-weight: 500;
                color: #2c3e50;
            }
            
            /* Appointment Section */
            .appointment-box {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
            }
            
            .appointment-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .appointment-details {
                display: flex;
                justify-content: space-around;
                align-items: center;
            }
            
            .appointment-item {
                text-align: center;
            }
            
            .appointment-label {
                font-size: 9px;
                opacity: 0.9;
                margin-bottom: 3px;
            }
            
            .appointment-value {
                font-size: 12px;
                font-weight: bold;
            }
            
            /* Contact Information */
            .contact-section {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 8px;
                margin-top: 20px;
                font-size: 10px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                margin: 5px 0;
            }
            
            .contact-icon {
                width: 20px;
                margin-right: 8px;
                color: #3498db;
            }
            
            /* Footer */
            .footer {
                background: #ecf0f1;
                padding: 10px;
                text-align: center;
                font-size: 9px;
                color: #7f8c8d;
                border-top: 1px solid #bdc3c7;
                position: relative;
                z-index: 2;
            }
            
            /* Urdu Text Styling */
            .urdu-text {
                font-family: 'Noto Nastaliq Urdu', 'Arial Unicode MS', sans-serif;
                line-height: 1.8;
            }
            
            /* Print Optimization */
            @media print {
                body { 
                    margin: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .card-container {
                    box-shadow: none;
                    page-break-after: always;
                }
            }
        </style>
    </head>
    <body>
        <div class="card-container">
            <!-- Watermark -->
            <div class="watermark">🏥</div>
            
            <!-- Top Banner -->
            <div class="top-banner">
                DR. SANAULLAH WELFARE FOUNDATION • HEALTHCARE FOR ALL • FREE MEDICAL SERVICES
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <!-- Left Column - English -->
                <div class="column left-column">
                    <div class="foundation-header">
                        <div class="foundation-name">Dr. Sanaullah Welfare Foundation</div>
                        <div class="service-heading">Free Healthcare Services</div>
                    </div>
                    
                    <div class="service-description">
                        Providing quality healthcare services to underserved communities. Our foundation offers free medical consultations, diagnostic services, and essential medicines to those in need.
                    </div>
                    
                    <div class="info-section">
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
                                <span class="info-value">#${Date.now().toString().slice(-6)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <div class="section-title">DOCTOR INFORMATION</div>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Name:</span>
                                <span class="info-value">${doctor.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Department:</span>
                                <span class="info-value">${doctor.specialization}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column - Urdu -->
                <div class="column right-column">
                    <div class="foundation-header urdu-text">
                        <div class="foundation-name">ڈاکٹر sanaullah فاؤنڈیشن</div>
                        <div class="service-heading">مفت صحت کی خدمات</div>
                    </div>
                    
                    <div class="service-description urdu-text">
                        غریب اور محتاج افراد کو معیاری صحت کی خدمات فراہم کرنا۔ ہمارا فاؤنڈیشن مفت طوری مشاورت، تشخیصی خدمات اور ضروری دواوں فراہم کرتا ہے۔
                    </div>
                    
                    <div class="info-section">
                        <div class="section-title urdu-text">مریض کی معلومات</div>
                        <div class="info-grid urdu-text">
                            <div class="info-item">
                                <span class="info-label">نام:</span>
                                <span class="info-value">${patientDetails.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">عمر:</span>
                                <span class="info-value">${patientDetails.age}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">جنس:</span>
                                <span class="info-value">${patientDetails.gender === 'male' ? 'مذکر' : 'مؤنث'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">فون:</span>
                                <span class="info-value">${patientDetails.phone}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">شناختی کارڈ:</span>
                                <span class="info-value">${patientDetails.cnic}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">مریض آئی ڈی:</span>
                                <span class="info-value">#${Date.now().toString().slice(-6)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <div class="section-title urdu-text">ڈاکٹر کی معلومات</div>
                        <div class="info-grid urdu-text">
                            <div class="info-item">
                                <span class="info-label">نام:</span>
                                <span class="info-value">${doctor.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">محکمہ:</span>
                                <span class="info-value">${doctor.specialization}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Appointment Box - Centered -->
            <div style="position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); width: 80%; z-index: 3;">
                <div class="appointment-box">
                    <div class="appointment-title">APPOINTMENT DETAILS / آپائنٹمنٹ کی تفصیلات</div>
                    <div class="appointment-details">
                        <div class="appointment-item">
                            <div class="appointment-label">DATE / تاریخ</div>
                            <div class="appointment-value">${appointmentDate}</div>
                        </div>
                        <div class="appointment-item">
                            <div class="appointment-label">TIME / وقت</div>
                            <div class="appointment-value">${appointmentTime}</div>
                        </div>
                        <div class="appointment-item">
                            <div class="appointment-label">TOKEN / ٹوکن</div>
                            <div class="appointment-value">${Math.floor(Math.random() * 100) + 1}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div>📍 Main Hospital: Karachi, Pakistan | 📞 Emergency: 021-1234567 | 🌐 www.drsanaullahwelfarefoundation.com</div>
                <div>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function downloadAppointmentCard(appointmentData) {
    console.log('🏥 Generating Professional Welfare Foundation Appointment Card...');
    const html = generateAppointmentCardHTML(appointmentData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-card-${Date.now()}.html`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

export function openAppointmentCard(appointmentData) {
    console.log('🏥 Opening Professional Welfare Foundation Appointment Card...');
    const html = generateAppointmentCardHTML(appointmentData);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
}
