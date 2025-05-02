const fs = require("fs");
module.exports = {
  config: {
    name: "ad",
    version: "2.0",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Bot tự rep khi có ai nhắc admin",
    commandCategory: "Tiện ích",
    usages: "text",
    cooldowns: 0
  },
  handleEvent: async function ({ event, api, Users }) {
    const { body, threadID, messageID, mentions, senderID } = event;
    if (!body) return;
    const text = body.toLowerCase();
    const ADMIN_UID = "61561400514605"; // Thay bằng UID thật của admin
    const mentionMatch = mentions && Object.keys(mentions).includes(ADMIN_UID);
    // Check từ khoá nhắc tên
    const keywordMatch = [
      "đạt", "dat", "thanhdat", "datthanh"
    ].some(keyword => text.includes(keyword));
    if (keywordMatch || mentionMatch) {
      const nameSender = await Users.getNameUser(senderID);
      const fancyText = 
`𝔅ạ𝔫 𝔫𝔥ắ𝔠 𝔤ì 𝔠𝔥ủ 𝔠ủ𝔞 𝔪ì𝔫𝔥 đấ𝔲 ${nameSender}😆✨\n𝕏𝕚𝕟 𝕔𝕙𝕒̀𝕠, 𝕕𝕖̂̂𝕪 𝕝𝕒̀ 𝕔𝕙𝕦̉ 𝕔𝕦̉𝕒 𝕞𝕚̀𝕟𝕙😘\n𝕋𝕖̂𝕟 : 𝕃𝕖̂ 𝕋𝕙𝕒̀𝕟𝕙 𝔻𝕒̣𝕥\nℕ𝕒̆𝕞 𝕤𝕚𝕟𝕙 : 𝟚𝟘𝟘𝟞\nℂ𝕦𝕟𝕘 : 𝕔𝕦𝕟𝕘 𝕜𝕙𝕦̉`;
      const videos = [
        "https://i.imgur.com/7OQBaMo.mp4",
        "https://i.imgur.com/ruOTcU1.mp4",
        "https://i.imgur.com/TwGBUTa.mp4",
        "https://i.imgur.com/mRWp5j2.mp4"
      ];

      const randomVideo = videos[Math.floor(Math.random() * videos.length)];

      return api.sendMessage(
        {
          body: fancyText,
          attachment: await api.getStreamFromURL(randomVideo)
        },
        threadID,
        messageID
      );
    }
  },
  run: async function () {
   // Lệnh không dùng trực tiếp
  }
};
