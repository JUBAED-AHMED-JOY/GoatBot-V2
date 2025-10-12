const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "love2",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Joy Ahmed",
  description: "Create a love frame with mentioned person",
  category: "Love",
  usages: "[tag]",
  cooldowns: 5,
  prefix: true
};

module.exports.onLoad = async () => {
  const cachePath = path.join(__dirname, "cache", "canvas");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

  const bgPath = path.join(cachePath, "joy2.png");
  if (!fs.existsSync(bgPath)) {
    try {
      const bgUrl = "https://drive.google.com/uc?id=1BnaLHRtYs4nykFSc5TE_5Fg1iuMqz4NO";
      const res = await axios.get(bgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(bgPath, Buffer.from(res.data));
    } catch (err) {
      console.error("Failed to download love2 background:", err);
    }
  }
};

async function circle(imgPath) {
  const image = await jimp.read(imgPath);
  image.circle();
  return image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const cachePath = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(cachePath, "joy2.png");
  if (!fs.existsSync(bgPath)) throw new Error("Background template missing.");

  const bg = await jimp.read(bgPath);
  const avt1Path = path.join(cachePath, `avt_${one}.png`);
  const avt2Path = path.join(cachePath, `avt_${two}.png`);
  const finalPath = path.join(cachePath, `love_${one}_${two}.png`);

  // download avatars
  const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662"; // যদি প্রয়োজন মনে করো, update করো
  const [res1, res2] = await Promise.all([
    axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`, { responseType: "arraybuffer" }),
    axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`, { responseType: "arraybuffer" })
  ]);

  fs.writeFileSync(avt1Path, Buffer.from(res1.data));
  fs.writeFileSync(avt2Path, Buffer.from(res2.data));

  const circ1 = await jimp.read(await circle(avt1Path));
  const circ2 = await jimp.read(await circle(avt2Path));

  // composite positions (অনুরূপভাবে পরিবর্তন করতে পারো)
  bg.composite(circ1.resize(217, 217), 98, 143);
  bg.composite(circ2.resize(216, 216), 538, 144);

  const finalBuffer = await bg.getBufferAsync("image/png");
  fs.writeFileSync(finalPath, finalBuffer);

  // clean avatars
  if (fs.existsSync(avt1Path)) fs.unlinkSync(avt1Path);
  if (fs.existsSync(avt2Path)) fs.unlinkSync(avt2Path);

  return finalPath;
}

module.exports.onStart = async function ({ api, event }) {
  const { senderID, mentions, threadID, messageID } = event;
  const mentionIDs = mentions ? Object.keys(mentions) : [];

  if (mentionIDs.length === 0) {
    return api.sendMessage("🥰 যাকে সাথে love frame বানাতে চাও, তাকে ট্যাগ/মেনশন করো!", threadID, messageID);
  }

  const targetID = mentionIDs[0];

  try {
    const imgPath = await makeImage({ one: senderID, two: targetID });

    const msg = `
╭╼|━━━━━━━━━━━━━━|╾╮
│ 💖 𝓛𝓸𝓿𝓮 𝓕𝓻𝓪𝓶𝓮 💖
│ 
│ ✨ 𝒞𝓇𝑒𝒶𝓉𝑜𝓇: 𝒥❍𝓎 𝒜𝒽𝓂𝑒𝒹 ✨
╰╼|━━━━━━━━━━━━━━|╾╯
`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }, messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ ছবিটি তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
  }
};