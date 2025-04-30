const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
console.log('Using PORT:', PORT);

const API_KEY = process.env.API_KEY;
console.log('Using KEY:', API_KEY);


// Root route for testing in the browser
app.get('/', (req, res) => {
  res.send('Welcome to the AI Question API!');
});

// POST route for /ask
app.post('/ask', async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    console.log('Received prompt:', userPrompt);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('OpenAI API Response:', response.data);
    const answer = response.data.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error('Error in /ask route:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
