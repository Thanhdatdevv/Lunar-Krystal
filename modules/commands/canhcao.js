const fs = require("fs");
const path = __dirname + "/canhbao-data.json";

const toxicWords = ["đụ", "lồn", "cặc", "chịch", "vú"];

module.exports = {
  config: {
    name: "canhbao",
    version: "1.1",
    hasPermission: 1,
    credits: "DatThanh",
    description: "Cảnh báo khi nhắn tục, tự kick và quản lý vi phạm",
    commandCategory: "Quản trị nhóm",
    usages: "/canhbao listvipham | del [reply hoặc UID] | kick [reply hoặc UID]",
    cooldowns: 5,
  },

  handleEvent: async function ({ api, event }) {
    const body = event.body?.toLowerCase();
    if (!body || !toxicWords.some(w => body.includes(w))) return;
    if (event.senderID == api.getCurrentUserID()) return;

    const uid = event.senderID;
    const name = (await api.getUserInfo(uid))[uid]?.name || "Không rõ";
    const threadID = event.threadID;

    let data = {};
    if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path));
    if (!data[uid]) data[uid] = { name, count: 0, history: [] };

    data[uid].count++;
    data[uid].history.push(event.body);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    const msg = `⚠️ @${name}, bạn vi phạm ngôn từ (${data[uid].count}/3 lần)!`;
    api.sendMessage({ body: msg, mentions: [{ tag: name, id: uid }] }, threadID);

    if (data[uid].count >= 3) {
      api.sendMessage(`❌ ${name} bị kick do vi phạm quá 3 lần!`, threadID, () => {
        api.removeUserFromGroup(uid, threadID);
        delete data[uid];
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
      });
    }
  },

  run: async function ({ api, event, args }) {
    const data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
    const { threadID, messageReply } = event;
    const [action, targetUID] = args;

    if (action === "listvipham") {
      if (Object.keys(data).length === 0)
        return api.sendMessage("✅ Không có ai vi phạm.", threadID);

      let msg = "📋 Danh sách vi phạm:\n\n";
      for (const id in data) {
        const u = data[id];
        const lines = u.history.slice(-3).map((t, i) => `${i + 1}. "${t}"`).join("\n");
        msg += `• ${u.name} (UID: ${id})\n- Lần: ${u.count}\n- Gần nhất:\n${lines}\n\n`;
      }
      return api.sendMessage(msg.trim(), threadID);
    }

    if (!["del", "kick"].includes(action))
      return api.sendMessage("Dùng:\n/canhbao listvipham\n/canhbao del [reply hoặc UID]\n/canhbao kick [reply hoặc UID]", threadID);

    let uid = targetUID || (messageReply ? messageReply.senderID : null);
    if (!uid) return api.sendMessage("Bạn cần reply tin nhắn hoặc nhập UID!", threadID);

    const name = data[uid]?.name || uid;

    if (!data[uid]) return api.sendMessage("Không tìm thấy người này trong danh sách vi phạm.", threadID);

    if (action === "del") {
      delete data[uid];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage(`✅ Đã xoá lịch sử vi phạm của ${name}`, threadID);
    }

    if (action === "kick") {
      api.removeUserFromGroup(uid, threadID, err => {
        if (err) return api.sendMessage("Không thể kick người dùng.", threadID);
        delete data[uid];
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        return api.sendMessage(`❌ Đã kick ${name} và xoá khỏi danh sách.`, threadID);
      });
    }
  }
};
