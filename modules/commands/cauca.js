module.exports.config = { name: "cauca", version: "1.1.0", hasPermssion: 0, credits: "Dat Thanh", description: "Câu cá nhận thưởng với cần câu nâng cấp", commandCategory: "game", usages: "/cauca, /cauca shop, /cauca mua [tên], /cauca info, /cauca top", cooldowns: 5 };

const fs = require("fs-extra"); const path = require("path"); const dataPath = path.join(__dirname, "cauca_data.json");

const rods = { "gỗ": { price: 1000, bonus: 0.1 }, "bạc": { price: 10000, bonus: 0.2 }, "vàng": { price: 50000, bonus: 0.3 }, "kim cương": { price: 500000, bonus: 0.5 }, "vip": { price: 10000000, bonus: 4.1 }, "luxury": { price: 1000000000, bonus: 10.0 } };

const fishes = [ { name: "Thủy Ngân Long Vương", rate: 0.01, reward: 10000000000, icon: "🐉", boss: true }, { name: "Megalondon", rate: 0.3, reward: 8000000, icon: "🦈", boss: true }, { name: "Mega cá mập", rate: 0.3, reward: 7000000, icon: "🦈", boss: true }, { name: "Cá rồng", rate: 0.4, reward: 6000000, icon: "🐲", boss: true }, { name: "Leviathan", rate: 0.4, reward: 5500000, icon: "🐉", boss: true }, { name: "Cá mập", rate: 1, reward: 1500000, icon: "🦈" }, { name: "Cá tiên", rate: 1.5, reward: 1000000, icon: "🧚‍♀️" }, { name: "Mực khổng lồ", rate: 1.5, reward: 900000, icon: "🦑" }, { name: "Bạch tuột", rate: 2, reward: 800000, icon: "🐙" }, { name: "Mực", rate: 2.5, reward: 600000, icon: "🦑" }, { name: "Cá đuối", rate: 3, reward: 400000, icon: "🐟" }, { name: "Cá thu", rate: 4, reward: 200000, icon: "🐟" }, { name: "Cá diêu hồng", rate: 5, reward: 100000, icon: "🐠" }, { name: "Cá vàng", rate: 6, reward: 50000, icon: "🐡" }, { name: "Lươn điện", rate: 7, reward: 20000, icon: "⚡" }, { name: "Cá vây xanh", rate: 9, reward: 10000, icon: "🐟" }, { name: "Cá muối", rate: 10, reward: 5000, icon: "🧂" }, { name: "Giun", rate: 12, reward: 1000, icon: "🪱" }, { name: "Giày", rate: 15, reward: 500, icon: "👟" }, { name: "Rác", rate: 18, reward: 200, icon: "🗑️" } ];

function loadData() { try { return JSON.parse(fs.readFileSync(dataPath)); } catch { return {}; } }

function saveData(data) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }

module.exports.run = async ({ event, api, args, Users }) => { const { senderID, threadID, messageID } = event; const data = loadData(); if (!data[senderID]) data[senderID] = { rod: null, money: 0 }; const user = data[senderID];

switch (args[0]) { case "shop": { const list = Object.entries(rods).map(([name, { price, bonus }]) => • ${name} - ${price.toLocaleString()} VND (tăng ${(bonus * 100).toFixed(1)}% rate)).join("\n"); return api.sendMessage([ SHOP CẦN CÂU ]\n${list}, threadID, messageID); } case "mua": { const rodName = args.slice(1).join(" ").toLowerCase(); if (!rods[rodName]) return api.sendMessage("Không tìm thấy cần câu đó!", threadID, messageID); if (user.money < rods[rodName].price) return api.sendMessage("Bạn không đủ tiền để mua cần câu này!", threadID, messageID); user.rod = rodName; user.money -= rods[rodName].price; saveData(data); return api.sendMessage(Mua thành công cần câu ${rodName}!, threadID, messageID); } case "info": { return api.sendMessage(Cần câu hiện tại: ${user.rod || "Chưa có"}\nTổng tiền câu: ${user.money.toLocaleString()} VND, threadID, messageID); } case "top": { const top = Object.entries(data) .sort((a, b) => b[1].money - a[1].money) .slice(0, 10) .map(async ([id, info], i) => ${i + 1}. ${(await Users.getNameUser(id)) || "Người dùng"} - ${info.money.toLocaleString()} VND); const topMsg = (await Promise.all(top)).join("\n"); return api.sendMessage([ BẢNG XẾP HẠNG ]\n${topMsg}, threadID, messageID); } default: { if (!user.rod) return api.sendMessage("Bạn chưa có cần câu, hãy dùng '/cauca shop' để xem và mua!", threadID, messageID);

api.sendMessage("Đang thả mồi chờ cá cắn câu...", threadID, async () => {
    await new Promise(res => setTimeout(res, 10000));

    const rodBonus = rods[user.rod].bonus;
    const rate = Math.random() * 100;
    let caught;
    let chance = 0;

    for (const fish of fishes) {
      chance += fish.rate + rodBonus;
      if (rate <= chance) {
        caught = fish;
        break;
      }
    }

    if (!caught) caught = { name: "Không có gì...", reward: 0, icon: "❌" };

    user.money += caught.reward;
    saveData(data);

    if (caught.name === "Thủy Ngân Long Vương") {
      const name = await Users.getNameUser(senderID);
      return api.sendMessage({ body: `⚜️ [BOSS] ${name} đã câu được ${caught.icon} 𝗧𝗛𝗨̉𝗬 𝗡𝗚𝗔̂𝗡 𝗟𝗢𝗡𝗚 𝗩𝗨̛𝗢̛𝗡𝗚 và nhận ${caught.reward.toLocaleString()} VND!!`, mentions: [{ id: senderID, tag: name }] }, threadID);
    }

    if (caught.boss) {
      return api.sendMessage(`${caught.icon} Bạn đã câu được cá boss [${caught.name}] và nhận ${caught.reward.toLocaleString()} VND!`, threadID);
    }

    return api.sendMessage(`${caught.icon} Bạn đã câu được ${caught.name} và nhận ${caught.reward.toLocaleString()} VND!`, threadID);
  });
}

} };

