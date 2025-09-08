// Simple test for IgniteVidya Companion API
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing IgniteVidya Companion API...');
    
    const response = await fetch('http://localhost:3000/api/ignitevidya-companion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, can you help me with math?'
      })
    });

    console.log('📊 Response status:', response.status);
    const data = await response.json();
    console.log('📝 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ API is working!');
      console.log('💬 Companion says:', data.response);
    } else {
      console.log('❌ API error:', data);
    }
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testAPI();
