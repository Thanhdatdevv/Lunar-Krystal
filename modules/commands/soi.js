const fs = require('fs');
const axios = require('axios');
const path = __dirname + '/soidata.js';

// === THAY API KEY CỦA BẠN VÀO DÒNG DƯỚI ===
const API_KEY = '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';

module.exports.config = {
  name: "soi",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Sói AI gắt gỏng có thể bật/tắt, chửi, khen, diss, quote và phân tích icon",
  commandCategory: "noprefix",
  usages: "soi chửi | soi khen | soi tâm trạng | soi icon | /soi on | /soi off",
  cooldowns: 3,
};

let data = {
  soiMode: true,
  blacklist: []
};
if (fs.existsSync(path)) data = require(path);
function saveData() {
  fs.writeFileSync(path, `module.exports = ${JSON.stringify(data, null, 2)}`, 'utf-8');
}

// Icon khinh bỉ
const iconResponses = {
  "🗿": "🗿? Nhìn mặt như tượng đá não rỗng, cạn lời!",
  "💀": "💀 Cười gần chết? Mày nên lo não mày chết trước!",
  "😂": "😂 Cười cái gì? Mày nghĩ mày hài hước á?",
  "🤣": "🤣 Mày cười như lên đồng, kiểm tra não chưa?",
  "😒": "😒 Nhìn cái mặt này tao muốn đấm.",
  "😐": "😐 Biểu cảm vô hồn y chang não mày.",
  "👻": "👻 Ma còn sợ mày, đừng làm trò nữa."
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
  const { body = "", mentions, type, messageReply, senderID, threadID } = event;
  const lower = body.toLowerCase();

  // === XỬ LÝ CÂU LỆNH NOPREFIX ===
  const noprefixCommand = lower.trim();
  const commandMap = {
    "soi chửi": "Có người thách mày chửi nó. Chửi thật gắt gỏng và hài hước vào!",
    "soi diss": "Có người thách mày diss nó. Hãy diss thật gắt và sáng tạo!",
    "soi khen": "Hãy khen người này, nhưng kiểu mỉa mai, châm biếm như một con sói gắt.",
    "soi quote": "Nói một câu quote ngầu lòi kiểu như dân chơi sói thật sự.",
    "soi tâm trạng": "Phân tích tâm trạng người vừa nhắn, kiểu gắt và cà khịa."
  };

  const matchedCommand = Object.keys(commandMap).find(cmd => noprefixCommand.startsWith(cmd));
  if (matchedCommand && data.soiMode) {
    const prompt = commandMap[matchedCommand];

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
      return api.sendMessage(`Sói: ${completion.data.choices[0].message.content}`, threadID);
    } catch (err) {
      console.error(err.message);
      return api.sendMessage("Sói đang bị nghẽn não, thử lại sau!", threadID);
    }
  }

  // === PHẢN ỨNG ICON KHINH BỈ ===
  const foundIcon = Object.keys(iconResponses).find(icon => body.includes(icon));
  if (foundIcon && data.soiMode) {
    return api.sendMessage(`Sói: ${iconResponses[foundIcon]}`, threadID);
  }

  // === CHẾ ĐỘ GẮT GỎNG KHI BỊ GỌI / XÚC PHẠM ===
  if (!data.soiMode) return;

  const mentionKeys = Object.keys(mentions || {});
  const mentionedSoi = mentionKeys.some(uid => uid === api.getCurrentUserID());
  const repliedToSoi = messageReply && messageReply.senderID === api.getCurrentUserID();
  const xúcPhạm = ["bot láo", "im đi", "câm", "xàm", "sói ngu", "mất dạy", "súc vật", "óc chó", "rác rưởi"].some(t => lower.includes(t));
  const bịGọi = mentionedSoi || repliedToSoi || xúcPhạm;
  if (!bịGọi) return;

  if ((xúcPhạm || repliedToSoi) && !data.blacklist.includes(senderID)) {
    data.blacklist.push(senderID);
    saveData();
  }

  const isBlacklisted = data.blacklist.includes(senderID);
  const prompt = `Mày là Sói - một con sói AI gắt gỏng, hay chửi thề, ngổ ngáo, không biết sợ ai. Có người vừa nói: "${body}". Hãy phản hồi lại bằng một câu thật gắt, hỗn láo nhưng hài hước, bằng tiếng Việt.`;

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
    return api.sendMessage(`Sói: ${gptReply}`, threadID);
  } catch (error) {
    console.error('Lỗi gọi OpenAI:', error.message);
    const fallback = isBlacklisted
      ? "Lại là mày à? Tao nhớ cái mặt mày rồi đấy!"
      : "Cái gì cơ? Mày muốn ăn đòn à?";
    return api.sendMessage(`Sói: ${fallback}`, threadID);
  }
};

module.exports.handleReaction = () => {};
