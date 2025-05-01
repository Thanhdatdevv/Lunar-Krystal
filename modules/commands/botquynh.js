module.exports = { 
  config: {
    name: "chuituc",
    version: "1.1",
    description: "Phản hồi khi người dùng chửi tục hoặc dùng dấu ?",
    commandCategory: "auto",
    usages: "Tự động phát hiện và phản hồi",
    cooldowns: 1,
  },

   onChat: async function ({ message, event }) {
    const text = event.body.toLowerCase();
    const tid = event.threadID;
    const mid = event.messageID;

    const toxicWords = ["lồn", "cặc", "peter", "mary", "chem chép", "địt", "chịch", "đụ", "clm"];
    const containsToxic = toxicWords.some(word => text.includes(word));
    const containsQuestionMark = text.includes("?");

    if (containsToxic) {
      message.reply("Mày có văn minh văn hóa của 1 con người không??????", tid, mid);
    } else if (containsQuestionMark) {
      message.reply("Bạn bỏ ? ra bạn sẽ cute hơn ó 💗💝", tid, mid);
    }
  }
};
