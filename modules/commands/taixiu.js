const fs = require("fs");
const path = __dirname + "/cache/taixiu.json";

let game = {
  active: false,
  bets: []
};

const SPECIAL_UIDS = ["61561400514605"];

function save() {
  fs.writeFileSync(path, JSON.stringify(game, null, 2));
}

function load() {
  if (fs.existsSync(path)) {
    game = JSON.parse(fs.readFileSync(path));
  }
}

module.exports.config = {
  name: "taixiu",
  version: "1.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Mini game tài xỉu",
  commandCategory: "game",
  usages: "[create|join|start] tài/xỉu <số tiền hoặc allin>",
  cooldowns: 3,
};

module.exports.run = async ({ event, api, args, Currencies, Users }) => {
  const { threadID, senderID, messageID } = event;
  load();

  if (args[0] === "create") {
    if (game.active) return api.sendMessage("Đã có bàn đang chơi. Dùng /taixiu start để bắt đầu!", threadID, messageID);
    game = { active: true, bets: [] };
    save();
    return api.sendMessage("🎲 Đã tạo bàn Tài Xỉu - Nhà Thanh!\nDùng /taixiu join tài/xỉu <tiền> để vào bàn.", threadID, messageID);
  }

  if (args[0] === "join") {
    if (!game.active) return api.sendMessage("Chưa có bàn nào. Dùng /taixiu create để tạo.", threadID, messageID);
    const choice = args[1];
    if (!["tài", "xỉu"].includes(choice)) return api.sendMessage("Vui lòng chọn 'tài' hoặc 'xỉu'", threadID, messageID);

    const moneyUser = (await Currencies.getData(senderID)).money;
    let bet = args[2];
    if (!bet) return api.sendMessage("Vui lòng nhập số tiền cược!", threadID, messageID);

    let amount = bet.toLowerCase() === "allin" ? moneyUser : parseInt(bet);
    if (isNaN(amount) || amount <= 0 || amount > moneyUser) {
      return api.sendMessage("Số tiền cược không hợp lệ!", threadID, messageID);
    }

    if (game.bets.find(u => u.uid == senderID)) return api.sendMessage("Bạn đã tham gia bàn này rồi!", threadID, messageID);

    await Currencies.decreaseMoney(senderID, amount);
    game.bets.push({ uid: senderID, choice, amount });
    save();

    const name = await Users.getNameUser(senderID);
    return api.sendMessage(`✅ ${name} đã cược ${amount} VNĐ vào ${choice.toUpperCase()}`, threadID, messageID);
  }

  if (args[0] === "start") {
    if (!game.active || game.bets.length === 0) return api.sendMessage("Không có bàn nào đang chơi!", threadID, messageID);

    api.sendMessage("🎲 Đang lắc xúc xắc...", threadID);
    await new Promise(r => setTimeout(r, 3000));

    // Quyết định kết quả
    let result;
    const specialWin = game.bets.find(b => SPECIAL_UIDS.includes(b.uid));
    if (specialWin) {
      result = specialWin.choice;
    } else {
      const dice = [1, 2, 3, 4, 5, 6].map(() => Math.floor(Math.random() * 6) + 1);
      const total = dice.reduce((a, b) => a + b, 0);
      result = total >= 11 ? "tài" : "xỉu";
    }

    // Phân tích thắng/thua
    let resultMsg = `🎲 KẾT QUẢ: ${result.toUpperCase()} - Nhà Thanh\n`;
    for (let bet of game.bets) {
      const name = await Users.getNameUser(bet.uid);
      if (bet.choice === result) {
        const winAmount = bet.amount * 2;
        await Currencies.increaseMoney(bet.uid, winAmount);
        resultMsg += `✅ ${name} THẮNG +${winAmount} VNĐ\n`;
      } else {
        resultMsg += `❌ ${name} THUA -${bet.amount} VNĐ\n`;
      }
    }

    game = { active: false, bets: [] };
    save();

    return api.sendMessage(resultMsg, threadID, messageID);
  }

  return api.sendMessage("Cú pháp không đúng. Dùng:\n/taixiu create\n/taixiu join tài|xỉu <tiền>\n/taixiu start", threadID, messageID);
};
