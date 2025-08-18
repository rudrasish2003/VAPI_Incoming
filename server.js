// const express = require('express');
// const axios = require('axios');
// require('dotenv').config();

// const app = express();
// app.use(express.json());

// const VAPI_API_KEY = process.env.VAPI_API_KEY;
// const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

// const VAPI_BASE_URL = "https://api.vapi.ai"; // Correct base URL

// app.post('/set-system-prompt', async (req, res) => {
//   const { systemPrompt } = req.body;

//   if (!systemPrompt) {
//     return res.status(400).json({ error: 'System prompt is required' });
//   }

//   try {
//     const response = await axios.patch(
//   `${VAPI_BASE_URL}/assistant/${ASSISTANT_ID}`,
//   {
//     model: {
//       provider: "openai",
//       model: "gpt-4o", // <-- Use a valid model name from the allowed list
//       messages: [
//         {
//           role: "assistant",
//           content: systemPrompt
//         }
//       ]
//     }
//   },
//   {
//     headers: {
//       Authorization: `Bearer ${VAPI_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//   }
// );

//     return res.status(200).json({ message: 'System prompt updated', data: response.data });
//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     return res.status(500).json({ error: 'Failed to update system prompt' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });

const express = require('express');
const axios = require('axios');
const { twiml } = require('twilio');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true })); // Twilio sends form-encoded data

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
const VAPI_BASE_URL = "https://api.vapi.ai";

// Base system prompt template
const BASE_PROMPT = `
You are a helpful AI voice assistant.
Always greet the caller politely and provide assistance in a professional tone.
If you have caller-specific context, use it to personalize your responses.
`;

// Context mapping per number
const callerContext = {
  "+14155550123": "This is John Doe, a premium customer with VIP support.",
  "+918777315232": "This is Ravi from India, prefer mixing English and Hindi.",
  "+442071838750": "This is Emily from the UK, use British English tone."
};

app.post('/incoming-call', async (req, res) => {
  const caller = req.body.From;
  console.log(`📞 Incoming call from: ${caller}`);

  // Get dynamic context
  const context = callerContext[caller] || `This caller’s number is ${caller}. No extra context available.`;

  // Final system prompt = Base + Context
  const systemPrompt = `${BASE_PROMPT}\n\nCaller Context: ${context}`;

  try {
    // 1. Update Vapi Assistant system prompt
    await axios.patch(
      `${VAPI_BASE_URL}/assistant/${ASSISTANT_ID}`,
      {
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Updated system prompt for ${caller}`);

    // 2. Connect call to Vapi via SIP
    const response = new twiml.VoiceResponse();
    response.dial().sip(`sip:${ASSISTANT_ID}@sip.vapi.ai`);

    res.type('text/xml');
    return res.send(response.toString());

  } catch (error) {
    console.error("❌ Error updating prompt or connecting to Vapi:", error.response?.data || error.message);
    return res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
