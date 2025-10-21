const axios = require("axios");

// memory-based per-thread limit
const limits = {};
const lastUsage = {};
const GITHUB_URL =
  "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/bom.json";

// Helper: split long message into 2000 char chunks
function chunkMessage(text, size = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

module.exports = {
  config: {
    name: "gcsms",
    version: "7.0.0",
    author: "Joy",
    role: 2,
    shortDescription: "Send group messages from GitHub JSON (large message safe)",
    longDescription:
      "Send messages to any thread/group using threadID and limit, plus list and reset system, all in one command. Large messages auto-sliced.",
    category: "admin",
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage(
        `⚙️ ব্যবহার:\n.gcsms <threadID> <limit>\n.gcsms list\n.gcsms reset <threadID>\n📘 Source: ${GITHUB_URL}`,
        event.threadID
      );
    }

    const action = args[0].toLowerCase();

    // ---- LIST ----
    if (action === "list") {
      if (!Object.keys(limits).length) {
        return api.sendMessage("⚠️ এখনও কোনো gcsms ব্যবহার হয়নি।", event.threadID);
      }

      let msg = "📊 GCSMS Usage List:\n";
      for (const [tid, count] of Object.entries(limits)) {
        const time = lastUsage[tid] ? ` (শেষ ব্যবহার: ${new Date(lastUsage[tid]).toLocaleString()})` : "";
        msg += `\n🔹 ${tid}: ${count} বার${time}`;
      }
      return api.sendMessage(msg, event.threadID);
    }

    // ---- RESET ----
    if (action === "reset") {
      if (!args[1]) return api.sendMessage("⚠️ ব্যবহার: .gcsms reset <threadID>", event.threadID);

      const threadID = args[1].trim();
      if (!limits[threadID])
        return api.sendMessage("⚠️ এই ThreadID এখনো ব্যবহার করেনি।", event.threadID);

      limits[threadID] = 0;
      lastUsage[threadID] = null;
      return api.sendMessage(`✅ ${threadID} এর gcsms limit রিসেট করা হয়েছে।`, event.threadID);
    }

    // ---- SEND MESSAGES ----
    const threadID = args[0].trim();
    const limit = parseInt(args[1]);
    if (isNaN(limit) || limit <= 0)
      return api.sendMessage("⚠️ একটি সঠিক limit দিন (যেমন 5 বা 10)।", event.threadID);

    if (!limits[threadID]) limits[threadID] = 0;
    if (limits[threadID] >= limit)
      return api.sendMessage(
        `🚫 Limit reached! এই group/thread সর্বোচ্চ ${limit} বার মেসেজ পাঠাতে পারবে।`,
        event.threadID
      );

    try {
      const res = await axios.get(GITHUB_URL, { timeout: 20000 });
      const data = res.data;

      let messages = [];
      if (Array.isArray(data)) {
        messages = data;
      } else if (Array.isArray(data.messages)) {
        messages = data.messages;
      } else if (typeof data.message === "string") {
        messages = [data.message];
      } else {
        return api.sendMessage("❌ GitHub JSON ফরম্যাট সঠিক নয়!", event.threadID);
      }

      if (!messages.length)
        return api.sendMessage("⚠️ GitHub ফাইল খালি!", event.threadID);

      api.sendMessage(
        `📩 শুরু হচ্ছে ${limit} বার মেসেজ পাঠানো...\n🎯 ThreadID: ${threadID}`,
        event.threadID
      );

      for (let i = 0; i < limit; i++) {
        const msg = messages[i % messages.length];
        const chunks = chunkMessage(msg, 2000); // slice if >2000 char

        for (const chunk of chunks) {
          await api.sendMessage(chunk, threadID);
          await new Promise((r) => setTimeout(r, 1500)); // 1.5 sec delay per chunk
        }
      }

      limits[threadID] += limit;
      lastUsage[threadID] = Date.now();

      return api.sendMessage(
        `✅ ${limit} বার মেসেজ পাঠানো হয়েছে!\n📘 Source: GitHub\n📩 ThreadID: ${threadID}`,
        event.threadID
      );
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.status
        ? `HTTP ${err.response.status}: ${err.response.statusText}`
        : err.code || err.message || "Unknown error";
      return api.sendMessage(
        `❌ GitHub থেকে ডেটা আনতে সমস্যা হয়েছে!\nError: ${errMsg}`,
        event.threadID
      );
    }
  },
};
