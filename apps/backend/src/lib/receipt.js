/**
 * Generate a professional donation receipt with logo and all details
 * In production, use libraries like pdfkit, puppeteer, or external services
 */

// Logo URL - use the public URL or serve from backend
// In development, use the frontend dev server URL
// In production, use your domain or CDN
const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
const LOGO_URL = process.env.LOGO_URL || (FRONTEND_URL ? `${FRONTEND_URL}/last-logo.png` : '/last-logo.png');

export function generateReceiptHTML(donation) {
	const { 
		id, 
		amount, 
		purpose, 
		created_at, 
		donor_name, 
		donor_email,
		donor_type,
		cnic,
		passport_number,
		donor_phone
	} = donation;
	
	// Format date
	const donationDate = new Date(created_at);
	const formattedDate = donationDate.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	});
	const formattedTime = donationDate.toLocaleTimeString('en-US', { 
		hour: '2-digit', 
		minute: '2-digit' 
	});
	
	// Format purpose display
	const purposeDisplay = {
		'medical': 'Medical Support',
		'education': 'Education & Training',
		'orphan': 'Orphan Support',
		'general': 'General Fund'
	}[purpose] || purpose || 'General Fund';
	
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Donation Receipt ${id} - Dr. Sanaullah Welfare Foundation</title>
	<style>
		@page {
			margin: 8mm;
			size: A4;
		}
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		body {
			font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
			padding: 20px;
			background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
			color: #1a1a1a;
			line-height: 1.7;
		}
		.print-actions {
			text-align: center;
			margin-bottom: 20px;
			position: sticky;
			top: 0;
			background: white;
			padding: 15px;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			z-index: 1000;
		}
		.print-actions button {
			background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
			color: white;
			border: none;
			padding: 12px 30px;
			margin: 0 10px;
			border-radius: 6px;
			font-size: 15px;
			font-weight: 600;
			cursor: pointer;
			box-shadow: 0 4px 6px rgba(0,0,0,0.1);
			transition: all 0.3s ease;
		}
		.print-actions button:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 12px rgba(0,0,0,0.15);
		}
		.print-actions button:active {
			transform: translateY(0);
		}
		.receipt-container {
			max-width: 210mm;
			margin: 0 auto;
			background: white;
			padding: 40px 45px;
			box-shadow: 0 10px 40px rgba(0,0,0,0.15);
			border-radius: 12px;
			position: relative;
		}
		.watermark {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%) rotate(-45deg);
			font-size: 120px;
			color: rgba(22, 163, 74, 0.03);
			font-weight: bold;
			z-index: 0;
			pointer-events: none;
		}
		.header {
			display: flex;
			align-items: flex-start;
			justify-content: center;
			padding: 20px 0 25px 130px;
			margin-bottom: 25px;
			position: relative;
			min-height: 120px;
			z-index: 1;
		}
		.header-border {
			position: absolute;
			bottom: 0;
			left: 150px;
			right: 0;
			height: 4px;
			background: linear-gradient(90deg, #16a34a 0%, #15803d 100%);
			z-index: 0;
			border-radius: 2px;
		}
		.header-content {
			flex: 1;
			text-align: center;
			z-index: 1;
		}
		.logo {
			max-width: 110px;
			height: auto;
			display: block;
			position: absolute;
			left: 0;
			top: 0;
			z-index: 2;
			background: white;
			padding: 8px;
			border-radius: 50%;
			box-shadow: 0 4px 15px rgba(0,0,0,0.1);
			border: 3px solid #f0f9ff;
		}
		.foundation-name {
			font-size: 26px;
			font-weight: 700;
			color: #16a34a;
			margin-bottom: 8px;
			letter-spacing: 0.5px;
			text-shadow: 0 2px 4px rgba(0,0,0,0.05);
		}
		.receipt-title {
			font-size: 15px;
			color: #4b5563;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 2px;
			margin-top: 5px;
		}
		.receipt-id {
			background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
			padding: 12px 20px;
			border-left: 5px solid #16a34a;
			margin-bottom: 20px;
			font-size: 14px;
			border-radius: 0 8px 8px 0;
			box-shadow: 0 2px 8px rgba(0,0,0,0.05);
		}
		.receipt-id-label {
			font-weight: 700;
			color: #16a34a;
			margin-right: 12px;
			font-size: 16px;
		}
		.receipt-id-value {
			font-family: 'Courier New', monospace;
			color: #1f2937;
			font-size: 14px;
		}
		.content {
			margin-top: 20px;
			position: relative;
			z-index: 1;
		}
		.section {
			margin-bottom: 20px;
			background: #fafafa;
			padding: 20px;
			border-radius: 8px;
			border: 1px solid #e5e7eb;
		}
		.section-title {
			font-size: 18px;
			font-weight: 700;
			color: #16a34a;
			margin-bottom: 15px;
			padding-bottom: 8px;
			border-bottom: 2px solid #16a34a;
			text-transform: uppercase;
			letter-spacing: 1px;
		}
		.details-grid {
			display: grid;
			grid-template-columns: 1fr 2fr;
			gap: 12px 25px;
			margin-bottom: 15px;
		}
		.detail-row {
			display: flex;
			justify-content: space-between;
			padding: 8px 0;
			border-bottom: 1px solid #e5e7eb;
			transition: background 0.2s;
		}
		.detail-row:hover {
			background: rgba(22, 163, 74, 0.02);
			padding-left: 10px;
			padding-right: 10px;
			margin-left: -10px;
			margin-right: -10px;
			border-radius: 6px;
		}
		.label {
			font-weight: 600;
			color: #6b7280;
			min-width: 180px;
			font-size: 14px;
		}
		.value {
			color: #1f2937;
			text-align: right;
			flex: 1;
			font-weight: 500;
			font-size: 14px;
		}
		.amount-box {
			background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
			color: white;
			padding: 20px;
			border-radius: 10px;
			text-align: center;
			margin: 20px 0;
			box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
			position: relative;
			overflow: hidden;
		}
		.amount-box::before {
			content: '';
			position: absolute;
			top: -50%;
			right: -50%;
			width: 200%;
			height: 200%;
			background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
		}
		.amount-label {
			font-size: 15px;
			margin-bottom: 8px;
			opacity: 0.95;
			font-weight: 500;
			text-transform: uppercase;
			letter-spacing: 1px;
		}
		.amount-value {
			font-size: 32px;
			font-weight: 800;
			position: relative;
			z-index: 1;
			text-shadow: 0 2px 4px rgba(0,0,0,0.2);
		}
		.footer {
			margin-top: 25px;
			padding-top: 20px;
			border-top: 2px solid #e5e7eb;
			text-align: center;
			color: #6b7280;
			font-size: 12px;
			position: relative;
			z-index: 1;
		}
		.footer p {
			margin: 6px 0;
			line-height: 1.6;
		}
		.thank-you {
			font-size: 18px;
			color: #16a34a;
			font-weight: 700;
			margin-bottom: 10px;
			text-transform: uppercase;
			letter-spacing: 1px;
		}
		.footer-info {
			background: #f9fafb;
			padding: 15px;
			border-radius: 6px;
			margin-top: 15px;
			border: 1px solid #e5e7eb;
		}
		.footer-info strong {
			color: #1f2937;
		}
		@media print {
			body {
				background: white;
				padding: 0;
				margin: 0;
				line-height: 1.2;
			}
			.print-actions {
				display: none !important;
			}
			.receipt-container {
				box-shadow: none;
				padding: 8px 18px;
				border-radius: 0;
				max-width: 100%;
				margin: 0;
			}
			.header {
				padding: 8px 0 10px 90px;
				margin-bottom: 8px;
				min-height: 75px;
			}
			.header-border {
				left: 90px;
				height: 2px;
			}
			.logo {
				max-width: 65px;
				padding: 3px;
			}
			.foundation-name {
				font-size: 18px;
				margin-bottom: 2px;
			}
			.receipt-title {
				font-size: 10px;
				letter-spacing: 1px;
			}
			.receipt-id {
				padding: 6px 10px;
				margin-bottom: 8px;
				font-size: 11px;
			}
			.receipt-id-label {
				font-size: 12px;
			}
			.receipt-id-value {
				font-size: 10px;
			}
			.content {
				margin-top: 8px;
			}
			.section {
				margin-bottom: 8px;
				padding: 10px;
				page-break-inside: avoid;
			}
			.section-title {
				font-size: 13px;
				margin-bottom: 6px;
				padding-bottom: 3px;
			}
			.detail-row {
				padding: 3px 0;
			}
			.label, .value {
				font-size: 11px;
			}
			.label {
				min-width: 130px;
			}
			.amount-box {
				padding: 10px;
				margin: 8px 0;
				page-break-inside: avoid;
			}
			.amount-label {
				font-size: 10px;
				margin-bottom: 3px;
			}
			.amount-value {
				font-size: 22px;
			}
			.footer {
				margin-top: 8px;
				padding-top: 8px;
				font-size: 9px;
				border-top-width: 1px;
			}
			.footer p {
				margin: 2px 0;
				line-height: 1.2;
			}
			.thank-you {
				font-size: 12px;
				margin-bottom: 4px;
			}
			.footer-info {
				padding: 6px;
				margin-top: 6px;
			}
			.footer-info p {
				margin: 2px 0;
			}
			.watermark {
				display: none;
			}
			.details-grid {
				gap: 3px 12px;
				margin-bottom: 6px;
			}
		}
		@media (max-width: 768px) {
			.receipt-container {
				padding: 30px 20px;
			}
			.header {
				padding: 20px 0 40px 120px;
				min-height: 120px;
			}
			.header-border {
				left: 120px;
			}
			.logo {
				max-width: 100px;
			}
			.foundation-name {
				font-size: 24px;
			}
			.details-grid {
				grid-template-columns: 1fr;
				gap: 15px;
			}
			.detail-row {
				flex-direction: column;
			}
			.value {
				text-align: left;
				margin-top: 5px;
			}
		}
	</style>
</head>
<body>
	<div class="print-actions">
		<button onclick="window.print()">🖨️ Print / Save as PDF</button>
		<button onclick="downloadReceipt()">📥 Download Receipt</button>
	</div>
	
	<div class="receipt-container">
		<div class="watermark">OFFICIAL</div>
		
		<div class="header">
			<div class="header-border"></div>
			<img src="${LOGO_URL}" alt="Dr. Sanaullah Welfare Foundation Logo" class="logo" />
			<div class="header-content">
				<div class="foundation-name">Dr. Sanaullah Welfare Foundation</div>
				<div class="receipt-title">Official Donation Receipt</div>
			</div>
		</div>
		
		<div class="receipt-id">
			<span class="receipt-id-label">Receipt ID:</span>
			<span class="receipt-id-value">${id}</span>
		</div>
		
		<div class="content">
			<div class="section">
				<div class="section-title">Donation Details</div>
				<div class="detail-row">
					<span class="label">Date:</span>
					<span class="value">${formattedDate}</span>
				</div>
				<div class="detail-row">
					<span class="label">Time:</span>
					<span class="value">${formattedTime}</span>
				</div>
				<div class="detail-row">
					<span class="label">Purpose:</span>
					<span class="value">${purposeDisplay}</span>
				</div>
				<div class="amount-box">
					<div class="amount-label">Total Amount Donated</div>
					<div class="amount-value">PKR ${Number(amount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
				</div>
			</div>
			
			<div class="section">
				<div class="section-title">Donor Information</div>
				<div class="detail-row">
					<span class="label">Donor Name:</span>
					<span class="value">${donor_name || 'Anonymous'}</span>
				</div>
				${donor_email ? `
				<div class="detail-row">
					<span class="label">Email:</span>
					<span class="value">${donor_email}</span>
				</div>
				` : ''}
				${donor_phone ? `
				<div class="detail-row">
					<span class="label">Phone:</span>
					<span class="value">${donor_phone}</span>
				</div>
				` : ''}
				${donor_type ? `
				<div class="detail-row">
					<span class="label">Donor Type:</span>
					<span class="value">${donor_type === 'local' ? 'Local' : 'International'}</span>
				</div>
				` : ''}
				${cnic ? `
				<div class="detail-row">
					<span class="label">CNIC Number:</span>
					<span class="value">${cnic}</span>
				</div>
				` : ''}
				${passport_number ? `
				<div class="detail-row">
					<span class="label">Passport Number:</span>
					<span class="value">${passport_number}</span>
				</div>
				` : ''}
			</div>
		</div>
		
		<div class="footer">
			<div class="thank-you">Thank you for your generous contribution!</div>
			<p>This is an official tax-deductible receipt for your records.</p>
			<div class="footer-info">
				<p><strong>Foundation Registration #12345</strong></p>
				<p>For any queries, please contact us at: <strong>info@sanaullahwelfare.org</strong></p>
				<p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
					This receipt is generated on ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
				</p>
			</div>
		</div>
	</div>
	
	<script>
		function downloadReceipt() {
			// Create a new window with the receipt content
			const printWindow = window.open('', '_blank');
			const content = document.querySelector('.receipt-container').outerHTML;
			const fullHTML = \`<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Donation Receipt ${id}</title>
	\${document.querySelector('style').outerHTML}
</head>
<body style="padding: 0; background: white;">
	<div style="padding: 40px;">
		\${content}
	</div>
</body>
</html>\`;
			
			printWindow.document.write(fullHTML);
			printWindow.document.close();
			
			// Wait for content to load, then trigger print
			setTimeout(() => {
				printWindow.print();
			}, 250);
		}
		
		// Auto-focus on load for better UX
		window.onload = function() {
			// Optional: Auto-scroll to top
			window.scrollTo(0, 0);
		};
	</script>
</body>
</html>
	`.trim();
}

/**
 * For production: use puppeteer or pdfkit to convert HTML to PDF
 * Example with puppeteer:
 * 
 * import puppeteer from 'puppeteer';
 * 
 * export async function generateReceiptPDF(donation) {
 *   const html = generateReceiptHTML(donation);
 *   const browser = await puppeteer.launch();
 *   const page = await browser.newPage();
 *   await page.setContent(html);
 *   const pdf = await page.pdf({ format: 'A4' });
 *   await browser.close();
 *   return pdf;
 * }
 */
