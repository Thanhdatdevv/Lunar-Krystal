const axios = require("axios");

module.exports = {
  config: {
    name: "naruto",
    version: "1.2",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Trò chuyện với Naruto bằng AI miễn phí",
    commandCategory: "noprefix",
    usages: "rep tin nhắn của bot hoặc nhắc 'naruto'",
    cooldowns: 3
  },

  handleEvent: async ({ api, event }) => {
    const { threadID, messageID, body, senderID, messageReply } = event;

    // Không phản hồi nếu là bot gửi
    if (senderID === api.getCurrentUserID()) return;

    const isMentionNaruto = body?.toLowerCase().includes("naruto");
    const isReplyToBot = messageReply?.senderID === api.getCurrentUserID();

    if (!isMentionNaruto && !isReplyToBot) return;

    const userMessage = body || messageReply.body;

    try {
      // Gọi API GPT miễn phí
      const res = await axios.get("https://api-j7hu.onrender.com/gpt", {
        params: { text: userMessage }
      });

      const reply = res.data.reply;
      if (!reply) throw new Error("API không trả lời");

      // Lấy ảnh minh họa Naruto (tùy chọn, nếu lỗi ảnh vẫn gửi text)
      let msg = { body: reply };
      try {
        const imgRes = await axios.get("https://api-j7hu.onrender.com/naruto");
        const imgUrl = imgRes.data.url || imgRes.data;
        const imgStream = (await axios.get(imgUrl, { responseType: "stream" })).data;
        msg.attachment = imgStream;
      } catch (imgErr) {
        // Không gửi ảnh nếu lỗi
      }

      return api.sendMessage(msg, threadID, messageID);
    } catch (err) {
      console.error("Lỗi gọi API GPT:", err.message);
      return api.sendMessage("Naruto bị lỗi thật rồi... chờ tí nha!", threadID, messageID);
    }
  },

  run: async () => {
    return; // Không dùng lệnh
  }
};
