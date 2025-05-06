//================= cauca.js - Module Câu Cá ===================//

module.exports.config = { name: "cauca", version: "1.0.1", hasPermssion: 0, credits: "GPT-Mirai", description: "Câu cá và kiếm tiền, mua cần câu, xem top", commandCategory: "Game", usages: "/cauca | /cauca shop | /cauca mua [tên] | /cauca top", cooldowns: 10 };

const fs = require("fs-extra"); const path = __dirname + "/cache/cauca.json"; const delay = ms => new Promise(res => setTimeout(res, ms));

const rods = { "gỗ": { price: 0, bonus: 0 }, "bạc": { price: 5000, bonus: 0.1 }, "vàng": { price: 50000, bonus: 0.2 }, "kim cương": { price: 500000, bonus: 0.4 }, "vip": { price: 10000000, bonus: 4.1 }, "luxury": { price: 1000000000, bonus: 10.0 } };

const fishes = [ { name: "Giày rách", rate: 15, money: 100 }, { name: "Rác", rate: 10, money: 50 }, { name: "Giun", rate: 8, money: 200 }, { name: "Cá diêu hồng", rate: 7, money: 500 }, { name: "Cá thu", rate: 6, money: 1000 }, { name: "Cá vàng", rate: 5, money: 2000 }, { name: "Cá mực", rate: 5, money: 3000 }, { name: "Cá đuối", rate: 4, money: 5000 }, { name: "Cá vây xanh", rate: 3, money: 7000 }, { name: "Cá tiên", rate: 1, money: 50000 }, { name: "Cá sấu", rate: 1, money: 100000 }, { name: "Lươn điện", rate: 0.8, money: 200000 }, { name: "Cá rồng", rate: 0.5, money: 1000000 }, { name: "Leviathan", rate: 0.3, money: 3000000 }, { name: "Cá mập", rate: 0.2, money: 5000000 }, { name: "Megalondon", rate: 0.1, money: 10000000 }, { name: "Thủy Ngân Long Vương", rate: 0.01, money: 10000000000, boss: true } ];

function loadData() { return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {}; }

function saveData(data) { fs.writeFileSync(path, JSON.stringify(data, null, 2)); }

function pickFish(bonus) { const totalRate = fishes.reduce((t, f) => t + f.rate + bonus, 0); let rand = Math.random() * totalRate; for (let fish of fishes) { rand -= fish.rate + bonus; if (rand <= 0) return fish; } return fishes[0]; }

module.exports.run = async function({ api, event, args, Currencies }) { const { threadID, senderID, messageID } = event; const data = loadData();

if (!data[senderID]) data[senderID] = { rod: "gỗ", money: 0 };

const user = data[senderID];

const send = msg => api.sendMessage(msg, threadID, messageID);

switch (args[0]) { case "shop": { const list = Object.entries(rods).map(([name, { price, bonus }]) => • ${name} - ${price.toLocaleString()} VND (tăng ${bonus * 100}% rate)).join("\n"); return send([ SHOP CẦN CÂU ]\n${list}); }

case "mua": {
  const name = args.slice(1).join(" ");
  if (!rods[name]) return send("Tên cần câu không tồn tại!");
  const cost = rods[name].price;
  const userMoney = await Currencies.getData(senderID).then(r => r.money);
  if (userMoney < cost) return send("Bạn không đủ tiền mua cần câu này!");
  user.rod = name;
  saveData(data);
  await Currencies.decreaseMoney(senderID, cost);
  return send(`Mua cần câu ${name} thành công!`);
}

case "info": {
  return send(`Bạn đang dùng cần câu: ${user.rod} | Tiền câu được: ${user.money.toLocaleString()} VND`);
}

case "top": {
  const top = Object.entries(data)
    .sort((a, b) => b[1].money - a[1].money)
    .slice(0, 10)
    .map(([id, d], i) => `${i + 1}. ${id} - ${d.money.toLocaleString()} VND`).join("\n");
  return send(`[ BXH CÂU CÁ ]\n${top}`);
}

default: {
  const rod = user.rod;
  if (!rod || !rods[rod]) return send("Bạn chưa có cần câu, hãy dùng '/cauca shop' để xem và '/cauca mua [tên]' để mua.");

  send("Đang thả mồi chờ cá cắn câu...");
  await delay(10000);

  const fish = pickFish(rods[rod].bonus);
  user.money += fish.money;
  saveData(data);
  await Currencies.increaseMoney(senderID, fish.money);

  if (fish.boss) {
    return api.sendMessage({
      body: `⚠️ 𝑩𝑶𝑺𝑺 ĐÃ CẮN CÂU ⚠️\n@${event.senderID} đã câu được con cá BOSS: ${fish.name}!!\nGiá trị: ${fish.money.toLocaleString()} VND!!`,
      mentions: [{ tag: "@all", id: senderID }],
      emoji: "\uD83D\uDEA8"
    }, threadID);
  }

  return send(`Bạn đã câu được: ${fish.name} và nhận được ${fish.money.toLocaleString()} VND.`);
}

} };

