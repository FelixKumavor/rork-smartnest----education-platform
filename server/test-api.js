const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user registration
async function testUserRegistration() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post(`${BASE_URL}/users/onboarding`, {
      fullName: 'Test User',
      email: 'test@example.com',
      dob: '1990-01-01',
      pin: '1234'
    });

    console.log('✅ User registration successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.log('❌ User registration failed:', error.response?.data || error.message);
    return null;
  }
}

// Test user login
async function testUserLogin() {
  try {
    console.log('Testing user login...');
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: 'test@example.com',
      pin: '1234'
    });

    console.log('✅ User login successful:', response.data);
    return response.data.data.token;
  } catch (error) {
    console.log('❌ User login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test getting properties
async function testGetProperties(token) {
  try {
    console.log('Testing get properties...');
    const response = await axios.get(`${BASE_URL}/properties`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Get properties successful:', response.data.data.properties.length, 'properties found');
    return response.data.data.properties[0]?._id;
  } catch (error) {
    console.log('❌ Get properties failed:', error.response?.data || error.message);
    return null;
  }
}

// Test payment initialization
async function testPaymentInit(token, propertyId) {
  try {
    console.log('Testing payment initialization...');
    const response = await axios.post(`${BASE_URL}/payments/initialize`,
      { propertyId, amount: 50 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Payment initialization successful:', response.data);
    return response.data.data.transaction.reference;
  } catch (error) {
    console.log('❌ Payment initialization failed:', error.response?.data || error.message);
    return null;
  }
}

// Test mobile money charge
async function testMobileMoneyCharge(token, propertyId) {
  try {
    console.log('Testing mobile money charge...');
    const response = await axios.post(`${BASE_URL}/payments/charge`,
      {
        propertyId,
        amount: 50,
        mobileNumber: '0207477013',
        provider: 'mtn'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Mobile money charge initiated:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Mobile money charge failed:', error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Smartnest Backend API Tests...\n');

  // Test user registration
  const user = await testUserRegistration();
  if (!user) return;

  // Test user login
  const token = await testUserLogin();
  if (!token) return;

  // Test getting properties
  const propertyId = await testGetProperties(token);
  if (!propertyId) return;

  // Test payment initialization
  const reference = await testPaymentInit(token, propertyId);
  if (!reference) return;

  // Test mobile money charge (commented out to avoid actual charges)
  // const chargeResult = await testMobileMoneyCharge(token, propertyId);

  console.log('\n✅ All tests completed successfully!');
  console.log('\n📝 Note: Mobile money charge test is commented out to avoid actual charges.');
  console.log('💡 To test real payments, uncomment the mobile money charge test and ensure Paystack credentials are configured.');
}

runTests();