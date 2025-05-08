const fs = require("fs");
const path = __dirname + "/cache/taixiu.json";

let gameData = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
let countdowns = {};

function save() {
  fs.writeFileSync(path, JSON.stringify(gameData, null, 2));
}

module.exports.config = {
  name: "taixiu",
  version: "1.2",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Chơi tài xỉu theo lệnh join",
  commandCategory: "game",
  usages: "[create | join tài/xỉu <tiền> | xổ | list]",
  cooldowns: 3,
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, senderID } = event;
  const [subcmd, ...rest] = args;

  if (subcmd === "create") {
    if (gameData[threadID]?.inGame)
      return api.sendMessage("Đã có bàn đang hoạt động trong nhóm này.", threadID);

    const name = await Users.getNameUser(senderID);
    gameData[threadID] = {
      host: senderID,
      players: {
        [senderID]: { name }
      },
      inGame: true,
      history: gameData[threadID]?.history || []
    };
    save();
    return api.sendMessage(`${name} đã tạo bàn tài xỉu. Dùng /taixiu join tài|xỉu <tiền> để vào cược.`, threadID);
  }

  if (subcmd === "join") {
    if (!gameData[threadID]?.inGame)
      return api.sendMessage("Chưa có bàn nào đang mở!", threadID);

    const choice = rest[0]?.toLowerCase();
    const moneyArg = rest[1];
    if (!["tài", "xỉu"].includes(choice))
      return api.sendMessage("Vui lòng chọn 'tài' hoặc 'xỉu' sau join.", threadID);

    const bet = parseInt(moneyArg);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("Số tiền không hợp lệ!", threadID);

    const userMoney = await Users.getMoney(senderID);
    if (bet > userMoney) return api.sendMessage("Bạn không đủ tiền để cược!", threadID);

    const name = await Users.getNameUser(senderID);
    await Users.decreaseMoney(senderID, bet);

    gameData[threadID].players[senderID] = {
      name,
      bet: { choice, amount: bet }
    };
    save();

    api.sendMessage(`${name} đã cược ${bet}$ vào ${choice.toUpperCase()}.`, threadID);

    const numBets = Object.values(gameData[threadID].players).filter(p => p.bet).length;
    if (numBets >= 2 && !countdowns[threadID]) {
      countdowns[threadID] = setTimeout(() => autoXo(threadID, api, Users), 60000);
      api.sendMessage("Đã có >=2 người cược. Tự động xổ sau 60 giây...", threadID);
    }
    return;
  }

  if (subcmd === "xổ") {
    if (!gameData[threadID]?.inGame)
      return api.sendMessage("Không có bàn nào đang mở!", threadID);
    if (gameData[threadID].host !== senderID)
      return api.sendMessage("Chỉ chủ bàn mới có thể xổ!", threadID);

    if (countdowns[threadID]) {
      clearTimeout(countdowns[threadID]);
      delete countdowns[threadID];
    }
    return autoXo(threadID, api, Users);
  }

  if (subcmd === "list") {
    const history = gameData[threadID]?.history || [];
    if (!history.length)
      return api.sendMessage("Chưa có lịch sử chơi nào.", threadID);

    const text = history.slice(-10).reverse().map((h, i) =>
      `${i + 1}. ${h.dice.join(', ')} = ${h.result.toUpperCase()}`
    ).join('\n');

    return api.sendMessage("Lịch sử 10 ván gần nhất:\n" + text, threadID);
  }

  return api.sendMessage("Sai cú pháp. Dùng: /taixiu create | join tài/xỉu <tiền> | xổ | list", threadID);
};

async function autoXo(threadID, api, Users) {
  const data = gameData[threadID];
  if (!data?.inGame) return;

  const dice = [1, 2, 3].map(() => Math.floor(Math.random() * 6) + 1);
  const total = dice.reduce((a, b) => a + b);
  const result = total >= 11 ? "tài" : "xỉu";
  let msg = `🎲 Kết quả: ${dice.join(", ")} = ${total} => ${result.toUpperCase()}\n\n`;

  for (const [uid, player] of Object.entries(data.players)) {
    const bet = player.bet;
    if (!bet) continue;

    if (bet.choice === result) {
      await Users.increaseMoney(uid, bet.amount * 2);
      msg += `✅ ${player.name} thắng +${bet.amount}$\n`;
    } else {
      msg += `❌ ${player.name} thua -${bet.amount}$\n`;
    }
  }

  data.history.push({ dice, result });
  data.players = {};
  data.inGame = false;
  save();

  if (countdowns[threadID]) {
    clearTimeout(countdowns[threadID]);
    delete countdowns[threadID];
  }

  return api.sendMessage(msg, threadID);
}
