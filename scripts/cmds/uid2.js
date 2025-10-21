const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "uid2",
  aliases: ["getuid"],
  version: "2.0.0",
  permission: 0,
  credits: "Joy",
  prefix: true,
  description: "Get Facebook user UID with profile picture.",
  category: "info",
  cooldowns: 5
};

module.exports.onStart = async function ({ event, api, args }) {
  try {
    const { threadID, messageID, senderID } = event;

    // Helper Function
    const sendUID = async (uid) => {
      const avatarURL = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const imgPath = path.join(__dirname, "cache", `${uid}.png`);

      await fs.ensureDir(path.dirname(imgPath));

      const imgData = await axios.get(avatarURL, { responseType: "arraybuffer", maxRedirects: 5 });
      await fs.writeFile(imgPath, imgData.data);

      const body = `🌐 ===「 𝗨𝗦𝗘𝗥 𝗨𝗜𝗗 」=== 🌐
━━━━━━━━━━━━━━━━━━
👤 𝗜𝗗     : ${uid}
💬 𝗜𝗕     : m.me/${uid}
🔗 𝗟𝗶𝗻𝗸𝗙𝗕 : https://www.facebook.com/profile.php?id=${uid}
━━━━━━━━━━━━━━━━━━`;

      await api.sendMessage(
        {
          body,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        messageID
      );

      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 20000);
    };

    // === Case 1: Reply করা মেসেজ === //
    if (event.type === "message_reply") {
      const uid = event.messageReply.senderID;
      return await sendUID(uid);
    }

    // === Case 2: Argument নাই (নিজের UID) === //
    if (!args[0]) {
      return await sendUID(senderID);
    }

    // === Case 3: Mention করা হলে === //
    if (Object.keys(event.mentions).length > 0) {
      const uid = Object.keys(event.mentions)[0];
      return await sendUID(uid);
    }

    // === Case 4: Link দেওয়া হলে === //
    if (args[0].includes(".com/")) {
      try {
        const link = args[0];
        const html = await axios.get(link);
        const match = html.data.match(/\"userID\":\"(\\d+)\"/);
        if (!match) return api.sendMessage("❌ UID খুঁজে পাওয়া যায়নি!", threadID, messageID);
        const uid = match[1];
        return await sendUID(uid);
      } catch (err) {
        return api.sendMessage("❌ লিংক থেকে UID আনতে সমস্যা হয়েছে!", threadID, messageID);
      }
    }

    // === Case 5: সরাসরি UID দিলে === //
    if (/^[0-9]+$/.test(args[0])) {
      return await sendUID(args[0]);
    }

    return api.sendMessage("❌ সঠিক ফরম্যাট ব্যবহার করুন: uid, @mention, reply বা FB লিংক দিন।", threadID, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ কিছু ভুল হয়েছে: " + err.message, event.threadID, event.messageID);
  }
};
