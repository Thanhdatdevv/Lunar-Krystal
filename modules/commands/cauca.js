const fs = require("fs-extra"); const path = require("path"); const { getStreamFromURL } = global.utils;

const dataPath = path.join(__dirname, "cauca", "data.json"); const delay = (ms) => new Promise((res) => setTimeout(res, ms));

if (!fs.existsSync(path.dirname(dataPath))) fs.mkdirSync(path.dirname(dataPath)); if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}), "utf-8");

const caList = [ { name: "Giày", rate: 12, reward: 0 }, { name: "Rác", rate: 12, reward: 0 }, { name: "Giun", rate: 10, reward: 1000 }, { name: "Cá muối", rate: 10, reward: 5000 }, { name: "Cá thu", rate: 8, reward: 8000 }, { name: "Cá diêu hồng", rate: 7, reward: 9000 }, { name: "Mực", rate: 6, reward: 12000 }, { name: "Bạch tuột", rate: 5, reward: 15000 }, { name: "Cá đuối", rate: 4, reward: 17000 }, { name: "Cá vàng", rate: 3.5, reward: 20000 }, { name: "Cá vây xanh", rate: 2.5, reward: 25000 }, { name: "Cá mập", rate: 2, reward: 30000 }, { name: "Cá sấu", rate: 1.5, reward: 40000 }, { name: "Lươn điện", rate: 1.2, reward: 50000 }, { name: "Cá rồng", rate: 0.5, reward: 500000 }, { name: "Leviathan", rate: 0.4, reward: 600000 }, { name: "Mega cá mập", rate: 0.3, reward: 700000 }, { name: "Mặc khổng lồ", rate: 0.3, reward: 700000 }, { name: "Megalondon", rate: 0.3, reward: 700000 }, { name: "Cá tiên", rate: 0.2, reward: 800000 }, { name: "Thủy Ngân Long Vương", rate: 0.01, reward: 10000000000, isBoss: true } ];

const rods = { "gỗ": { name: "Cần câu gỗ", bonus: 0, price: 0 }, "bạc": { name: "Cần câu bạc", bonus: 0.1, price: 5000 }, "vàng": { name: "Cần câu vàng", bonus: 0.2, price: 50000 }, "kim cương": { name: "Cần câu kim cương", bonus: 0.3, price: 200000 }, "vip": { name: "Cần câu VIP", bonus: 0.41, price: 10000000 }, "luxury": { name: "Cần câu Luxury", bonus: 1.0, price: 1000000000 } };

module.exports = { config: { name: "cauca", version: "1.1", author: "Dat Thanh", description: "Câu cá kiếm tiền, có shop và top!", usages: "/cauca hoặc /cauca shop, mua [tên], info, top", commandCategory: "game", cooldowns: 5 },

onStart: async ({ event, message, args, usersData }) => { const uid = event.senderID; const data = JSON.parse(fs.readFileSync(dataPath)); if (!data[uid]) data[uid] = { rod: null, money: 0, caught: [] };

const send = (msg) => message.reply(msg);

const save = () => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

const getRandomFish = (bonus) => {
  const roll = Math.random() * 100;
  let total = 0;
  for (const fish of caList.sort((a, b) => a.rate - b.rate)) {
    total += fish.rate + bonus;
    if (roll < total) return fish;
  }
  return caList[0];
};

if (args[0] === "shop") {
  let msg = "[ 𝗦𝗛𝗢𝗣 𝗖𝗔̂̀𝗡 𝗖𝗔̂𝗨 ]\n";
  for (const [key, rod] of Object.entries(rods)) {
    msg += `→ ${rod.name} | +${Math.floor(rod.bonus * 100)}% | ${rod.price.toLocaleString()} VND\n`;
  }
  return send(msg);
}

if (args[0] === "mua") {
  const loai = args.slice(1).join(" ").toLowerCase();
  if (!rods[loai]) return send("Không tìm thấy loại cần câu này!");
  if (data[uid].money < rods[loai].price) return send("Bạn không đủ tiền để mua!");
  data[uid].money -= rods[loai].price;
  data[uid].rod = loai;
  save();
  return send(`Bạn đã mua ${rods[loai].name}`);
}

if (args[0] === "info") {
  const rod = data[uid].rod ? rods[data[uid].rod].name : "Chưa có";
  const caught = data[uid].caught.length;
  return send(`→ Cần câu: ${rod}\n→ Cá đã câu: ${caught}\n→ Tiền: ${data[uid].money.toLocaleString()} VND`);
}

if (args[0] === "top") {
  const sorted = Object.entries(data).sort((a, b) => b[1].money - a[1].money).slice(0, 10);
  let msg = "[ 𝗧𝗢𝗣 𝗧𝗥𝗔𝗜 𝗖𝗔́ 𝗩𝗔̀𝗡𝗚 ]\n";
  for (let i = 0; i < sorted.length; i++) {
    const name = (await usersData.get(sorted[i][0])).name;
    msg += `#${i + 1}. ${name} - ${sorted[i][1].money.toLocaleString()} VND\n`;
  }
  return send(msg);
}

// Bắt đầu câu cá
if (!data[uid].rod) return send("Bạn chưa có cần câu. Dùng '/cauca shop' để xem và '/cauca mua [tên]' để mua!");

send("Đang thả mồi... chờ cá cắn câu...");
await delay(10000);

const bonus = rods[data[uid].rod].bonus * 100;
const fish = getRandomFish(bonus);
data[uid].money += fish.reward;
data[uid].caught.push(fish.name);
save();

if (fish.name === "Thủy Ngân Long Vương") {
  return message.send({
    body: `» 𝐁𝐎𝐒𝐒 𝐂𝐀́ 𝐓𝐇𝐔̛𝐎̛̣𝐍𝐆 «\n@everyone\n${event.senderName} đã câu được 𝗧𝗛𝗨̉𝗬 𝗡𝗚𝗔̂𝗡 𝗟𝗢𝗡𝗚 𝗩𝗨̛𝗢̛𝗡𝗚!!\nNhận được ${fish.reward.toLocaleString()} VND!`,
    mentions: [{ tag: "@everyone", id: uid }]
  });
}

const icon = fish.isBoss ? "🐉" : "🐟";
return send(`${icon} Bạn đã câu được ${fish.name} và nhận được ${fish.reward.toLocaleString()} VND!`);

} };

