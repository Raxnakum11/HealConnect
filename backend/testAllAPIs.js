const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

async function testAPIEndpoints() {
    console.log('🚀 Testing API Endpoints...\n');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log(`   Status: ${healthResponse.status}`);
        console.log(`   Response: ${JSON.stringify(healthData)}\n`);
        
        // Test 2: Register a test user
        console.log('2. Testing User Registration...');
        const registerData = {
            name: 'Test User',
            email: 'test@example.com',
            mobile: '9999999999',
            password: 'password123',
            role: 'patient'
        };
        
        const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        
        console.log(`   Status: ${registerResponse.status}`);
        if (registerResponse.status === 201 || registerResponse.status === 400) {
            const registerResult = await registerResponse.json();
            console.log(`   Response: ${JSON.stringify(registerResult)}\n`);
        }
        
        // Test 3: Login
        console.log('3. Testing User Login...');
        const loginData = {
            email: 'patient@example.com',
            password: 'password123'
        };
        
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        console.log(`   Status: ${loginResponse.status}`);
        const loginResult = await loginResponse.json();
        console.log(`   Response: ${JSON.stringify(loginResult)}\n`);
        
        if (loginResult.success && loginResult.data.token) {
            const token = loginResult.data.token;
            
            // Test 4: Get Appointments (with auth)
            console.log('4. Testing Get Appointments...');
            const appointmentsResponse = await fetch(`${API_BASE}/api/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`   Status: ${appointmentsResponse.status}`);
            const appointmentsResult = await appointmentsResponse.json();
            console.log(`   Response: ${JSON.stringify(appointmentsResult)}\n`);
            
            // Test 5: Get Prescriptions (with auth)
            console.log('5. Testing Get Prescriptions...');
            const prescriptionsResponse = await fetch(`${API_BASE}/api/prescriptions/my-prescriptions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`   Status: ${prescriptionsResponse.status}`);
            const prescriptionsResult = await prescriptionsResponse.json();
            console.log(`   Response: ${JSON.stringify(prescriptionsResult)}\n`);
        }
        
        // Test 6: Get Camps (public)
        console.log('6. Testing Get Camps...');
        const campsResponse = await fetch(`${API_BASE}/api/camps`);
        console.log(`   Status: ${campsResponse.status}`);
        if (campsResponse.status === 200) {
            const campsResult = await campsResponse.json();
            console.log(`   Response: Found ${campsResult.length || 0} camps\n`);
        } else {
            const campsResult = await campsResponse.json();
            console.log(`   Response: ${JSON.stringify(campsResult)}\n`);
        }
        
        console.log('✅ API Testing Complete!');
        
    } catch (error) {
        console.error('❌ API Test Error:', error.message);
    }
}

testAPIEndpoints();