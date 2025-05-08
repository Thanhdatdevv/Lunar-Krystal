const games = {};

module.exports.config = {
  name: "taixiu",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "dat thanh",
  description: "Chơi tài xỉu ăn tiền",
  commandCategory: "game",
  usages: "/taixiu create | join tài|xỉu <số tiền> | xổ",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, senderID, messageID } = event;
  const input = args[0];

  // Tạo bàn
  if (input === "create") {
    if (games[threadID])
      return api.sendMessage("⚠️ Đã có bàn đang diễn ra. Gõ /taixiu xổ để kết thúc trước.", threadID, messageID);

    games[threadID] = {
      author: senderID,
      bets: []
    };

    return api.sendMessage("🎲 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 🎲\n\n✅ Bàn Tài Xỉu đã được tạo!\n→ Gõ: /taixiu join tài|xỉu <số tiền>", threadID);
  }

  // Tham gia cược
  if (input === "join") {
    const betSide = args[1]?.toLowerCase();
    const betAmount = parseInt(args[2]);
    if (!games[threadID])
      return api.sendMessage("❌ Chưa có bàn nào, gõ: /taixiu create", threadID, messageID);
    if (!["tài", "xỉu"].includes(betSide))
      return api.sendMessage("⚠️ Chọn tài hoặc xỉu nhé.", threadID, messageID);
    if (isNaN(betAmount) || betAmount <= 0)
      return api.sendMessage("⚠️ Số tiền không hợp lệ.", threadID, messageID);

    const userMoney = (await Currencies.getData(senderID)).money || 0;
    if (userMoney < betAmount)
      return api.sendMessage("❌ Bạn không đủ tiền cược.", threadID, messageID);

    const existingBet = games[threadID].bets.find(b => b.id == senderID);
    if (existingBet)
      return api.sendMessage("⚠️ Bạn đã cược rồi!", threadID, messageID);

    await Currencies.decreaseMoney(senderID, betAmount);
    games[threadID].bets.push({ id: senderID, side: betSide, money: betAmount });

    return api.sendMessage(`✅ Đã cược ${betAmount}$ vào ${betSide.toUpperCase()}.`, threadID);
  }

  // Xổ tài xỉu
  if (input === "xổ") {
    const game = games[threadID];
    if (!game)
      return api.sendMessage("❌ Chưa có bàn nào đang diễn ra.", threadID, messageID);
    if (senderID != game.author)
      return api.sendMessage("⚠️ Chỉ chủ bàn mới được xổ.", threadID, messageID);
    if (game.bets.length == 0)
      return api.sendMessage("⚠️ Chưa có ai cược.", threadID, messageID);

    const dice = [rand(), rand(), rand()];
    const total = dice[0] + dice[1] + dice[2];
    const result = total >= 11 && total <= 17 ? "tài" : "xỉu";

    let msg = `🎲 𝗧𝗔̀𝗜 𝗫𝗜̉𝗨 - 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 🎲\n`;
    msg += `🎲 Kết quả: ${dice.join(" + ")} = ${total} → ${result.toUpperCase()}\n\n`;

    let winners = 0, losers = 0, totalWin = 0;

    for (const bet of game.bets) {
      if (bet.side == result) {
        await Currencies.increaseMoney(bet.id, bet.money * 2);
        winners++;
        totalWin += bet.money;
      } else {
        losers++;
      }
    }

    msg += `✅ Người thắng: ${winners}\n❌ Người thua: ${losers}\n💰 Tổng tiền thắng: ${totalWin * 2}$`;
    delete games[threadID];

    return api.sendMessage(msg, threadID);
  }

  // Mặc định
  return api.sendMessage("⚠️ Sai cú pháp.\nDùng: /taixiu create | join tài|xỉu <số tiền> | xổ", threadID, messageID);
};

function rand() {
  return Math.floor(Math.random() * 6) + 1;
}
