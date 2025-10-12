module.exports = {
  config: {
    name: "del",
    aliases: ["del"],
    author: "Joy",
    role: 2,
    category: "system",
    description: "Deletes a specified command file from the bot folder"
  },

  onStart: async function ({ api, event, args }) {
    const fs = require('fs');
    const path = require('path');

    const fileName = args[0];

    if (!fileName) {
      return api.sendMessage("❌ Please provide a file name to delete.", event.threadID);
    }

    // Ensure file ends with .js if user didn't type it
    const fullFileName = fileName.endsWith('.js') ? fileName : `${fileName}.js`;
    const filePath = path.join(__dirname, fullFileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return api.sendMessage(`❌ File not found: ${fullFileName}`, event.threadID);
      }

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return api.sendMessage(`❌ Failed to delete file: ${fullFileName}`, event.threadID);
        }

        api.sendMessage(`✅ The command file has been deleted successfully: ${fullFileName}`, event.threadID);
      });
    });
  }
};
