const fs = require("fs");
const path = __dirname + "/canhbao.json";

const forbiddenWords = ["đụ", "chịch", "lồn", "cặc", "vú"];
const maxWarnings = 3;

function loadData() {
  return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
}

function saveData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "canhcao",
    version: "3.0",
    hasPermission: 1,
    credits: "DatThanh",
    description: "Cảnh báo người vi phạm ngôn từ cấm và xử lý.",
    commandCategory: "group",
    usages: "[menu | listvipham | del | kick]",
    cooldowns: 3,
  },

  handleEvent: async ({ event, api, Users }) => {
    const { body, senderID, threadID, messageID } = event;
    if (!body || event.isGroup === false || senderID == api.getCurrentUserID()) return;

    const text = body.toLowerCase();
    const violatedWord = forbiddenWords.find(w => text.includes(w));
    if (!violatedWord) return;

    const data = loadData();
    data[senderID] = data[senderID] || { count: 0 };
    data[senderID].count += 1;
    saveData(data);

    const name = (await Users.getNameUser(senderID)) || "Không rõ";
    const count = data[senderID].count;

    // Thả emoji vào tin nhắn
    api.setMessageReaction("😡", event.messageID, () => {}, true);

    // Cảnh báo đẹp
    const warningText = `
━━━━━━━━━━━━━━━━━━━━
⚠️  𝗖𝗔̉𝗡𝗛 𝗕𝗔́𝗢 𝗩𝗜 𝗣𝗛𝗔̣𝗠  ⚠️
━━━━━━━━━━━━━━━━━━━━
👤  Người vi phạm: ${name}
🆔  UID: ${senderID}
❗  Từ bị cấm: "${violatedWord}"
📌  Lần vi phạm: ${count}/${maxWarnings}
━━━━━━━━━━━━━━━━━━━━
⚠️  Nếu vi phạm đủ ${maxWarnings} lần, bạn sẽ bị loại khỏi nhóm!`;

    api.sendMessage({
      body: warningText,
      mentions: [{ id: senderID, tag: name }]
    }, threadID, () => {
      if (count >= maxWarnings) {
        api.removeUserFromGroup(senderID, threadID);
        delete data[senderID];
        saveData(data);
      }
    }, messageID);
  },

  run: async ({ event, api, args, Users }) => {
    const { threadID, messageID, mentions, messageReply } = event;
    const sub = args[0];
    const data = loadData();

    // Menu lệnh
    if (!sub || sub.toLowerCase() === "menu") {
      const msg = `
━━━━━━━━━━━━━━
📜  𝐌𝐄𝐍𝐔 𝐂𝐀̉𝐍𝐇 𝐂𝐀́𝐎
━━━━━━━━━━━━━━
⚠️  Tự động cảnh báo khi có:
➡️  đụ | chịch | lồn | cặc | vú

🛠️  Lệnh quản lý:
• /canhcao listvipham – Xem người vi phạm
• /canhcao del [reply/tag/uid] – Xoá người khỏi danh sách
• /canhcao kick [reply/tag/uid] – Kick người khỏi nhóm
━━━━━━━━━━━━━━
⛔  Vi phạm 3 lần sẽ bị kick tự động!
      `;
      return api.sendMessage(msg, threadID, messageID);
    }

    // Lấy UID từ tag, reply hoặc args
    let targetID = Object.keys(mentions)[0] || (messageReply && messageReply.senderID) || args[1];
    if (!targetID) return api.sendMessage("Vui lòng reply, tag hoặc nhập UID.", threadID);

    const name = (await Users.getNameUser(targetID)) || "Không rõ";

    if (sub == "del") {
      if (!data[targetID]) return api.sendMessage("Người này không có trong danh sách vi phạm.", threadID);
      delete data[targetID];
      saveData(data);
      return api.sendMessage(`✅ Đã xoá ${name} (UID: ${targetID}) khỏi danh sách vi phạm.`, threadID);
    }

    if (sub == "kick") {
      if (!data[targetID]) return api.sendMessage("Không thấy người này trong danh sách vi phạm.", threadID);
      delete data[targetID];
      saveData(data);
      api.removeUserFromGroup(targetID, threadID, err => {
        if (err) return api.sendMessage("❌ Không thể kick người dùng này.", threadID);
        api.sendMessage(`🔨 Đã kick ${name} (UID: ${targetID}) khỏi nhóm.`, threadID);
      });
      return;
    }

    if (sub == "listvipham") {
      const list = Object.keys(data);
      if (!list.length) return api.sendMessage("✅ Không có ai vi phạm!", threadID);

      const msg = list.map((id, i) => 
        `#${i+1}. 👤 ${(await Users.getNameUser(id)) || "Không rõ"}\n🆔 UID: ${id}\n⚠️ Số lần vi phạm: ${data[id].count}`
      ).join("\n\n");

      return api.sendMessage(`📋 𝐃𝐀𝐍𝐇 𝐒𝐀́𝐂𝐇 𝐕𝐈 𝐏𝐇𝐀̣𝐌:\n━━━━━━━━━━━━━━\n${msg}`, threadID);
    }

    return api.sendMessage("Lệnh không hợp lệ. Dùng: /canhcao menu | listvipham | del | kick", threadID);
  }
};
