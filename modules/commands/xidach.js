// File: xidach.js

const fs = require("fs-extra"); const path = __dirname + "/../cache/xidach.json"; const historyPath = __dirname + "/../history/xidach.json";

module.exports.config = { name: "xidach", version: "1.0.0", hasPermssion: 0, credits: "GPT-4", description: "Chơi xì dách (Blackjack Việt Nam)", commandCategory: "game", usages: "/xidach [create|join|start|rut|dung|list]", cooldowns: 3 };

let data = fs.existsSync(path) ? require(path) : {};

function save() { fs.writeFileSync(path, JSON.stringify(data, null, 2)); }

function drawCard() { const suits = ['♠', '♥', '♦', '♣']; const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']; const card = ranks[Math.floor(Math.random() * ranks.length)] + suits[Math.floor(Math.random() * suits.length)]; return card; }

function calcPoints(cards) { let total = 0, aces = 0; for (let card of cards) { let value = card.match(/\d+/) ? parseInt(card) : card[0]; if (value === 'A') { aces++; total += 11; } else if (['J', 'Q', 'K'].includes(value)) { total += 10; } else { total += value; } } while (total > 21 && aces > 0) { total -= 10; aces--; } return total; }

module.exports.run = async function({ api, event, args, Users, Currencies }) { const { threadID, senderID, messageID } = event; const send = msg => api.sendMessage(msg, threadID, messageID); const action = args[0];

if (!data[threadID]) data[threadID] = null;

if (action === "create") { if (data[threadID]) return send("Đã có bàn đang hoạt động."); data[threadID] = { host: senderID, players: {}, started: false, turn: null }; save(); return send("Đã tạo bàn xì dách. Dùng /xidach join <tiền cược> để tham gia."); }

if (action === "join") { if (!data[threadID] || data[threadID].started) return send("Không có bàn đang mở hoặc đã bắt đầu."); const bet = parseInt(args[1]); if (isNaN(bet) || bet <= 0) return send("Vui lòng nhập số tiền cược hợp lệ."); const money = (await Currencies.getData(senderID)).money; if (money < bet) return send("Bạn không đủ tiền."); data[threadID].players[senderID] = { bet, cards: [], done: false, bust: false }; save(); return send(Đã tham gia bàn với ${bet}$. Dùng /xidach start khi sẵn sàng (chỉ chủ bàn).); }

if (action === "start") { const room = data[threadID]; if (!room || room.started) return send("Chưa có bàn hoặc đã bắt đầu."); if (room.host !== senderID) return send("Chỉ chủ bàn mới có thể bắt đầu."); if (Object.keys(room.players).length < 1) return send("Cần ít nhất 1 người chơi."); for (let uid in room.players) { room.players[uid].cards = [drawCard(), drawCard()]; room.players[uid].done = false; room.players[uid].bust = false; } room.started = true; room.turn = Object.keys(room.players)[0]; save(); api.sendMessage("Bắt đầu chia bài! Người đầu tiên: " + room.turn, threadID); return; }

if (action === "rut") { const room = data[threadID]; if (!room || !room.started) return send("Chưa bắt đầu ván chơi."); if (room.turn !== senderID) return send("Không đến lượt bạn."); const player = room.players[senderID]; if (player.done || player.bust) return send("Bạn đã kết thúc lượt."); const newCard = drawCard(); player.cards.push(newCard); const point = calcPoints(player.cards); if (point > 21) { player.bust = true; player.done = true; send(Bạn rút ${newCard} => Quắc (${point} điểm)); } else { send(Bạn rút ${newCard} => hiện tại ${point} điểm); } nextTurn(threadID); save(); return; }

if (action === "dung") { const room = data[threadID]; if (!room || !room.started) return send("Chưa bắt đầu ván chơi."); if (room.turn !== senderID) return send("Không đến lượt bạn."); room.players[senderID].done = true; send("Bạn đã dừng. Chờ người chơi tiếp theo."); nextTurn(threadID); save(); return; }

if (action === "list") { if (!fs.existsSync(historyPath)) return send("Chưa có ván nào được ghi nhận."); const history = require(historyPath); const list = history[threadID] || []; if (!list.length) return send("Chưa có ván nào ở nhóm này."); return send("Lịch sử xì dách: " + list.map((r, i) => Ván ${i + 1}: ${r}).join("\n")); } };

function nextTurn(threadID) { const room = data[threadID]; const ids = Object.keys(room.players); const currentIndex = ids.indexOf(room.turn); for (let i = currentIndex + 1; i < ids.length; i++) { const p = room.players[ids[i]]; if (!p.done && !p.bust) { room.turn = ids[i]; return; } } // Tất cả đã xong endGame(threadID); }

async function endGame(threadID) { const room = data[threadID]; const results = []; let maxPoint = 0; for (let uid in room.players) { const p = room.players[uid]; const pt = calcPoints(p.cards); if (!p.bust && pt > maxPoint) maxPoint = pt; }

for (let uid in room.players) { const p = room.players[uid]; const pt = calcPoints(p.cards); const result = ${uid}: ${p.cards.join(', ')} => ${pt} điểm ${p.bust ? "(quắc)" : ""}; results.push(result); if (!p.bust && pt === maxPoint) { await global.module.exports.Currencies.increaseMoney(uid, p.bet); } else { await global.module.exports.Currencies.decreaseMoney(uid, p.bet); } }

if (!fs.existsSync(historyPath)) fs.writeFileSync(historyPath, JSON.stringify({})); const history = require(historyPath); if (!history[threadID]) history[threadID] = []; history[threadID].push(results.join(" | ")); fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

global.api.sendMessage("Kết quả ván xì dách: " + results.join("\n"), threadID); delete data[threadID]; save(); }

