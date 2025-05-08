const axios = require('axios');

module.exports.config = { name: "xidach", version: "1.0.2", hasPermssion: 0, credits: "Dat Thanh", description: "Chơi xì dách nhiều người với cược", commandCategory: "game", usages: "/xidach <create|join|rút|dằn|xổ> <tiền>", cooldowns: 1 };

const games = {};

function createDeck() { const suits = ['♠️', '♥️', '♦️', '♣️']; const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']; let deck = []; for (const suit of suits) { for (const rank of ranks) { deck.push(`${rank}${suit}`); } } return deck.sort(() => Math.random() - 0.5); }

function calculatePoints(hand) { let points = 0, aces = 0; for (const card of hand) { const rank = card.slice(0, -1); if (['J', 'Q', 'K'].includes(rank)) points += 10; else if (rank === 'A') { points += 11; aces += 1; } else points += parseInt(rank); } while (points > 21 && aces > 0) { points -= 10; aces--; } return points; }

module.exports.run = async ({ event, api, args }) => { const { threadID, senderID, messageID } = event; const type = args[0];

switch (type) { case "create": { if (games[threadID]) return api.sendMessage("⚠️ Bàn đang chơi đã tồn tại, hãy dùng /xidach join để tham gia!", threadID, messageID); const bet = parseInt(args[1]); if (isNaN(bet) || bet <= 0) return api.sendMessage("❌ Vui lòng nhập số tiền cược hợp lệ.", threadID, messageID); const deck = createDeck(); const hand = [deck.pop(), deck.pop()]; games[threadID] = { deck, bet, players: { [senderID]: { hand, status: 'playing' } }, started: true }; return api.sendMessage( ♠️ 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 ♠️\n━━━━━━━━━━━━━━━\n + 🃏 Bạn đã tạo bàn Xì Dách với cược: ${bet} VNĐ\n + 🎴 Bài của bạn: ${hand.join(', ')}\n + 📥 Gõ /xidach join để người khác cùng chơi!, threadID ); }

case "join": {
  const game = games[threadID];
  if (!game) return api.sendMessage("❌ Chưa có bàn nào, hãy tạo bằng /xidach create <tiền>.", threadID, messageID);
  if (game.players[senderID]) return api.sendMessage("✅ Bạn đã tham gia bàn này rồi.", threadID, messageID);
  const hand = [game.deck.pop(), game.deck.pop()];
  game.players[senderID] = { hand, status: 'playing' };
  return api.sendMessage(
    `♠️ 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 ♠️\n━━━━━━━━━━━━━━━\n` +
    `🎉 Bạn đã tham gia bàn chơi thành công!\n` +
    `🃏 Bài của bạn: ${hand.join(', ')}\n` +
    `✍️ Dùng /xidach rút hoặc /xidach dằn để tiếp tục.`,
    threadID
  );
}

case "rút": {
  const game = games[threadID];
  if (!game || !game.players[senderID]) return api.sendMessage("Bạn chưa tham gia bàn chơi nào.", threadID);
  if (game.players[senderID].status !== 'playing') return api.sendMessage("Bạn đã dằn rồi.", threadID);
  game.players[senderID].hand.push(game.deck.pop());
  return api.sendMessage(`🃏 Bạn đã rút thêm bài: ${game.players[senderID].hand.join(', ')}`, threadID);
}

case "dằn": {
  const game = games[threadID];
  if (!game || !game.players[senderID]) return api.sendMessage("Bạn chưa tham gia bàn chơi nào.", threadID);
  game.players[senderID].status = 'stand';
  return api.sendMessage("✅ Bạn đã dằn bài.", threadID);
}

case "xổ": {
  const game = games[threadID];
  if (!game) return api.sendMessage("❌ Chưa có bàn chơi nào.", threadID);
  const results = [];
  let winner = null, max = 0;
  for (let uid in game.players) {
    const p = game.players[uid];
    const point = calculatePoints(p.hand);
    results.push({ uid, point });
    if (point <= 21 && point > max) {
      max = point;
      winner = uid;
    }
  }
  let msg = "━━━━━━━━━━━━━━━\n       ♠️ XỔ XÌ DÁCH ♠️\n━━━━━━━━━━━━━━━\n";
  for (let r of results) {
    msg += `• UID ${r.uid}: ${r.point} điểm\n`;
  }
  if (winner) {
    msg += `\n🥇 Người thắng: ${winner} (${max} điểm)\n+${game.bet * (Object.keys(game.players).length - 1)} VNĐ`;
  } else {
    msg += "\nKhông ai thắng vì đều quá 21 điểm!";
  }
  delete games[threadID];
  return api.sendMessage(msg + "\n━━━━━━━━━━━━━━━", threadID);
}

default:
  return api.sendMessage("❓ Lệnh không hợp lệ. Dùng: /xidach <create|join|rút|dằn|xổ>", threadID);

} };

