const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

console.log('✅ Server starting...');
console.log('Using PORT:', PORT);
console.log('Using API KEY:', API_KEY ? '[HIDDEN]' : '❌ MISSING');

// Root route
app.get('/', (req, res) => {
  res.send('🎉 Welcome to the AI Question API!');
});

// POST /ask
app.post('/ask', async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: 'Prompt is required in request body.' });
    }

    console.log('📩 Received prompt:', userPrompt);

    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an API that returns only JSON. Do not add explanations. Respond strictly with a JSON object.'
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    };

    const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', requestBody, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const message = openAIResponse.data.choices[0].message.content;
    console.log('🧠 GPT Response:', message);

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(message);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
      return res.status(500).json({
        error: 'Failed to parse response from GPT model. Ensure it returns valid JSON.',
        rawResponse: message
      });
    }

    return res.json(parsedJSON);
  } catch (err) {
    console.error('🔥 Error in /ask route:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to fetch or process GPT response.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
