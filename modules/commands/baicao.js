const games = {};
const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

module.exports.config = {
  name: "bacao",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Chơi bài ba cây (ba cào)",
  commandCategory: "game",
  usages: "/bacao create | join <tiền> | xổ",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args, Currencies, Users }) => {
  const { threadID, senderID, messageID } = event;
  const cmd = args[0];

  // Tạo bàn
  if (cmd === "create") {
    if (games[threadID]) return api.sendMessage("⚠️ Bàn ba cào đã tồn tại. Gõ /bacao xổ để kết thúc.", threadID, messageID);
    games[threadID] = {
      author: senderID,
      players: []
    };
    return api.sendMessage("♦️ 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 ♦️\n\n✅ Bàn ba cào đã được tạo!\nGõ: /bacao join <tiền cược>", threadID);
  }

  // Tham gia
  if (cmd === "join") {
    const bet = parseInt(args[1]);
    if (!games[threadID]) return api.sendMessage("⚠️ Chưa có bàn nào. Gõ /bacao create", threadID, messageID);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("⚠️ Tiền cược không hợp lệ.", threadID, messageID);

    const userMoney = (await Currencies.getData(senderID)).money || 0;
    if (userMoney < bet) return api.sendMessage("❌ Không đủ tiền cược.", threadID, messageID);

    const game = games[threadID];
    if (game.players.find(p => p.id === senderID)) return api.sendMessage("⚠️ Bạn đã tham gia rồi.", threadID, messageID);

    await Currencies.decreaseMoney(senderID, bet);
    game.players.push({ id: senderID, bet });
    return api.sendMessage(`✅ Đã tham gia bàn ba cào với ${bet}$!`, threadID);
  }

  // Xổ bài
  if (cmd === "xổ") {
    const game = games[threadID];
    if (!game) return api.sendMessage("⚠️ Không có bàn nào đang diễn ra.", threadID, messageID);
    if (game.author !== senderID) return api.sendMessage("⚠️ Chỉ chủ bàn mới được xổ bài.", threadID, messageID);
    if (game.players.length < 2) return api.sendMessage("⚠️ Cần ít nhất 2 người chơi.", threadID, messageID);

    const result = [];
    const getPoint = (cards) => {
      let sum = 0;
      for (const card of cards) {
        let val = card.value;
        if (["J", "Q", "K"].includes(val)) val = 10;
        else if (val === "A") val = 1;
        sum += parseInt(val);
      }
      return sum % 10;
    };

    for (let player of game.players) {
      const cards = drawCards(3);
      const point = getPoint(cards);
      result.push({ ...player, point, cards });
    }

    // Tìm người thắng
    result.sort((a, b) => b.point - a.point);
    const winner = result[0];
    let msg = `♦️ 𝗕𝗔 𝗖𝗔̀𝗢 - 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 ♦️\n\n`;

    for (const p of result) {
      const name = await Users.getNameUser(p.id);
      const cardStr = p.cards.map(c => `${c.suit}${c.value}`).join(" ");
      msg += `• ${name}: ${cardStr} → ${p.point} điểm\n`;
    }

    const totalBet = result.reduce((sum, p) => sum + p.bet, 0);
    await Currencies.increaseMoney(winner.id, totalBet);
    const winnerName = await Users.getNameUser(winner.id);
    msg += `\n👑 Người thắng: ${winnerName} (+${totalBet}$)`;

    delete games[threadID];
    return api.sendMessage(msg, threadID);
  }

  // Sai cú pháp
  return api.sendMessage("⚠️ Sai cú pháp. Dùng:\n/bacao create\n/bacao join <tiền>\n/bacao xổ", threadID, messageID);
};

function drawCards(n) {
  const deck = [];
  for (const suit of suits) {
    for (const val of values) {
      deck.push({ suit, value: val });
    }
  }

  const shuffled = deck.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
