const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const request = require("request");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    version: "1.0.0",
    role: 0,
    author: "Joy",
    description: "Displays personal info of the bot owner",
    category: "info",
    countDown: 5,
    guide: { en: "Just type the command" },
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const imgDir = path.join(__dirname, "cache");
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

    const imgPath = path.join(imgDir, "info_avatar.png");
    const imageUrl = "https://graph.facebook.com/100001435123762/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

    const currentTime = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【hh:mm:ss】");

    const infoText = `
╭─[ 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ]─╮
👤 Name       : MD JUBAED AHMMED JOY
📘 Facebook   : JOY AHMED
🕋 Religion   : Islam
🏠 Permanent : Jamalpur, Dhaka
📍 Current   : Tarakandi, Sarishabari, Jamalpur
🚻 Gender    : Male
🎂 Age       : 16+
💘 Status    : Single
🎓 Work      : Student
📧 Gmail     : mdjubaedahmed124@gmail.com
📞 WhatsApp  : wa.me/+8801709045888
✈️ Telegram  : t.me/JOY_AHMED_88
🔗 FB Link   : facebook.com/100001435123762
⏰ Time      : ${currentTime}
╰─────────────────────╯`;

    const callback = () => {
      api.sendMessage({
        body: infoText,
        attachment: fs.createReadStream(imgPath),
      }, threadID, () => fs.unlinkSync(imgPath));
    };

    request(encodeURI(imageUrl))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", callback);
  },
};