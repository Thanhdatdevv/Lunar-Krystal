module.exports = {
  config: {
    name: "chuituc",
    version: "2.5",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Phản hồi tự động khi người dùng chửi tục hoặc dùng dấu ?",
    commandCategory: "Hệ thống",
    usages: "Gửi tin nhắn bình thường để thử",
    cooldowns: 1,
  },

  handleEvent: async function ({ event, api }) {
    const text = event.body?.toLowerCase();
    if (!text) return;

    const toxicWords = [
      "lồn", "lon", "cặc", "cac", "địt", "djt", "đụ", 
      "chịch", "đéo", "thằng ngu", "con đĩ", "peter", 
      "mary", "chem chép", "đĩ", "vú", "dú"
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
    // Module dạng sự kiện
  }
};
