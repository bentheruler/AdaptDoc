/**
 * 🚀 AdoptDoc API Test Script
 * Use this to verify your AI and Template endpoints are working correctly.
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testApi() {
  console.log('--- starting AdoptDoc API tests ---');

  try {
    // 1. Test Themes Endpoint
    console.log('\nTesting GET /templates/themes...');
    const themesRes = await axios.get(`${BASE_URL}/templates/themes`, { timeout: 65000 });
    console.log('✅ Success! Available Themes:', JSON.stringify(themesRes.data.themes, null, 2));

    // 2. Test Document Preview (Mock)
    console.log('\nTesting GET /documents/test-letter/preview...');
    const previewRes = await axios.get(`${BASE_URL}/documents/test-letter/preview?theme=modern`, { timeout: 65000 });
    console.log('✅ Success! Preview HTML starts with:', previewRes.data.substring(0, 50) + '...');

    // 3. Test AI Generation (Requires API Key in .env)
    console.log('\nTesting POST /ai/generate (Requires valid API key)...');
    try {
      const aiRes = await axios.post(`${BASE_URL}/ai/generate`, {
        docType: "resume",
        userData: {
          name: "John Doe",
          summary: "Software Engineering student building AI tools."
        }
      }, { timeout: 65000 });
      console.log('✅ Success! AI Response:', JSON.stringify(aiRes.data.content, null, 2));
    } catch (aiErr) {
      console.warn('⚠️ AI generation failed. Check your API keys in server/.env.');
      console.warn('Error Message:', aiErr.response?.data?.error || aiErr.message);
    }

    console.log('\n--- all tests completed ---');

  } catch (error) {
    console.error('\n❌ Test failed! Is your server running? (Run: node server.js)');
    console.error(error.message);
  }
}

testApi();
