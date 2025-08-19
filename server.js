import express from "express";

const app = express();
app.use(express.json());

// Example: mapping numbers to different prompts
const numberPrompts = {
  "+918013671142": "You are a polite assistant handling calls for Rudrasish Dutta.",
  "+918777315232": "You are a support bot for Debuggersss team calls.",
  "+911234567890": "You are handling university-related calls for Rudrasish."
};

app.post("/webhooks/vapi", async (req, res) => {
  const messageType = req.body?.message?.type;
  if (messageType !== "assistant-request") {
    return res.sendStatus(204);
  }

  const incomingNumber = req.body?.call?.from?.phoneNumber;
  const prompt = numberPrompts[incomingNumber] || "You are a default helpful assistant.";

  // Return a transient assistant configuration
  return res.json({
    assistant: {
      name: "Inbound Receptionist",
      firstMessage: "Hi there! How can I help you today?",
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: prompt
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "shimmer"
      }
    }
  });
});

app.listen(3000, () => console.log("Server listening on port 3000"));