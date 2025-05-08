const fs = require("fs");
const path = __dirname + "/cache/taixiu.json";
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

module.exports = {
  config: {
    name: "taixiu",
    version: "1.0",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    Description: "Tạo và chơi tài xỉu, cược tiền",
    category: "game",
    guide: {
      vi: "/taixiu create\n/taixiu join tài|xỉu <tiền>\n/taixiu xổ\n/taixiu list"
    }
  },

  onStart({ args, event, message, usersData, threadsData }) {
    const { threadID, senderID, body } = event;
    const data = JSON.parse(fs.readFileSync(path));
    const input = args[0];

    if (input === "create") {
      if (data[threadID]?.status === "pending") return message.reply("Đã có bàn đang hoạt động.");
      data[threadID] = {
        owner: senderID,
        players: [],
        status: "pending",
        time: Date.now(),
        history: data[threadID]?.history || []
      };
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      message.reply("Bàn Tài Xỉu đã được tạo. Dùng /taixiu join tài|xỉu <tiền> để tham gia.");

      setTimeout(() => {
        const updated = JSON.parse(fs.readFileSync(path));
        if (updated[threadID]?.status === "pending") runRoll(threadID, message);
      }, 60000);
    }

    else if (input === "join") {
      if (!data[threadID] || data[threadID].status !== "pending")
        return message.reply("Không có bàn nào đang hoạt động.");
      const choice = args[1]?.toLowerCase();
      const bet = parseInt(args[2]);
      if (!["tài", "xỉu"].includes(choice)) return message.reply("Vui lòng chọn tài hoặc xỉu.");
      if (isNaN(bet) || bet <= 0) return message.reply("Tiền cược không hợp lệ.");

      const user = data[threadID].players.find(p => p.uid === senderID);
      if (user) return message.reply("Bạn đã tham gia rồi.");
      data[threadID].players.push({ uid: senderID, choice, bet });
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      message.reply(`Bạn đã cược ${bet} vào "${choice.toUpperCase()}".`);
    }

    else if (input === "xổ") {
      if (!data[threadID] || data[threadID].status !== "pending")
        return message.reply("Không có bàn đang hoạt động.");
      if (data[threadID].owner !== senderID) return message.reply("Chỉ chủ bàn được xổ.");
      runRoll(threadID, message);
    }

    else if (input === "list") {
      const history = data[threadID]?.history || [];
      if (!history.length) return message.reply("Chưa có ván nào.");
      let reply = "Lịch sử bàn Tài Xỉu:\n";
      history.slice(-10).reverse().forEach((g, i) => {
        reply += `${i + 1}. ${g.total} điểm (${g.result.toUpperCase()}) - ${new Date(g.time).toLocaleString()}\n`;
      });
      message.reply(reply);
    }

    else message.reply("Sai cú pháp. Dùng /taixiu create, /taixiu join tài|xỉu <tiền>, /taixiu xổ, /taixiu list.");
  }
};

function runRoll(threadID, message) {
  const data = JSON.parse(fs.readFileSync(path));
  if (!data[threadID]) return;

  const dice = [rand(1,6), rand(1,6), rand(1,6)];
  const total = dice.reduce((a, b) => a + b, 0);
  const result = total >= 11 ? "tài" : "xỉu";

  const players = data[threadID].players;
  let reply = `Kết quả: [ ${dice.join(" | ")} ] = ${total} điểm → ${result.toUpperCase()}\n`;
  players.forEach(p => {
    reply += `• ${p.uid}: ${p.choice.toUpperCase()} - `;
    reply += p.choice === result ? `Thắng +${p.bet}\n` : `Thua -${p.bet}\n`;
  });

  data[threadID].history = data[threadID].history || [];
  data[threadID].history.push({ total, result, time: Date.now() });
  delete data[threadID];
  fs.writeFileSync(path, JSON.stringify(data, null, 2));

  message.send(reply);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
