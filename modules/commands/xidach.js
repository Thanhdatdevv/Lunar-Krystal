const fs = require("fs");
const path = __dirname + "/cache/xidach.json";
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

const allCards = () => {
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
  const suits = ["♠", "♥", "♦", "♣"];
  return suits.flatMap(suit => ranks.map(rank => `${rank}${suit}`));
};

const getPoint = card => {
  const rank = card.replace(/[♠♥♦♣]/g, "");
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 1;
  return parseInt(rank);
};

function drawCard(deck) {
  const index = Math.floor(Math.random() * deck.length);
  const card = deck[index];
  deck.splice(index, 1);
  return card;
}

module.exports = {
  config: {
    name: "xidach",
    version: "1.0",
    author: "dat Thanh",
    role: 0,
    shortDescription: "Chơi xì dách nhiều người",
    longDescription: "Tạo bàn, tham gia, rút bài và so điểm trong Xì Dách",
    category: "game",
    guide: {
      vi: "/xidach create\n/xidach join\n/xidach rut\n/xidach dung\n/xidach xổ\n/xidach info"
    }
  },

  onStart({ event, args, message }) {
    const { threadID, senderID } = event;
    const data = JSON.parse(fs.readFileSync(path));
    const cmd = args[0];

    if (cmd === "create") {
      if (data[threadID]) return message.reply("Đã có bàn đang hoạt động.");
      const deck = allCards();
      const firstCard = drawCard(deck);
      data[threadID] = {
        owner: senderID,
        deck,
        players: {
          [senderID]: {
            cards: [firstCard],
            status: "playing"
          }
        },
        started: true
      };
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply(`Đã tạo bàn Xì Dách. Dùng /xidach join để vào chơi.`);
    }

    if (cmd === "join") {
      if (!data[threadID]) return message.reply("Chưa có bàn nào đang hoạt động.");
      const game = data[threadID];
      if (game.players[senderID]) return message.reply("Bạn đã tham gia rồi.");

      const card = drawCard(game.deck);
      game.players[senderID] = { cards: [card], status: "playing" };
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply(`Bạn đã tham gia và được rút 1 lá bài.`);
    }

    if (cmd === "rut") {
      const game = data[threadID];
      if (!game || !game.players[senderID]) return message.reply("Bạn chưa tham gia bàn nào.");

      const player = game.players[senderID];
      if (player.status === "done") return message.reply("Bạn đã dừng.");
      if (player.cards.length >= 5) return message.reply("Bạn đã rút tối đa 5 lá.");

      const card = drawCard(game.deck);
      player.cards.push(card);
      const total = player.cards.reduce((sum, c) => sum + getPoint(c), 0);
      let reply = `Bạn rút thêm: ${card} (Tổng: ${total} điểm)`;
      if (total > 21) {
        player.status = "done";
        reply += "\nBạn đã QUÁ 21 điểm!";
      }
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply(reply);
    }

    if (cmd === "dung") {
      const game = data[threadID];
      if (!game || !game.players[senderID]) return message.reply("Bạn chưa tham gia bàn.");
      game.players[senderID].status = "done";
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply("Bạn đã dừng. Chờ chủ bàn xổ.");
    }

    if (cmd === "info") {
      const game = data[threadID];
      if (!game) return message.reply("Không có bàn nào hoạt động.");
      const list = Object.entries(game.players).map(([uid, p]) => {
        const cards = p.cards.join(", ");
        const total = p.cards.reduce((s, c) => s + getPoint(c), 0);
        return `• ${uid === game.owner ? "[CHỦ]" : ""} ${uid}: ${cards} (${total} điểm)`;
      }).join("\n");
      return message.reply("Trạng thái bàn hiện tại:\n" + list);
    }

    if (cmd === "xổ") {
      const game = data[threadID];
      if (!game) return message.reply("Không có bàn nào.");
      if (game.owner !== senderID) return message.reply("Chỉ chủ bàn được xổ.");

      const results = Object.entries(game.players).map(([uid, p]) => {
        const cards = p.cards.join(", ");
        const total = p.cards.reduce((s, c) => s + getPoint(c), 0);
        let status = total > 21 ? "Quá điểm" : `${total} điểm`;
        return `• ${uid === game.owner ? "[CHỦ]" : ""} ${uid}: ${cards} → ${status}`;
      }).join("\n");

      delete data[threadID];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply("KẾT QUẢ BÀN XÌ DÁCH:\n" + results);
    }

    return message.reply("Sai cú pháp. Dùng: /xidach create | join | rut | dung | xổ | info");
  }
};
