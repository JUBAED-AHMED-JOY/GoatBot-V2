const fs = require("fs");

module.exports = {
  config: {
    name: "adminNoti",
    version: "1.0.1",
    author: "Rômeo",
    description: "Group Information Update",
    category: "events"
  },

  onStart: async ({ threadsData, event, api, usersData }) => {
    const { threadID, logMessageData, logMessageType, logMessageBody, author } = event;
    
    if (author === threadID) return;

    switch (logMessageType) {
      case "log:thread-admins": {
        return async function () {
          if (logMessageData.ADMIN_EVENT == "add_admin") {
            try {
              const userName = await usersData.getName(logMessageData.TARGET_ID);
              api.sendMessage(`[ GROUP UPDATE ]\n❯ ${userName} has been promoted to admin`, threadID);
            } catch (error) {
              console.log("Error getting user name for TARGET_ID:", logMessageData.TARGET_ID, error);
              api.sendMessage(`[ GROUP UPDATE ]\n❯ User ${logMessageData.TARGET_ID} has been promoted to admin`, threadID);
            }
          } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
            try {
              const userName = await usersData.getName(logMessageData.TARGET_ID);
              api.sendMessage(`[ GROUP UPDATE ]\n❯ ${userName} has been removed from admin position`, threadID);
            } catch (error) {
              console.log("Error getting user name for TARGET_ID:", logMessageData.TARGET_ID, error);
              api.sendMessage(`[ GROUP UPDATE ]\n❯ User ${logMessageData.TARGET_ID} has been removed from admin position`, threadID);
            }
          }

          try {
            const threadInfo = await threadsData.get(threadID);
            let { adminIDs } = threadInfo;
            
            if (logMessageData.ADMIN_EVENT == "add_admin") {
              adminIDs.push(logMessageData.TARGET_ID);
            } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
              adminIDs = adminIDs.filter(uid => uid != logMessageData.TARGET_ID);
            }
            adminIDs = [...new Set(adminIDs)];
            await threadsData.set(threadID, adminIDs, "adminIDs");
          } catch (error) {
            console.log("Error updating adminIDs:", error);
          }
        };
      }

      case "log:user-nickname": {
        return async function () {
          const { participant_id, nickname } = logMessageData;
          if (participant_id && nickname) {
            try {
              const participantName = await usersData.getName(participant_id);
              const formattedNickname = nickname || "removed";
              api.sendMessage(`[ GROUP UPDATE ]\n❯ ${participantName}'s nickname has been updated to: ${formattedNickname}`, threadID);
            } catch (error) {
              console.log("Error getting user name for participant_id:", participant_id, error);
              api.sendMessage(`[ GROUP UPDATE ]\n❯ User ${participant_id}'s nickname has been updated to: ${nickname || "removed"}`, threadID);
            }

            try {
              const threadInfo = await threadsData.get(threadID);
              let { nicknames } = threadInfo;
              nicknames = nicknames || {};
              nicknames[participant_id] = nickname;
              await threadsData.set(threadID, nicknames, "nicknames");
            } catch (error) {
              console.log("Error updating nicknames:", error);
            }
          }
        };
      }

      case "log:thread-icon": {
        return async function () {
          api.sendMessage(`[ GROUP UPDATE ]\n❯ Thread icon has been updated`, threadID);

          try {
            const newIcon = logMessageData.thread_icon || "👍";
            await threadsData.set(threadID, newIcon, "emoji");
          } catch (error) {
            console.log("Error updating emoji:", error);
          }
        };
      }

      case "log:thread-name": {
        return async function () {
          const newName = logMessageData.name;
          api.sendMessage(`[ GROUP UPDATE ]\n❯ Group name has been changed to: ${newName}`, threadID);

          try {
            const threadName = logMessageData.name;
            await threadsData.set(threadID, threadName, "threadName");
          } catch (error) {
            console.log("Error updating threadName:", error);
          }
        };
      }

      case "log:thread-call": {
        return async function () {
          if (logMessageData.event === "group_call_started") {
            if (logMessageData.caller_id) {
              try {
                const name = await usersData.getName(logMessageData.caller_id);
                api.sendMessage(`[ GROUP UPDATE ]\n❯ ${name} started a ${(logMessageData.video) ? 'video ' : ''}call`, threadID);
              } catch (error) {
                console.log("Error getting user name for caller_id:", logMessageData.caller_id, error);
                api.sendMessage(`[ GROUP UPDATE ]\n❯ User ${logMessageData.caller_id} started a ${(logMessageData.video) ? 'video ' : ''}call`, threadID);
              }
            } else {
              api.sendMessage(`[ GROUP UPDATE ]\n❯ A ${(logMessageData.video) ? 'video ' : ''}call has started`, threadID);
            }
          } else if (logMessageData.event === "group_call_ended") {
            const callDuration = logMessageData.call_duration;
            const hours = Math.floor(callDuration / 3600);
            const minutes = Math.floor((callDuration - (hours * 3600)) / 60);
            const seconds = callDuration - (hours * 3600) - (minutes * 60);
            const timeFormat = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`.trim();
            api.sendMessage(`[ GROUP UPDATE ]\n❯ ${(logMessageData.video) ? 'Video' : 'Voice'} call ended (${timeFormat})`, threadID);
          } else if (logMessageData.joining_user) {
            try {
              const name = await usersData.getName(logMessageData.joining_user);
              api.sendMessage(`[ GROUP UPDATE ]\n❯ ${name} joined the ${(logMessageData.group_call_type == '1') ? 'video' : 'voice'} call`, threadID);
            } catch (error) {
              console.log("Error getting user name for joining_user:", logMessageData.joining_user, error);
              api.sendMessage(`[ GROUP UPDATE ]\n❯ User ${logMessageData.joining_user} joined the ${(logMessageData.group_call_type == '1') ? 'video' : 'voice'} call`, threadID);
            }
          }
        };
      }

      case "log:thread-poll": {
        return async function () {
          
          if (logMessageData.event_type === "question_creation" || logMessageData.event_type === "update_vote") {
            api.sendMessage(`[ GROUP UPDATE ]\n❯ A poll has been ${logMessageData.event_type === "question_creation" ? "created" : "updated"}`, threadID);
          }
        };
      }

      case "log:thread-image": {
        return async function () {
          try {
            const userName = await usersData.getName(author);
            api.sendMessage(`[ GROUP UPDATE ]\n❯ ${userName} changed the group photo`, threadID);
          } catch (error) {
            console.log("Error getting user name for author:", author, error);
            api.sendMessage(`[ GROUP UPDATE ]\n❯ Group photo has been updated`, threadID);
          }

          try {
            await threadsData.set(threadID, logMessageData.image.url, "imageSrc");
          } catch (error) {
            console.log("Error updating imageSrc:", error);
          }
        };
      }

      case "log:thread-color": {
        return async function () {
          const newColor = logMessageData.thread_color || "🌤";
          api.sendMessage(`[ GROUP UPDATE ]\n❯ Thread color has been updated`, threadID);

          try {
            await threadsData.set(threadID, newColor, "threadThemeID");
          } catch (error) {
            console.log("Error updating threadThemeID:", error);
          }
        };
      }

      default: {
        return null;
      }
    }
  }
};
