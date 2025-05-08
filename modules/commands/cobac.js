const fs = require("fs");

module.exports.config = {
  name: "bacao",
  version: "1.4",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Trò chơi Ba Cào, Xì Dách, Tài Xỉu",
  commandCategory: "game",
  usages: "/cobac",
  cooldowns: 3
};

let sessions = {}; // Lưu thông tin các bàn chơi
let players = {}; // Lưu thông tin người chơi và số tiền của họ

module.exports.run = async ({ api, event }) => {
  const menu = `
  
╔══════════════════════════╗
║   🌟🌟🌟 **CASINO NHÀ THANH** 🌟🌟🌟   ║
╚══════════════════════════╝

♠️ 𝐁𝐀 𝐂𝐀̀𝐎 🎴, 🃏 𝐗𝐢̀ 𝐃𝐚́𝐜𝐡 🃏 và 🎲 𝐓𝐚̀𝐢 𝐗𝐢̉𝐔 🎲

Hãy chọn một trong các lệnh để chơi:
1️⃣ • Tạo bàn Ba Cào
2️⃣ • Tham gia Ba Cào
3️⃣ • Bắt đầu Ba Cào (start)
4️⃣ • Tạo phòng Xì Dách
5️⃣ • Tham gia Xì Dách
6️⃣ • Bắt đầu Xì Dách (start)
7️⃣ • Tạo bàn Tài Xỉu
8️⃣ • Tham gia Tài Xỉu
9️⃣ • Bắt đầu Tài Xỉu (start)
🔟 • Đặt cược Tài hoặc Xỉu
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
    case "1": // Tạo bàn Ba Cào
      return api.sendMessage(
        `♠️ Bạn đã chọn tạo bàn Ba Cào!\n\nDùng lệnh:\n/bacao join <số tiền> — Tham gia bàn chơi\n/bacao start — Chủ bàn bắt đầu chơi`,
        threadID
      );

    case "2": // Tham gia bàn Ba Cào
      return api.sendMessage(
        `♠️ Bạn đã chọn tham gia bàn Ba Cào!\n\nDùng lệnh:\n/bacao start — Chủ bàn bắt đầu chơi`,
        threadID
      );

    case "3": // Start Ba Cào
      return api.sendMessage(
        `♠️ Ván chơi Ba Cào đã bắt đầu! Các người chơi chuẩn bị!`,
        threadID
      );

    case "4": // Tạo phòng Xì Dách
      return api.sendMessage(
        `🃏 Bạn đã chọn tạo phòng Xì Dách!\n\nDùng lệnh:\n/xidach join — Tham gia bàn chơi\n/xidach start — Chủ bàn bắt đầu ván chơi`,
        threadID
      );

    case "5": // Tham gia Xì Dách
      return api.sendMessage(
        `🃏 Bạn đã chọn tham gia bàn Xì Dách!\n\nDùng lệnh:\n/xidach start — Chủ bàn bắt đầu ván chơi`,
        threadID
      );

    case "6": // Start Xì Dách
      return api.sendMessage(
        `🃏 Ván chơi Xì Dách đã bắt đầu! Các người chơi chuẩn bị!`,
        threadID
      );

    case "7": // Tạo bàn Tài Xỉu
      return api.sendMessage(
        `🎲 Bạn đã chọn tạo bàn Tài Xỉu!\n\nDùng lệnh:\n/taixiu join <số tiền> — Tham gia bàn chơi\n/taixiu start — Chủ bàn bắt đầu chơi`,
        threadID
      );

    case "8": // Tham gia Tài Xỉu
      return api.sendMessage(
        `🎲 Bạn đã chọn tham gia bàn Tài Xỉu!\n\nDùng lệnh:\n/taixiu start — Chủ bàn bắt đầu chơi`,
        threadID
      );

    case "9": // Start Tài Xỉu
      return api.sendMessage(
        `🎲 Ván chơi Tài Xỉu đã bắt đầu! Các người chơi chuẩn bị!`,
        threadID
      );

    case "🔟": // Đặt cược Tài hoặc Xỉu
      return api.sendMessage(
        `🎲 Bạn đã chọn đặt cược Tài hoặc Xỉu! Dùng lệnh:\n/taixiu đặt tài <số tiền>\n/taixiu đặt xỉu <số tiền>`,
        threadID
      );

    default:
      return api.sendMessage("⚠️ Vui lòng chọn số từ 1 đến 9 hoặc 10.", threadID);
  }
};

module.exports.handleCommand = async ({ api, event, args }) => {
  const { threadID, senderID, body } = event;

  // Lưu thông tin người chơi và số tiền vào players
  const addPlayerMoney = (playerID, amount) => {
    if (!players[playerID]) players[playerID] = { money: 0 };
    players[playerID].money += amount;
  };

  // Ba Cào commands
  if (body.startsWith("/bacao create")) {
    return api.sendMessage(`♠️ Đã tạo bàn chơi Ba Cào thành công!`, threadID);
  }

  if (body.startsWith("/bacao join")) {
    const amount = parseInt(args[1]); // Số tiền tham gia
    if (!amount) {
      return api.sendMessage(`⚠️ Vui lòng nhập số tiền để tham gia bàn.`, threadID);
    }
    addPlayerMoney(senderID, amount);
    return api.sendMessage(`♠️ Bạn đã tham gia bàn Ba Cào với số tiền ${amount}!`, threadID);
  }

  if (body.startsWith("/bacao start")) {
    const winnerID = Object.keys(players)[Math.floor(Math.random() * Object.keys(players).length)];
    const winnerMoney = players[winnerID].money;
    return api.sendMessage(
      `♠️ Ván chơi Ba Cào đã kết thúc! Người thắng cuộc là ID ${winnerID} với số tiền ${winnerMoney}.`,
      threadID
    );
  }

  if (body.startsWith("/bacao xào")) {
    return api.sendMessage(`♠️ Bài đã được xào!`, threadID);
  }

  if (body.startsWith("/bacao chia")) {
    return api.sendMessage(`♠️ Bài đã được chia cho các người chơi!`, threadID);
  }

  if (body.startsWith("/bacao end")) {
    return api.sendMessage(`♠️ Ván chơi Ba Cào đã kết thúc!`, threadID);
  }

  // Xì Dách commands
  if (body.startsWith("/xidach create")) {
    return api.sendMessage(`🃏 Đã tạo phòng Xì Dách thành công!`, threadID);
  }

  if (body.startsWith("/xidach join")) {
    const amount = parseInt(args[1]); // Số tiền tham gia
    if (!amount) {
      return api.sendMessage(`⚠️ Vui lòng nhập số tiền để tham gia bàn.`, threadID);
    }
    addPlayerMoney(senderID, amount);
    return api.sendMessage(`🃏 Bạn đã tham gia phòng Xì Dách với số tiền ${amount}!`, threadID);
  }

  if (body.startsWith("/xidach start")) {
    const winnerID = Object.keys(players)[Math.floor(Math.random() * Object.keys(players).length)];
    const winnerMoney = players[winnerID].money;
    return api.sendMessage(
      `🃏 Ván chơi Xì Dách đã kết thúc! Người thắng cuộc là ID ${winnerID} với số tiền ${winnerMoney}.`,
      threadID
    );
  }

  if (body.startsWith("/xidach rút")) {
    return api.sendMessage(`🃏 Bạn đã rút bài Xì Dách!`, threadID);
  }

  if (body.startsWith("/xidach dằn")) {
    return api.sendMessage(`🃏 Bạn đã dằn bài Xì Dách!`, threadID);
  }

  if (body.startsWith("/xidach end")) {
    return api.sendMessage(`🃏 Chủ bàn đã xổ bài!`, threadID);
  }

  // Tài Xỉu commands
  if (body.startsWith("/taixiu create")) {
    return api.sendMessage(`🎲 Đã tạo bàn chơi Tài Xỉu thành công!`, threadID);
  }

  if (body.startsWith("/taixiu join")) {
    const amount = parseInt(args[1]); // Số tiền tham gia
    if (!amount) {
      return api.sendMessage(`⚠️ Vui lòng nhập số tiền để tham gia bàn.`, threadID);
    }
    addPlayerMoney(senderID, amount);
    return api.sendMessage(`🎲 Bạn đã tham gia bàn Tài Xỉu với số tiền ${amount}!`, threadID);
  }

  if (body.startsWith("/taixiu start")) {
    const winnerID = Object.keys(players)[Math.floor(Math.random() * Object.keys(players).length)];
    const winnerMoney = players[winnerID].money;
    return api.sendMessage(
      `🎲 Ván chơi Tài Xỉu đã kết thúc! Người thắng cuộc là ID ${winnerID} với số tiền ${winnerMoney}.`,
      threadID
    );
  }

  if (body.startsWith("/taixiu đặt tài")) {
    const bet = parseInt(args[2]); // Số tiền đặt cược
    if (!bet) {
      return api.sendMessage(`⚠️ Vui lòng nhập số tiền để đặt cược.`, threadID);
    }
    addPlayerMoney(senderID, bet);
    return api.sendMessage(`🎲 Bạn đã đặt cược Tài ${bet} cho ván Tài Xỉu!`, threadID);
  }

  if (body.startsWith("/taixiu đặt xỉu")) {
    const bet = parseInt(args[2]); // Số tiền đặt cược
    if (!bet) {
      return api.sendMessage(`⚠️ Vui lòng nhập số tiền để đặt cược.`, threadID);
    }
    addPlayerMoney(senderID, bet);
    return api.sendMessage(`🎲 Bạn đã đặt cược Xỉu ${bet} cho ván Tài Xỉu!`, threadID);
  }

  if (body.startsWith("/taixiu xổ")) {
    return api.sendMessage(`🎲 Chủ bàn đã xổ kết quả Tài Xỉu!`, threadID);
  }
};
