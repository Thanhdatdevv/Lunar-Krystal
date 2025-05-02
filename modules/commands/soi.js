const fs = require('fs');
const axios = require('axios');
const path = __dirname + '/soidata.js';

const API_KEY = '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';

module.exports.config = {
  name: "soi",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh + ChatGPT",
  description: "Sói AI gắt gỏng, hỗn láo, biết phân tích emoji và ảnh",
  commandCategory: "fun",
  usages: "/soi on | /soi off",
  cooldowns: 3,
};

let data = {
  soiMode: true,
  blacklist: []
};

if (fs.existsSync(path)) {
  data = require(path);
}

function saveData() {
  fs.writeFileSync(path, `module.exports = ${JSON.stringify(data, null, 2)}`, 'utf-8');
}

const iconMap = {
  "🗿": "Cục đá biết đi, có não hơn mày đấy!",
  "😂": "Cười muốn xỉu mà chẳng vui chút nào!",
  "😭": "Khóc lóc như con nít, lớn đầu chưa?",
  "❤️": "Yêu đương chi cho khổ, đồ yếu đuối!",
  "👍": "Làm như tao cần mày like lắm vậy!",
  "🤡": "Hề chính hiệu, chắc là mày rồi!",
  "💀": "Chết luôn đi cho đỡ phiền!",
  "🤨": "Nhìn cái mặt là tao thấy nghi rồi đó!",
  "🔥": "Nóng quá ha, nhưng chưa đủ để tao quan tâm!",
  "👻": "Hù tao hả? Mày còn đáng sợ hơn á!",
  "😎": "Ngầu như trái bầu, tự ảo tưởng hả?",
  "💩": "Đúng kiểu mày luôn, đống 💩 biết đi!",
  "🤔": "Suy nghĩ hả? Mày còn não sao?",
  "😡": "Giận đi, giận nữa đi rồi ai quan tâm?",
  "😴": "Ngủ luôn đi, nói chuyện với mày tao mệt quá!",
};

module.exports.run = async ({ api, event, args }) => {
  if (args[0] === "on") {
    data.soiMode = true;
    saveData();
    api.changeBio("Sói đã thức tỉnh!");
    return api.sendMessage("Chế độ Sói đã bật. Sói sẵn sàng cắn!", event.threadID);
  }

  if (args[0] === "off") {
    data.soiMode = false;
    saveData();
    api.changeBio("Sói đã ngủ.");
    return api.sendMessage("Chế độ Sói đã tắt. Sói đi ngủ rồi!", event.threadID);
  }

  return api.sendMessage("Dùng: /soi on | /soi off", event.threadID);
};

module.exports.handleEvent = async ({ api, event }) => {
  if (!data.soiMode) return;

  const { body = '', mentions, type, messageReply, senderID, threadID, messageID } = event;
  if (!body && type !== "message_reply") return;
  if (senderID === api.getCurrentUserID()) return;

  const mentionKeys = Object.keys(mentions || {});
  const mentionedSoi = mentionKeys.includes(api.getCurrentUserID());
  const repliedToSoi = messageReply && messageReply.senderID === api.getCurrentUserID();

  const bịGâyHấn = ["bot láo", "im đi", "câm", "bớt xạo", "sói ngu", "chó sói", "mất dạy", "hỗn", "rác rưởi"];
  const xúcPhạm = bịGâyHấn.some(tu => body.toLowerCase().includes(tu));

  const bịGọi = mentionedSoi || repliedToSoi || xúcPhạm;

  // Phân tích emoji hỗn láo
  if (iconMap[body]) {
    const phrases = [
      `Nhìn cái icon ${body} mà chán đời, ${iconMap[body]} đúng không? Dẹp đi!`,
      `Gửi cái icon ${body} chi vậy? ${iconMap[body]}, mà tao đâu có quan tâm!`,
      `${iconMap[body]}? Haha, cái icon rác gì vậy trời!`,
      `Cái này hả? ${iconMap[body]}. Mày gửi thế để tao ấn tượng chắc?`,
      `Icon ${body} à? ${iconMap[body]}, mà nhìn là tao thấy rảnh rồi đó.`
    ];
    const msg = phrases[Math.floor(Math.random() * phrases.length)];
    return api.sendMessage(msg, threadID, messageID);
  }

  // Lệnh noprefix tiếng Việt
  const lowerBody = body.toLowerCase();

  const noprefixHandlers = [
    {
      keywords: ["sói chửi", "sói chửi tao đi", "sói gắt"],
      prompt: "Chửi tao một câu hỗn láo và hài hước bằng tiếng Việt",
    },
    {
      keywords: ["sói diss", "sói diss tao", "sói đá đểu"],
      prompt: "Diss tao một câu cực gắt và lầy lội bằng tiếng Việt",
    },
    {
      keywords: ["sói khen", "sói khen tao", "sói nịnh"],
      prompt: "Khen tao một cách vừa mỉa mai vừa vui vẻ bằng tiếng Việt",
    },
    {
      keywords: ["sói tâm trạng", "sói mood"],
      prompt: "Nói tâm trạng của tao hôm nay theo kiểu hài hước và hỗn láo bằng tiếng Việt",
    },
    {
      keywords: ["sói châm ngôn", "sói quote"],
      prompt: "Nói một câu châm ngôn triết lý nhưng theo phong cách lươn lẹo và bất cần bằng tiếng Việt",
    }
  ];

  for (const handler of noprefixHandlers) {
    if (handler.keywords.some(kw => lowerBody.includes(kw))) {
      try {
        const res = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: handler.prompt }],
            temperature: 0.9,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        return api.sendMessage(res.data.choices[0].message.content, threadID, messageID);
      } catch (err) {
        return api.sendMessage("Sói bị câm tạm thời rồi, thử lại sau đi!", threadID, messageID);
      }
    }
  }

  if (!bịGọi) return;

  if ((xúcPhạm || repliedToSoi) && !data.blacklist.includes(senderID)) {
    data.blacklist.push(senderID);
    saveData();
  }

  const isBlacklisted = data.blacklist.includes(senderID);
  const prompt = `Mày là Sói - một con sói AI gắt gỏng, hay chửi thề, ngổ ngáo, không biết sợ ai. Có người vừa nói chuyện xúc phạm mày như: "${body}". Hãy phản hồi lại bằng một câu thật gắt, hỗn láo nhưng hài hước, bằng tiếng Việt.`;

  try {
    const completion = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const gptReply = completion.data.choices[0].message.content;
    return api.sendMessage(`Sói: ${gptReply}`, threadID, messageID);
  } catch (error) {
    console.error('Lỗi gọi OpenAI:', error.message);
    const fallback = isBlacklisted
      ? "Lại là mày à? Tao nhớ cái mặt mày rồi đấy!"
      : "Cái gì cơ? Mày muốn ăn đòn à?";
    return api.sendMessage(`Sói: ${fallback}`, threadID, messageID);
  }
};

module.exports.handleReaction = () => {};
