// Simple API test without initializing server
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSignupAPI() {
  console.log('🧪 Testing Signup API');
  console.log('=' .repeat(50));

  // Test user data
  const testUser = {
    name: 'Test Patient New',
    email: 'newpatient2025@example.com',
    mobile: '9876543211', // Different mobile to avoid conflicts
    password: 'TestPass123!',
    role: 'patient'
  };

  try {
    console.log('📝 Sending registration request...');
    
    const response = await fetch('http://localhost:9000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Registration successful!');
      
      // Test login
      console.log('\n🔐 Testing login...');
      const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      const loginResult = await loginResponse.json();
      console.log('Login Status:', loginResponse.status);
      console.log('Login Result:', JSON.stringify(loginResult, null, 2));
      
    } else {
      console.log('❌ Registration failed');
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testSignupAPI();