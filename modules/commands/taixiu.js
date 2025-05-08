const users = {};
const games = {};

module.exports.config = {
  name: "taixiu",
  version: "1.1",
  hasPermssion: 0,
  credits: "dat thanh",
  description: "Chơi Tài Xỉu",
  commandCategory: "game",
  usages: "/taixiu create | join tài/xỉu <tiền> | xổ | list",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, senderID, messageID } = event;
  const command = args[0];

  if (command === "create") {
    if (games[threadID]) return api.sendMessage("⚠️ Bàn chơi đã tồn tại.", threadID, messageID);
    games[threadID] = {
      owner: senderID,
      bets: {},
      result: null,
      timeout: setTimeout(() => endGame(api, threadID, Currencies), 60000)
    };
    return api.sendMessage("🎲 Tạo bàn chơi thành công!\nDùng: /taixiu join tài/xỉu <tiền>", threadID, messageID);
  }

  if (command === "join") {
    const choice = args[1];
    const bet = parseInt(args[2]);
    if (!["tài", "xỉu"].includes(choice) || isNaN(bet) || bet < 1)
      return api.sendMessage("⚠️ Dùng: /taixiu join tài/xỉu <tiền>", threadID, messageID);

    if (!games[threadID]) return api.sendMessage("⚠️ Chưa có bàn chơi. Dùng /taixiu create", threadID, messageID);
    if (games[threadID].bets[senderID]) return api.sendMessage("⚠️ Bạn đã đặt rồi.", threadID, messageID);

    const money = (await Currencies.getData(senderID)).money;
    if (money < bet) return api.sendMessage("⚠️ Bạn không đủ tiền.", threadID, messageID);

    games[threadID].bets[senderID] = { choice, bet };
    return api.sendMessage(`✅ Đã đặt ${choice.toUpperCase()} với ${bet}$`, threadID, messageID);
  }

  if (command === "xổ") {
    const game = games[threadID];
    if (!game) return api.sendMessage("⚠️ Chưa có bàn chơi.", threadID, messageID);
    if (game.owner !== senderID) return api.sendMessage("⚠️ Chỉ chủ bàn mới được xổ.", threadID, messageID);
    clearTimeout(game.timeout);
    return endGame(api, threadID, Currencies);
  }

  if (command === "list") {
    const list = games[threadID]?.history?.slice(-10).join("\n") || "Chưa có dữ liệu.";
    return api.sendMessage(`📜 Lịch sử Tài Xỉu:\n${list}`, threadID, messageID);
  }
};

async function endGame(api, threadID, Currencies) {
  const game = games[threadID];
  if (!game) return;

  const dice = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
  const total = dice.reduce((a, b) => a + b, 0);
  const result = total >= 11 ? "tài" : "xỉu";

  let msg = `🎲 Kết quả: [${dice.join(" + ")}] = ${total} → ${result.toUpperCase()}\n`;

  for (const [uid, betData] of Object.entries(game.bets)) {
    const { choice, bet } = betData;
    if (choice === result) {
      await Currencies.increaseMoney(uid, bet);
      msg += `✅ UID ${uid} thắng +${bet}$\n`;
    } else {
      await Currencies.decreaseMoney(uid, bet);
      msg += `❌ UID ${uid} thua -${bet}$\n`;
    }
  }

  if (!game.history) game.history = [];
  game.history.push(`🎲 ${result.toUpperCase()} (${dice.join(",")})`);

  delete games[threadID];
  api.sendMessage(msg, threadID);
}
