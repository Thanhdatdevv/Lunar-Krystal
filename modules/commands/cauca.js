const fs = require("fs-extra");
const path = require("path");

const fishes = [
  { name: "Giun", rate: 20, money: 500 },
  { name: "Rác", rate: 18, money: 100 },
  { name: "Giày", rate: 15, money: 200 },
  { name: "Cá diêu hồng", rate: 10, money: 2000 },
  { name: "Cá thu", rate: 9, money: 2500 },
  { name: "Cá vàng", rate: 8, money: 3000 },
  { name: "Mực", rate: 7, money: 4000 },
  { name: "Cá đuối", rate: 5, money: 7000 },
  { name: "Cá vây xanh", rate: 3, money: 10000 },
  { name: "Cá muối", rate: 2, money: 20000 },
  { name: "Cá sấu", rate: 1.5, money: 30000 },
  { name: "Lương điện", rate: 1, money: 40000 },
  { name: "Bạch tuột", rate: 0.8, money: 50000 },
  { name: "Mực khổng lồ", rate: 0.5, money: 80000 },
  { name: "Cá mập", rate: 0.4, money: 100000 },
  { name: "Megalondon", rate: 0.3, money: 500000 },
  { name: "Mega cá mập", rate: 0.3, money: 500000 },
  { name: "Cá rồng", rate: 0.3, money: 500000 },
  { name: "Leviathan", rate: 0.3, money: 500000 },
  { name: "Cá tiên", rate: 0.5, money: 1000000 },
  {
    name: "THỦY NGÂN LONG VƯƠNG",
    rate: 0.01,
    money: 10000000000,
    boss: true,
    notifyAll: true,
    special: true
  }
];

const rods = {
  "gỗ": 0,
  "bạc": 10,
  "vàng": 20,
  "kim cương": 30,
  "VIP": 15,
  "Luxury": 40
};

const rodPrices = {
  "gỗ": 1000,
  "bạc": 10000,
  "vàng": 50000,
  "kim cương": 200000,
  "VIP": 10000000,
  "Luxury": 1000000000
};

module.exports = {
  config: {
    name: "cauca",
    version: "1.1",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Câu cá kiếm tiền",
    commandCategory: "giải trí",
    usages: "[buy/tên cần] hoặc để câu",
    cooldowns: 5,
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const dataPath = path.join(__dirname, "cache", "caucadb.json");

    let userData = {};
    if (fs.existsSync(dataPath)) {
      userData = JSON.parse(fs.readFileSync(dataPath));
    }

    if (!userData[senderID]) {
      userData[senderID] = {
        rod: null,
        money: 0
      };
    }

    const user = userData[senderID];

    if (args[0] === "buy") {
      const rodName = args.slice(1).join(" ").toLowerCase();
      if (!rods.hasOwnProperty(rodName)) {
        return api.sendMessage("Tên cần câu không hợp lệ! Các loại cần: " + Object.keys(rods).join(", "), threadID, messageID);
      }

      const price = rodPrices[rodName];

      if (user.money < price) {
        return api.sendMessage(`Bạn không đủ tiền mua cần câu ${rodName.toUpperCase()} (${price.toLocaleString()} VNĐ)`, threadID, messageID);
      }

      user.money -= price;
      user.rod = rodName;
      fs.writeFileSync(dataPath, JSON.stringify(userData, null, 2));
      return api.sendMessage(`Bạn đã mua thành công cần câu ${rodName.toUpperCase()}!`, threadID, messageID);
    }

    if (!user.rod) {
      return api.sendMessage("Bạn chưa có cần câu! Dùng /cauca buy [tên cần] để mua.", threadID, messageID);
    }

    const bonus = rods[user.rod];
    let rand = Math.random() * 100;
    let foundFish = null;

    for (const fish of fishes) {
      const adjustedRate = fish.rate + bonus * (fish.rate / 100);
      if (rand <= adjustedRate) {
        foundFish = fish;
        break;
      } else {
        rand -= adjustedRate;
      }
    }

    if (!foundFish) {
      foundFish = { name: "RÁC", money: 0 };
    }

    user.money += foundFish.money;
    fs.writeFileSync(dataPath, JSON.stringify(userData, null, 2));

    const formattedMoney = `${foundFish.money.toLocaleString()} VNĐ`;

    if (foundFish.notifyAll && foundFish.special) {
      const name = (await usersData.get(senderID)).name || "Người dùng";
      api.sendMessage(
        `━━━━━━━━━━━━━━━\n` +
        `🌊 𝗧𝗛𝗨̉𝗬 𝗡𝗚𝗔̂𝗡 𝗟𝗢𝗡𝗚 𝗩𝗨̛𝗢̛𝗡𝗚 🌊\n` +
        `━━━━━━━━━━━━━━━\n` +
        `💥 ${name.toUpperCase()} vừa câu trúng cá truyền thuyết:\n` +
        `⚜️ 𝗧𝗛𝗨̉𝗬 𝗡𝗚𝗔̂𝗡 𝗟𝗢𝗡𝗚 𝗩𝗨̛𝗢̛𝗡𝗚 ⚜️\n` +
        `💰 Nhận ngay: ${formattedMoney}\n` +
        `━━━━━━━━━━━━━━━`,
        threadID,
        () => {
          api.getThreadInfo(threadID, (err, info) => {
            if (!err && info.participantIDs) {
              api.sendMessage({ body: "@all", mentions: info.participantIDs.map(id => ({ id })) }, threadID);
              api.sendMessage({ body: "THẢ EMOJI!", emoji: "🐉" }, threadID);
            }
          });
        }
      );
    } else if (foundFish.boss) {
      api.sendMessage(`🔥 Bạn đã câu được cá boss: ${foundFish.name} và nhận được ${formattedMoney}! 🔥`, threadID, () => {
        api.sendMessage({ body: "", emoji: "⚡" }, threadID);
      });
    } else {
      api.sendMessage(
        `🎣 Bạn đã câu được: ${foundFish.name}\n💰 Nhận: ${formattedMoney}`,
        threadID,
        messageID
      );
    }
  }
};
