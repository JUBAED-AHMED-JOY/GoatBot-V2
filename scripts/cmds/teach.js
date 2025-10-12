const axios = require("axios");

module.exports = {
  config: {
    name: "teach",
    version: "5.0.2",
    author: "JOY",
    countDown: 2,
    role: 0,
    category: "admin",
    shortDescription: "Teach Simsimi QnA (Supports |, -, or reply)",
    longDescription: "Reply a message or use teach question | answer / teach question - answer",
    guide: {
      en: "Reply a message + teach [ASK] or teach question | answer / teach question - answer"
    }
  },

  // 🔹 API লোড
  getApiUrl: async function () {
    const githubApiUrl = "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json";
    try {
      const res = await axios.get(githubApiUrl, { headers: { "Cache-Control": "no-cache" } });
      return res.data?.api || null;
    } catch (err) {
      console.error("❌ GitHub Load Error:", err.message);
      return null;
    }
  },

  // 🔹 Teach পাঠানো
  sendTeach: async function (apiUrl, ask, ans) {
    try {
      const response = await axios.get(`${apiUrl}/sim`, { params: { teach: `${ask}|${ans}` } });
      return response.data;
    } catch (err) {
      console.error("❌ Teach Error:", err.response?.data || err.message);
      return null;
    }
  },

  // =========================
  // ✅ Goat-compatible onStart function
  // =========================
  onStart: async function ({ message, event, args }) {
    const { threadID, messageID, type, messageReply } = event;

    // API URL
    const apiUrl = await module.exports.getApiUrl();
    if (!apiUrl) return message.reply("❌ GitHub থেকে API URL লোড করা যায়নি!");

    // 🔹 CASE 1: Reply Mode
    if (type === "message_reply" && messageReply?.body) {
      if (!args[0]) return message.reply("⚠️ Reply a message & type: teach [ASK]");

      const ask = args.join(" ").trim().toLowerCase();
      const ans = messageReply.body.trim();

      const result = await module.exports.sendTeach(apiUrl, ask, ans);
      if (result?.success) {
        return message.reply(`✅ Teach Saved!\n💬 ASK: ${ask}\n💡 ANS: ${ans}`);
      } else {
        return message.reply(`⚠️ Teach Failed!\n${result?.error || "Unknown error."}`);
      }
    }

    // 🔹 CASE 2: Direct Teach Mode
    const input = args.join(" ").trim();
    let ask, ans;
    if (input.includes("|")) {
      [ask, ans] = input.split("|").map(v => v.trim());
    } else if (input.includes("-")) {
      [ask, ans] = input.split("-").map(v => v.trim());
    }

    if (ask && ans) {
      const result = await module.exports.sendTeach(apiUrl, ask.toLowerCase(), ans);
      if (result?.success) {
        return message.reply(`✅ Teach Added!\n💬 ASK: ${ask}\n💡 ANS: ${ans}`);
      } else {
        return message.reply(`⚠️ Teach Failed!\n${result?.error || "Server problem!"}`);
      }
    }

    // 🔴 Invalid Format
    return message.reply(
      "❌ Invalid Format!\n\n🧠 Usage:\n1️⃣ Reply a message: teach [ASK]\n2️⃣ teach question | answer\n3️⃣ teach question - answer"
    );
  }
};
