// Test appointment booking API
const testAppointmentBooking = async () => {
  try {
    // First, let's test if the appointments endpoint is reachable
    const response = await fetch('http://localhost:5000/api/appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail but shows if endpoint exists
      }
    });
    
    console.log('Appointments endpoint response:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Appointments endpoint is reachable (401 Unauthorized as expected without valid token)');
    } else {
      console.log('❌ Unexpected response:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing appointments endpoint:', error.message);
  }
};

testAppointmentBooking();