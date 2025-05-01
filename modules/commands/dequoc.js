const fs = require("fs-extra");
const path = require("path");
const cron = require("node-cron");

const filePath = path.join(__dirname, "dequoc.json");
if (!fs.existsSync(filePath)) fs.writeJsonSync(filePath, {});

const civilizationLevels = [
  "Nền văn minh cổ đại",
  "Nền văn minh đồng - sắt",
  "Nền văn minh trung cổ",
  "Nền văn minh Empire",
  "Nền văn minh khai thác",
  "Nền văn minh World War",
  "Nền văn minh hiện đại"
];

module.exports = {
  config: {
    name: "dequoc",
    version: "1.0.0",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Quản lý bộ lạc và đế quốc",
    longDescription: "Tạo và quản lý các bộ lạc, nâng cấp nền văn minh, xem top, v.v.",
    category: "game",
    guide: "{pn} create | add | del | rename | point | giaitan | info | list | listvm | top | nangcap"
  },

  onStart: async function ({ message, args, event, threadsData, usersData, api }) {
    const { threadID, senderID } = event;
    const data = await fs.readJson(filePath);

    const send = (msg) => api.sendMessage(msg, threadID);

    const save = () => fs.writeJsonSync(filePath, data, { spaces: 2 });

    const getLevelName = (point) => {
      const level = Math.floor(point / 50);
      return civilizationLevels[Math.min(level, civilizationLevels.length - 1)];
    };

    const cmd = args[0];
    if (!cmd) return send("⚔️ Vui lòng chọn lệnh: create, add, del, rename, point, giaitan, info, list, listvm, top, nangcap");

    const tribe = data[threadID];

    switch (cmd) {
      case "create": {
        if (tribe) return send("❗ Nhóm này đã có bộ lạc.");
        const name = args.slice(1).join(" ") || "Bộ lạc vô danh";
        data[threadID] = {
          name: `${name} (${civilizationLevels[0]})`,
          leader: senderID,
          members: [senderID],
          point: 0,
          level: 0
        };
        save();
        return send(`⚒️ Bộ lạc '${name}' đã được tạo với thủ lĩnh là bạn!`);
      }

      case "add": {
        if (!tribe) return send("❗ Nhóm chưa có bộ lạc.");
        if (tribe.leader !== senderID) return send("❌ Chỉ thủ lĩnh mới có quyền thêm người.");
        if (tribe.members.length >= 30) return send("🚫 Bộ lạc đã đủ 30 thành viên.");
        const mention = Object.keys(event.mentions)[0];
        if (!mention) return send("👉 Vui lòng tag người cần thêm.");
        if (tribe.members.includes(mention)) return send("🔁 Thành viên đã có trong bộ lạc.");

        tribe.members.push(mention);
        tribe.point += 20;
        save();

        const name = await usersData.getName(mention);
        return send(`✅ Đã thêm ${name} vào bộ lạc!
+20 điểm cho bộ lạc!`);
      }

      case "del": {
        if (!tribe) return send("❗ Nhóm chưa có bộ lạc.");
        if (tribe.leader !== senderID) return send("❌ Chỉ thủ lĩnh mới có quyền xóa người.");
        const mention = Object.keys(event.mentions)[0];
        if (!mention) return send("👉 Vui lòng tag người cần xóa.");
        if (!tribe.members.includes(mention)) return send("❌ Người này không thuộc bộ lạc.");

        tribe.members = tribe.members.filter(m => m !== mention);
        save();

        const name = await usersData.getName(mention);
        return send(`❌ Đã loại bỏ ${name} khỏi bộ lạc.`);
      }

      case "rename": {
        if (!tribe) return send("❗ Nhóm chưa có bộ lạc.");
        if (tribe.leader !== senderID) return send("❌ Chỉ thủ lĩnh mới có quyền đổi tên.");
        const newName = args.slice(1).join(" ");
        if (!newName) return send("✏️ Vui lòng nhập tên mới.");

        tribe.name = `${newName} (${civilizationLevels[tribe.level]})`;
        save();
        return send(`✅ Tên bộ lạc đã được đổi thành: ${tribe.name}`);
      }

      case "point": {
        if (!tribe) return send("❗ Nhóm chưa có bộ lạc.");
        const nextLevel = tribe.level + 1;
        const nextPoint = (nextLevel < civilizationLevels.length) ? 50 * (nextLevel) : "Tối đa";
        return send(`🏅 Bộ lạc: ${tribe.name}
⭐ Điểm hiện tại: ${tribe.point}
🔼 Điểm cần để lên cấp: ${nextPoint}`);
      }

      case "giaitan": {
        if (!tribe) return send("❗ Nhóm chưa có bộ lạc.");
        if (tribe.leader !== senderID) return send("❌ Chỉ thủ lĩnh mới có quyền giải tán.");
        delete data[threadID];
        save();
        return send("💥 Bộ lạc đã bị giải tán.");
      }

      case "info": {
        if (!tribe) return send("❗ Nhóm chưa có bộ lạc.");
        const leaderName = await usersData.getName(tribe.leader);
        return send(`📜 Tên bộ lạc: ${tribe.name}
👑 Thủ lĩnh: ${leaderName}
👥 Số thành viên: ${tribe.members.length}
⭐ Điểm: ${tribe.point}`);
      }

      case "list": {
        const entries = Object.entries(data);
        if (!entries.length) return send("📭 Chưa có bộ lạc nào.");
        const list = entries.map(([tid, t]) => `• ${t.name} (${t.point} điểm)`).join("
");
        return send(`📚 Danh sách bộ lạc:
${list}`);
      }

      case "listvm": {
        const list = civilizationLevels.map((lvl, i) => `Cấp ${i + 1}: ${lvl}`).join("
");
        return send(`🏛️ Các cấp độ nền văn minh:
${list}`);
      }

      case "top": {
        const top = Object.values(data)
          .sort((a, b) => b.point - a.point)
          .slice(0, 5);
        let msg = "🏆 Top bộ lạc:
";
        top.forEach((t, i) => {
          msg += `🥇 [${i + 1}] ${t.name} (${t.point} điểm)
`;
        });
        return send(msg);
      }

      case "nangcap": {
        if (!tribe) return send("❗ Nhóm chưa có bộ lạc.");
        if (tribe.leader !== senderID) return send("❌ Chỉ thủ lĩnh mới có quyền nâng cấp.");
        if (tribe.level >= civilizationLevels.length - 1) return send("🚀 Bộ lạc đã đạt cấp tối đa.");
        if (tribe.point < 50 * (tribe.level + 1)) return send("❌ Chưa đủ điểm để nâng cấp.");

        tribe.level++;
        tribe.name = tribe.name.replace(/\(.*\)/, `(${civilizationLevels[tribe.level]})`);
        save();
        return send(`✨ Bộ lạc đã được nâng cấp lên: ${civilizationLevels[tribe.level]}!`);
      }

      default:
        return send("⚠️ Lệnh không hợp lệ.");
    }
  },
};

// Tự động gửi top 12:00 mỗi ngày
cron.schedule("0 12 * * *", async () => {
  const data = await fs.readJson(filePath);
  const top = Object.entries(data)
    .map(([tid, t]) => ({ threadID: tid, ...t }))
    .sort((a, b) => b.point - a.point)
    .slice(0, 5);

  const msg =
    "🏆 𝗧𝗼𝗽 𝗯𝗼̣̂ 𝗹𝗮̣𝗰 𝗵𝗮̆̀𝗻𝗴 𝗻𝗴𝗮̀𝘆 (12:00 trưa)

" +
    top.map((t, i) => `🥇 [${i + 1}] ${t.name} (${t.point} điểm)`).join("
");

  for (const t of top) {
    api.sendMessage(msg, t.threadID);
  }
});
