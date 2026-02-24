// Debug script to check frontend environment variables and authentication
console.log('=== FRONTEND DEBUG INFO ===');
console.log('Current URL:', window.location.href);
console.log('API Base URL:', 'http://localhost:5000/api');
console.log('Auth Token:', localStorage.getItem('authToken'));

// Check if token is valid
const token = localStorage.getItem('authToken');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expires:', new Date(payload.exp * 1000));
    console.log('Is expired:', payload.exp * 1000 < Date.now());
  } catch (e) {
    console.log('Invalid token format');
  }
} else {
  console.log('No auth token found');
}

// Test API connectivity
fetch('http://localhost:5000/api/appointments', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
})
.then(response => {
  console.log('API Test Response Status:', response.status);
  return response.text();
})
.then(text => {
  console.log('API Test Response:', text);
})
.catch(error => {
  console.log('API Test Error:', error);
});