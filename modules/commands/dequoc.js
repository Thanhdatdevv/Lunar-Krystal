// dequoc.js - Module quản lý bộ lạc và nền văn minh

const fs = require("fs-extra");
const path = __dirname + "/dequoc.json";

// Tạo file dữ liệu nếu chưa có
if (!fs.existsSync(path)) fs.writeJsonSync(path, {});

const civilizationLevels = [
  "⚙️ Nền văn minh cổ đại",
  "⛏️ Nền văn minh đồng - sắt",
  "⚔️ Nền văn minh trung cổ",
  "🏰 Nền văn minh Empire",
  "⛵ Nền văn minh khai thác",
  "⚙️ Nền văn minh World War",
  "🚀 Nền văn minh hiện đại"
];

module.exports = {
  config: {
    name: "dequoc",
    version: "1.1.0",
    hasPermission: 0,
    credits: "Dat Thanht",
    description: "Quản lý bộ lạc và nền văn minh.",
    commandCategory: "Game",
    usages: "[lệnh]",
    cooldowns: 3
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID, senderID, mentions } = event;
    let db = fs.readJsonSync(path);
    const command = args[0];

    const save = () => fs.writeJsonSync(path, db, { spaces: 2 });

    function getLevelName(level) {
      return civilizationLevels[Math.min(level, civilizationLevels.length - 1)];
    }

    switch (command) {
      case "create": {
        if (Object.values(db).find(x => x.members.includes(senderID)))
          return api.sendMessage("⚠️ Bạn đã ở trong một bộ lạc khác.", threadID, messageID);

        const name = args.slice(1).join(" ") || "Bộ lạc vô danh";
        db[senderID] = {
          name: name + ` - ${getLevelName(0)}`,
          leader: senderID,
          members: [senderID],
          points: 0,
          level: 0
        };
        save();
        return api.sendMessage(`✅ Tạo bộ lạc thành công: ${db[senderID].name}`, threadID, messageID);
      }

      case "add": {
        const user = db[senderID];
        if (!user) return api.sendMessage("❌ Bạn đéo phải chủ bộ lạc.", threadID, messageID);
        const uid = Object.keys(mentions)[0];
        if (!uid) return api.sendMessage("🔖 Vui lòng tag người cần thêm.", threadID, messageID);
        if (user.members.length >= 30)
          return api.sendMessage("🚫 Bộ lạc đã đủ 30 người.", threadID, messageID);
        if (Object.values(db).some(x => x.members.includes(uid)))
          return api.sendMessage("⚠️ Người này đã ở bộ lạc khác.", threadID, messageID);

        user.members.push(uid);
        user.points += 20;
        save();
        return api.sendMessage(`➕ Đã thêm ${Object.values(mentions)[0]} vào bộ lạc.
✨ +20 điểm cho bộ lạc!`, threadID, messageID);
      }

      case "del": {
        const user = db[senderID];
        if (!user) return api.sendMessage("❌ Bạn không phải chủ bộ lạc.", threadID, messageID);
        const uid = Object.keys(mentions)[0];
        if (!uid) return api.sendMessage("🔖 Vui lòng tag người cần xoá.", threadID, messageID);
        if (!user.members.includes(uid))
          return api.sendMessage("⚠️ Người này không trong bộ lạc bạn.", threadID, messageID);

        user.members = user.members.filter(id => id !== uid);
        save();
        return api.sendMessage(`➖ Đã xoá ${Object.values(mentions)[0]} khỏi bộ lạc.`, threadID, messageID);
      }

      case "rename": {
        const user = db[senderID];
        if (!user) return api.sendMessage("❌ Bạn không phải chủ bộ lạc.", threadID, messageID);
        const newName = args.slice(1).join(" ");
        if (!newName) return api.sendMessage("✏️ Vui lòng nhập tên mới.", threadID, messageID);

        user.name = newName + ` - ${getLevelName(user.level)}`;
        save();
        return api.sendMessage(`✏️ Đổi tên bộ lạc thành: ${user.name}`, threadID, messageID);
      }

      case "point": {
        const user = Object.values(db).find(x => x.members.includes(senderID));
        if (!user) return api.sendMessage("❌ Bạn chưa tham gia bộ lạc nào.", threadID, messageID);

        const need = (user.level + 1) * 50;
        return api.sendMessage(`📊 Bộ lạc: ${user.name}
🏅 Điểm: ${user.points} / ${need} để lên cấp tiếp theo`, threadID, messageID);
      }

      case "nangcap": {
        const user = db[senderID];
        if (!user) return api.sendMessage("❌ Bạn không phải chủ bộ lạc.", threadID, messageID);
        if (user.level >= civilizationLevels.length - 1)
          return api.sendMessage("🏁 Đã đạt cấp tối đa.", threadID, messageID);

        const need = (user.level + 1) * 50;
        if (user.points < need)
          return api.sendMessage(`⚠️ Chưa đủ điểm để nâng cấp. Cần ${need} điểm.`, threadID, messageID);

        user.level++;
        user.name = user.name.split(" - ")[0] + ` - ${getLevelName(user.level)}`;
        save();
        return api.sendMessage(`⬆️ Bộ lạc đã nâng cấp thành công!
Tên mới: ${user.name}`, threadID, messageID);
      }

      case "giaitan": {
        if (!db[senderID]) return api.sendMessage("❌ Bạn không phải chủ bộ lạc.", threadID, messageID);
        delete db[senderID];
        save();
        return api.sendMessage("⚠️ Bộ lạc đã bị giải tán.", threadID, messageID);
      }

      case "top": {
        const topList = Object.values(db)
          .sort((a, b) => b.points - a.points)
          .slice(0, 5)
          .map((bl, i) => `${i + 1}. ${bl.name} - ${bl.points} điểm`)
          .join("
");
        return api.sendMessage(`🏆 TOP BỘ LẠC:
${topList}`, threadID, messageID);
      }

      case "info": {
        const user = Object.values(db).find(x => x.members.includes(senderID));
        if (!user) return api.sendMessage("❌ Bạn chưa tham gia bộ lạc nào.", threadID, messageID);

        return api.sendMessage(
          `ℹ️ Tên: ${user.name}
👑 Chủ bộ lạc: ${user.leader}
👥 Số người: ${user.members.length}
⭐ Điểm: ${user.points}`,
          threadID,
          messageID
        );
      }

      case "list": {
        const list = Object.values(db)
          .map(x => `${x.name} - ${x.points} điểm`)
          .join("
");
        return api.sendMessage(`📜 Danh sách bộ lạc:
${list}`, threadID, messageID);
      }

      case "listvm": {
        const text = civilizationLevels
          .map((name, i) => `Cấp ${i + 1}: ${name}`)
          .join("
");
        return api.sendMessage(`🏛️ Cấp bậc nền văn minh:
${text}`, threadID, messageID);
      }

      default:
        return api.sendMessage("❓ Sai cú pháp. Dùng: create, add, del, rename, point, nangcap, giaitan, top, info, list, listvm", threadID, messageID);
    }
  }
};
