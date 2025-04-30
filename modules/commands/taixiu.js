const fs = require("fs");
const path = __dirname + "/taixiuData.json";

module.exports.config = {
  name: "taixiu",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Chơi tài xỉu bằng tiền, có ảnh, delay, lưu lịch sử",
  commandCategory: "game",
  usages: "[tài/xỉu] [số tiền]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const type = args[0]?.toLowerCase();
  const bet = parseInt(args[1]);

  if (!["tài", "xỉu"].includes(type))
    return api.sendMessage("Bạn phải chọn 'tài' hoặc 'xỉu'.\nVí dụ: taixiu tài 100", threadID, messageID);

  if (isNaN(bet) || bet <= 0)
    return api.sendMessage("Số tiền cược không hợp lệ.", threadID, messageID);

  const balance = (await Currencies.getData(senderID)).money;
  if (bet > balance)
    return api.sendMessage("Bạn không có đủ tiền để cược.", threadID, messageID);

  api.sendMessage("Đang tung xúc xắc...", threadID, async () => {
    setTimeout(async () => {
      const dice = [rand(1, 6), rand(1, 6), rand(1, 6)];
      const total = dice.reduce((a, b) => a + b);
      const result = (total >= 11 && total <= 17) ? "tài" : "xỉu";
      const diceEmoji = {
        1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅"
      };

      let msg = `🎲 Kết quả: ${dice.map(i => diceEmoji[i]).join(" ")} (Tổng: ${total})\n`;
      msg += `Kết quả là: ${result.toUpperCase()}\n`;

      let win = false;
      if (type === result) {
        await Currencies.increaseMoney(senderID, bet);
        msg += `✅ Bạn thắng! +${bet} đô.`;
        win = true;
      } else {
        await Currencies.decreaseMoney(senderID, bet);
        msg += `❌ Bạn thua! -${bet} đô.`;
      }

      saveHistory(senderID, {
        time: new Date().toLocaleString(),
        choice: type,
        result,
        total,
        dice,
        win,
        bet
      });

      api.sendMessage(msg, threadID);
    }, 2000);
  });
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function saveHistory(uid, data) {
  let db = {};
  if (fs.existsSync(path)) {
    db = JSON.parse(fs.readFileSync(path));
  }
  if (!db[uid]) db[uid] = [];
  db[uid].unshift(data);
  if (db[uid].length > 20) db[uid] = db[uid].slice(0, 20);
  fs.writeFileSync(path, JSON.stringify(db, null, 2));
}