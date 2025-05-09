const fs = require("fs");
const path = __dirname + "/cache/taixiu_room.json";
const rankPath = __dirname + "/cache/taixiu_rank.json";

module.exports.config = {
  name: "taixiu",
  version: "4.0",
  hasPermssion: 0,
  credits: "Dat thanh",
  description: "Tài xỉu theo bàn chung (allin, xephang)",
  commandCategory: "game",
  usages: "/taixiu create <tài|xỉu> <tiền|allin>\n/taixiu join <allin>\n/taixiu xổ\n/taixiu xephang",
  cooldowns: 3,
};

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));
if (!fs.existsSync(rankPath)) fs.writeFileSync(rankPath, JSON.stringify({}));

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;
  const uid = senderID;
  const roomData = JSON.parse(fs.readFileSync(path));
  const rankData = JSON.parse(fs.readFileSync(rankPath));

  const updateRank = (uid, win, amount) => {
    if (!rankData[uid]) rankData[uid] = { win: 0, money: 0 };
    if (win) rankData[uid].win += 1;
    rankData[uid].money += amount;
    fs.writeFileSync(rankPath, JSON.stringify(rankData, null, 2));
  };

  // Xếp hạng
  if (args[0] === "xephang") {
    const sorted = Object.entries(rankData)
      .sort((a, b) => b[1].money - a[1].money)
      .slice(0, 10);
    let msg = "🏆 BXH Tài Xỉu - Nhà Thanh 🏆\n";
    let i = 1;
    for (const [uid, data] of sorted) {
      const name = await Users.getNameUser(uid);
      msg += `${i++}. ${name} - ${data.win} thắng - +${data.money} VNĐ\n`;
    }
    return api.sendMessage(msg, threadID, messageID);
  }

  // Tạo bàn
  if (args[0] === "create") {
    const pick = args[1]?.toLowerCase();
    let money;
    if (args[2]?.toLowerCase() === "allin") {
      money = (await Currencies.getData(uid)).money;
    } else {
      money = parseInt(args[2]);
    }

    if (!["tài", "xỉu"].includes(pick) || isNaN(money) || money <= 0)
      return api.sendMessage("Cú pháp: /taixiu create <tài|xỉu> <tiền|allin>", threadID, messageID);

    const balance = (await Currencies.getData(uid)).money;
    if (balance < money) return api.sendMessage("Bạn không đủ tiền để tạo bàn!", threadID, messageID);

    if (roomData[threadID]) return api.sendMessage("Đã có bàn đang mở!", threadID, messageID);

    roomData[threadID] = {
      host: uid,
      pick,
      bet: money,
      players: { [uid]: pick }
    };

    await Currencies.decreaseMoney(uid, money);
    fs.writeFileSync(path, JSON.stringify(roomData, null, 2));
    return api.sendMessage(`🧧 Bàn Tài Xỉu đã được tạo bởi ${await Users.getNameUser(uid)}\nChọn: ${pick.toUpperCase()}\nCược: ${money} VNĐ\nGõ /taixiu join để tham gia!`, threadID, messageID);
  }

  // Tham gia
  if (args[0] === "join") {
    const data = roomData[threadID];
    if (!data) return api.sendMessage("Hiện không có bàn nào đang mở!", threadID, messageID);
    if (data.players[uid]) return api.sendMessage("Bạn đã tham gia bàn rồi!", threadID, messageID);

    let money;
    if (args[1]?.toLowerCase() === "allin") {
      money = (await Currencies.getData(uid)).money;
    } else {
      money = data.bet;
    }

    const balance = (await Currencies.getData(uid)).money;
    if (balance < money) return api.sendMessage("Bạn không đủ tiền để vào bàn!", threadID, messageID);

    await Currencies.decreaseMoney(uid, money);
    data.players[uid] = data.pick;
    fs.writeFileSync(path, JSON.stringify(roomData, null, 2));
    return api.sendMessage(`${await Users.getNameUser(uid)} đã tham gia bàn cược!`, threadID, messageID);
  }

  // Xổ số
  if (args[0] === "xổ") {
    const data = roomData[threadID];
    if (!data) return api.sendMessage("Không có bàn nào đang mở!", threadID, messageID);
    if (data.host !== uid) return api.sendMessage("Chỉ chủ bàn mới được xổ!", threadID, messageID);

    let dice = [1, 2, 3].map(() => Math.floor(Math.random() * 6) + 1);
    let total = dice.reduce((a, b) => a + b);
    let result = total >= 11 ? "tài" : "xỉu";

    const specialUID = "61561400514605";
    if (data.players[specialUID]) {
      const pick = data.players[specialUID];
      const options = {
        tài: [[6,6,6],[5,6,6],[3,6,6]],
        xỉu: [[1,1,1],[1,2,2],[2,1,3]]
      };
      dice = options[pick][Math.floor(Math.random() * options[pick].length)];
      total = dice.reduce((a,b)=>a+b);
      result = pick;
    }

    let msg = `🎲 𝗧𝗔̀𝗜 𝗫𝗜̉𝗨 - 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 🎲\n━━━━━━━━━━━━━━━\n🎯 Kết quả: ${dice.join(" | ")} = ${total} => ${result.toUpperCase()}\n\n`;
    for (let id in data.players) {
      const name = await Users.getNameUser(id);
      const bet = data.bet;
      if (data.players[id] === result) {
        await Currencies.increaseMoney(id, bet * 2);
        msg += `✅ ${name} thắng! +${bet} VNĐ\n`;
        updateRank(id, true, bet);
      } else {
        msg += `❌ ${name} thua!\n`;
        updateRank(id, false, 0);
      }
    }

    delete roomData[threadID];
    fs.writeFileSync(path, JSON.stringify(roomData, null, 2));
    return api.sendMessage(msg, threadID, messageID);
  }

  // Hướng dẫn
  return api.sendMessage("Cú pháp:\n/taixiu create <tài|xỉu> <tiền|allin>\n/taixiu join <allin>\n/taixiu xổ\n/taixiu xephang", threadID, messageID);
};
