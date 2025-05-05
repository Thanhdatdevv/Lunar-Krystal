const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "ad",
    version: "1.0",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Phản hồi khi ai đó nhắc đến tên chủ của Nhi",
    commandCategory: "events",
    usages: "Tự động",
    cooldowns: 1,
  },

  handleEvent: async function ({ event, message }) {
    const text = event.body?.toLowerCase();
    if (!text) return;

    const keywords = ["đạt", "dat", "dat thanh", "thanh dat", "đạt thành", "thành đạt"];
    const matched = keywords.some(keyword => text.includes(keyword));

    // Bỏ qua nếu người gửi là chính bot
    if (event.senderID == global.botID) return;

    if (matched) {
      const videoPath = path.join(__dirname, "7OQBaMo.mp4"); // đổi tên file nếu cần
      if (!fs.existsSync(videoPath)) return message.reply("Không tìm thấy video chủ của Nhi rồi!");

      return message.reply({
        body: "Bạn nhắc gì chủ Nhi ấy?\nXin chào đây là chủ của Nhi 🤗💦",
        attachment: fs.createReadStream(videoPath)
      });
    }
  },

  run: () => {}
};
