// Test the Patient API endpoint directly
const http = require('http');

function testPatientAPI() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/patients?doctorId=68d58e0f8e2dcd2dad6bde9f',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const request = http.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log('=== Patient API Response ===');
      console.log(`Status Code: ${response.statusCode}`);
      console.log(`Status Message: ${response.statusMessage}`);
      console.log('\nResponse Headers:');
      console.log(JSON.stringify(response.headers, null, 2));
      
      console.log('\nResponse Body:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('Raw response (not JSON):');
        console.log(data);
      }
    });
  });

  request.on('error', (error) => {
    console.error('Request Error:', error);
  });

  request.end();
}

// Start the test
console.log('Testing Patient API endpoint...');
testPatientAPI();