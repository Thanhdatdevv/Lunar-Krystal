// taixiu.js

module.exports.config = { name: "taixiu", version: "1.3.1", hasPermssion: 0, credits: "Nhà Thanh", description: "Tạo phòng chơi tài xỉu, all-in, xếp hạng.", commandCategory: "game", usages: "/taixiu create | join tài/xỉu [số tiền] | start | xephang", cooldowns: 3 };

const fs = require("fs"); const path = __dirname + "/taixiu_data.json"; const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = {}; if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path));

function save() { fs.writeFileSync(path, JSON.stringify(data, null, 2)); }

const specialUIDs = ["61561400514605"];

module.exports.run = async function({ api, event, args, Currencies, Users }) { const { threadID, senderID, messageID } = event; if (!args[0]) return api.sendMessage("[ Nhà Thanh Tài Xỉu ] » Dùng lệnh /taixiu create | join | start | xephang", threadID, messageID);

const thread = threadID; data[thread] = data[thread] || { bets: [], active: false, result: null, host: null };

if (args[0] === "create") { if (data[thread].active) return api.sendMessage("[ Nhà Thanh ] » Đã có bàn đang chờ, hãy /taixiu join để tham gia.", threadID, messageID); data[thread] = { bets: [], active: true, result: null, host: senderID }; save(); return api.sendMessage("[ Nhà Thanh ] » Bàn Tài Xỉu đã được tạo. Dùng /taixiu join tài/xỉu [tiền] để tham gia!", threadID, messageID); }

if (args[0] === "join") { if (!data[thread].active) return api.sendMessage("[ Nhà Thanh ] » Chưa có bàn nào, hãy tạo với /taixiu create", threadID, messageID); const choice = args[1]?.toLowerCase(); if (!['tài', 'xỉu'].includes(choice)) return api.sendMessage("[ Nhà Thanh ] » Bạn phải chọn tài hoặc xỉu.", threadID, messageID); let bet = args[2]?.toLowerCase() === 'allin' ? -1 : parseInt(args[2]); if (isNaN(bet)) return api.sendMessage("[ Nhà Thanh ] » Nhập số tiền cược hợp lệ.", threadID, messageID);

let userMoney = (await Currencies.getData(senderID)).money;
if (bet === -1) bet = userMoney;
if (bet > userMoney || bet <= 0) return api.sendMessage("[ Nhà Thanh ] » Bạn không đủ tiền hoặc cược không hợp lệ.", threadID, messageID);

const existing = data[thread].bets.find(b => b.uid === senderID);
if (existing) return api.sendMessage("[ Nhà Thanh ] » Bạn đã tham gia bàn này rồi.", threadID, messageID);

data[thread].bets.push({ uid: senderID, bet: choice, amount: bet });
await Currencies.decreaseMoney(senderID, bet);
save();
return api.sendMessage(`[ Nhà Thanh ] » Tham gia thành công với cửa ${choice.toUpperCase()} - ${bet} VNĐ`, threadID, messageID);

}

if (args[0] === "start") { if (!data[thread].active || data[thread].bets.length < 1) return api.sendMessage("[ Nhà Thanh ] » Bàn chơi không tồn tại hoặc không có ai tham gia.", threadID, messageID); api.sendMessage("[ Nhà Thanh ] » Bot đang lắc...", threadID); await delay(3000);

const hostSpecial = specialUIDs.includes(data[thread].host);
const counts = { tài: 0, xỉu: 0 };
for (let b of data[thread].bets) counts[b.bet]++;

let result;
if (hostSpecial) {
  result = counts['tài'] >= counts['xỉu'] ? 'tài' : 'xỉu';
} else {
  result = Math.random() < 0.5 ? 'tài' : 'xỉu';
}

let resultMsg = `[ Nhà Thanh ] » Kết quả: ${result.toUpperCase()}

; for (let b of data[thread].bets) { const name = await Users.getNameUser(b.uid); if (b.bet === result) { const winAmount = b.amount * 2; await Currencies.increaseMoney(b.uid, winAmount); resultMsg += ✅ ${(await name)} THẮNG +${winAmount} VNĐ\n; data[b.uid] = data[b.uid] || { win: 0, money: 0 }; data[b.uid].win++; data[b.uid].money += b.amount; } else { resultMsg += ❌ ${(await name)} THUA -${b.amount} VNĐ\n`; } } data[thread] = { bets: [], active: false, result: null, host: null }; save(); return api.sendMessage(resultMsg, threadID); }

if (args[0] === "xephang") { const rankData = {}; for (const key in data) { if (Array.isArray(data[key].bets)) continue; for (const uid in data) { if (!rankData[uid]) rankData[uid] = { win: 0, money: 0 }; rankData[uid].win += data[uid].win || 0; rankData[uid].money += data[uid].money || 0; } } const sorted = Object.entries(rankData) .sort((a, b) => b[1].money - a[1].money) .slice(0, 10); let msg = "🏆 BẢNG XẾP HẠNG TÀI XỈU - NHÀ THANH 🏆\n"; let i = 1; for (const [uid, stat] of sorted) { const name = await Users.getNameUser(uid); msg += ${i++}. ${name} - ${stat.win} thắng - +${stat.money} VNĐ\n; } return api.sendMessage(msg, threadID, messageID); } };

