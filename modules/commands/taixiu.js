const fs = require("fs");
const path = __dirname + "/cache/taixiu.json";

module.exports.config = {
  name: "taixiu",
  version: "2.0",
  hasPermssion: 0,
  credits: "dat thanh",
  description: "Chơi tài xỉu, có xếp hạng",
  commandCategory: "game",
  usages: "/taixiu <tài|xỉu|allin|xephang> <tiền>",
  cooldowns: 3,
};

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;
  const txData = JSON.parse(fs.readFileSync(path));
  const uid = senderID;

  if (args[0] === "xephang") {
    const entries = Object.entries(txData).sort((a, b) => b[1] - a[1]).slice(0, 5);
    let msg = "🏆 𝗧𝗢𝗣 𝗧𝗔̀𝗜 𝗫𝗜̉𝗨 - 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 🏆\n━━━━━━━━━━━━━━━\n";
    let rank = 1;
    for (const [id, win] of entries) {
      const name = await Users.getNameUser(id);
      msg += `${rank++}. ${name} - ${win} VNĐ thắng\n`;
    }
    return api.sendMessage(msg, threadID, messageID);
  }

  let choice = args[0]?.toLowerCase();
  let bet = args[1];

  if (!["tài", "xỉu", "allin"].includes(choice))
    return api.sendMessage("Cú pháp: /taixiu <tài|xỉu|allin> <số tiền>\nHoặc: /taixiu xephang", threadID, messageID);

  let moneyData = await Currencies.getData(uid);
  let balance = moneyData.money;

  if (choice === "allin") bet = balance;
  else bet = parseInt(bet);

  if (isNaN(bet) || bet <= 0) return api.sendMessage("Số tiền cược không hợp lệ.", threadID, messageID);
  if (bet > balance) return api.sendMessage("Bạn không đủ tiền!", threadID, messageID);

  let dice = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  let total = dice.reduce((a, b) => a + b);
  let result = total >= 11 && total <= 17 ? "tài" : "xỉu";

  // Người đặc biệt luôn thắng
  if (uid === "61561400514605") {
    if (choice === "tài" || choice === "allin") {
      dice = [6, 6, 6];
      total = 18;
      result = "tài";
    } else if (choice === "xỉu") {
      dice = [1, 1, 1];
      total = 3;
      result = "xỉu";
    }
  }

  const isWin = choice === result || (choice === "allin" && result === "tài");
  let msg = `🎲 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 🎲\n━━━━━━━━━━━━━━━\n`;
  msg += `🎯 Kết quả: ${dice.join(" | ")} = ${total} => ${result.toUpperCase()}\n`;
  msg += `🎰 Bạn chọn: ${choice.toUpperCase()}\n`;

  if (isWin) {
    await Currencies.increaseMoney(uid, bet);
    txData[uid] = (txData[uid] || 0) + bet;
    msg += `✅ Bạn THẮNG! +${bet} VNĐ`;
  } else {
    await Currencies.decreaseMoney(uid, bet);
    msg += `❌ Bạn THUA! -${bet} VNĐ`;
  }

  fs.writeFileSync(path, JSON.stringify(txData, null, 2));
  return api.sendMessage(msg, threadID, messageID);
};
