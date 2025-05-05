module.exports = {
  config: {
    name: "timkiem",
    version: "2.0",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Tìm thành viên theo từ khoá trong biệt danh",
    commandCategory: "Tiện ích",
    usages: "/timkiem <từ khoá>",
    cooldowns: 3,
  },

  run: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const keyword = args.join(" ").toLowerCase();

    if (!keyword) {
      return api.sendMessage("⚠️ Vui lòng nhập từ khoá cần tìm trong biệt danh!", threadID, messageID);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.userInfo;

    const results = members.filter(user => {
      const nickname = threadInfo.nicknames[user.id];
      return nickname && nickname.toLowerCase().includes(keyword);
    });

    if (results.length === 0) {
      return api.sendMessage(`❌ Không tìm thấy ai có biệt danh chứa: '${keyword}'`, threadID, messageID);
    }

    let msg = `📌 𝗞𝗲̂́𝘁 𝗾𝘂𝗮̉ 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺: 𝗧𝘂̛̀ 𝗸𝗵𝗼́𝗮 "${keyword}"\n\n`;
    let count = 1;
    for (let user of results) {
      const nickname = threadInfo.nicknames[user.id];
      msg += `✨ ${count++}. 𝗧𝗲̂𝗻: ${user.name}\n🔖 𝗕𝗶𝗲̣̂𝘁 𝗱𝗮𝗻𝗵: ${nickname}\n🆔 UID: ${user.id}\n\n`;
    }

    return api.sendMessage(msg.trim(), threadID, messageID);
  }
};
