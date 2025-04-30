
module.exports.config = {
  name: "olivia",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Bot Olivia AI trả lời khi được tag hoặc reply",
  commandCategory: "chatbot",
  usages: "[tin nhắn]",
  cooldowns: 3,
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (event.senderID == api.getCurrentUserID()) return;

  const replies = [
    "Ơ kìa, ai gọi Olivia đấy nhỉ? Đừng bảo là crush nhé!",
    "Gọi Olivia có thưởng không hay chỉ để nghe giọng ngọt như mía lùi thôi?",
    "Trời ơi, rep Olivia là auto cute gấp 10 lần đấy!",
    "Anh/em lại rep Olivia, chắc nhớ quá rồi đúng không?",
    "Không có gì thì gọi Olivia làm gì, định thả thính à?"
  ];

  const reply = replies[Math.floor(Math.random() * replies.length)];
  return api.sendMessage(reply, event.threadID, event.messageID);
};

module.exports.run = async function ({ api, event, args }) {
  if (!args[0]) return;

  const content = args.join(" ").toLowerCase();
  if (!content.includes("olivia")) return;

  const replies = [
    "Olivia đây! Có chi mà gọi em ngọt ngào thế?",
    "Ai gọi tên Olivia đấy, nói nhỏ thôi không là yêu luôn đấy!",
    "Gọi Olivia là phải cẩn thận nhé, vì dễ nghiện lắm!",
    "Sao thế? Nhớ Olivia à? Nói đại đi, em nghe nè.",
    "Gọi tên em là phải có lý do hợp lý chứ, ví dụ như... muốn hẹn hò?"
  ];

  const reply = replies[Math.floor(Math.random() * replies.length)];
  return api.sendMessage(reply, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID
    });
  });
};
