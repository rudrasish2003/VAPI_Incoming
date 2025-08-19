const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

const VAPI_BASE_URL = "https://api.vapi.ai"; // Correct base URL

app.post('/set-system-prompt', async (req, res) => {
  const { systemPrompt } = req.body;

  if (!systemPrompt) {
    return res.status(400).json({ error: 'System prompt is required' });
  }

  try {
    const response = await axios.patch(
  `${VAPI_BASE_URL}/assistant/${ASSISTANT_ID}`,
  {
    model: {
      provider: "openai",
      model: "gpt-4o", // <-- Use a valid model name from the allowed list
      messages: [
        {
          role: "assistant",
          content: systemPrompt
        }
      ]
    }
  },
  {
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }
);

    return res.status(200).json({ message: 'System prompt updated', data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to update system prompt' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});