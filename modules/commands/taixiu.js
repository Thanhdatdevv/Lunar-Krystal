const fs = require("fs");
const path = __dirname + "/cache/taixiu.json";

let gameData = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
let countdowns = {}; // lưu timeout để tự xổ

function save() {
  fs.writeFileSync(path, JSON.stringify(gameData, null, 2));
}

module.exports.config = {
  name: "taixiu",
  version: "1.1",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Chơi tài xỉu nhiều người",
  commandCategory: "game",
  usages: "[create | join | list]",
  cooldowns: 3,
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, senderID } = event;
  const command = args[0];

  if (command === "create") {
    if (gameData[threadID]?.inGame)
      return api.sendMessage("Hiện tại đã có bàn đang chơi trong nhóm này.", threadID);

    const name = (await Users.getNameUser(senderID)) || "Người chơi";
    gameData[threadID] = {
      host: senderID,
      players: {
        [senderID]: { name }
      },
      inGame: true,
      history: gameData[threadID]?.history || []
    };
    save();
    return api.sendMessage(`${name} đã tạo bàn tài xỉu. Dùng /taixiu join để tham gia!`, threadID);
  }

  if (command === "join") {
    if (!gameData[threadID]?.inGame)
      return api.sendMessage("Chưa có bàn nào đang hoạt động, hãy dùng /taixiu create để tạo!", threadID);
    if (gameData[threadID].players[senderID])
      return api.sendMessage("Bạn đã tham gia bàn rồi!", threadID);

    const name = (await Users.getNameUser(senderID)) || "Người chơi";
    gameData[threadID].players[senderID] = { name };
    save();
    return api.sendMessage(`${name} đã tham gia bàn!`, threadID);
  }

  if (command === "list") {
    if (!gameData[threadID]?.history?.length)
      return api.sendMessage("Chưa có lịch sử chơi nào trong nhóm này.", threadID);

    const history = gameData[threadID].history.slice(-10).reverse().map((h, i) =>
      `${i + 1}. ${h.dice.join(', ')} = ${h.result.toUpperCase()}`
    ).join('\n');

    return api.sendMessage("Lịch sử 10 ván gần nhất:\n" + history, threadID);
  }

  return api.sendMessage("Dùng /taixiu create, join hoặc list", threadID);
};

module.exports.handleEvent = async ({ event, api, Users }) => {
  const { threadID, senderID, body } = event;
  if (!body || !gameData[threadID]?.inGame) return;

  const text = body.toLowerCase().trim();
  const args = text.split(/\s+/);
  const cmd = args[0];
  const moneyArg = args[1];
  const player = gameData[threadID].players[senderID];

  if (!["tài", "xỉu", "xổ"].includes(cmd)) return;

  if (cmd === "xổ") {
    if (gameData[threadID].host !== senderID)
      return api.sendMessage("Chỉ chủ bàn mới có thể xổ!", threadID);

    if (countdowns[threadID]) {
      clearTimeout(countdowns[threadID]);
      delete countdowns[threadID];
    }
    return autoXo(threadID, api, Users);
  }

  if (!player) return;

  let bet = moneyArg === "allin" ? await Users.getMoney(senderID) : parseInt(moneyArg);
  if (isNaN(bet) || bet <= 0) return api.sendMessage("Vui lòng nhập số tiền hợp lệ!", threadID);

  const userMoney = await Users.getMoney(senderID);
  if (bet > userMoney) return api.sendMessage("Bạn không đủ tiền để cược!", threadID);

  await Users.decreaseMoney(senderID, bet);
  gameData[threadID].players[senderID].bet = { choice: cmd, amount: bet };
  save();
  api.sendMessage(`Đã cược ${bet}$ vào ${cmd.toUpperCase()}.`, threadID);

  const numBets = Object.values(gameData[threadID].players).filter(p => p.bet).length;
  if (numBets >= 2 && !countdowns[threadID]) {
    countdowns[threadID] = setTimeout(() => autoXo(threadID, api, Users), 60000);
    api.sendMessage("Đã có đủ người cược! Bàn sẽ tự động xổ trong 60 giây...", threadID);
  }
};

async function autoXo(threadID, api, Users) {
  if (!gameData[threadID]?.inGame) return;

  const dice = [1, 2, 3].map(() => Math.floor(Math.random() * 6) + 1);
  const total = dice.reduce((a, b) => a + b);
  const result = total >= 11 ? "tài" : "xỉu";
  let msg = `🎲 Kết quả: ${dice.join(", ")} = ${total} => ${result.toUpperCase()}\n\n`;

  for (const [uid, player] of Object.entries(gameData[threadID].players)) {
    const bet = player.bet;
    if (!bet) continue;

    if (bet.choice === result) {
      await Users.increaseMoney(uid, bet.amount * 2);
      msg += `✅ ${player.name} thắng +${bet.amount}$\n`;
    } else {
      msg += `❌ ${player.name} thua -${bet.amount}$\n`;
    }
  }

  gameData[threadID].history.push({ dice, result });
  gameData[threadID].players = {};
  gameData[threadID].inGame = false;
  save();

  if (countdowns[threadID]) {
    clearTimeout(countdowns[threadID]);
    delete countdowns[threadID];
  }

  return api.sendMessage(msg, threadID);
}
