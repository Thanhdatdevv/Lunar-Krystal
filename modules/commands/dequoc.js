
const fs = require('fs');
const path = __dirname + '/dequoc.json';
let tribes = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};

const civilizations = [
  "nền văn minh cổ đại",
  "nền văn minh đồng - sắt",
  "nền văn minh trung cổ",
  "nền văn minh Empire",
  "nền văn minh khai thác",
  "nền văn minh world war",
  "nền văn minh hiện đại"
];

function save() {
  fs.writeFileSync(path, JSON.stringify(tribes, null, 2));
}

module.exports = {
  config: {
    name: "dequoc",
    version: "1.0",
    hasPermssion: 0,
    credits: "Bạn",
    description: "Quản lý bộ lạc và đế quốc",
    commandCategory: "game",
    usages: "[create|add|del|rename|point|giaitan|top|info|list|listvm]",
    cooldowns: 5
  },

  run: async ({ api, event, args }) => {
    const { threadID, senderID, messageID, mentions } = event;
    const cmd = args[0];

    switch (cmd) {
      case "create":
        if (Object.values(tribes).some(t => t.members.includes(senderID)))
          return api.sendMessage("Bạn đã thuộc một bộ lạc rồi.", threadID, messageID);
        const name = args.slice(1).join(" ");
        if (!name) return api.sendMessage("Hãy nhập tên bộ lạc.", threadID, messageID);
        tribes[senderID] = {
          name,
          leader: senderID,
          members: [senderID],
          point: 0
        };
        save();
        return api.sendMessage(`Đã tạo bộ lạc '${name}'.`, threadID, messageID);

      case "add":
        if (!tribes[senderID]) return api.sendMessage("Bạn chưa tạo bộ lạc.", threadID, messageID);
        if (tribes[senderID].leader !== senderID)
          return api.sendMessage("Chỉ chủ bộ lạc mới có thể thêm thành viên.", threadID, messageID);
        const member = Object.keys(mentions)[0];
        if (!member) return api.sendMessage("Tag người bạn muốn thêm.", threadID, messageID);
        if (tribes[senderID].members.length >= 30)
          return api.sendMessage("Bộ lạc đã đủ 30 người.", threadID, messageID);
        if (Object.values(tribes).some(t => t.members.includes(member)))
          return api.sendMessage("Người này đã ở bộ lạc khác.", threadID, messageID);
        tribes[senderID].members.push(member);
        save();
        return api.sendMessage(`Đã thêm ${Object.values(mentions)[0].replace("@", "")} vào bộ lạc.`, threadID, messageID);

      case "del":
        if (!tribes[senderID]) return api.sendMessage("Bạn chưa có bộ lạc.", threadID, messageID);
        const target = Object.keys(mentions)[0];
        if (!target) return api.sendMessage("Tag người cần xoá.", threadID, messageID);
        const tribe = tribes[senderID];
        if (tribe.leader !== senderID)
          return api.sendMessage("Chỉ chủ bộ lạc mới được xoá người.", threadID, messageID);
        if (!tribe.members.includes(target))
          return api.sendMessage("Người này không thuộc bộ lạc bạn.", threadID, messageID);
        tribe.members = tribe.members.filter(id => id !== target);
        save();
        return api.sendMessage("Đã xoá người khỏi bộ lạc.", threadID, messageID);

      case "rename":
        const newName = args.slice(1).join(" ");
        if (!newName) return api.sendMessage("Nhập tên mới cho bộ lạc.", threadID, messageID);
        if (!tribes[senderID]) return api.sendMessage("Bạn chưa tạo bộ lạc.", threadID, messageID);
        if (tribes[senderID].leader !== senderID)
          return api.sendMessage("Chỉ chủ bộ lạc mới có thể đổi tên.", threadID, messageID);
        tribes[senderID].name = newName;
        save();
        return api.sendMessage(`Đã đổi tên bộ lạc thành '${newName}'.`, threadID, messageID);

      case "point":
        const t = Object.values(tribes).find(t => t.members.includes(senderID));
        if (!t) return api.sendMessage("Bạn chưa thuộc bộ lạc nào.", threadID, messageID);
        const level = Math.floor(t.point / 50);
        return api.sendMessage(`Bộ lạc: ${t.name}
Điểm: ${t.point}
Nền văn minh: ${civilizations[level] || "chưa xác định"}`, threadID, messageID);

      case "giaitan":
        const yourTribe = tribes[senderID];
        if (!yourTribe) return api.sendMessage("Bạn chưa có bộ lạc.", threadID, messageID);
        if (yourTribe.leader !== senderID) return api.sendMessage("Chỉ chủ bộ lạc mới có thể giải tán.", threadID, messageID);
        delete tribes[senderID];
        save();
        return api.sendMessage("Đã giải tán bộ lạc.", threadID, messageID);

      case "top":
        const topList = Object.values(tribes)
          .sort((a, b) => b.point - a.point)
          .slice(0, 10)
          .map((t, i) => `${i + 1}. ${t.name} - ${t.point} điểm`);
        return api.sendMessage("Top bộ lạc:
" + topList.join("\n"), threadID, messageID);

      case "info":
        const tribeInfo = Object.values(tribes).find(t => t.members.includes(senderID));
        if (!tribeInfo) return api.sendMessage("Bạn chưa thuộc bộ lạc nào.", threadID, messageID);
        const civLevel = Math.floor(tribeInfo.point / 50);
        return api.sendMessage(
          `Tên: ${tribeInfo.name}\nChủ: ${tribeInfo.leader}\nThành viên: ${tribeInfo.members.length}\nNền văn minh: ${civilizations[civLevel]}`,
          threadID,
          messageID
        );

      case "list":
        const allTribes = Object.values(tribes)
          .map(t => `${t.name} - ${t.point} điểm`);
        return api.sendMessage("Tất cả bộ lạc:\n" + allTribes.join("\n"), threadID, messageID);

      case "listvm":
        return api.sendMessage("Danh sách nền văn minh:\n" + civilizations.join("\n"), threadID, messageID);

      default:
        return api.sendMessage("Sai cú pháp. Dùng: create|add|del|rename|point|giaitan|top|info|list|listvm", threadID, messageID);
    }
  }
};
