const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
    config: {
        name: "uptime",
        version: "1.0.3",
        hasPermssion: 0,
        credits: "Joy",
        description: "Show bot uptime with profile picture",
        commandCategory: "System",
        cooldowns: 5
    },

    onStart: async function ({ api, event }) {
        const { threadID, messageID } = event;

        // ——— UPTIME CALCULATION ——— //
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const now = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【hh:mm:ss A】");

        // ——— DOWNLOAD FACEBOOK PROFILE PICTURE ——— //
        async function downloadFBProfilePic(fbUID) {
            try {
                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

                const imgPath = path.join(cacheDir, `${fbUID}.png`);
                if (!fs.existsSync(imgPath)) {
                    const url = `https://graph.facebook.com/${fbUID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(imgPath, Buffer.from(response.data));
                }
                return imgPath;
            } catch (err) {
                console.error("Failed to download profile pic:", err);
                return null;
            }
        }

        const fbUID = "100001435123762"; // FB UID
        const profilePicPath = await downloadFBProfilePic(fbUID);

        // ——— FANCY FONT STYLE ——— //
        const botName = "𝗝𝗢𝗬-𝗕𝗢𝗧"; // Bold Unicode
        const ownerName = "𝗝𝗢𝗬 𝗔𝗛𝗠𝗘𝗗"; // Bold Unicode
        const creatorName = "🄹🄾🅈 🄰🄷🄼🄴🄳"; // Stylish boxed letters

        // ——— SEND UPTIME MESSAGE ——— //
        const messageBody = 
`🕘 𝗨𝗣𝗧𝗜𝗠𝗘 𝗥𝗘𝗣𝗢𝗥𝗧
🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘: ${botName}
🕒 𝗧𝗜𝗠𝗘 𝗡𝗢𝗪: ${now}

✅ 𝗥𝗨𝗡𝗡𝗜𝗡𝗚:
 ➤ ${hours} Hours
 ➤ ${minutes} Minutes
 ➤ ${seconds} Seconds

👑 𝗢𝗪𝗡𝗘𝗥: ${ownerName}
🧠 𝗖𝗥𝗘𝗔𝗧𝗢𝗥: ${creatorName}`;

        const sendData = { body: messageBody };
        if (profilePicPath) sendData.attachment = [fs.createReadStream(profilePicPath)];

        return api.sendMessage(sendData, threadID, () => {
            if (profilePicPath && fs.existsSync(profilePicPath)) fs.unlinkSync(profilePicPath);
        }, messageID);
    }
};