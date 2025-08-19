// server.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true })); // Twilio sends urlencoded
app.use(express.json());

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

app.post("/inbound-call", async (req, res) => {
  const fromNumber = req.body.From; // Caller’s number from Twilio (E.164 format)

  try {
    // Create a Vapi call
    const vapiResponse = await axios.post(
      "https://api.vapi.ai/call",
      {
        assistantId: ASSISTANT_ID,
        customer: {
          number: fromNumber, // Must be in E.164
        },
        // ✅ override system prompt properly
        assistantOverrides: {
          systemPrompt: `You are handling a call from ${fromNumber}. Provide custom greeting.`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Vapi Call Created:", vapiResponse.data);

    // Respond TwiML to connect call
    res.type("text/xml");
    res.send(`
      <Response>
        <Dial>
          <Number>${fromNumber}</Number>
        </Dial>
      </Response>
    `);

  } catch (err) {
    console.error("❌ Error creating Vapi call:", err.response?.data || err.message);
    res.type("text/xml");
    res.send(`
      <Response>
        <Say>Sorry, an error occurred while connecting your call. Please try again later.</Say>
        <Hangup/>
      </Response>
    `);
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
