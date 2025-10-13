const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "pair",
    version: "1.0",
    author: "Joy",
    cooldowns: 5,
    role: 0,
    shortDescription: "Randomly pair users in group",
    longDescription: "Randomly pairs two users and generates a pairing image",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function({ api, event }) {
    const { threadID, senderID, messageID } = event;
    const __root = path.resolve(__dirname, "cache/canvas");

    if (!fs.existsSync(__root)) fs.mkdirSync(__root, { recursive: true });

    const baseImagePath = path.join(__root, "pairing.jpg");
    if (!fs.existsSync(baseImagePath)) {
      await downloadFile("https://i.pinimg.com/736x/15/fa/9d/15fa9d71cdd07486bb6f728dae2fb264.jpg", baseImagePath);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const participants = threadInfo.participantIDs.filter(id => id != senderID);
    if (participants.length === 0) return api.sendMessage("❌ No one else to pair with!", threadID, messageID);

    const partnerID = participants[Math.floor(Math.random() * participants.length)];
    const userData = await api.getUserInfo(senderID);
    const partnerData = await api.getUserInfo(partnerID);
    const userName = userData[senderID].name;
    const partnerName = partnerData[partnerID].name;

    const pathImg = await makePairImage(senderID, partnerID, baseImagePath, __root);

    const odds = Math.floor(Math.random() * 101) + "%";
    const mentions = [
      { id: senderID, tag: userName },
      { id: partnerID, tag: partnerName }
    ];

    api.sendMessage({
      body: `💖 Congratulations ${userName} was paired with ${partnerName}!\nPair odds: ${odds}`,
      mentions,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);
  }
};

async function makePairImage(one, two, baseImagePath, __root) {
  const pairingImg = await jimp.read(baseImagePath);
  const pathImg = path.join(__root, `pairing_${one}_${two}.png`);

  const avatarOnePath = path.join(__root, `avt_${one}.png`);
  const avatarTwoPath = path.join(__root, `avt_${two}.png`);

  const avatarOneData = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOnePath, Buffer.from(avatarOneData, 'utf-8'));

  const avatarTwoData = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwoPath, Buffer.from(avatarTwoData, 'utf-8'));

  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  pairingImg.composite(circleOne.resize(85, 85), 355, 100)
            .composite(circleTwo.resize(75, 75), 250, 140);

  const raw = await pairingImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return pathImg;
}

async function circle(image) {
  const img = await jimp.read(image);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function downloadFile(url, filePath) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, response.data);
}
