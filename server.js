// server.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

// Example: mapping numbers to different prompts
const numberPrompts = {
  "+918013671142": "You are a polite assistant handling calls for Rudrasish Dutta.",
  "+918777315232": "You are a support bot for Debuggersss team calls.",
  "+911234567890": "You are handling university-related calls for Rudrasish."
};

// Endpoint to create call
app.post("/create-call", async (req, res) => {
  try {
    const fromNumber = req.body.From;
    const toNumber = req.body.To || "+918013671142"; // default test number

    if (!fromNumber) {
      return res.status(400).json({ error: "Missing 'From' number" });
    }

    // Get system prompt based on caller
    const systemPrompt = numberPrompts[fromNumber] || "You are a default helpful assistant.";

    const payload = {
      customer: {
        number: toNumber, // ✅ Must be E.164 format (+91...)
      },
      assistantId: ASSISTANT_ID,
      assistantOverrides: {
        model: {
         messages: [
           {
          role: "system",
          content: systemPrompt
          }
       ]
      }
     } // ✅ Directly pass systemPrompt
    };

    const response = await axios.post("https://api.vapi.ai/call", payload, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error creating Vapi call:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
