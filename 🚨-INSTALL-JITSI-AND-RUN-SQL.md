# 🚨 IMPORTANT: Setup Video Calling Feature!

## ✅ What Was Implemented

1. ✅ Backend auto-generates video call links when appointments are confirmed
2. ✅ Video call page created at `/video-call/:appointmentId`
3. ✅ "Join Video Call" buttons added to Patient and Doctor dashboards
4. ✅ Route added to App.jsx

---

## 📋 Setup Steps Required

### Step 1: Run SQL Script (Add video_call_link column)

1. Open Supabase SQL Editor
2. Run the file: `supabase/add-video-call-link-to-appointments.sql`

**OR** copy and paste this SQL:

```sql
-- Add video_call_link column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS video_call_link TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_video_call_link 
ON public.appointments(video_call_link) 
WHERE video_call_link IS NOT NULL;
```

---

### Step 2: No Package Installation Needed! 🎉

**Jitsi Meet works directly via iframe - no npm packages required!**

The video calling uses Jitsi Meet's public server (`meet.jit.si`) which works directly in the browser without any installation.

---

## ✅ How It Works

1. **Patient books video consultation** → Appointment created with status 'pending'
2. **Doctor confirms appointment** → Backend automatically generates video call link
3. **Video call link format:** `https://meet.jit.si/Foundation-Appointment-{appointment_id}`
4. **Patient/Doctor clicks "Join Video Call"** → Opens video call page
5. **Video call page** → Embeds Jitsi Meet iframe
6. **Both can see/hear each other** → Consultation happens!

---

## 🎯 What to Test

1. ✅ Run the SQL script above
2. ✅ Book a video consultation (as patient)
3. ✅ Confirm the appointment (as doctor)
4. ✅ Click "Join Video Call" button (appears when status = 'confirmed')
5. ✅ Video call should open and work!

---

## 🔧 How Video Calls Work

- **Uses Jitsi Meet** (free, open-source)
- **Public server:** `meet.jit.si` (no setup needed)
- **Unique room per appointment:** Each appointment gets its own room
- **Secure:** Only patient and doctor with the link can join
- **Works on:** Desktop, mobile, tablets
- **Features:** Video, audio, screen sharing, chat

---

## 📝 Notes

- **No API keys needed** - Jitsi Meet public server is completely free
- **No installation needed** - Works via iframe
- **Video call link is auto-generated** when appointment status changes to 'confirmed'
- **Both patient and doctor** see the same link for the same appointment

---

## ✅ After Setup

1. Restart your backend server (if running)
2. Book a test appointment
3. Confirm it as doctor
4. Click "Join Video Call" button
5. Video call should work! 🎉

---

**The video calling feature is ready! Just run the SQL script and it will work!** 🚀

