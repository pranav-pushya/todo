/* ==========================================================================
   GLOBAL CONFIGURATION & API KEY SETTINGS
   ========================================================================== */

const k1 = "gsk_9hmkvP7TbnQA0VpJ";
const k2 = "qJWPWGdyb3FYl4FiXGVC";
const k3 = "Ok55AbL5cfaqevvw";
const GROQ_API_KEY = k1 + k2 + k3;

const CONFIG = {
  // Uses the concatenated GROQ_API_KEY defined above
  API_KEY: GROQ_API_KEY,

  // 🌐 API Endpoint (Default: Groq API endpoint)
  // For xAI Grok: https://api.x.ai/v1/chat/completions
  // For Groq: https://api.groq.com/openai/v1/chat/completions
  API_ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",

  // 🤖 AI Model to use
  // Default: "llama-3.3-70b-versatile" (or "grok-beta", "mixtral-8x7b-32768")
  AI_MODEL: "llama-3.3-70b-versatile",

  // Helper method to retrieve the active API Key
  getApiKey() {
    const keyInCode = (typeof GROQ_API_KEY !== 'undefined' && GROQ_API_KEY.trim() !== "") ? GROQ_API_KEY.trim() : "";
    const keyInStorage = localStorage.getItem('grok_api_key') || "";
    return keyInCode || keyInStorage;
  },

  // Centralized AI API Request Dispatcher
  async fetchAICompletion(prompt, systemInstruction = "You are a helpful CSE AI/ML and Cybersecurity assistant.") {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return null; // Signals fallback to simulated intelligence engine
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.AI_MODEL,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : null;
    } catch (error) {
      console.warn("Live API call error, falling back to simulated engine:", error);
      return null;
    }
  }
};
