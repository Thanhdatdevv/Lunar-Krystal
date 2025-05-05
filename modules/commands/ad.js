const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "dat",
    version: "1.0",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Phản hồi khi nhắc đến tên chủ Nhi",
    commandCategory: "events",
    usages: "",
    cooldowns: 1,
  },

  handleEvent: async function ({ event, message }) {
    const text = event.body?.toLowerCase();
    const senderID = event.senderID;

    if (!text) return;

    const botID = global.data.botID || (global.botID ? global.botID : null);
    if (senderID === botID) return;

    const keywords = ["dat", "đạt", "đạt thành", "thành đạt", "dat thanh", "thanh dat"];
    const matched = keywords.some(k => text.includes(k));

    if (matched) {
      const videoFolder = path.join(__dirname, "dat_videos");
      const videoFiles = fs.readdirSync(videoFolder).filter(file => file.endsWith(".mp4"));
      if (videoFiles.length === 0) return;

      const randomVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];
      const filePath = path.join(videoFolder, randomVideo);

      return message.reply({
        body: "Bạn nhắc gì chủ Nhi ấy\nXin chào đây là chủ của Nhi 🤗💦",
        attachment: fs.createReadStream(filePath)
      });
    }
  },

  run: () => {}
};
