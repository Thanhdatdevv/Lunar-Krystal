const adminUID = "61561400514605"; // Thay bằng UID thật của admin nếu cần

module.exports = {
  config: {
    name: "ad",
    version: "1.0",
    hasPermission: 0,
    credits: "DatThanh",
    description: "Tự động phản hồi khi nhắc đến admin",
    commandCategory: "Hệ thống",
    usages: "",
    cooldowns: 0
  },

  handleEvent: async function ({ event, api, Users }) {
    const { body, threadID, messageID, mentions, senderID } = event;
    if (!body) return;

    const text = body.toLowerCase();
    const mentionMatch = mentions && Object.keys(mentions).includes(adminUID);
    const nameMatch = ["đạt", "dat", "thanhdat", "datthanh"].some(keyword => text.includes(keyword));

    if (!mentionMatch && !nameMatch) return;

    const senderName = await Users.getNameUser(senderID);
    const replyText =
`Bạn gọi tên chủ tớ đấy à ${senderName}?
Đây là chủ iu của tớ nè:
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
    // Không dùng trực tiếp
  }
};
