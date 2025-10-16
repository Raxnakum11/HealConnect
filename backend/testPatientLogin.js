// Test patient login functionality

// Test login and data loading
async function testPatientLogin() {
    try {
        // Try to login as the test patient
        console.log('Testing patient login...');
        
        const loginPayload = {
            email: 'patient@example.com',
            password: 'password123'
        };
        console.log('Login payload:', loginPayload);
        
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginPayload)
        });
        
        console.log('Response status:', loginResponse.status);
        console.log('Response headers:', Object.fromEntries(loginResponse.headers.entries()));
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (loginData.success && loginData.data.token) {
            const token = loginData.data.token;
            console.log('Login successful! Token:', token);
            
            // Test getting appointments with the token
            console.log('\nTesting appointments API...');
            const appointmentsResponse = await fetch('http://localhost:5000/api/appointments', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const appointmentsData = await appointmentsResponse.json();
            console.log('Appointments response:', appointmentsData);
            
            // Test getting prescriptions with the token
            console.log('\nTesting prescriptions API...');
            const prescriptionsResponse = await fetch('http://localhost:5000/api/prescriptions/my-prescriptions', {
                method: 'GET', 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const prescriptionsData = await prescriptionsResponse.json();
            console.log('Prescriptions response:', prescriptionsData);
        } else {
            console.error('Login failed:', loginData);
        }
    } catch (error) {
        console.error('Test error:', error);
    }
}

testPatientLogin();