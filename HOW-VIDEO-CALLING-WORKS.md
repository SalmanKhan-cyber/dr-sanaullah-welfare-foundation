# 🎥 How Video Calling Works

## ✅ **Complete Video Call Flow**

### **Step 1: Patient Books Appointment**
1. Patient goes to **"Consult Online"** or **"In-Clinic"** page
2. Selects a doctor and books an appointment
3. Appointment status: **PENDING** ⏳
4. No video call link yet (waiting for doctor to accept)

---

### **Step 2: Doctor Accepts Appointment**
1. Doctor goes to **Doctor Dashboard** → **"Appointments"** tab
2. Sees the pending appointment request
3. Clicks **"Accept"** button ✅
4. **Automatically generates video call link** 🎥
5. Appointment status changes to: **CONFIRMED** ✅
6. Both patient and doctor receive notifications

---

### **Step 3: Join Video Call**
1. **Patient:**
   - Goes to **Patient Dashboard** → **"Appointments"** tab
   - Sees confirmed appointment with **"Join Video Call"** button 🎥
   - Clicks button → Opens video call page

2. **Doctor:**
   - Goes to **Doctor Dashboard** → **"Appointments"** tab
   - Sees confirmed appointment with **"Join Video Call"** button 🎥
   - Clicks button → Opens video call page

---

### **Step 4: Video Call Page**
- Opens in full-screen Jitsi Meet interface
- Both users can see and hear each other
- Camera and microphone controls available
- Screen sharing available
- **Leave Call** button to exit

---

## 🎯 **Key Features:**

✅ **Automatic Link Generation** - Video call link is created when doctor accepts  
✅ **Secure Rooms** - Each appointment has a unique room name  
✅ **Real-time Communication** - Powered by Jitsi Meet  
✅ **No Installation Required** - Works in browser  
✅ **Both Sides Can Join** - Patient and doctor both see the button  

---

## 📋 **Requirements:**

1. ✅ Appointment must be **CONFIRMED** (doctor accepted)
2. ✅ Video call link must exist (auto-generated on acceptance)
3. ✅ Both users must be logged in
4. ✅ Browser must allow camera/microphone access

---

## 🔧 **Technical Details:**

- **Video Platform:** Jitsi Meet (free, open-source)
- **Room Name Format:** `Foundation-Appointment-{appointment_id}`
- **URL Format:** `https://meet.jit.si/Foundation-Appointment-{id}`
- **Route:** `/video-call/:appointmentId`

---

## ❓ **Troubleshooting:**

### **"Join Video Call" button not showing:**
- ✅ Check if appointment status is **"confirmed"**
- ✅ Check if doctor has accepted the appointment
- ✅ Refresh the page

### **Video call not loading:**
- ✅ Check browser permissions (camera/microphone)
- ✅ Try a different browser (Chrome, Firefox, Edge)
- ✅ Check internet connection

### **Can't see/hear the other person:**
- ✅ Check camera/microphone permissions
- ✅ Check if devices are not muted
- ✅ Refresh the page

---

## 🎉 **That's It!**

The video calling feature is fully integrated and ready to use. Just follow the steps above! 🚀

