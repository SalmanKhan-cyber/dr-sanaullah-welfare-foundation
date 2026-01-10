# Features Documentation – Dr. Sanaullah Welfare Foundation

Complete feature list with implementation details and usage instructions.

---

## 🔐 Authentication System

### Supported Methods
1. **Email + Password**
   - Standard sign-up with email verification
   - Password reset via magic link
2. **Phone + OTP**
   - Send OTP to phone number
   - Verify OTP to complete login

### Implementation
- **Backend**: Supabase Auth (`apps/backend/src/routes/auth.js`)
- **Frontend**: Login form (`apps/frontend/src/pages/Login.jsx`)
- **Middleware**: JWT validation (`apps/backend/src/middleware/auth.js`)

### Usage
```js
// Sign up with email
POST /api/auth/signup-email
Body: { email, password, role }

// Send phone OTP
POST /api/auth/otp
Body: { phone }

// Set user role (admin only)
POST /api/auth/set-role
Body: { userId, role }
```

---

## 👥 Role-Based Access Control (RBAC)

### User Roles
1. **Patient** – Access medical services
2. **Donor** – Make donations
3. **Admin** – Full system control
4. **Lab** – Manage lab reports
5. **Student** – Enroll in courses
6. **Teacher** – Create/manage courses
7. **Pharmacy** – Manage inventory

### How It Works
- Role stored in user metadata (`user_metadata.role`)
- RBAC middleware checks role before allowing access
- Each route specifies allowed roles

### Implementation
```js
// Backend: apps/backend/src/middleware/rbac.js
router.use('/api/patients', authMiddleware, rbac(['patient','admin']), patientRoutes);
```

---

## 🩺 Patient Panel

### Features
1. **Profile Management**
   - View/edit personal details (name, CNIC, age, gender)
   - Medical history tracking
2. **Lab Reports**
   - View all lab test results
   - Download reports (signed URLs)
3. **Prescriptions**
   - View doctor prescriptions
   - Download prescription files
4. **Appointments** (placeholder)
   - Book appointments with discounted doctors
5. **Notifications**
   - Receive alerts for new reports/prescriptions

### API Endpoints
```
GET  /api/patients/me              - Get profile
PUT  /api/patients/me              - Update profile
GET  /api/patients/me/reports      - Get lab reports
GET  /api/prescriptions/patient/:id - Get prescriptions
```

---

## 💰 Donation System

### Features
1. **One-Time Donations**
   - Select amount and purpose (medical, education, orphan, general)
   - Payment gateway integration (Stripe/PayPal stub)
2. **Donation Receipt**
   - Automatic HTML receipt generation
   - PDF receipt (with puppeteer, optional)
   - Download/email receipt
3. **Donation History**
   - View all past donations
   - Filter by purpose/date
4. **Transparency Dashboard** (admin)
   - View all donations
   - Generate reports

### Payment Gateway Integration (Stub)

#### Stripe Example
```js
// Install: npm install stripe
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // cents
  currency: 'pkr',
  metadata: { donorId, purpose }
});

// Return client_secret to frontend
res.json({ clientSecret: paymentIntent.client_secret });
```

#### Frontend Integration
```js
// Install: npm install @stripe/stripe-js @stripe/react-stripe-js
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

### API Endpoints
```
POST /api/donations          - Create donation
GET  /api/donations/me       - Get my donations
GET  /api/donations/all      - Get all (admin only)
GET  /api/donations/:id/receipt - Download receipt
```

---

## 🧪 Lab Panel

### Features
1. **Test Request Management**
   - View incoming test requests
   - Track pending/completed tests
2. **Report Upload**
   - Upload PDF/image reports
   - Automatic notification to patient
3. **Report Download**
   - Generate signed URLs for secure access
4. **Pricing Management** (admin)
   - Set test prices with discounts (60% for members)

### File Upload Flow
1. Lab staff uploads file via form
2. Backend validates file (size, type)
3. File uploaded to `lab-reports` bucket in Supabase Storage
4. Path stored in database
5. Patient notified
6. Patient downloads via signed URL (7-day expiry)

### API Endpoints
```
GET  /api/lab/tasks               - Get test requests
POST /api/lab/reports/upload      - Upload report
GET  /api/lab/reports/:id/download - Download report
```

---

## 🎓 Education System

### Student Features
1. **Course Enrollment**
   - Browse available courses
   - Enroll with automatic 70% discount
2. **Progress Tracking**
   - View course completion percentage
   - Access course materials
3. **Certificates**
   - Download digital certificates upon completion
   - Signed URLs for secure access

### Teacher Features
1. **Course Creation**
   - Create new courses
   - Set duration, description, pricing
2. **Student Management**
   - View enrolled students
   - Mark attendance/progress
3. **Content Upload**
   - Upload materials, assignments
   - Send announcements

### API Endpoints
```
GET  /api/courses                  - List all courses
POST /api/courses                  - Create course (teacher)
POST /api/courses/enroll           - Enroll in course
GET  /api/certificates/my          - Get my certificates
POST /api/certificates/issue       - Issue certificate (admin/teacher)
GET  /api/certificates/:id/download - Download certificate
```

---

## 💊 Pharmacy System

### Features
1. **Inventory Management**
   - Add/update medicines
   - Track stock levels
   - Monitor expiry dates
2. **Prescription Processing**
   - Link prescriptions to inventory
   - Apply automatic 50% discount for members
3. **Low Stock Alerts**
   - Notify admin when stock < threshold
4. **Reports**
   - Daily/weekly/monthly sales reports
   - Expiry alerts

### API Endpoints
```
GET  /api/pharmacy/items           - List inventory
POST /api/pharmacy/items           - Add item
POST /api/pharmacy/prescriptions   - Process prescription
```

---

## 🔔 Notification System

### Notification Types
1. **Lab Report Ready** → Patient
2. **New Prescription** → Patient
3. **Donation Confirmation** → Donor
4. **Certificate Issued** → Student
5. **Low Stock Alert** → Admin/Pharmacy
6. **Course Enrollment** → Student/Teacher

### Implementation
```js
// Backend: Insert notification
await supabaseAdmin.from('notifications').insert({
  user_id: userId,
  message: 'Your lab report is ready.',
  read: false
});

// Frontend: Fetch notifications
GET /api/notifications
```

### Real-Time Updates (Optional)
Use Supabase Realtime:
```js
// Frontend
supabase
  .channel('notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
    // Update UI with new notification
  })
  .subscribe();
```

---

## 📂 File Storage System

### Storage Buckets
1. **lab-reports** – Lab test PDFs/images
2. **prescriptions** – Prescription files
3. **certificates** – Course certificates
4. **receipts** – Donation receipts

### Security
- All buckets are **private**
- Access via **signed URLs** (7-day expiry)
- File size limits enforced (20MB)
- MIME type validation

### Upload Flow
```js
// Backend helper: apps/backend/src/lib/storage.js
import { uploadFile, getSignedUrl } from '../lib/storage.js';

// Upload
const { url, path } = await uploadFile('lab-reports', filePath, buffer, mimeType);

// Download
const url = await getSignedUrl('lab-reports', path, 604800); // 7 days
```

---

## 🛡️ Admin Panel

### Features
1. **User Management**
   - View all users
   - Approve/reject registrations
   - Assign/change roles
2. **Donation Dashboard**
   - View all donations
   - Generate financial reports
   - Transparency metrics
3. **Content Management**
   - Update homepage content
   - Post news/announcements
4. **Doctor Management**
   - Add doctors
   - Set discount rates
5. **Course Management**
   - Approve teacher course requests
   - Manage trainers
6. **Analytics** (placeholder)
   - Total donations
   - Active patients
   - Course enrollments

### API Endpoints
```
GET  /api/users                    - List all users (admin)
POST /api/users/approve            - Approve user
GET  /api/donations/all            - All donations (admin)
```

---

## 🔒 Security Features

### Implemented
1. **JWT Authentication** – Supabase tokens
2. **RBAC** – Role-based route protection
3. **Row Level Security (RLS)** – Database-level security
4. **Input Validation** – Zod schemas (can be added)
5. **HTTPS** – Enforced in production
6. **CORS** – Restricted origins
7. **File Upload Limits** – 20MB max
8. **Signed URLs** – Time-limited file access

### Recommended Additions
- Rate limiting (`express-rate-limit`)
- Helmet security headers (already included)
- SQL injection prevention (parameterized queries via Supabase)
- XSS protection (React's built-in escaping)
- CSRF tokens for forms

---

## 📊 Database Schema

### Core Tables
- `users` – All users across roles
- `patients` – Patient-specific details
- `doctors` – Doctor directory
- `donations` – Donation records
- `lab_reports` – Lab test results
- `prescriptions` – Prescription records
- `courses` – Educational courses
- `students` – Course enrollments
- `teachers` – Teacher profiles
- `pharmacy_items` – Medicine inventory
- `notifications` – In-app notifications
- `logs` – Activity audit trail

### Relationships
- `patients` → `users` (one-to-one)
- `lab_reports` → `patients` (many-to-one)
- `donations` → `users` (many-to-one)
- `students` → `users` + `courses` (many-to-many)

---

## 🚀 Extensibility

### Easy Additions
1. **Email Notifications** – Use SendGrid/Resend
2. **SMS Notifications** – Use Twilio
3. **Appointment Booking** – Add `appointments` table
4. **Telemedicine** – Integrate video call SDK (Agora, Twilio Video)
5. **Payment Gateway** – Stripe, PayPal, Razorpay
6. **Analytics** – Google Analytics, Mixpanel
7. **Chat System** – Socket.io or Supabase Realtime
8. **Mobile App** – React Native (reuse Supabase client)

---

## 📝 Testing

### Backend Testing
```bash
# Install testing libraries
npm install --save-dev jest supertest

# Run tests
npm test
```

### Frontend Testing
```bash
# Install testing libraries
npm install --save-dev vitest @testing-library/react

# Run tests
npm run test
```

---

## 🎨 UI Components

### Frontend Stack
- **React 18** – UI library
- **React Router 6** – Routing
- **Tailwind CSS** – Styling
- **Vite** – Build tool

### Key Components (To Add)
- `<Button>` – Reusable button
- `<Input>` – Form input
- `<Modal>` – Popup dialogs
- `<Table>` – Data tables
- `<FileUpload>` – File picker (already added)
- `<Notification>` – Toast messages

---

## 📱 Mobile Responsiveness

All pages are mobile-first and responsive:
- Flexbox/Grid layouts
- `md:` breakpoints for tablet/desktop
- Touch-friendly buttons (min 44px height)
- Collapsible navigation on mobile

---

## 🌐 Internationalization (i18n)

To add multiple languages:

1. Install `react-i18next`
2. Create translation files (`en.json`, `ur.json`)
3. Wrap app in `I18nextProvider`
4. Use `useTranslation()` hook

---

**All features documented!** 📚

For implementation details, refer to source code in:
- Backend: `apps/backend/src/routes/`
- Frontend: `apps/frontend/src/pages/`

