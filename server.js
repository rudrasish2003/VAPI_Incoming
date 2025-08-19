const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/inbound-call", async (req, res) => {
  const callerNumber = req.body.From; // Caller ID from Twilio
  console.log("Incoming call from:", callerNumber);

  // Decide dynamic system prompt
  let systemPrompt = "Default system prompt for unknown callers.";
  if (callerNumber === "+918777315232") {
    systemPrompt = "Hi Rudrasish, you’re connected to your personalized AI assistant.";
  } else if (callerNumber === "+919999999999") {
    systemPrompt = "Hello special user, this AI will answer based on context B.";
  }

  try {
    // Create a call in Vapi with assistant overrides
    const response = await axios.post(
      "https://api.vapi.ai/call",
      {
        assistantId: process.env.VAPI_ASSISTANT_ID,
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        assistantOverrides: {
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            systemPrompt: systemPrompt
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        },
      }
    );

    console.log("Vapi Call created:", response.data);

    // Tell Twilio to connect the call to Vapi (Vapi handles bridging automatically)
    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Dial>${process.env.TWILIO_VAPI_NUMBER}</Dial>
      </Response>
    `);
  } catch (error) {
    console.error("Error creating Vapi call:", error.response?.data || error.message);
    res.status(500).send("Error creating Vapi call");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
