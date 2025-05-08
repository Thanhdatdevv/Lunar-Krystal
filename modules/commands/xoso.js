// Module Xổ Số - Casino Nhà Thanh
module.exports.config = {
  name: "xoso",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Chơi xổ số cùng bạn bè",
  commandCategory: "game",
  usages: "/xoso <mua|xosomoi|kiemtra>",
  cooldowns: 3
};

const lottery = {};

function generateTicket() {
  let ticket = [];
  for (let i = 0; i < 6; i++) {
    ticket.push(Math.floor(Math.random() * 10));  // Tạo số từ 0 đến 9
  }
  return ticket.join('');
}

function checkTicket(ticket, winningNumber) {
  return ticket === winningNumber;
}

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const type = args[0];

  if (!type) return api.sendMessage("[Casino Nhà Thanh] Hãy dùng lệnh: /xoso <mua|xosomoi|kiemtra>", threadID, messageID);

  if (!lottery[threadID]) lottery[threadID] = { tickets: [], winningNumber: null };

  switch (type) {
    case "mua": {
      const bet = parseInt(args[1]);
      if (isNaN(bet) || bet <= 0) return api.sendMessage("Hãy nhập số tiền cược hợp lệ.", threadID, messageID);
      
      const ticket = generateTicket();
      lottery[threadID].tickets.push({ senderID, ticket, bet });
      return api.sendMessage(`[Casino Nhà Thanh] Bạn đã mua vé số với số: ${ticket} và cược: ${bet} VNĐ. Chúc bạn may mắn!`, threadID, messageID);
    }

    case "xosomoi": {
      if (lottery[threadID].tickets.length === 0) return api.sendMessage("Chưa có người mua vé. Hãy để mọi người mua vé bằng lệnh /xoso mua <tiền>.", threadID, messageID);

      // Tạo ra một số trúng thưởng ngẫu nhiên
      const winningNumber = generateTicket();
      lottery[threadID].winningNumber = winningNumber;

      let winners = [];
      let totalPrize = 0;
      
      for (let ticket of lottery[threadID].tickets) {
        if (checkTicket(ticket.ticket, winningNumber)) {
          winners.push(ticket.senderID);
          totalPrize += ticket.bet;
        }
      }

      let resultMessage = "━━━━━━━━━━━━━━━\n       ♠️ XỔ SỐ CÙNG NHÀ THANH ♠️\n━━━━━━━━━━━━━━━\n";
      resultMessage += `Số trúng thưởng là: ${winningNumber}\n`;
      
      if (winners.length > 0) {
        resultMessage += "🥇 Những người thắng cuộc:\n";
        for (let winner of winners) {
          resultMessage += `- UID ${winner}\n`;
        }
        resultMessage += `Tổng tiền thưởng: ${totalPrize} VNĐ`;
      } else {
        resultMessage += "Không có người trúng thưởng lần này!";
      }

      // Xóa thông tin xổ số sau khi kết thúc
      delete lottery[threadID];
      return api.sendMessage(resultMessage + "\n━━━━━━━━━━━━━━━", threadID, messageID);
    }

    case "kiemtra": {
      const ticket = args[1];
      if (!ticket) return api.sendMessage("Hãy nhập số vé của bạn để kiểm tra!", threadID, messageID);

      let found = false;
      for (let entry of lottery[threadID].tickets) {
        if (entry.ticket === ticket && checkTicket(ticket, lottery[threadID].winningNumber)) {
          found = true;
          break;
        }
      }

      if (found) {
        return api.sendMessage(`Chúc mừng! Bạn đã trúng thưởng với số vé ${ticket}!\nSố trúng thưởng là: ${lottery[threadID].winningNumber}`, threadID, messageID);
      } else {
        return api.sendMessage(`Rất tiếc, vé số của bạn ${ticket} không trúng thưởng.\nSố trúng thưởng là: ${lottery[threadID].winningNumber}`, threadID, messageID);
      }
    }

    default:
      return api.sendMessage("Lệnh không hợp lệ, hãy dùng /xoso <mua|xosomoi|kiemtra>", threadID, messageID);
  }
};
