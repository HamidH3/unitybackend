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




// server receives the POST request
app.post('/ask', async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
        //checks if the POST request has the body (prompt) that is assigned in questionGenerator
      return res.status(400).json({ error: 'Prompt is required in request body.' });
    }

    //now if the POST request has a body (prompt), this makes a new request body to GPT API
    const requestBody = {
      model: 'gpt-3.5-turbo',
      temperature: 0.8,            
      top_p: 1.0,                  
      frequency_penalty: 0.5,      
      presence_penalty: 0.4, 
      messages: [
        {
          role: 'system',
          content: 'You are an API that returns only JSON. Do not add explanations. Respond strictly with a JSON object.'
        },
        {
          role: 'user',
          //this contains the prompt from QuestionGenerator in unity script
          content: userPrompt
        }
      ]
    };
    //here post request to open AI using the API key in the environment variable
    const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', requestBody, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    //message carries the content generated from gpt that 
    const message = openAIResponse.data.choices[0].message.content;

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(message);
    } catch (parseError) {
      return res.status(500).json({
        error: 'Failed to parse response from GPT model. Ensure it returns valid JSON.',
        rawResponse: message
      });
    }

    return res.json(parsedJSON);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch or process GPT response.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(` Server is currently running on http://localhost:${PORT}`);
});
