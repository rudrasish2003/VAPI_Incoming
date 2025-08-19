const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false })); // Twilio sends x-www-form-urlencoded
app.use(bodyParser.json());

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
const VAPI_BASE_URL = "https://api.vapi.ai"; 

// Example prompts by caller number
const promptsByNumber = {
  "+918777315232": "You are a helpful agent for Customer A.",
  "+918013671142": "You are a support bot for Customer B.",
};

// 🟢 Incoming call webhook (from Twilio)
app.post("/incoming-call", async (req, res) => {
  const { From } = req.body; // Caller number from Twilio

  console.log("📞 Incoming call from:", From);

  // Choose system prompt based on number (default fallback)
  const systemPrompt =
    promptsByNumber[From] || `You are assisting caller ${From}.`;

  try {
    // 1. Update system prompt in Vapi
    await axios.patch(
      `${VAPI_BASE_URL}/assistant/${ASSISTANT_ID}`,
      {
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "assistant", content: systemPrompt }],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Prompt updated for ${From}`);

    // 2. Forward request to Vapi’s inbound endpoint
    const vapiResponse = await axios.post(
      `${VAPI_BASE_URL}/twilio/inbound_call`,
      new URLSearchParams(req.body).toString(), // forward as form-urlencoded
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // 3. Send back TwiML (XML) to Twilio
    res.set("Content-Type", "text/xml");
    return res.send(vapiResponse.data);
  } catch (err) {
    console.error("❌ Error handling call:", err.response?.data || err.message);
    return res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});
