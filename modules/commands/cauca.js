module.exports.config = {
  name: "cauca",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "GPT sửa từ Hòa",
  description: "Game câu cá, mua cần và bắt boss",
  commandCategory: "game",
  usages: "[shop | mua <tên> | info | top]",
  cooldowns: 5,
};

const fs = require("fs");
const path = __dirname + "/cache/fishData.json";

const rods = {
  thường: { price: 0, bonus: 0 },
  tốt: { price: 1000, bonus: 0.05 },
  vip: { price: 5000, bonus: 0.1 },
  truyền_thuyết: { price: 10000, bonus: 0.2 }
};

const fishList = [
  { name: "Thủy Ngân Long Vương", price: 100000000 }, // boss
  { name: "cá rô", price: 100 },
  { name: "cá chép", price: 300 },
  { name: "cá ngừ", price: 500 },
  { name: "cá hồi", price: 1000 },
  { name: "rùa vàng", price: 5000 },
  { name: "cá mập", price: 10000 }
];

function loadData() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");
  return JSON.parse(fs.readFileSync(path));
}

function saveData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const data = loadData();
  const user = data[senderID] || { rod: "thường", money: 0 };
  data[senderID] = user;

  switch (args[0]) {
    case "shop": {
      const list = Object.entries(rods)
        .map(([name, { price, bonus }]) =>
          `• ${name} - ${price.toLocaleString()} VND (tăng ${(bonus * 100).toFixed(1)}% rate)`
        ).join("\n");
      return api.sendMessage(`[ SHOP CẦN CÂU ]\n${list}`, threadID, messageID);
    }

    case "mua": {
      const rodName = args.slice(1).join(" ").toLowerCase();
      if (!rods[rodName])
        return api.sendMessage("Không tìm thấy cần câu đó!", threadID, messageID);
      if (user.money < rods[rodName].price)
        return api.sendMessage("Bạn không đủ tiền để mua cần câu này!", threadID, messageID);
      user.rod = rodName;
      user.money -= rods[rodName].price;
      saveData(data);
      return api.sendMessage(`Mua thành công cần câu ${rodName}!`, threadID, messageID);
    }

    case "info": {
      return api.sendMessage(
        `Cần câu hiện tại: ${user.rod || "Chưa có"}\nTổng tiền câu: ${user.money.toLocaleString()} VND`,
        threadID, messageID
      );
    }

    case "top": {
      const top = Object.entries(data)
        .sort((a, b) => b[1].money - a[1].money)
        .slice(0, 10)
        .map(async ([id, info], i) =>
          `${i + 1}. ${(await Users.getNameUser(id)) || "Người dùng"} - ${info.money.toLocaleString()} VND`
        );
      const topMsg = (await Promise.all(top)).join("\n");
      return api.sendMessage(`[ BẢNG XẾP HẠNG ]\n${topMsg}`, threadID, messageID);
    }

    default: {
      if (!user.rod)
        return api.sendMessage("Bạn chưa có cần câu, hãy dùng '/cauca shop' để xem và mua!", threadID, messageID);

      const luck = Math.random() + rods[user.rod].bonus;

      let fish;
      if (luck > 0.99) {
        fish = fishList[0]; // Boss
      } else if (luck > 0.95) {
        fish = fishList[6]; // cá mập
      } else if (luck > 0.85) {
        fish = fishList[5]; // rùa vàng
      } else if (luck > 0.7) {
        fish = fishList[4]; // cá hồi
      } else if (luck > 0.5) {
        fish = fishList[3]; // cá ngừ
      } else if (luck > 0.3) {
        fish = fishList[2]; // cá chép
      } else {
        fish = fishList[1]; // cá rô
      }

      user.money += fish.price;
      saveData(data);

      const msg = fish.name === "Thủy Ngân Long Vương"
        ? `BẠN ĐÃ CÂU ĐƯỢC BOSS [Thủy Ngân Long Vương]!!!\nGiá trị: ${fish.price.toLocaleString()} VND!\nMột cú vung cần đi vào lịch sử!`
        : `Bạn vừa câu được ${fish.name} và bán được ${fish.price.toLocaleString()} VND!`;
      return api.sendMessage(msg, threadID, messageID);
    }
  }
};
