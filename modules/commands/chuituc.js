module.exports = {
  config: {
    name: "chuituc",
    version: "2.0",
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

    const toxicWords = ["lồn", "cặc", "địt", "đụ", "chịch", "đéo", "thằng ngu", "con đĩ", "peter", "mary", "chem chép"];
    const containsToxic = toxicWords.some(word => text.includes(word));
    const containsQuestionMark = text.includes("?");

    if (containsToxic) {
      return api.sendMessage(
        " mẹ mày văn hoá mày chó nó tha rồi hả , con mẹ mày?🖕", 
        event.threadID, 
        event.messageID
      );
    }

    if (containsQuestionMark) {
      return api.sendMessage(
        " bỏ chấm hỏi ra bạn sẽ cute hơn ó😘😘", 
        event.threadID, 
        event.messageID
      );
    }
  },

  run: async () => {
    // Lệnh chính không làm gì cả vì đây là module dạng sự kiện
  }
};
