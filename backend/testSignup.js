// Test signup functionality and database saving
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSignupFlow() {
  console.log('🧪 Testing Signup & Database Flow');
  console.log('=' .repeat(50));

  // Test user data
  const testUser = {
    name: 'Test Patient',
    email: 'testuser2025@example.com',
    mobile: '9876543210',
    password: 'TestPass123!',
    role: 'patient'
  };

  try {
    console.log('📝 Testing User Registration...');
    console.log('User data:', {
      name: testUser.name,
      email: testUser.email,
      mobile: testUser.mobile,
      role: testUser.role,
      password: '***hidden***'
    });

    const response = await fetch('http://localhost:9000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const result = await response.json();
    
    console.log('\n📊 Registration Response:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('✅ User registered successfully!');
      console.log('User ID:', result.data.user.id);
      console.log('Name:', result.data.user.name);
      console.log('Email:', result.data.user.email);
      console.log('Mobile:', result.data.user.mobile);
      console.log('Role:', result.data.user.role);
      console.log('Token received:', result.data.token ? 'Yes' : 'No');
      
      // Test login with email
      console.log('\n🔐 Testing Login with Email...');
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };
      
      const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      const loginResult = await loginResponse.json();
      
      console.log('Login Status:', loginResponse.status);
      console.log('Login Success:', loginResult.success);
      
      if (loginResult.success) {
        console.log('✅ Login successful!');
        console.log('User:', loginResult.data.user.name);
        console.log('Email:', loginResult.data.user.email);
        console.log('Token:', loginResult.data.token ? 'Received' : 'Not received');
      } else {
        console.log('❌ Login failed:', loginResult.message);
      }
      
    } else {
      console.log('❌ Registration failed:', result.message);
      console.log('Full error details:', JSON.stringify(result, null, 2));
      
      // Check if it's a duplicate user
      if (result.message.includes('already registered')) {
        console.log('\n🔄 User already exists, testing login instead...');
        
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
        
        if (loginResult.success) {
          console.log('✅ Login with existing user successful!');
        } else {
          console.log('❌ Login failed:', loginResult.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.log('\n🔍 Possible Issues:');
    console.log('1. Server not running on port 9000');
    console.log('2. Database connection issues');
    console.log('3. API endpoint not available');
  }
}

// Run the test
testSignupFlow()
  .then(() => {
    console.log('\n✅ Signup test completed!');
  })
  .catch(error => {
    console.error('Test failed:', error);
  });