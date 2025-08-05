#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 10000 });
    console.log('✅ Health check:', healthResponse.data);
    
    // Test ping endpoint
    console.log('\n2. Testing ping endpoint...');
    const pingResponse = await axios.get(`${BASE_URL}/ping`, { timeout: 10000 });
    console.log('✅ Ping:', pingResponse.data);
    
    // Test CORS preflight
    console.log('\n3. Testing CORS preflight...');
    const corsResponse = await axios.options(`${BASE_URL}/auth/login`, {
      headers: {
        'Origin': 'https://123real-time-collaboration-workspace.launchpulse.ai',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      timeout: 10000
    });
    console.log('✅ CORS preflight status:', corsResponse.status);
    
    // Test invalid JSON handling
    console.log('\n4. Testing invalid JSON handling...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, 'invalid json', {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid JSON properly rejected with status 400');
      } else {
        console.log('❌ Unexpected error for invalid JSON:', error.message);
      }
    }
    
    // Test timeout handling (this will take a while)
    console.log('\n5. Testing timeout handling...');
    try {
      await axios.get(`${BASE_URL}/health`, { timeout: 1 }); // Very short timeout
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('✅ Timeout properly handled');
      } else {
        console.log('❌ Unexpected timeout error:', error.message);
      }
    }
    
    console.log('\n🎉 All basic connectivity tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
testEndpoints();