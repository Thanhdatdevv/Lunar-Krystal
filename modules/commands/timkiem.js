module.exports = {
  config: {
    name: "timkiem",
    version: "1.1",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Tìm người theo biệt danh hoặc tìm người chưa đặt biệt danh",
    commandCategory: "Tiện ích",
    usages: "/timkiem [từ khóa | noname]",
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const keyword = args.join(" ").toLowerCase();

    if (!keyword) return api.sendMessage("Vui lòng nhập từ khóa hoặc dùng: /timkiem noname", threadID, event.messageID);

    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.userInfo;

    let result = [];

    if (keyword === "noname") {
      result = members.filter(user => !user.nickname);
    } else {
      result = members.filter(user => user.nickname && user.nickname.toLowerCase().includes(keyword));
    }

    if (result.length === 0) {
      return api.sendMessage("Không tìm thấy ai phù hợp cả!", threadID, event.messageID);
    }

    const icon = keyword === "noname" ? "🔍" : "📛";
    const title = keyword === "noname" ? "DANH SÁCH CHƯA CÓ BIỆT DANH" : `KẾT QUẢ CHỨA TỪ KHÓA: '${keyword}'`;

    const listText = result.map((user, index) => {
      const name = user.name || "Không rõ";
      const nickname = user.nickname || "Chưa có";
      return `${icon} ${index + 1}. ${name}\n🆔 UID: ${user.id}\n📝 Biệt danh: ${nickname}`;
    }).join("\n\n");

    const finalMessage = `╭───『 ${title} 』───╮\n\n${listText}\n\n╰───────────────╯`;

    api.sendMessage(finalMessage, threadID, event.messageID);
  }
};
