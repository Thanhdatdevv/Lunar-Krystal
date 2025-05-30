module.exports = {
  config: {
    name: "chuituc",
    version: "2.6",
    hasPermission: 0,
    credits: "Dat Thanh",
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
      "lồn", "cặc", "địt", "đụ", 
      "chịch", "đéo", "thằng ngu", "con đĩ", "peter", 
      "mary","bot ngu" ,"bot đần" ,"chem chép", "đĩ", "đỉ", "vú", "dú"
    ];
    
    const containsToxic = toxicWords.some(word => text.includes(word));
    const containsQuestionMark = text.includes("#");

    if (containsToxic) {
      return api.sendMessage(
        "bot nhắc nhẹ bạn đang vi phạm từ ngữ không được quyền nói", 
        event.threadID, 
        event.messageID
      );
    }

    if (containsQuestionMark) {
      return api.sendMessage(
        "Bạn cute dữ á 😘", 
        event.threadID, 
        event.messageID
      );
    }
  },

  run: async () => {
    // Không xử lý lệnh gõ
  }
};
