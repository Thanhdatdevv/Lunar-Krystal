const fs = require("fs");
const path = __dirname + "/canhbao-data.json";

module.exports = {
  config: {
    name: "canhbao",
    version: "1.0",
    hasPermission: 1,
    credits: "DatThanh",
    description: "Cảnh báo khi người dùng nhắn tục và quản lý vi phạm",
    commandCategory: "Quản trị nhóm",
    usages: "/canhbao listvipham | del UID | kick UID",
    cooldowns: 5,
  },

  handleEvent: async function ({ api, event }) {
    const toxicWords = ["lồn", "cặc","chịch", "đụ", "vú"];
    if (!event.body || !toxicWords.some(word => event.body.toLowerCase().includes(word))) return;
    if (event.senderID == api.getCurrentUserID()) return;

    const uid = event.senderID;
    const name = (await api.getUserInfo(uid))[uid]?.name || "Không rõ";
    const threadID = event.threadID;

    // Load data
    let data = {};
    if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path));
    if (!data[uid]) data[uid] = { name, count: 0, history: [] };

    // Cập nhật vi phạm
    data[uid].count++;
    data[uid].history.push(event.body);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    // Gửi cảnh báo
    const msg = `⚠️ @${name}, dcm văn hoá m chó tha à! (${data[uid].count}/3 lần vi phạm)`;
    api.sendMessage({ body: msg, mentions: [{ tag: name, id: uid }] }, threadID);

    // Kick nếu quá 3 lần
    if (data[uid].count >= 3) {
      api.sendMessage(`❌ ${name} đã bị kick do vi phạm quá 3 lần.`, threadID, () => {
        api.removeUserFromGroup(uid, threadID);
        delete data[uid];
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
      });
    }
  },

  run: async function ({ event, args, api }) {
    const data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
    const [action, uid] = args;

    if (action === "listvipham") {
      if (Object.keys(data).length === 0) return api.sendMessage("✅ Không có ai vi phạm.", event.threadID);

      let msg = "📋 Danh sách người vi phạm:\n\n";
      for (const id in data) {
        const name = data[id].name || id;
        const history = data[id].history.slice(-3).map((t, i) => `${i + 1}. "${t}"`).join("\n");
        msg += `• ${name} (UID: ${id})\n- Số lần: ${data[id].count}\n- Gần nhất:\n${history}\n\n`;
      }
      return api.sendMessage(msg.trim(), event.threadID);
    }

    if (!uid || !["del", "kick"].includes(action))
      return api.sendMessage("Dùng:\n/canhbao listvipham\n/canhbao del UID\n/canhbao kick UID", event.threadID);

    const name = data[uid]?.name || uid;

    if (action === "del") {
      delete data[uid];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage(`✅ Đã xoá lịch sử vi phạm của ${name}`, event.threadID);
    }

    if (action === "kick") {
      api.removeUserFromGroup(uid, event.threadID, err => {
        if (err) return api.sendMessage("Không thể kick người dùng.", event.threadID);
        delete data[uid];
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        return api.sendMessage(`❌ Đã kick ${name} và xoá khỏi danh sách vi phạm.`, event.threadID);
      });
    }
  }
};
