const axios = require("axios");

const BOT_REPLIES = [
  "আমি এখন জয় বস এর সাথে বিজি আছি 😎",
  "What are you asking me to do?",
  "I love you baby, meye hole chipay aso 💋",
  "Love you 3000 😍💝",
  "Ji bolেন, ki korte pari ami apnar jonno?",
  "আমাকে না ডেকে আমার বস জয়কে ডাকেন! 💻 link: https://www.facebook.com/100001435123762",
  "Hmm jan ummah 😘😘",
  "তুমি কি আমাকে ডাকলে বন্ধু 🤖?",
  "ভালোবাসি তোমাকে 🤖",
  "Hi 🤖 I can help you ~~~~"
];

const API_CONFIG_URL = "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json";

async function getApiBase() {
  try {
    const res = await axios.get(API_CONFIG_URL);
    return res.data.api;
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    name: "bot",
    version: "9.0.0",
    author: "JOY",
    role: 0,
    category: "auto",
    prefix: false,
    shortDescription: "Bot with teach system + trigger chat + reply continuation",
  },

  onStart: async () => {
    console.log("✅ 'bot' command loaded (trigger + teach + reply system active)");
  },

  // 🔹 Teach system
  teach: async function (apiUrl, ask, ans) {
    try {
      const res = await axios.get(`${apiUrl}/sim`, { params: { teach: `${ask}|${ans}` } });
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

      const API_BASE = await getApiBase();
      if (!API_BASE) return message.reply("⚠️ API link not found (GitHub JSON load failed)");

      // =====================
      // 🔸 Teach system (via reply)
      // =====================
      if (messageReply && text.startsWith("teach ")) {
        const ask = text.slice(6).trim();
        const ans = messageReply.body?.trim();
        if (!ans) return message.reply("❌ Reply to a message to teach its content!");

        const result = await this.teach(API_BASE, ask, ans);
        return message.reply(result?.success
          ? `✅ Teach Added!\n💬 ASK: ${ask}\n💡 ANS: ${ans}`
          : `⚠️ Teach failed! ${result?.error || ""}`);
      }

      // 🔸 Teach system (direct)
      if (text.startsWith("teach ")) {
        const input = text.slice(6).trim();
        const [ask, ans] = input.split(/[\|\-]/).map(x => x?.trim());
        if (ask && ans) {
          const result = await this.teach(API_BASE, ask, ans);
          return message.reply(result?.success
            ? `✅ Teach Added!\n💬 ASK: ${ask}\n💡 ANS: ${ans}`
            : `⚠️ Teach failed! ${result?.error || ""}`);
        }
      }

      // =====================
      // 🔹 Trigger system
      // =====================
      const triggerWords = ["baby", "bby", "bot", "jan", "babu", "janu"];
      const startsWithTrigger = triggerWords.some(w => text.startsWith(w));

      if (startsWithTrigger) {
        const userText = text.replace(/^\S+\s*/, "");

        if (!userText) {
          const randomReply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
          return api.sendMessage(randomReply, event.threadID, (error, info) => {
            if (!info) return;
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
          }, event.messageID);
        }

        const response = await axios.get(`${API_BASE}/sim`, {
          params: { text: userText }
        });

        const reply = response.data.answer || "🤖 Couldn't get a reply right now.";
        return api.sendMessage(reply, event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bot",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            reply
          });
        }, event.messageID);
      }
    } catch (err) {
      console.error("❌ Chatbot Error:", err.message);
      return message.reply("❌ Error: " + err.message);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      const botID = await api.getCurrentUserID();
      if (botID === event.senderID) return;

      if (event.type === "message_reply") {
        const API_BASE = await getApiBase();
        if (!API_BASE) return api.sendMessage("⚠️ API not found!", event.threadID);

        const response = await axios.get(`${API_BASE}/sim`, {
          params: { text: event.body?.toLowerCase() }
        });

        const reply = response.data.answer || "🤖 Couldn't get a reply right now.";
        await api.sendMessage(reply, event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bot",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            reply
          });
        }, event.messageID);
      }
    } catch (err) {
      return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
