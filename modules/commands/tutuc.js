module.exports = {
  config: {
    name: "chuituc",
    version: "1.1",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Phản hồi khi người dùng chửi tục hoặc dùng dấu ?",
    commandCategory: "events",
    usages: "Dùng trong tin nhắn thường",
    cooldowns: 1,
  },

  handleEvent: async function ({ event, message }) {
    const text = event.body?.toLowerCase();
    if (!text) return;

    const toxicWords = ["lồn", "cặc", "peter", "mary", "chem chép", "địt", "chịch", "đụ"];
    const containsToxic = toxicWords.some(word => text.includes(word));
    const containsQuestionMark = text.includes("?");

    if (containsToxic) {
      return message.reply("Mày có văn minh văn hóa của 1 con người không??????", event.threadID, event.messageID);
    } else if (containsQuestionMark) {
      return message.reply("Bạn bỏ ? ra bạn sẽ cute hơn ó 💗💝", event.threadID, event.messageID);
    }
  },

  run: () => {}
};
