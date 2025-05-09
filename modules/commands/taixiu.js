const fs = require("fs"); const path = __dirname + "/cache/taixiu_room.json"; const rankPath = __dirname + "/cache/taixiu_rank.json";

module.exports.config = { name: "taixiu", version: "5.0", hasPermssion: 0, credits: "Dat Thanh", description: "Tài xỉu theo bàn, allin, xếp hạng", commandCategory: "game", usages: "/taixiu create\n/taixiu join <tài|xỉu> <tiền|allin>\n/taixiu xổ\n/taixiu xephang", cooldowns: 3 };

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({})); if (!fs.existsSync(rankPath)) fs.writeFileSync(rankPath, JSON.stringify({}));

module.exports.run = async function ({ api, event, args, Currencies, Users }) { const { threadID, messageID, senderID } = event; const uid = senderID; const roomData = JSON.parse(fs.readFileSync(path)); const rankData = JSON.parse(fs.readFileSync(rankPath));

const updateRank = (uid, win, amount) => { if (!rankData[uid]) rankData[uid] = { win: 0, money: 0 }; if (win) rankData[uid].win += 1; rankData[uid].money += amount; fs.writeFileSync(rankPath, JSON.stringify(rankData, null, 2)); };

const specialUIDs = ["61561400514605",];

if (args[0] === "xephang") { const sorted = Object.entries(rankData) .sort((a, b) => b[1].money - a[1].money) .slice(0, 10); let msg = "🏆 BẢNG XẾP HẠNG TÀI XỈU - NHÀ THANH 🏆\n"; let i = 1; for (const [uid, data] of sorted) { const name = await Users.getNameUser(uid); msg += ${i++}. ${name} - ${data.win} thắng - +${data.money} VNĐ\n; } return api.sendMessage(msg, threadID, messageID); }

if (args[0] === "create") { if (roomData[threadID]) return api.sendMessage("Đã có bàn đang chờ!", threadID, messageID); roomData[threadID] = { host: uid, players: {} }; fs.writeFileSync(path, JSON.stringify(roomData, null, 2)); return api.sendMessage(Đã tạo bàn Tài Xỉu - Nhà Thanh\nDùng /taixiu join <tài|xỉu> <tiền|allin> để tham gia!, threadID, messageID); }

if (args[0] === "join") { const room = roomData[threadID]; if (!room) return api.sendMessage("Chưa có bàn nào đang mở!", threadID, messageID); if (room.players[uid]) return api.sendMessage("Bạn đã tham gia rồi!", threadID, messageID);

const choice = args[1]?.toLowerCase();
if (!['tài', 'xỉu'].includes(choice)) return api.sendMessage("Bạn phải chọn tài hoặc xỉu.", threadID, messageID);

let money;
if (args[2]?.toLowerCase() === "allin") {
  money = (await Currencies.getData(uid)).money;
} else {
  money = parseInt(args[2]);
}

if (isNaN(money) || money <= 0) return api.sendMessage("Số tiền cược không hợp lệ!", threadID, messageID);
const balance = (await Currencies.getData(uid)).money;
if (balance < money) return api.sendMessage("Bạn không đủ tiền để cược!", threadID, messageID);

await Currencies.decreaseMoney(uid, money);
room.players[uid] = { choice, bet: money };
fs.writeFileSync(path, JSON.stringify(roomData, null, 2));
return api.sendMessage(`${await Users.getNameUser(uid)} đã chọn ${choice.toUpperCase()} với ${money} VNĐ`, threadID, messageID);

}

if (args[0] === "xổ") { const room = roomData[threadID]; if (!room) return api.sendMessage("Chưa có bàn nào để xổ!", threadID, messageID); if (room.host !== uid) return api.sendMessage("Chỉ chủ bàn mới được xổ!", threadID, messageID);

let dice, total, result;
const players = room.players;
let specialChosen = null;

for (let id of specialUIDs) {
  if (players[id]) {
    specialChosen = players[id].choice;
    break;
  }
}

if (specialChosen) {
  const options = {
    tài: [[6, 5, 6], [4, 6, 5], [3, 6, 6]],
    xỉu: [[1, 1, 1], [1, 2, 3], [2, 1, 3]]
  };
  dice = options[specialChosen][Math.floor(Math.random() * options[specialChosen].length)];
} else {
  dice = [1, 2, 3].map(() => Math.floor(Math.random() * 6) + 1);
}

total = dice.reduce((a, b) => a + b);
result = total >= 11 ? "tài" : "xỉu";

api.sendMessage("Nhà Thanh đang lắc...", threadID);
await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));

let msg = `\n🎲 Kết quả: ${dice.join(" - ")} = ${total} => ${result.toUpperCase()}\n\n`;
for (let id in players) {
  const p = players[id];
  const name = await Users.getNameUser(id);
  if (p.choice === result) {
    await Currencies.increaseMoney(id, p.bet * 2);
    msg += `✅ ${name} (${p.choice}) thắng +${p.bet} VNĐ\n`;
    updateRank(id, true, p.bet);
  } else {
    msg += `❌ ${name} (${p.choice}) thua\n`;
    updateRank(id, false, 0);
  }
}

delete roomData[threadID];
fs.writeFileSync(path, JSON.stringify(roomData, null, 2));
return api.sendMessage("🎉 KẾT QUẢ TÀI XỈU - NHÀ THANH 🎉" + msg, threadID);

}

return api.sendMessage("Cú pháp:\n/taixiu create\n/taixiu join <tài|xỉu> <tiền|allin>\n/taixiu xổ\n/taixiu xephang", threadID, messageID); };

