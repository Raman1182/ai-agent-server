const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('Testing AI Agent API...\n');

  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('Health check passed:', healthResponse.data.status);

    console.log('\n2. Testing simple message...');
    const simpleResponse = await axios.post(`${BASE_URL}/agent/message`, {
      message: "Hello, what can you help me with?",
      sessionId: "test-session-1"
    });
    console.log('Simple message response:', simpleResponse.data.reply.substring(0, 100) + '...');

    console.log('\n3. Testing RAG query...');
    const ragResponse = await axios.post(`${BASE_URL}/agent/message`, {
      message: "What are the benefits of using Markdown for blogging?",
      sessionId: "test-session-1"
    });
    console.log('RAG query response:', ragResponse.data.reply.substring(0, 100) + '...');
    console.log('Retrieved context chunks:', ragResponse.data.context?.length || 0);

    console.log('\n4. Testing math plugin...');
    const mathResponse = await axios.post(`${BASE_URL}/agent/message`, {
      message: "Calculate 15 * 3 + 7",
      sessionId: "test-session-2"
    });
    console.log('Math plugin response:', mathResponse.data.reply.substring(0, 100) + '...');
    console.log('Plugins used:', mathResponse.data.pluginsUsed);

    console.log('\n5. Testing weather plugin...');
    const weatherResponse = await axios.post(`${BASE_URL}/agent/message`, {
      message: "What's the weather in Mumbai?",
      sessionId: "test-session-2"
    });
    console.log('Weather plugin response:', weatherResponse.data.reply.substring(0, 100) + '...');
    console.log('Plugins used:', weatherResponse.data.pluginsUsed);

    console.log('\nAll tests passed! API is working correctly.');

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();