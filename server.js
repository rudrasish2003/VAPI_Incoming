// server.js

const progressDB = {
  "+918777315232": {
    currentQuestion: 3,
    lastTranscript: "I was telling you about my React projects.",
    updatedAt: new Date()
  }
};

 const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

// Demo in-memory DB
const db = {
  "+918777315232": {
    currentQuestion: 3,
    lastTranscript: "I was telling you about my React projects.",
    updatedAt: new Date()
  }
};


// Function to get user context from DB
function getUserContext(phoneNumber) {
  if (db.calls[phoneNumber]) {
    return db.calls[phoneNumber].map(r => r.context).join("\n");
  }
  return null;
}

// Function to save call record
function saveCall(phoneNumber, callId, context) {
  if (!db.calls[phoneNumber]) {
    db.calls[phoneNumber] = [];
  }
  db.calls[phoneNumber].push({ callId, context });
}

// Endpoint for incoming Twilio call
app.post("/incoming-call", async (req, res) => {
  try {
    const { From, To } = req.body; // Twilio sends From (caller), To (your Twilio num)

    console.log("Incoming call from:", From);

    // Fetch user context if any
    const userContext = getUserContext(From);

    // Base system prompt
    let systemPrompt = "You are a helpful assistant for handling customer calls.";
    if (userContext) {
      systemPrompt += `\n\nHere is the caller's previous context:\n${userContext}`;
    }

    // Create VAPI call
    const response = await axios.post(
      "https://api.vapi.ai/call",
      {
        assistantId: ASSISTANT_ID,
        phoneNumberId: To, // your Twilio number imported in VAPI
        customer: { number: From },
        assistantOverrides: {
          systemPrompt, // 👈 modified system prompt
        },
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save record in DB (you can replace with real DB insert)
    saveCall(From, response.data.id, "Demo context for this call");

    res.status(200).json({ success: true, callId: response.data.id });
  } catch (err) {
    console.error("Error creating call:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create VAPI call" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
