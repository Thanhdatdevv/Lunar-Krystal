module.exports = {
  config: {
    name: "ad",
    version: "2.0",
    hasPermission: 0,
    credits: "GPT Rewrite for Dat",
    description: "Tự động phản hồi khi nhắc đến tên admin",
    commandCategory: "Hệ thống",
    usages: "",
    cooldowns: 0
  },

  handleEvent: async function ({ event, api, Users }) {
    const { body, threadID, messageID, senderID } = event;
    if (!body) return;

    const text = body.toLowerCase();
    const nameKeywords = ["đạt", "dat", "thanhdat", "datthanh"];
    const matched = nameKeywords.some(keyword => text.includes(keyword));

    if (!matched) return;

    const senderName = await Users.getNameUser(senderID);
    const replyText = 
`Bạn gọi chủ tớ đấy à ${senderName}?
Đây là chủ của tớ nè:
• Tên: Lê Thành Đạt
• Năm sinh: 2006
• Cung: cung khủ
Muốn liên lạc/mua bot thì call ảnh nha!`;

    const videoList = [
      "https://i.imgur.com/7OQBaMo.mp4",
      "https://i.imgur.com/ruOTcU1.mp4",
      "https://i.imgur.com/TwGBUTa.mp4",
      "https://i.imgur.com/mRWp5j2.mp4"
    ];
    const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];

    return api.sendMessage({
      body: replyText,
      attachment: await api.getStreamFromURL(randomVideo)
    }, threadID, messageID);
  },

  run: async function () {
    // Không dùng lệnh trực tiếp
  }
};
