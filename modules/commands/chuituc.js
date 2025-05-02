module.exports = {
  config: {
    name: "chuituc",
    version: "2.6",
    hasPermission: 0,
    credits: "QuỳnhGPT",
    description: "Phản hồi khi người dùng chửi tục hoặc dùng dấu ? (trừ tin nhắn của bot)",
    commandCategory: "Hệ thống",
    usages: "Gửi tin nhắn thường để kiểm tra",
    cooldowns: 1,
  },

  handleEvent: async function ({ event, api }) {
    // Bỏ qua nếu là tin nhắn của chính bot
    if (event.senderID == api.getCurrentUserID()) return;

    const text = event.body?.toLowerCase();
    if (!text) return;

    const toxicWords = [
      "lồn", "lon", "cặc", "cac", "địt", "djt", "đụ", 
      "chịch", "đéo", "thằng ngu", "con đĩ", "peter", 
      "mary","bot ngu" ,"bot đần" ,"chem chép", "đĩ", "vú", "dú"
    ];
    
    const containsToxic = toxicWords.some(word => text.includes(word));
    const containsQuestionMark = text.includes("?");

    if (containsToxic) {
      return api.sendMessage(
        "Dcm văn hoá m chó tha à", 
        event.threadID, 
        event.messageID
      );
    }

    if (containsQuestionMark) {
      return api.sendMessage(
        "Bạn bỏ ? sẽ cute hơn nhiều á 😘", 
        event.threadID, 
        event.messageID
      );
    }
  },

  run: async () => {
    // Không xử lý lệnh gõ
  }
};
