const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "fuck",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Joy",
  description: "Generates a 'fuck' meme with your avatar and mentioned user's avatar.",
  category: "fun",
  usages: "fuck @mention",
  cooldowns: 5,
  prefix: true
};

module.exports.onLoad = async () => {
  const dir = path.join(__dirname, "cache", "canvas");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const imgPath = path.join(dir, "fuckv2.png");

  if (!fs.existsSync(imgPath)) {
    try {
      const res = await axios.get("https://drive.google.com/uc?id=1DEVtK3nSegoSjT4VsXMhnkEO3Sct9sgz", { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(res.data));
    } catch (err) {
      console.error("Failed to download template:", err);
    }
  }
};

async function circle(imagePath) {
  const img = await jimp.read(imagePath);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const dir = path.join(__dirname, "cache", "canvas");
  const bgPath = path.join(dir, "fuckv2.png");
  const outPath = path.join(dir, `fuck_${one}_${two}.png`);
  const onePath = path.join(dir, `avt_${one}.png`);
  const twoPath = path.join(dir, `avt_${two}.png`);

  // Download avatars
  const avatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  const avatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;

  fs.writeFileSync(onePath, Buffer.from(avatarOne));
  fs.writeFileSync(twoPath, Buffer.from(avatarTwo));

  const bg = await jimp.read(bgPath);
  const circOne = await jimp.read(await circle(onePath));
  const circTwo = await jimp.read(await circle(twoPath));

  // Composite avatars
  bg.composite(circOne.resize(180, 180), 190, 200);
  bg.composite(circTwo.resize(180, 180), 390, 200);

  const finalImg = await bg.getBufferAsync("image/png");
  fs.writeFileSync(outPath, finalImg);

  // Cleanup
  if (fs.existsSync(onePath)) fs.unlinkSync(onePath);
  if (fs.existsSync(twoPath)) fs.unlinkSync(twoPath);

  return outPath;
}

module.exports.onStart = async function ({ api, event }) {
  const { threadID, messageID, senderID, mentions } = event;
  const mentionIDs = Object.keys(mentions || {});

  if (mentionIDs.length === 0) {
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n│  ⚠️ একজনকে মেনশন করুন!\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );
  }

  const one = senderID;
  const two = mentionIDs[0];

  try {
    const imgPath = await makeImage({ one, two });
    return api.sendMessage(
      {
        body: `╭╼|━━━━━━━━━━━━━━|╾╮\n│  🥵 Fuck mode activated!\n╰╼|━━━━━━━━━━━━━━|╾╯`,
        attachment: fs.createReadStream(imgPath),
        mentions: [{ id: two, tag: mentions[two] }]
      },
      threadID,
      () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      },
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n│  ❌ ছবিটি তৈরি করতে সমস্যা হয়েছে!\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID,
      messageID
    );
  }
};