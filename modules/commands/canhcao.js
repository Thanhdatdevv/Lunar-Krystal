const fs = require("fs");
const path = __dirname + "/cache/violations.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

module.exports = {
  config: {
    name: "canhbao",
    version: "1.0",
    hasPermission: 1,
    credits: "Dat Thanh",
    description: "Cảnh báo khi người dùng chửi tục và xử lý khi vi phạm quá giới hạn",
    commandCategory: "group-admin",
    usages: "[listvipham | del <UID> | kick <UID>]",
    cooldowns: 1,
  },

  handleEvent: async function ({ event, api }) {
    const { threadID, senderID, body } = event;
    if (!body) return;

    const tuCam = ["lồn", "cặc", "đụ", "chịch"];
    const text = body.toLowerCase();
    const viPham = tuCam.filter(tu => text.includes(tu));
    if (viPham.length === 0) return;

    let data = JSON.parse(fs.readFileSync(path));
    if (!data[senderID]) data[senderID] = [];

    data[senderID].push(...viPham);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    const soLan = data[senderID].length;

    const name = await api.getUserInfo(senderID).then(res => res[senderID].name);

    const msg = {
      body: `⚠️ @${name} vừa sử dụng từ ngữ không phù hợp: [${viPham.join(", ")}]\n` +
            `Đã vi phạm ${soLan} lần.\n` +
            (soLan >= 3 ? "Bạn đã vượt quá số lần cho phép, tạm biệt!" : "Nếu còn tiếp tục sẽ bị đuổi khỏi nhóm."),
      mentions: [{
        tag: `@${name}`,
        id: senderID
      }]
    };

    await api.sendMessage(msg, threadID);

    if (soLan >= 3) {
      try {
        await api.removeUserFromGroup(senderID, threadID);
      } catch (err) {
        await api.sendMessage(`Không thể kick ${name}. Bot cần quyền quản trị viên.`, threadID);
      }
    }
  },

  run: async function ({ event, api, args }) {
    const { threadID, messageID } = event;
    const data = JSON.parse(fs.readFileSync(path));

    const cmd = args[0];
    const targetID = args[1];

    if (cmd === "listvipham") {
      if (Object.keys(data).length === 0) return api.sendMessage("Không có ai vi phạm.", threadID, messageID);

      let msg = "=== Danh sách người vi phạm ===\n";
      for (const [uid, list] of Object.entries(data)) {
        const name = await api.getUserInfo(uid).then(res => res[uid]?.name || "Không rõ");
        msg += `• ${name} (${uid}): ${list.length} lần\n`;
      }

      return api.sendMessage(msg, threadID, messageID);
    }

    if (cmd === "del" && targetID) {
      delete data[targetID];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage(`Đã xoá lịch sử vi phạm của UID: ${targetID}`, threadID, messageID);
    }

    if (cmd === "kick" && targetID) {
      delete data[targetID];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      try {
        await api.removeUserFromGroup(targetID, threadID);
        return api.sendMessage(`Đã xoá và kick UID: ${targetID}`, threadID, messageID);
      } catch (err) {
        return api.sendMessage("Không thể kick. Bot không đủ quyền.", threadID, messageID);
      }
    }

    return api.sendMessage("Sai cú pháp. Dùng: listvipham, del <UID>, kick <UID>", threadID, messageID);
  }
};
