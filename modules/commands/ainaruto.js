const axios = require("axios");

module.exports = {
  config: {
    name: "naruto",
    version: "1.1",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "chat ai",
    commandCategory: "noprefix",
    usages: "rep tin nhắn của bot hoặc nhắc 'naruto'",
    cooldowns: 3
  },

  handleEvent: async ({ api, event }) => {
    const { threadID, messageID, body, senderID, messageReply } = event;
    if (!body && !messageReply) return;

    const isMentionNaruto = body?.toLowerCase().includes("naruto");
    const isReplyToBot = messageReply?.senderID === api.getCurrentUserID();

    if (!isMentionNaruto && !isReplyToBot) return;

    const userMessage = body || messageReply.body;

    try {
      // Gọi API GPT miễn phí
      const res = await axios.get(`https://api-j7hu.onrender.com/gpt`, {
        params: { text: userMessage }
      });

      const reply = res.data.reply || "Naruto không hiểu lắm...";

      // Lấy ảnh minh họa Naruto
      const imgRes = await axios.get("https://api-j7hu.onrender.com/naruto");
      const imgUrl = imgRes.data.url || imgRes.data;
      const imgStream = (await axios.get(imgUrl, { responseType: "stream" })).data;

      return api.sendMessage({ body: reply, attachment: imgStream }, threadID, messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("Naruto bị lỗi rồi... thử lại sau nha!", threadID, messageID);
    }
  },

  run: async () => {
    return; // Không dùng lệnh, bot tự phản hồi khi được rep hoặc nhắc tên
  }
};
