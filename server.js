// server.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 🗄️ Demo DB (replace with your real DB lookups)
const progressDB = {
  "+918777315232": {
    currentQuestion: 3,
    lastTranscript: "I was telling you about my React projects.",
    updatedAt: new Date()
  }
};

// 🔹 Incoming Call Webhook for Vapi
app.post("/vapi/incoming", async (req, res) => {
  const event = req.body;
  const callerNumber = event.customer.number;

  console.log("Incoming call from:", callerNumber);

  // Lookup candidate progress from DB
  const progress = progressDB[callerNumber];

  if (!progress) {
    // First-time caller → start fresh
    return res.json({
      assistantOverrides: {
        firstMessage: "Hi, thanks for calling. Let's start your interview now!",
        prompt: "You are an interview bot. Start interviewing the candidate from Question 1."
      },
      metadata: { resumeFrom: "Q1" }
    });
  }

  // Returning candidate → resume with context
  return res.json({
    assistantOverrides: {
      firstMessage: `Welcome back! Let's continue from Question ${progress.currentQuestion}.`,
      prompt: `You are an AI interview assistant. 
The candidate previously said: "${progress.lastTranscript}". 
Continue smoothly from Question ${progress.currentQuestion}, 
do not repeat previous questions, and keep the conversation natural.`
    },
    metadata: {
      resumeFrom: `Q${progress.currentQuestion}`,
      lastTranscript: progress.lastTranscript || "No transcript available"
    }
  });
});

// Start server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
