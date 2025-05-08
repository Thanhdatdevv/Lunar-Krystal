const fs = require("fs");
const lotoData = {}; // Tạm thời lưu trong bộ nhớ, không dùng database

module.exports.config = {
  name: "loto",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Chơi lô tô - Đoán số may mắn từ 00-99",
  commandCategory: "game",
  usages: "/loto <số>",
  cooldowns: 3
};

function fancyTitle(title) {
  return `「 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛𝗔̀ 𝗧𝗛𝗔𝗡𝗛 」\n== 『 ${title} 』 ==`;
}

function getRandomLotoNumber() {
  return Math.floor(Math.random() * 100).toString().padStart(2, "0");
}

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, senderID, messageID } = event;

  if (!args[0]) return api.sendMessage("Vui lòng nhập một số từ 00 - 99 để đánh lô.", threadID, messageID);

  const betNumber = args[0].padStart(2, "0");
  if (!/^\d{2}$/.test(betNumber)) return api.sendMessage("Số không hợp lệ, vui lòng nhập số có 2 chữ số (00 - 99).", threadID, messageID);

  const betAmount = 1000000; // Mỗi lần chơi tốn 10.000 VNĐ

  const money = (await Currencies.getData(senderID)).money || 0;
  if (money < betAmount) return api.sendMessage("Bạn không đủ tiền để đánh lô (1.000.000VNĐ/lượt).", threadID, messageID);

  // Trừ tiền trước
  await Currencies.decreaseMoney(senderID, betAmount);

  // Quay số
  const result = getRandomLotoNumber();

  const win = betNumber === result;
  const reward = betAmount * 2;

  let msg = fancyTitle("𝐋Ô 𝐓Ô - Đ𝐎𝐀́𝐍 𝐒𝐎̂́ 𝐌𝐀𝐘 𝐌𝐀̆́𝐍") + "\n\n";
  msg += `➤ Số bạn chọn: ${betNumber}\n`;
  msg += `➤ Số xổ ra: ${result}\n`;

  if (win) {
    await Currencies.increaseMoney(senderID, reward);
    msg += `\n🎉 Chúc mừng bạn đã TRÚNG LÔ!\n➤ Nhận được: +${reward} VNĐ`;
  } else {
    msg += `\n💸 Rất tiếc, bạn không trúng. Mất ${betAmount} VNĐ`;
  }

  msg += `\n\n🧧 Hãy tiếp tục thử vận may cùng 𝗡𝗵𝗮̀ 𝗧𝗵𝗮𝗻𝗵!`;

  return api.sendMessage(msg, threadID, messageID);
};
