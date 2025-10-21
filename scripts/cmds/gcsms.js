const axios = require("axios");

// memory-based storages
const limits = {};
const lastUsage = {};
const unlimited = new Set();

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
    version: "9.0.0",
    author: "Joy",
    role: 2,
    shortDescription: "Send all group messages from GitHub JSON together (unlimited supported)",
    longDescription:
      "Send all messages to a thread/group, includes limit, unlimited, list, reset. Large messages auto-sliced.",
    category: "admin",
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage(
        `⚙️ ব্যবহার:\n.gcsms <threadID> <limit>\n.gcsms list\n.gcsms reset <threadID>\n.gcsms setunlimited <threadID>\n.gcsms unsetunlimited <threadID>\n.gcsms unlimited\n\n📘 Source: ${GITHUB_URL}`,
        event.threadID
      );
    }

    const action = args[0].toLowerCase();

    // ---- LIST ----
    if (action === "list") {
      if (!Object.keys(limits).length && unlimited.size === 0) {
        return api.sendMessage("⚠️ এখনও কোনো gcsms ব্যবহার হয়নি এবং কোনো unlimited নেই।", event.threadID);
      }

      let msg = "📊 GCSMS Usage & Unlimited List:\n";
      for (const [tid, count] of Object.entries(limits)) {
        const time = lastUsage[tid] ? ` (শেষ: ${new Date(lastUsage[tid]).toLocaleString()})` : "";
        const isUn = unlimited.has(tid) ? " 🔓UNLIMITED" : "";
        msg += `\n🔹 ${tid}: ${count} বার${isUn}${time}`;
      }
      for (const tid of unlimited) {
        if (!(tid in limits)) msg += `\n🔸 ${tid}: 0 বার 🔓UNLIMITED`;
      }
      return api.sendMessage(msg, event.threadID);
    }

    // ---- RESET ----
    if (action === "reset") {
      if (!args[1]) return api.sendMessage("⚠️ ব্যবহার: .gcsms reset <threadID>", event.threadID);
      const threadID = args[1].trim();
      limits[threadID] = 0;
      lastUsage[threadID] = null;
      return api.sendMessage(`✅ ${threadID} এর gcsms limit রিসেট করা হয়েছে। (unlimited: ${unlimited.has(threadID) ? "হ্যাঁ" : "না"})`, event.threadID);
    }

    // ---- SET UNLIMITED ----
    if (action === "setunlimited") {
      if (!args[1]) return api.sendMessage("⚠️ ব্যবহার: .gcsms setunlimited <threadID>", event.threadID);
      const threadID = args[1].trim();
      unlimited.add(threadID);
      if (!limits[threadID]) limits[threadID] = 0;
      return api.sendMessage(`✅ ${threadID} এখন থেকে UNLIMITED হিসেবে মার্ক করা হলো।`, event.threadID);
    }

    // ---- UNSET UNLIMITED ----
    if (action === "unsetunlimited") {
      if (!args[1]) return api.sendMessage("⚠️ ব্যবহার: .gcsms unsetunlimited <threadID>", event.threadID);
      const threadID = args[1].trim();
      if (!unlimited.has(threadID)) return api.sendMessage("⚠️ এই ThreadID unlimited হিসেবে নাই।", event.threadID);
      unlimited.delete(threadID);
      return api.sendMessage(`✅ ${threadID} এখন থেকে UNLIMITED নয়।`, event.threadID);
    }

    // ---- SHOW UNLIMITED LIST ----
    if (action === "unlimited") {
      if (unlimited.size === 0) return api.sendMessage("⚠️ এখনো কোনো unlimited thread নেই।", event.threadID);
      let msg = "🔓 Unlimited Threads:\n";
      for (const tid of unlimited) msg += `\n• ${tid}`;
      return api.sendMessage(msg, event.threadID);
    }

    // ---- SEND MESSAGES ----
    const threadID = args[0].trim();
    const limitArg = args[1];
    if (!limitArg) return api.sendMessage("⚠️ ব্যবহার: .gcsms <threadID> <limit>", event.threadID);
    const limit = parseInt(limitArg);
    if (isNaN(limit) || limit <= 0) return api.sendMessage("⚠️ একটি সঠিক limit দিন।", event.threadID);

    if (!limits[threadID]) limits[threadID] = 0;

    if (!unlimited.has(threadID) && limits[threadID] >= limit) {
      return api.sendMessage(`🚫 Limit reached! এই group/thread সর্বোচ্চ ${limit} বার মেসেজ পাঠাতে পারবে।`, event.threadID);
    }

    try {
      const res = await axios.get(GITHUB_URL, { timeout: 20000 });
      const data = res.data;

      let messages = [];
      if (Array.isArray(data)) messages = data;
      else if (Array.isArray(data.messages)) messages = data.messages;
      else if (typeof data.message === "string") messages = [data.message];
      else return api.sendMessage("❌ GitHub JSON ফরম্যাট সঠিক নয়!", event.threadID);
      if (!messages.length) return api.sendMessage("⚠️ GitHub ফাইল খালি!", event.threadID);

      // join all messages into one string
      const allMsg = messages.join("\n\n");
      const chunks = chunkMessage(allMsg, 2000);

      api.sendMessage(`📩 শুরু হচ্ছে ${limit} বার মেসেজ পাঠানো...\n🎯 ThreadID: ${threadID}`, event.threadID);

      for (let i = 0; i < limit; i++) {
        for (const chunk of chunks) {
          await api.sendMessage(chunk, threadID);
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      if (!unlimited.has(threadID)) limits[threadID] += limit;
      lastUsage[threadID] = Date.now();

      return api.sendMessage(
        `✅ ${limit} বার মেসেজ পাঠানো হয়েছে!\n📘 Source: GitHub\n📩 ThreadID: ${threadID}\n🔓 Unlimited: ${unlimited.has(threadID) ? "হ্যাঁ" : "না"}`,
        event.threadID
      );

    } catch (err) {
      console.error(err);
      const errMsg = err.response?.status ? `HTTP ${err.response.status}: ${err.response.statusText}` : err.code || err.message || "Unknown error";
      return api.sendMessage(`❌ GitHub থেকে ডেটা আনতে সমস্যা হয়েছে!\nError: ${errMsg}`, event.threadID);
    }
  },
};
