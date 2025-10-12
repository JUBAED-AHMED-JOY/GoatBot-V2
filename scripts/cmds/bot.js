const axios = require("axios");

const BOT_REPLIES = [
  "আমি এখন জয় বস এর সাথে বিজি আছি 😎",
  "what are you asking me to do?",
  "I love you baby meye hole chipay aso 💋",
  "Love you 3000 😍💝",
  "ji bolেন ki korte pari ami apnar jonno?",
  "আমাকে না ডেকে আমার বস জয়কে ডাকেন! 💻 link: https://www.facebook.com/100001435123762",
  "Hmm jan ummah😘😘",
  "তুমি কি আমাকে ডাকলে বন্ধু 🤖?",
  "ভালোবাসি তোমাকে 🤖",
  "Hi, 🤖 i can help you~~~~"
];

const API_CONFIG_URL = "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json";

module.exports = {
  config: {
    name: "bot",
    version: "7.0.0",
    author: "JOY",
    role: 0,
    category: "auto",
    prefix: false,
    shortDescription: "Bot, বট, bby: random + API replies + Teach system",
  },

  onStart: async function () {
    console.log("✅ 'bot' command loaded (random reply + reply-to-bot API + teach system active)");
  },

  // 🔹 Teach System
  teach: async function (apiUrl, ask, ans) {
    try {
      const res = await axios.get(`${apiUrl}/sim`, {
        params: { teach: `${ask}|${ans}` }
      });
      return res.data;
    } catch (err) {
      console.error("❌ Teach Error:", err.message);
      return null;
    }
  },

  onChat: async function ({ api, event, message }) {
    try {
      const { body, messageReply } = event;
      if (!body) return;

      const text = body.trim().toLowerCase();
      const botID = await api.getCurrentUserID();
      const isReplyToBot = messageReply && messageReply.senderID === botID;

      // 🔹 Load API base
      let API_BASE;
      try {
        const res = await axios.get(API_CONFIG_URL);
        API_BASE = res.data.api;
      } catch {
        API_BASE = null;
      }

      if (!API_BASE) return message.reply("⚠️ API link not found (GitHub JSON load failed)");

      // ======================
      // 1️⃣ Teach via reply
      // ======================
      if (messageReply && text.startsWith("teach ")) {
        const ask = text.slice(6).trim();
        const ans = messageReply.body?.trim();
        if (!ans) return message.reply("❌ Reply to a message to teach its content!");
        const result = await module.exports.teach(API_BASE, ask, ans);
        if (result?.success) return message.reply(`✅ Teach Added!\n💬 ASK: ${ask}\n💡 ANS: ${ans}`);
        return message.reply(`⚠️ Teach failed! ${result?.error || ""}`);
      }

      // ======================
      // 2️⃣ Teach via direct command
      // ======================
      if (text.startsWith("teach ")) {
        const input = text.slice(6).trim();
        let ask, ans;
        if (input.includes("|")) [ask, ans] = input.split("|").map(x => x.trim());
        else if (input.includes("-")) [ask, ans] = input.split("-").map(x => x.trim());

        if (ask && ans) {
          const result = await module.exports.teach(API_BASE, ask, ans);
          if (result?.success) return message.reply(`✅ Teach Added!\n💬 ASK: ${ask}\n💡 ANS: ${ans}`);
          return message.reply(`⚠️ Teach failed! ${result?.error || ""}`);
        }
      }

      // ======================
      // 3️⃣ Random reply if just "bot", "bby", "বট"
      // ======================
      if (["bot", "bby", "বট"].includes(text)) {
        const randomReply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
        return message.reply(randomReply);
      }

      // ======================
      // 4️⃣ Bot API reply (normal question)
      // ======================
      if (isReplyToBot || text.startsWith("bot") || text.startsWith("bby") || text.startsWith("বট")) {
        const res = await axios.get(`${API_BASE}/sim?text=${encodeURIComponent(body)}`);
        const ans = res.data.answer || "Bot couldn't answer.";
        return message.reply(ans);
      }

    } catch (err) {
      console.error("❌ Chatbot Error:", err.message);
      return message.reply("❌ API Error: " + err.message);
    }
  }
};
