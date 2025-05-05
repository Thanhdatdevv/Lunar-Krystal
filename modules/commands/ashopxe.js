const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "..", "..", "cache", "shopxe_data.json");
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({ users: {}, dsXe: [] }, null, 2));

const data = JSON.parse(fs.readFileSync(dataPath));

function genBienSo() {
  const num = Math.floor(Math.random() * 300) + 76000;
  return `RZX${num}`;
}

module.exports = {
  config: {
    name: "shopxe",
    version: "1.0.0",
    author: "GPT",
    description: "Quản lý shop xe ảo với nhiều mẫu xe",
    commandCategory: "Tiện ích",
    usages: "shopxe [list|muaxe|banxe|kho|menu|chuyenxe|gopxe]",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const [action, ...params] = args;

    switch (action) {
      case "list": {
        let msg = `\uD83C\uDFCE️ 𝗗𝗮𝗻𝗵 𝘀𝗮́𝗰𝗵 𝘅𝗲 𝗵𝗶𝗲̣̂𝗻 𝗰𝗼́:\n`;
        for (const xe of data.dsXe) {
          msg += `• ${xe.ten} - ${xe.gia.toLocaleString()} VND\n`;
        }
        return api.sendMessage(msg, threadID, messageID);
      }

      case "muaxe": {
        const tenXe = params.join(" ").trim();
        const xe = data.dsXe.find(x => x.ten.toLowerCase() === tenXe.toLowerCase());
        if (!xe) return api.sendMessage("\u274C Xe không tồn tại!", threadID, messageID);

        const bienSo = genBienSo();
        const ngayMua = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

        if (!data.users[senderID]) data.users[senderID] = { kho: [] };
        data.users[senderID].kho.push({ ...xe, bienSo, ngayMua });
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        return api.sendMessage(
          `\u2705 Bạn đã mua thành công xe: ${xe.ten}\n\n--- 𝗚𝗶𝗮̂́𝘆 𝗰𝗵𝘂𝘆𝗲̂̉𝗻 𝗻𝗵𝘂̛𝗼̛̣𝗻𝗴 ---\n𝗧𝗲̂𝗻 𝗰𝗵𝘂̉ 𝘀𝗼̛̉ 𝗵𝘂̛̃𝘂: ${event.senderName}\n𝗖𝗖𝗖𝗗: ${senderID}\n𝗡𝗴𝗮̀𝘆 𝗴𝗶𝗼̛̀ 𝗺𝘂𝗮: ${ngayMua}\n𝗕𝗶𝗲̂̉𝗻 𝘀𝗼̂́: ${bienSo}`,
          threadID, messageID
        );
      }

      case "kho": {
        const kho = data.users[senderID]?.kho || [];
        if (!kho.length) return api.sendMessage("\u26FD️ Kho xe của bạn đang trống!", threadID, messageID);

        let msg = `\uD83D\uDE97 𝗞𝗵𝗼 𝘅𝗲 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻:\n`;
        for (const xe of kho) {
          msg += `• ${xe.ten} - ${xe.bienSo}\n`;
        }
        return api.sendMessage(msg, threadID, messageID);
      }
if (subcmd === "chuyenxe") { if (data[senderID].length === 0) return api.sendMessage("Bạn không có xe để chuyển.", threadID, messageID); const mentionID = Object.keys(mentions)[0]; if (!mentionID) return api.sendMessage("Vui lòng tag người nhận xe.", threadID, messageID);

const xe = data[senderID][0]; // chuyển chiếc đầu tiên
const tenNguoiNhan = mentions[mentionID];

const msg = `[ 𝗚𝗶𝗮̂́𝘆 𝗖𝗵𝘂𝘆𝗲̂̉𝗻 𝗡𝗵𝘂̛𝗼̛̣𝗻𝗴 𝗫𝗲 ] \nBạn thật sự muốn chuyển xe ${xe.ten} cho ${tenNguoiNhan}?\nThả tim vào tin nhắn này để xác nhận.`;
return api.sendMessage(msg, threadID, (err, info) => {
  global.handleReaction.push({
    name: this.config.name,
    messageID: info.messageID,
    author: senderID,
    type: 'chuyenxe',
    data: { tenXe: xe.ten, bienSo: xe.bienSo, receiverID: mentionID }
  });
}, messageID);

} 
      case "menu": {
        return api.sendMessage(`\uD83D\uDCCB 𝗠𝗲𝗻𝘂 𝗦𝗵𝗼𝗽 𝗫𝗲\n
• /shopxe list - Xem danh sách xe\n• /shopxe muaxe <tên xe> - Mua xe\n• /shopxe kho - Xem kho xe\n• /shopxe banxe <tên xe> - Bán xe\n• /shopxe chuyenxe @tag - Chuyển xe\n• /shopxe gopxe <tên xe> - Mua trả góp`, threadID, messageID);
      }
 // Các lệnh khác như banxe, chuyenxe, gopxe có thể thêm sau

      default: return api.sendMessage("\u2753 Lệnh không hợp lệ, dùng /shopxe menu để xem hướng dẫn.", threadID, messageID);
    }
  }
};
