// Test the email API directly
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEmailAPI() {
  try {
    console.log('🧪 Testing Email API Directly');
    console.log('=' .repeat(40));

    // First, let's login and get a token
    console.log('1. Login as patient user...');
    
    const loginResponse = await fetch('http://localhost:9000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'patelaryan2106@gmail.com',
        password: 'password123' // You might need to provide the correct password
      })
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.log('❌ Login failed:', loginResult.message);
      
      // Try with a doctor account if patient login fails
      console.log('2. Trying with doctor account...');
      
      const doctorLogin = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'user9999999999@healconnect.com', // Doctor account from our database check
          password: 'password123'
        })
      });
      
      const doctorResult = await doctorLogin.json();
      
      if (doctorResult.success) {
        console.log('✅ Doctor login successful');
        console.log('Testing email API with doctor token...');
        
        // Test email API
        const testEmailResponse = await fetch('http://localhost:9000/api/notifications/email/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${doctorResult.data.token}`
          },
          body: JSON.stringify({
            testEmail: 'patelaryan2106@gmail.com'
          })
        });
        
        const emailResult = await testEmailResponse.json();
        console.log('Email API Response Status:', testEmailResponse.status);
        console.log('Email API Response:', JSON.stringify(emailResult, null, 2));
        
      } else {
        console.log('❌ Doctor login failed:', doctorResult.message);
      }
      
      return;
    }

    console.log('✅ Patient login successful');
    console.log('User role:', loginResult.data.user.role);
    
    // Test email API with patient token (should fail due to role restriction)
    console.log('\n3. Testing email API with patient token...');
    
    const testEmailResponse = await fetch('http://localhost:9000/api/notifications/email/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginResult.data.token}`
      },
      body: JSON.stringify({
        testEmail: 'patelaryan2106@gmail.com'
      })
    });
    
    const emailResult = await testEmailResponse.json();
    console.log('Email API Response Status:', testEmailResponse.status);
    console.log('Email API Response:', JSON.stringify(emailResult, null, 2));
    
    if (testEmailResponse.status === 403) {
      console.log('\n💡 ISSUE IDENTIFIED: Patient role cannot access doctor-only email test endpoint');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testEmailAPI();