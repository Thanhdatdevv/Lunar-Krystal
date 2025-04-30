const fs = require("fs");
const schedule = require("node-schedule");

const dataPath = __dirname + "/dequoc.json";

function loadData() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(dataPath));
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports.config = {
  name: "dequoc",
  version: "1.1.0",
  hasPermission: 0,
  credits: "Dat Thanh",
  description: "Quản lý bộ lạc và nền văn minh",
  commandCategory: "game",
  usages: "/dequoc [tao|add|del|rename|nangcap|point|top]",
  cooldowns: 5
};

module.exports.run = async function ({ event, message, args }) {
  const { senderID, mentions } = event;
  const data = loadData();
  const tribeKey = Object.keys(data).find(key => data[key].members.includes(senderID));
  const subCommand = args[0];
  const name = args.slice(1).join(" ");

  switch (subCommand) {
    case "tao": {
      if (tribeKey) return message.reply("Bạn đã có bộ lạc rồi.");
      if (!name) return message.reply("Nhập tên bộ lạc bạn muốn tạo.");
      const id = Date.now().toString();
      data[id] = {
        name,
        members: [senderID],
        point: 0,
        level: 0
      };
      saveData(data);
      return message.reply(`Đã tạo bộ lạc "${name}" thành công!`);
    }

    case "add": {
      if (!tribeKey) return message.reply("Bạn chưa thuộc bộ lạc nào!");
      const mentionID = Object.keys(mentions)[0];
      if (!mentionID) return message.reply("Hãy tag người cần thêm.");
      if (data[tribeKey].members.includes(mentionID)) return message.reply("Người này đã trong bộ lạc.");
      data[tribeKey].members.push(mentionID);
      data[tribeKey].point += 10;
      saveData(data);
      return message.reply(`Đã thêm thành viên và +10 điểm cho bộ lạc ${data[tribeKey].name}`);
    }

    case "del": {
      if (!tribeKey) return message.reply("Bạn chưa thuộc bộ lạc nào!");
      const mentionID = Object.keys(mentions)[0];
      if (!mentionID) return message.reply("Hãy tag người cần xoá.");
      data[tribeKey].members = data[tribeKey].members.filter(id => id !== mentionID);
      saveData(data);
      return message.reply("Đã xoá thành viên khỏi bộ lạc.");
    }

    case "rename": {
      if (!tribeKey) return message.reply("Bạn chưa thuộc bộ lạc nào!");
      if (!name) return message.reply("Hãy nhập tên mới cho bộ lạc.");
      data[tribeKey].name = name;
      saveData(data);
      return message.reply(`Đã đổi tên bộ lạc thành: ${name}`);
    }

    case "nangcap": {
      if (!tribeKey) return message.reply("Bạn chưa thuộc bộ lạc nào!");
      const tribe = data[tribeKey];
      const required = 50 * (tribe.level + 1);
      if (tribe.point < required) return message.reply("Bạn không đủ điểm nền văn minh.");
      tribe.point -= required;
      tribe.level += 1;
      saveData(data);
      return message.reply(`Chúc mừng! Bộ lạc ${tribe.name} đã nâng cấp lên nền văn minh cấp ${tribe.level}`);
    }

    case "point": {
      if (!tribeKey) return message.reply("Bạn chưa thuộc bộ lạc nào!");
      const tribe = data[tribeKey];
      return message.reply(`Bộ lạc: ${tribe.name}
Điểm: ${tribe.point}
Cấp: ${tribe.level}`);
    }

    case "top": {
      const topList = Object.values(data)
        .sort((a, b) => b.point - a.point)
        .map((tribe, index) =>
          `${index + 1}. ${tribe.name} - ${tribe.point} điểm (cấp ${tribe.level})`
        )
        .slice(0, 10)
        .join("
");
      return message.reply("Bảng xếp hạng bộ lạc:
" + topList);
    }

    default:
      return message.reply("Dùng: /dequoc [tao|add|del|rename|nangcap|point|top]");
  }
};

module.exports.onLoad = () => {
  schedule.scheduleJob('0 0 * * *', () => {
    const data = loadData();
    const summary = Object.values(data).map(
      tribe => `- ${tribe.name}: ${tribe.point} điểm (cấp ${tribe.level})`
    ).join("
");

    const topList = Object.values(data)
      .sort((a, b) => b.point - a.point)
      .map((tribe, index) =>
        `${index + 1}. ${tribe.name} - ${tribe.point} điểm (cấp ${tribe.level})`
      )
      .slice(0, 10)
      .join("
");

    const fullMsg =
      "=== Báo cáo lúc 0:00 ===
" +
      "Tổng điểm các bộ lạc:
" + summary + "

" +
      "Top bộ lạc:
" + topList;

    const threads = [...new Set(Object.values(data).flatMap(t => t.members))];
    const api = global.api;
    if (!api) return;
    threads.forEach(id => {
      api.sendMessage(fullMsg, id);
    });
  });
};
