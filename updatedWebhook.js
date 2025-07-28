require("dotenv").config();
const axios = require("axios");

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const updateAssistantWebhook = async () => {
  try {
    const response = await axios.patch(
      `https://api.vapi.ai/assistants/${ASSISTANT_ID}`,
      {
        webhook: {
          url: WEBHOOK_URL
        }
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Webhook URL updated successfully:");
    console.log(response.data);
  } catch (error) {
    console.error(" Failed to update webhook:");
    console.error(error.response?.data || error.message);
  }
};

updateAssistantWebhook();
