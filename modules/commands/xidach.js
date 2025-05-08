const games = {};
const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

module.exports.config = {
  name: "xidach",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Chơi xì dách với nhà cái",
  commandCategory: "game",
  usages: "/xidach <tiền cược>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, senderID, messageID, body } = event;
  const input = args[0];

  // Nếu đang chơi
  if (games[senderID]) {
    const game = games[senderID];
    if (body.toLowerCase() === "rút") {
      const card = drawCards(1)[0];
      game.playerCards.push(card);
      const point = calculate(game.playerCards);
      let msg = `🃏 Bạn rút: ${card.suit}${card.value} → Tổng: ${point} điểm\n`;

      if (point > 21) {
        msg += `❌ Quá 21! Bạn thua và mất ${game.bet}$`;
        delete games[senderID];
        await Currencies.decreaseMoney(senderID, game.bet);
      } else {
        msg += `✉️ Gõ "rút" để rút tiếp, "dằn" để ngừng.`;
      }
      return api.sendMessage(msg, threadID, messageID);
    }

    if (body.toLowerCase() === "dằn") {
      const game = games[senderID];
      const playerPoint = calculate(game.playerCards);
      const dealerCards = drawCards(2);
      let dealerPoint = calculate(dealerCards);

      while (dealerPoint < 17) {
        dealerCards.push(...drawCards(1));
        dealerPoint = calculate(dealerCards);
      }

      let msg = `♦️ 𝗫𝗜̀ 𝗗𝗔́𝗖𝗛 - 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 ♦️\n\n`;
      msg += `👤 Bạn: ${formatCards(game.playerCards)} → ${playerPoint} điểm\n`;
      msg += `🏦 Nhà cái: ${formatCards(dealerCards)} → ${dealerPoint} điểm\n\n`;

      let win = false;
      if (playerPoint > 21) win = false;
      else if (dealerPoint > 21 || playerPoint > dealerPoint) win = true;

      if (win) {
        msg += `✅ Bạn thắng! +${game.bet}$`;
        await Currencies.increaseMoney(senderID, game.bet);
      } else if (playerPoint === dealerPoint) {
        msg += `⚖️ Hòa tiền.`;
        await Currencies.increaseMoney(senderID, 0); // giữ tiền
      } else {
        msg += `❌ Bạn thua. -${game.bet}$`;
        await Currencies.decreaseMoney(senderID, game.bet);
      }

      delete games[senderID];
      return api.sendMessage(msg, threadID, messageID);
    }

    return api.sendMessage(`✉️ Đang chơi. Gõ "rút" để lấy bài hoặc "dằn" để chốt.`, threadID, messageID);
  }

  // Bắt đầu game
  const bet = parseInt(input);
  if (isNaN(bet) || bet <= 0) return api.sendMessage("⚠️ Vui lòng nhập số tiền cược hợp lệ.", threadID, messageID);

  const userMoney = (await Currencies.getData(senderID)).money || 0;
  if (userMoney < bet) return api.sendMessage("❌ Bạn không đủ tiền.", threadID, messageID);

  const cards = drawCards(2);
  games[senderID] = {
    playerCards: cards,
    bet
  };

  const point = calculate(cards);
  let msg = `♦️ 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 ♦️\n\n🃏 Bài của bạn: ${formatCards(cards)} → ${point} điểm\n`;
  msg += `✉️ Gõ "rút" để lấy bài hoặc "dằn" để chốt.`;
  return api.sendMessage(msg, threadID, messageID);
};

// Tính điểm
function calculate(cards) {
  let sum = 0, ace = 0;
  for (let card of cards) {
    if (["J", "Q", "K"].includes(card.value)) sum += 10;
    else if (card.value === "A") {
      ace += 1;
      sum += 11;
    } else sum += parseInt(card.value);
  }

  while (sum > 21 && ace > 0) {
    sum -= 10;
    ace--;
  }

  return sum;
}

// Lấy bài
function drawCards(n) {
  const deck = [];
  for (let suit of suits) {
    for (let val of values) {
      deck.push({ suit, value: val });
    }
  }
  return deck.sort(() => Math.random() - 0.5).slice(0, n);
}

// Hiển thị bài
function formatCards(cards) {
  return cards.map(c => `${c.suit}${c.value}`).join(" ");
}
