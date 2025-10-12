module.exports = {
  config: {
    name: "goiadmin",
    author: "Joy-Ahmed",
    role: 0,
    shortDescription: "জয় কে মেনশন করলে র‍্যান্ডম রিপ্লাই",
    longDescription: "নির্দিষ্ট কয়েকজন UID কে মেনশন করলে বট র‍্যান্ডম মেসেজ পাঠাবে",
    category: "BOT",
    guide: "{pn}"
  },

  onChat: function({ api, event }) {
    const allowedUIDs = ["100001435123762", "100001435123762", "100041805920990", "100041805920990"]; // এখানে তোমার UID গুলো বসাও

    const mentionedIDs = Object.keys(event.mentions || {});

    // চেক করবো মেনশন করা ID গুলোর মধ্যে যদি allowedUIDs এর কেউ থাকে
    const matched = mentionedIDs.some(id => allowedUIDs.includes(id));

    if (matched) {
      const msg = [
        "জয় এখন বিজি, যা বলার আমাকে বলতে পারেন_!!😼🥰",
        "এতো মেনশন না দিয়ে সিংগেল জয় রে একটা গফ দে 😒 😏",
        "Mantion না দিয়ে সিরিয়াস প্রেম করতে চাইলে ইনবক্স",
        "মেনশন দিসনা পারলে একটা গফ দে",
        "Mantion দিস না বাঁলপাঁক্না জয় প্রচুর বিজি 🥵🥀🤐"
      ];
      return api.sendMessage(
        { body: msg[Math.floor(Math.random() * msg.length)] },
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function() {}
};