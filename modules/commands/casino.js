const fs = require("fs");

module.exports.config = {
  name: "casino",
  version: "1.1",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Trung tâm trò chơi casino: Tài Xỉu, Ba Cào, Xì Dách",
  commandCategory: "game",
  usages: "/casinonhathanh",
  cooldowns: 3
};

let sessions = {};

module.exports.run = async ({ api, event }) => {
  const menu = `
🎰 𝐂𝐀𝐒𝐈𝐍𝐎 𝐍𝐇À 𝐓𝐇𝐀𝐍𝐇 🎰

Hãy chọn một trò chơi bằng cách reply số tương ứng:

1️⃣ • Tài Xỉu 🎲
2️⃣ • Ba Cào ♠️♥️
3️⃣ • Xì Dách 🃏

⏳ Vui lòng reply số để chọn game.
  `.trim();

  return api.sendMessage(menu, event.threadID, (err, info) => {
    sessions[info.messageID] = {
      type: "menu",
      author: event.senderID
    };
  });
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, senderID, body } = event;
  const choice = body.trim();

  const session = sessions[handleReply.messageID];
  if (!session || session.author !== senderID) return;

  switch (choice) {
    case "1":
      return api.sendMessage(
        `🎲 𝐁𝐚̣𝐧 𝐝𝐚̃ 𝐜𝐡𝐨̣𝐧 𝐓𝐚̀𝐢 𝐗𝐢̉𝐮!\n\nDùng lệnh:\n/taixiu create — Tạo bàn chơi\n/taixiu join tài|xỉu <số tiền> — Đặt cược\n/taixiu xổ — Chủ bàn xổ\n/taixiu list — Xem lịch sử`,
        threadID
      );

    case "2":
      return api.sendMessage(
        `♠️ 𝐁𝐚̣𝐧 𝐝𝐚̃ 𝐜𝐡𝐨̣𝐧 𝐁𝐚 𝐂𝐚̀𝐨!\n\nDùng lệnh:\n/bacao create — Tạo bàn\n/bacao join <số tiền> — Tham gia\n/bacao bắtđầu — Chủ bàn bắt đầu chơi`,
        threadID
      );

    case "3":
      return api.sendMessage(
        `🃏 𝐁𝐚̣𝐧 𝐝𝐚̃ 𝐜𝐡𝐨̣𝐧 𝐗𝐢̀ 𝐃𝐚́𝐜𝐡!\n\nDùng lệnh:\n/xidach create — Tạo phòng chơi\n/xidach join — Vào bàn\n/xidach rút — Rút bài\n/xidach dằn — Dằn bài\n/xidach xổ — Chủ bàn xổ`,
        threadID
      );

    default:
      return api.sendMessage("⚠️ Vui lòng chọn số từ 1 đến 3.", threadID);
  }
};
