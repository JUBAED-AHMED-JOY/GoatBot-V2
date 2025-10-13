const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "RB-BADOL-KHAN",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "╔════•|🤍💚💛❤️💙🖤💜|•════╗\n\n❤️আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ•আ্ঁলা্ঁই্ঁকু্ঁম্ঁ💛\n\n🍒𝐉𝐎𝐘-𝐁𝐎𝐓🍒\n\n💚𝐁𝐎𝐓•𝐎𝐖𝐍𝐄𝐑: 𝐉𝐎𝐘 𝐀𝐇𝐌𝐄𝐃💚\n\n🤍𝐁𝐎𝐓•𝐀𝐃𝐌𝐈𝐍: 𝐉𝐎𝐘 𝐀𝐇𝐌𝐄𝐃🤍\n\n🍇═══════❤️💛💙💜💚═══════🍇\n\n🥀𝐁𝐎𝐓•𝐏𝐄𝐅𝐈𝐗: 【 %1 】\n\n🔐𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒•𝐂𝐊: 【 %1 help】\n\n╚════•|💜🖤💙❤️💛💚🤍|•════╝",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `🍒═══════❤️💛💙💜💚═══════🍒\n\n╔════•|      ✿      |•════╗\n 💐আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ💐\n╚════•|      ✿      |•════╝\n\n    ╰┈➤W⃠E⃠L⃠L⃠ C⃠O⃠M⃠E⃠➤\n\n                 ╰┈➤𝐍𝐄𝐖➤\n\n        ~🇲‌🇪‌🇲‌🇧‌🇪‌🇷‌~\n\n             ╰┈➤{userName}.➤\n\n༄✺আ্ঁপ্ঁনা্ঁকে্ঁ আ্ঁমা্ঁদে্ঁর্ঁ✺࿐\n\n{threadName}\n\n 🌺🌿🌸—এ্ঁর্ঁ প্ঁক্ষ্ঁ🍀থে্ঁকে্ঁ🍀—🌸🌿\n\n         🌿_ভা্ঁলো্ঁবা্ঁসা্ঁ_অ্ঁভি্ঁরা্ঁম্ঁ_🌿\n\n༄✺আঁপঁনিঁ এঁইঁ গ্রুঁপেঁর {soThanhVien} নঁং মে্ঁম্বা্ঁরঁ ࿐\n\n╔═━────━▒•✠•❀•✠• ▒━────━═╗\n╰┈➤𝐁𝐎𝐓'𝐬 𝐎𝐖𝐍𝐄𝐑➤\n\n            ☟                     \n\n𝐉𝐎𝐘 𝐀𝐇𝐌𝐄𝐃\n┗━━━━ ✦❘༻•✠•❀•✠•༺❘✦ ━━━━━┛\n🍒═══════❤️💛💙💜💚═══════🍒\n\n▓▓▓▓▓▓▓▓\n\nআমাদের সাথে সময় দেওয়া ও পাশে থাকার অনুরোধ রইলো !!-🍂🌺🥀\n\n🦋༎❤❤༎\n\nⵗⵗ̥̥̊̊ⵗ̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̥̥̥̥̥̊̊ⵗ̥̥̥̥̥̥̥̥̥̥̥ⵗ̥̥̥̥̥̥̥̥̥̥̊̊ⵗ̥̥̥̥̥̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̊̊̊ⵗ̥̥̊̊ \n\n🦋║ლ💞 💞 ლ║🦋\n\n💐☘️-ধন্যবাদ প্রিয়-☘️💐\n𝄞❤️⋆⃝⑅⑅⃝❤️»̶̶͓͓̽̽̽»̶̶͓͓̽̽̽.♥❤️⃪⃝⃘᭄⃕❤️`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("hh");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
