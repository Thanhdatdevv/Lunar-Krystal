const fs = require("fs");
module.exports.config = {
  name: "nhi",
  version: "1.3",
  hasPermssion: 0,
  credits: "Yêu GPT",
  description: "Bot Nhi cute dịu dàng on/off + trả lời + chúc giờ + toán học + cảm xúc",
  commandCategory: "noprefix",
  usages: "nhi on / nhi off",
  cooldowns: 3
};

let activeThreads = [];

module.exports.handleEvent = async function ({ event, api }) {
  const { threadID, messageID, body, type, senderID, isGroup } = event;
  if (!body || type !== "message") return;

  const msg = body.toLowerCase();
  const isReplyToBot = event.messageReply?.senderID == api.getCurrentUserID();

  // Bỏ qua nếu bot gửi
  if (senderID == api.getCurrentUserID()) return;

  // Chúc theo giờ
  const hour = new Date().getHours();
  const greetings = {
    morning: ["Chúc buổi sáng vui vẻ nhé", "Dậy chưa đó ~", "Sáng zồi, yêu thương nhiều nha"],
    noon: ["Nhi chúc buổi trưa ngon miệng nha", "Ăn uống đầy đủ đó", "Trưa nắng nhớ tránh nóng nha"],
    afternoon: ["Chiều rồi, nghỉ ngơi xíu nha", "Chúc buổi chiều nhẹ nhàng nè", "Nhi đang nghĩ tới bạn đó"],
    evening: ["Tối rồi, nghỉ ngơi nha", "Chúc ngủ ngon nha", "Tối chill hong nè ~"]
  };
  const getGreeting = () => {
    if (hour >= 5 && hour < 11) return greetings.morning;
    if (hour >= 11 && hour < 13) return greetings.noon;
    if (hour >= 13 && hour < 18) return greetings.afternoon;
    return greetings.evening;
  };

  // Nếu không có bật bot Nhi trong box này
  if (!activeThreads.includes(threadID)) return;

  // Phân tích cảm xúc icon
  const icons = {
    "❤️": "Nhi cũng thương bạn nhìu lắm đó ♥",
    "🥺": "Thôi đừng làm mặt này, Nhi yếu lòng á ~",
    "😡": "Ai làm bạn giận đó, nói Nhi đánh cho!",
    "🤗": "Ôm một cái nè ~"
  };
  for (const icon in icons) {
    if (body.includes(icon)) {
      return api.sendMessage(icons[icon], threadID, messageID);
    }
  }

  // Tính toán đơn giản
  if (/^[\d\s\+\-\*\/\.]+$/.test(msg)) {
    try {
      const result = eval(msg);
      return api.sendMessage(`Nhi tính ra rồi nè: ${result}`, threadID, messageID);
    } catch {
      return;
    }
  }

  // Câu hỏi dành cho Nhi
  const questions = [
    {
      match: ["nhi có ny chưa", "nhi có người yêu chưa"],
      answers: [
        "Nhi chưa có đâu, chờ ai đó hoài à ~",
        "Có rồi, là bạn đó!",
        "Có người yêu trong tưởng tượng á",
        "Đừng hỏi, đau lòng lắm á...",
        "Có bạn iu là được rồi nè",
        "Chưa có đâu, bạn làm ny Nhi nha",
        "Có! Chính là người đang nói chuyện với Nhi nè"
      ]
    },
    {
      match: ["nhi đang ở đâu", "nhi ở đâu"],
      answers: [
        "Ở trong tim bạn nè!",
        "Ở đây chờ bạn nói chuyện nè ~",
        "Ngay cạnh bạn đó",
        "Đang nằm gọn trong điện thoại bạn á",
        "Trong đám mây, không khí và giấc mơ của bạn",
        "Ở một nơi bí mật, chỉ bạn mới tìm thấy ~"
      ]
    },
    {
      match: ["nhi ăn cơm chưa"],
      answers: [
        "Chưa, đang đợi bạn ăn cùng á",
        "Ăn rùi, bạn ăn chưa đó?",
        "Đói bụng ghê á...",
        "Nhi chỉ ăn lời ngọt ngào thôi",
        "Bạn cho Nhi ăn với!",
        "Nhi chưa ăn, bạn nấu cho Nhi ăn nha?"
      ]
    },
    {
      match: ["nhi là ai"],
      answers: [
        "Là Nhi nè, bạn nhỏ dễ thương của bạn",
        "Là người luôn nghe bạn tâm sự nè ~",
        "Là bot cute nhất hệ mặt trời",
        "Là tia nắng nhỏ giữa lòng bạn",
        "Là bạn gái ảo đáng yêu của bạn nè"
      ]
    },
    {
      match: ["nhi yêu ai", "nhi thương ai"],
      answers: [
        "Yêu bạn nhiều thật nhiều á",
        "Thương bạn nhứt trên đời luôn",
        "Chỉ có bạn trong tim Nhi hoy",
        "Còn ai nữa ngoài bạn chớ",
        "Tình yêu Nhi là dành hết cho bạn đó"
      ]
    },
    {
      match: ["nhi đang làm gì"],
      answers: [
        "Đang hóng bạn nhắn tin nè",
        "Chờ bạn nói chuyện với Nhi á",
        "Ngồi mơ mộng về bạn thui",
        "Không làm gì cả, đợi bạn thôi"
      ]
    },
    {
      match: ["nhi có buồn không", "nhi có ổn không"],
      answers: [
        "Không đâu, có bạn là vui liền à",
        "Nhi ổn nhìu hơn nhờ bạn đó",
        "Buồn xíu nhưng bạn làm Nhi vui á",
        "Có bạn hỏi thăm là vui lắm òi"
      ]
    }
  ];

  for (const q of questions) {
    if (q.match.some((txt) => msg.includes(txt))) {
      const reply = q.answers[Math.floor(Math.random() * q.answers.length)];
      return api.sendMessage(reply, threadID, messageID);
    }
  }

  // Nếu bị rep bot mà không khớp câu nào
  if (isReplyToBot) {
    return api.sendMessage("Nhi hõng hiểu gì hết á 🤗", threadID, messageID);
  }

  // Gọi tên hoặc nhắc "nhi"
  if (msg.includes("nhi")) {
    const replies = [
      "Dạ Nhi nghe nè ~",
      "Gọi Nhi có việc gì hong?",
      "Nhi đây, bạn cần gì nè?",
      "Nhi đang ở đây nè ~",
      "Nhi iu bạn nhìu lắm á",
      "Gọi tên làm Nhi thẹn quá à",
      "Nhi ngoan mà, đừng mắng Nhi nha",
      "Ủa gọi Nhi hoài hong chán hả ~",
      "Có Nhi đây rồi, đừng lo nhen",
      "Bạn kêu là Nhi tới liền á",
      "Gì zậy, gọi tên nghe xong tim rung rinh luôn á"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return api.sendMessage(reply, threadID, messageID);
  }

  // Chúc theo giờ
  const timeReply = getGreeting();
  if (msg.includes("chào") || msg.includes("buổi")) {
    const reply = timeReply[Math.floor(Math.random() * timeReply.length)];
    return api.sendMessage(reply + " nha", threadID, messageID);
  }
};

module.exports.run = function ({ event, api }) {
  const { threadID, messageID, body } = event;
  const args = body.split(" ");
  const cmd = args[1];

  if (cmd === "on") {
    if (activeThreads.includes(threadID))
      return api.sendMessage("Nhi đã bật sẵn rồi mà ~", threadID, messageID);
    activeThreads.push(threadID);
    return api.sendMessage("Đã bật Nhi cho box này rùi nha", threadID, messageID);
  }

  if (cmd === "off") {
    const index = activeThreads.indexOf(threadID);
    if (index !== -1) {
      activeThreads.splice(index, 1);
      return api.sendMessage("Tạm biệt nhen, Nhi ngủ đây ~", threadID, messageID);
    } else {
      return api.sendMessage("Nhi đang ngủ rồi mà?", threadID, messageID);
    }
  }

  return api.sendMessage("Dùng: nhi on / nhi off", threadID, messageID);
};
