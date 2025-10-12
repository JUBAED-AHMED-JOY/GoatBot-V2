const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "fingering",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Joy",
  description: "A fun image attack between two users!",
  category: "fun",
  usages: "[@mention]",
  cooldowns: 5,
  prefix: true
};

module.exports.onLoad = async () => {
  const dir = path.join(__dirname, "cache", "canvas");
  const imgPath = path.join(dir, "fingering.png");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(imgPath)) {
    try {
      const res = await axios.get("https://drive.google.com/uc?id=1D95B_wc1jup4IFBB-_54OBB0sg2IXeZS", { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(res.data));
    } catch (err) {
      console.error("Failed to download fingering template:", err);
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
  const bgPath = path.join(dir, "fingering.png");
  if (!fs.existsSync(bgPath)) throw new Error("Background template missing.");

  const bg = await jimp.read(bgPath);
  const outPath = path.join(dir, `duoattack_${one}_${two}.png`);
  const onePath = path.join(dir, `avt_${one}.png`);
  const twoPath = path.join(dir, `avt_${two}.png`);

  // download avatars
  const avt1 = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  const avt2 = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;

  fs.writeFileSync(onePath, Buffer.from(avt1));
  fs.writeFileSync(twoPath, Buffer.from(avt2));

  const circleOneBuf = await circle(onePath);
  const circleTwoBuf = await circle(twoPath);

  const circleOne = await jimp.read(circleOneBuf);
  const circleTwo = await jimp.read(circleTwoBuf);

  // composite positions — তুমি চাইলে এখানে coordinates/size পরিবর্তন করতে পারো
  bg
    .composite(circleOne.resize(180, 180), 320, 90)
    .composite(circleTwo.resize(180, 180), 100, 230);

  const final = await bg.getBufferAsync("image/png");
  fs.writeFileSync(outPath, final);

  // clean avatars
  if (fs.existsSync(onePath)) fs.unlinkSync(onePath);
  if (fs.existsSync(twoPath)) fs.unlinkSync(twoPath);

  return outPath;
}

module.exports.onStart = async function ({ api, event }) {
  const { threadID, messageID, senderID, mentions } = event;
  const mentionIDs = Object.keys(mentions || {});

  if (mentionIDs.length === 0) {
    return api.sendMessage("⚠️ একজনকে মেনশন করুন যাতে সে আপনার 'fingering' এর শিকার হতে পারে!", threadID, messageID);
  }

  const one = senderID;
  const two = mentionIDs[0];

  try {
    const imgPath = await makeImage({ one, two });
    const msg = {
      body: `╭╼|━━━━━━━━━━━━━━|╾╮\n┃ 🔥 fingering Initiated!\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      attachment: fs.createReadStream(imgPath)
    };
    return api.sendMessage(msg, threadID, () => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }, messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ ছবিটি তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
  }
};