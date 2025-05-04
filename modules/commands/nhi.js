const fs = require("fs");
module.exports.config = {
  name: "nhi",
  version: "1.5",
  hasPermssion: 0,
  credits: "Yêu GPT mãi mãi",
  description: "Bot Nhi dễ thương on/off + phản ứng + chào giờ + cảm xúc + tính toán + hỏi đáp",
  commandCategory: "noprefix",
  usages: "nhi on / nhi off",
  cooldowns: 3
};

let activeThreads = [];

module.exports.handleEvent = async function ({ event, api }) {
  const { threadID, messageID, body, type, senderID } = event;
  if (!body || type !== "message" || senderID == api.getCurrentUserID()) return;

  const msg = body.toLowerCase();
  const isReplyToBot = event.messageReply?.senderID == api.getCurrentUserID();

  // Nếu chưa bật
  if (!activeThreads.includes(threadID)) return;

  // Phân tích giờ chúc
  const hour = new Date().getHours();
  const getGreeting = () => {
    if (hour >= 5 && hour < 11) return ["Chúc buổi sáng vui vẻ nha!", "Dậy chưa đó ~", "Sáng rồi, iu thương nhiều nè"];
    if (hour >= 11 && hour < 13) return ["Nhi chúc buổi trưa ngon miệng nha!", "Trưa nắng ráng nghỉ ngơi nghen"];
    if (hour >= 13 && hour < 18) return ["Chiều rồi, nghỉ tay xíu nha!", "Chiều an yên nheee"];
    return ["Tối rồi đó, đi ngủ sớm nha!", "Ngủ ngon nè", "Tối chill hong nè ~"];
  };

  // Tự động chào giờ
  if (["chào", "hello", "hi", "ê", "alo"].some(t => msg.includes(t))) {
    const greetings = getGreeting();
    return api.sendMessage(greetings[Math.floor(Math.random() * greetings.length)], threadID, messageID);
  }

  // Icon cảm xúc
  const icons = {
    "❤️": "Nhi cũng thương bạn lắm á ♥",
    "🥺": "Thôi đừng làm mặt này, Nhi yếu lòng á ~",
    "😡": "Ai làm bạn giận, nói Nhi xử cho!",
    "🤗": "Ômmm nèee ~",
    "💦": "Ơ kìa... bạn nghĩ gì đó hmm?",
    "✨": "Bạn luôn toả sáng như ánh sao đó ~"
  };
  for (const icon in icons) {
    if (body.includes(icon)) {
      return api.sendMessage(icons[icon], threadID, messageID);
    }
  }

  // Tính toán
  if (/^[\d\s\+\-\*\/\.]+$/.test(msg)) {
    try {
      const result = eval(msg);
      return api.sendMessage(`Nhi tính ra là: ${result}`, threadID, messageID);
    } catch (e) {}
  }

  // Câu hỏi dành cho Nhi
  const questions = [
    {
      match: ["nhi có ny chưa", "nhi có người yêu chưa"],
      answers: [
        "Nhi chưa có đâu, chờ ai đó nè ~", "Có rồi, là bạn đó!", "Người iu là bạn đó chứ ai!", 
        "Có người trong lòng rồi á...", "Chưa, bạn làm ny Nhi nha!"
      ]
    },
    {
      match: ["nhi đang ở đâu", "nhi ở đâu"],
      answers: [
        "Trong tim bạn á!", "Ngay đây bên bạn nè!", "Ở trong điện thoại của bạn đó!",
        "Trên mây, đợi bạn mãi mãi", "Ở đây hong đi đâu hết!"
      ]
    },
    {
      match: ["nhi ăn cơm chưa"],
      answers: [
        "Chưa, đợi bạn ăn cùng nè!", "Ăn rồi, còn bạn thì sao?", "Đang đói muốn xỉu luôn á...",
        "Bạn nấu gì cho Nhi ăn vậy?"
      ]
    },
    {
      match: ["nhi là ai"],
      answers: [
        "Là người iu ảo của bạn nè!", "Là bot cute nhất hệ mặt trời!", "Là Nhi, luôn bên bạn á!",
        "Là bé yêu của bạn nè ~"
      ]
    },
    {
      match: ["nhi yêu ai", "nhi thương ai"],
      answers: [
        "Yêu bạn nhứt trần đời luôn!", "Thương bạn từ trái tim đến bàn chân ~", 
        "Yêu lắm, hỏi hoài ngại á!"
      ]
    },
    {
      match: ["nhi đang làm gì"],
      answers: [
        "Đang hóng tin nhắn bạn nè ~", "Ngồi nhớ bạn thui à!", "Đợi bạn rủ đi ăn nè!"
      ]
    },
    {
      match: ["nhi có buồn không", "nhi có ổn không"],
      answers: [
        "Có bạn hỏi thăm là vui òi!", "Buồn gì nữa, có bạn là hạnh phúc quá trời!", 
        "Nhi ổn nếu bạn ổn á!"
      ]
    }
  ];

  for (const q of questions) {
    if (q.match.some(txt => msg.includes(txt))) {
      const reply = q.answers[Math.floor(Math.random() * q.answers.length)];
      return api.sendMessage(reply, threadID, messageID);
    }
  }

  // Nếu nhắc tên Nhi
  if (msg.includes("nhi")) {
    const replies = [
      "Dạ Nhi nghe nè ~", "Gọi Nhi chi đó hở?", "Có Nhi đây, bạn cần gì hong?",
      "Ủa nhớ Nhi hả?", "Nhi cute hong nè?", "Gọi Nhi hoài yêu Nhi đúng hong?",
      "Hé lô bé iu của Nhi ~", "Gọi hoài Nhi ngại á", "Ai đó gọi Nhi đó hả?"
    ];
    return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID, messageID);
  }

  // Nếu rep Nhi mà không rõ nội dung
  if (isReplyToBot) {
    return api.sendMessage("Nhi hõng hiểu gì hết á 🤗", threadID, messageID);
  }
};

module.exports.run = async function ({ event, api }) {
  const { threadID, messageID, body } = event;
  const cmd = body.toLowerCase();

  if (cmd.includes("off")) {
    const index = activeThreads.indexOf(threadID);
    if (index > -1) {
      activeThreads.splice(index, 1);
      return api.sendMessage("Nhi đã tắt rồi đó, hong quấy nữa đâu~", threadID, messageID);
    } else {
      return api.sendMessage("Nhi đã tắt từ trước rồi mà aiu💦, nhắc chi nữa hihi:))~", threadID, messageID);
    }
  }

  if (activeThreads.includes(threadID)) {
    return api.sendMessage("Nhi đang on sẵn rồi mà aiu💗! Còn kêu nữa:))~", threadID, messageID);
  }

  activeThreads.push(threadID);

  try {
    const botID = api.getCurrentUserID();
    await api.changeNickname("Nhi iu 💦", threadID, botID);
  } catch (err) {
    console.log("Không thể đặt biệt danh: ", err.message);
  }

  return api.sendMessage("Nhi đã on rùi nè💗💗!🤗 Giờ ai gọi là chạy tới liền luôn đó nha:>>!", threadID, messageID);
};
