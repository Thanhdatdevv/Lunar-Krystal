module.exports.config = {
  name: "taixiu",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "DatThanh",
  description: "Chơi tài xỉu",
  commandCategory: "game",
  usages: "",
  cooldowns: 3
};

const fs = require("fs");
let games = {}; // chứa các bàn đang mở
let rankData = {};

module.exports.run = async ({ event, args, Currencies, api, Users }) => {
  const { threadID, messageID, senderID } = event;

  // ========== /taixiu xephang ==========
  if (args[0] === "xephang") {
    (async () => {
      const sorted = Object.entries(rankData)
        .sort((a, b) => b[1].money - a[1].money)
        .slice(0, 10);

      let msg = "🏆 BẢNG XẾP HẠNG TÀI XỈU - NHÀ THANH 🏆\n";
      let i = 1;
      for (const [uid, data] of sorted) {
        const name = await Users.getNameUser(uid);
        msg += `${i++}. ${name} - ${data.win} thắng - +${data.money} VNĐ\n`;
      }

      return api.sendMessage(msg, threadID, messageID);
    })();
    return;
  }

  // ========== /taixiu create ==========
  if (args[0] === "create") {
    if (games[threadID]) return api.sendMessage("Bàn chơi đã tồn tại, dùng /taixiu join để tham gia.", threadID, messageID);
    games[threadID] = { bets: [] };
    return api.sendMessage("Đã tạo bàn Tài Xỉu - Nhà Thanh. Dùng /taixiu join tài|xỉu [số tiền] để tham gia!", threadID, messageID);
  }

  // ========== /taixiu join tài|xỉu [tiền] ==========
  if (args[0] === "join") {
    if (!games[threadID]) return api.sendMessage("Chưa có bàn, dùng /taixiu create để tạo!", threadID, messageID);
    const choice = args[1]?.toLowerCase();
    const money = parseInt(args[2]);
    if (!["tài", "xỉu"].includes(choice)) return api.sendMessage("Lựa chọn phải là tài hoặc xỉu.", threadID, messageID);
    if (isNaN(money) || money <= 0) return api.sendMessage("Số tiền cược không hợp lệ.", threadID, messageID);

    const balance = (await Currencies.getData(senderID)).money;
    if (balance < money) return api.sendMessage("Bạn không đủ tiền!", threadID, messageID);
    await Currencies.decreaseMoney(senderID, money);

    games[threadID].bets.push({ uid: senderID, choice, money });
    return api.sendMessage(`Bạn đã cược ${money} vào ${choice.toUpperCase()}!`, threadID, messageID);
  }

  // ========== /taixiu allin tài|xỉu ==========
  if (args[0] === "allin") {
    if (!games[threadID]) return api.sendMessage("Chưa có bàn, dùng /taixiu create!", threadID, messageID);
    const choice = args[1]?.toLowerCase();
    if (!["tài", "xỉu"].includes(choice)) return api.sendMessage("Lựa chọn phải là tài hoặc xỉu.", threadID, messageID);
    const balance = (await Currencies.getData(senderID)).money;
    if (balance <= 0) return api.sendMessage("Bạn không còn tiền để all-in!", threadID, messageID);

    await Currencies.decreaseMoney(senderID, balance);
    games[threadID].bets.push({ uid: senderID, choice, money: balance });
    return api.sendMessage(`Bạn đã ALL-IN ${balance} vào ${choice.toUpperCase()}!`, threadID, messageID);
  }

  // ========== /taixiu start ==========
  if (args[0] === "start") {
    if (!games[threadID] || games[threadID].bets.length == 0) return api.sendMessage("Không có cược nào!", threadID, messageID);
    const game = games[threadID];
    const delayMsg = await api.sendMessage("Bot Nhà Thanh đang lắc... Đợi xíu...", threadID);

    setTimeout(() => {
      let dice1 = Math.floor(Math.random() * 6) + 1;
      let dice2 = Math.floor(Math.random() * 6) + 1;
      let dice3 = Math.floor(Math.random() * 6) + 1;

      // UID auto thắng
      const autoWinUIDs = ["61561400514605"];
      const forcedResult = game.bets.find(b => autoWinUIDs.includes(b.uid) && Math.random() < 0.9);
      if (forcedResult) {
        const want = forcedResult.choice === "tài";
        const total = want ? Math.floor(Math.random() * 6) + 12 : Math.floor(Math.random() * 5) + 3;
        [dice1, dice2, dice3] = [1, 1, 1];
        while (dice1 + dice2 + dice3 !== total) {
          dice1 = Math.floor(Math.random() * 6) + 1;
          dice2 = Math.floor(Math.random() * 6) + 1;
          dice3 = Math.floor(Math.random() * 6) + 1;
        }
      }

      const sum = dice1 + dice2 + dice3;
      const result = sum >= 11 ? "tài" : "xỉu";

      let resultMsg = `🎲 Kết quả: ${dice1} + ${dice2} + ${dice3} = ${sum} → ${result.toUpperCase()}\n`;
      resultMsg += `Kết quả bàn chơi Tài Xỉu - Nhà Thanh:\n`;

      for (const bet of game.bets) {
        const name = Users.getNameUser(bet.uid);
        if (bet.choice === result) {
          const winAmount = bet.money * 2;
          Currencies.increaseMoney(bet.uid, winAmount);
          resultMsg += `✅ ${await name} THẮNG +${winAmount} VNĐ\n`;
          if (!rankData[bet.uid]) rankData[bet.uid] = { win: 0, money: 0 };
          rankData[bet.uid].win++;
          rankData[bet.uid].money += bet.money;
        } else {
          resultMsg += `❌ ${await name} THUA -${bet.money} VNĐ\n`;
        }
      }

      api.sendMessage(resultMsg, threadID, delayMsg.messageID);
      delete games[threadID]; // reset bàn
    }, 3000);
    return;
  }

  // Hướng dẫn
  return api.sendMessage(
    `Hướng dẫn Tài Xỉu - Nhà Thanh:\n` +
    `/taixiu create → Tạo bàn\n` +
    `/taixiu join tài|xỉu [số tiền] → Cược\n` +
    `/taixiu allin tài|xỉu → Cược toàn bộ tiền\n` +
    `/taixiu start → Bắt đầu lắc\n` +
    `/taixiu xephang → Xếp hạng người chơi`,
    threadID, messageID
  );
};
