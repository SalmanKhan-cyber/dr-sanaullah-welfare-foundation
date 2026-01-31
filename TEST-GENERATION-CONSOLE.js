// Test appointment sheet generation for appointment abd6b153-1109-43ed-b98b-b3de08856dd4
// Run this in browser console after logging in as the patient (user_id: 028d6466-2f03-4d87-937c-e3d010c91c5d)

fetch('/api/debug/generate-appointment-sheet/abd6b153-1109-43ed-b98b-b3de08856dd4', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ Success Response:', data);
  if (data.appointment_sheet_url) {
    console.log('📄 Download URL:', data.appointment_sheet_url);
    window.open(data.appointment_sheet_url, '_blank');
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});

// Alternative: Check what happens when we try to download the existing endpoint
fetch('/api/appointments/abd6b153-1109-43ed-b98b-b3de08856dd4/appointment-sheet/pdf')
.then(response => {
  if (response.ok) {
    return response.blob();
  }
  throw new Error('Sheet not found');
})
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
})
.catch(error => console.error('❌ Download error:', error));
