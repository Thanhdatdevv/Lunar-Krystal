const fs = require("fs");
const path = __dirname + "/cache/bacao.json";
let gameData = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
let autoDeal = {};

function save() {
  fs.writeFileSync(path, JSON.stringify(gameData, null, 2));
}

function getCard() {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];
  const deck = [];
  for (const r of ranks) for (const s of suits) deck.push(`${r}${s}`);
  return deck.sort(() => Math.random() - 0.5);
}

function calcPoint(cards) {
  const rankValue = r => {
    if (r === 'A') return 1;
    if (['J', 'Q', 'K'].includes(r)) return 0;
    return parseInt(r);
  };
  const total = cards.reduce((sum, c) => sum + rankValue(c.slice(0, -1)), 0);
  return total % 10;
}

module.exports.config = {
  name: "bacao",
  version: "1.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Chơi bài 3 cào ăn tiền",
  commandCategory: "game",
  usages: "[create | join <tiền> | chia | list]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, senderID } = event;
  const [cmd, ...rest] = args;

  if (cmd === "create") {
    if (gameData[threadID]?.inGame)
      return api.sendMessage("Đã có bàn đang hoạt động.", threadID);
    const name = await Users.getNameUser(senderID);
    gameData[threadID] = {
      host: senderID,
      players: { [senderID]: { name } },
      inGame: true,
      history: gameData[threadID]?.history || []
    };
    save();
    return api.sendMessage(`${name} đã tạo bàn 3 cào. Dùng /bacao join <tiền> để tham gia.`, threadID);
  }

  if (cmd === "join") {
    if (!gameData[threadID]?.inGame)
      return api.sendMessage("Chưa có bàn nào đang mở!", threadID);

    const bet = parseInt(rest[0]);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("Số tiền không hợp lệ.", threadID);
    const userMoney = await Users.getMoney(senderID);
    if (bet > userMoney) return api.sendMessage("Bạn không đủ tiền!", threadID);

    const name = await Users.getNameUser(senderID);
    await Users.decreaseMoney(senderID, bet);
    gameData[threadID].players[senderID] = { name, bet };
    save();

    api.sendMessage(`${name} đã vào bàn với cược ${bet}$`, threadID);

    if (Object.keys(gameData[threadID].players).length >= 2 && !autoDeal[threadID]) {
      autoDeal[threadID] = setTimeout(() => chiaBai(threadID, api, Users), 30000);
      api.sendMessage("Tự động chia bài sau 30 giây...", threadID);
    }
    return;
  }

  if (cmd === "chia") {
    if (!gameData[threadID]?.inGame) return api.sendMessage("Không có bàn nào!", threadID);
    if (gameData[threadID].host !== senderID)
      return api.sendMessage("Chỉ chủ bàn mới được chia!", threadID);

    if (autoDeal[threadID]) clearTimeout(autoDeal[threadID]);
    return chiaBai(threadID, api, Users);
  }

  if (cmd === "list") {
    const history = gameData[threadID]?.history || [];
    if (!history.length) return api.sendMessage("Chưa có ván nào.", threadID);
    const text = history.slice(-5).reverse().map((v, i) => `${i + 1}. ${v}`).join("\n");
    return api.sendMessage("Lịch sử ván gần đây:\n" + text, threadID);
  }

  return api.sendMessage("Sai cú pháp. Dùng: /bacao create | join <tiền> | chia | list", threadID);
};

async function chiaBai(threadID, api, Users) {
  const data = gameData[threadID];
  if (!data?.inGame) return;
  const deck = getCard();
  const results = [];

  let msg = "🎴 Kết quả 3 Cào:\n";
  const playerCards = {};

  for (const uid of Object.keys(data.players)) {
    const cards = [deck.pop(), deck.pop(), deck.pop()];
    const point = calcPoint(cards);
    playerCards[uid] = { cards, point };
    msg += `\n${data.players[uid].name}: ${cards.join(", ")} = ${point} điểm`;
  }

  const maxPoint = Math.max(...Object.values(playerCards).map(p => p.point));
  const winners = Object.entries(playerCards).filter(([_, p]) => p.point === maxPoint).map(([uid]) => uid);

  msg += `\n\n🏆 Người thắng: ${winners.map(id => data.players[id].name).join(", ")}`;

  for (const [uid, info] of Object.entries(data.players)) {
    if (winners.includes(uid)) {
      const winAmount = info.bet * (Object.keys(data.players).length - winners.length);
      await Users.increaseMoney(uid, info.bet + winAmount);
    }
  }

  data.history.push(msg);
  data.players = {};
  data.inGame = false;
  save();
  if (autoDeal[threadID]) {
    clearTimeout(autoDeal[threadID]);
    delete autoDeal[threadID];
  }

  return api.sendMessage(msg, threadID);
}
