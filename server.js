require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const MY_AGENT_ID = process.env.ASSISTANT_ID;

app.post("/webhook", (req, res) => {
  const payload = req.body;
  const event = payload.message?.type;
  const direction = payload.message?.call?.direction;
  const agentId = payload.message?.agent?.id;
  const agentConfig = payload.message?.agent?.config;

  console.log(" Event:", event);
  console.log(" Direction:", direction);
  console.log(" Agent ID:", agentId);

  if (agentId && agentId !== MY_AGENT_ID) {
    console.warn(" Webhook hit for a different assistant. Ignoring...");
    return res.sendStatus(200);
  }

  if (event === "call.started") {
    const caller = payload.message?.call?.from;
    console.log("Incoming call from:", caller);

    const message =
      direction === "inbound"
        ? "Hello! You've reached Rudrasish's AI assistant. How can I help you?"
        : "Hi! I'm calling on behalf of Rudrasish.";

    return res.json({
      action: "respond",
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    });
  }

  if (event === "message.transcript") {
    const userText = payload.message?.text;
    console.log("🗣️ User said:", userText);
  }

  if (event === "call.ended") {
    console.log("📴 Call ended");
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}/webhook`);
});
