const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "【 https://facebook.com/100001435123762】";

/** 
* @author NTKhang
* @message if you delete or edit it you will get a global ban
*/

module.exports = {
    config: {
        name: "help",
        version: "1.18",
        author: "NTKhang", //convert by Joy Ahmed
        countDown: 5,
        role: 0,
        shortDescription: {
            vi: "Xem cách dùng lệnh",
            en: "View command usage"
        },
        longDescription: {
            vi: "Xem cách sử dụng của các lệnh",
            en: "View command usage"
        },
        category: "info",
        guide: {
            vi: "   {pn} [để trống | <số trang> | <tên lệnh>]",
            en: "{pn} [empty | <page number> | <command name>]"
        },
        priority: 1
    },

    langs: {
        vi: {
            help: "╭─────────────⭓\n%1\n├─────⭔\n│ Trang [ %2/%3 ]\n│ Hiện tại bot có %4 lệnh có thể sử dụng\n│ » Gõ %5help <số trang> để xem danh sách các lệnh\n│ » Gõ %5help để xem chi tiết cách sử dụng lệnh đó\n├────────⭔\n│ %6\n╰─────────────⭓",
            commandNotFound: "Lệnh \"%1\" không tồn tại"
        },
        en: {
            help: "╭───────────⦿\n%1\n✪──────⦿\n✪ Page [ %2/%3 ]\n│ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭𝐥𝐲, 𝐓𝐡𝐞 𝐁𝐨𝐭 𝐇𝐚𝐬 %4 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐓𝐡𝐚𝐭 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝\n│ 𝐓𝐲𝐩𝐞 %5𝐡𝐞𝐥𝐩 <𝐩𝐚𝐠𝐞> 𝐓𝐨 𝐕𝐢𝐞𝐰 𝐓𝐡𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭\n│ 𝐓𝐲𝐩𝐞 %5help 𝐓𝐨 𝐕𝐢𝐞𝐰 𝐃𝐞𝐭𝐚𝐢𝐥𝐬\n✪──────⦿\n✪ %6\n╰─────────────⦿",
            commandNotFound: "Command \"%1\" does not exist"
        }
    },

    onStart: async function ({ message, args, event, threadsData, getLang, role }) {
        const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        const prefix = getPrefix(threadID);

        const commandName = (args[0] || "").toLowerCase();
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

        // ————— DOWNLOAD FB PROFILE PICTURE ————— //
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

        const fbUID = "100001435123762";
        const profilePicPath = await downloadFBProfilePic(fbUID);

        // ————— HELP MESSAGE ————— //
        if (!command && (!args[0] || !isNaN(args[0]))) {
            // LIST ALL COMMANDS
            let arrayInfo = [];
            let msg = "";

            for (const [name, value] of commands) {
                if (value.config.role > 1 && role < value.config.role) continue;
                let describe = name;
                if (value.config.shortDescription)
                    describe += `: ${value.config.shortDescription}`;
                arrayInfo.push({ data: describe, priority: value.priority || 0 });
            }

            arrayInfo.sort((a, b) => a.data.localeCompare(b.data));
            const page = parseInt(args[0]) || 1;
            const numberOfOnePage = 30;
            const totalPage = Math.ceil(arrayInfo.length / numberOfOnePage);
            if (page < 1 || page > totalPage) return message.reply(getLang("pageNotFound", page));

            const start = (page - 1) * numberOfOnePage;
            const pageData = arrayInfo.slice(start, start + numberOfOnePage);
            msg = pageData.map((item, index) => `✵${start + index + 1}. 「${item.data}」`).join("\n");

            const formSendMessage = {
                body: getLang("help", msg, page, totalPage, commands.size, prefix, doNotDelete)
            };
            if (profilePicPath) formSendMessage.attachment = [fs.createReadStream(profilePicPath)];

            return message.reply(formSendMessage);
        }

        // ————— COMMAND NOT FOUND ————— //
        else if (!command && args[0]) {
            return message.reply(getLang("commandNotFound", args[0]));
        }

        // ————— SINGLE COMMAND INFO ————— //
        else {
            const configCommand = command.config;
            const guide = configCommand.guide?.[langCode] || configCommand.guide?.["en"] || "";
            const formSendMessage = {
                body: `╭── COMMAND INFO ──⭓\nName: ${configCommand.name}\nDescription: ${configCommand.longDescription || "No description"}\nUsage:\n${guide}\n╰────────────⭓`
            };
            if (profilePicPath) formSendMessage.attachment = [fs.createReadStream(profilePicPath)];
            return message.reply(formSendMessage);
        }
    }
};