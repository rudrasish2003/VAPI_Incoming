const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/inbound-call", async (req, res) => {
  const callerNumber = req.body.From; // Caller ID from Twilio
  console.log("📞 Incoming call from:", callerNumber);

  // Map callers to dynamic instructions
  const promptMap = {
    "+918777315232": "Hi Rudrasish, you’re connected to your personalized AI assistant.",
    "+919999999999": "Hello special user, this AI will answer based on context B.",
  };

  const instructions = promptMap[callerNumber] || "Default system prompt for unknown callers.";

  try {
    // Create a call in Vapi with assistant overrides
    const response = await axios.post(
      "https://api.vapi.ai/call",
      {
        assistantId: process.env.VAPI_ASSISTANT_ID,
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: callerNumber,
          name: "Inbound Caller", // optional, you can personalize per number
        },
        assistantOverrides: {
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            instructions: instructions,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        },
      }
    );

    console.log("✅ Vapi Call created:", response.data);

    // Return valid TwiML to Twilio
    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Dial>${process.env.TWILIO_VAPI_NUMBER}</Dial>
      </Response>
    `);
  } catch (error) {
    console.error("❌ Error creating Vapi call:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Always return valid TwiML, even on error
    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Say>Sorry, an error occurred while connecting your call. Please try again later.</Say>
        <Hangup/>
      </Response>
    `);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
