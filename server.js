// server.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

// 📞 Create a call endpoint
app.post("/create-call", async (req, res) => {
  try {
    const { phoneNumber, customContext } = req.body;

    if (!phoneNumber || !phoneNumber.startsWith("+")) {
      return res.status(400).json({ error: "Phone number must be in E.164 format (e.g., +918777315232)" });
    }

    const response = await axios.post(
      "https://api.vapi.ai/call",
      {
        assistantId: ASSISTANT_ID,
        customer: {
          number: phoneNumber, // ✅ Must be in E.164 format
        },
        assistantOverrides: {
          // ✅ Use `instructions`, NOT `systemPrompt`
          instructions: `You are an AI assistant. Context: ${customContext || "default context."}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error creating Vapi call:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// 🛠 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
