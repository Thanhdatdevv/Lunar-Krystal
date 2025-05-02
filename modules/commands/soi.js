
const fs = require('fs');
const axios = require('axios');
const path = __dirname + '/soidata.js';

// === THAY API KEY CỦA BẠN VÀO DÒNG DƯỚI ===
const API_KEY = 'YOUR_OPENAI_API_KEY_HERE';

module.exports.config = {
  name: "soi",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ChatGPT + Tùy chỉnh bởi bạn",
  description: "Sói AI gắt gỏng, phản ứng khi bị rep, nhắc tên, hoặc xúc phạm",
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

  const { body, mentions, type, messageReply, senderID } = event;
  if (!body && type !== "message_reply") return;

  const mentionKeys = Object.keys(mentions || {});
  const mentionedSoi = mentionKeys.some(uid => uid === api.getCurrentUserID());
  const repliedToSoi = messageReply && messageReply.senderID === api.getCurrentUserID();

  const bịGâyHấn = ["bot láo", "im đi", "câm", "bớt xạo", "sói ngu", "chó sói", "mất dạy", "hỗn", "rác rưởi"];
  const xúcPhạm = bịGâyHấn.some(tu => body?.toLowerCase().includes(tu));

  const bịGọi = mentionedSoi || repliedToSoi || xúcPhạm;
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
    return api.sendMessage(`Sói: ${gptReply}`, event.threadID);
  } catch (error) {
    console.error('Lỗi gọi OpenAI:', error.message);
    const fallback = isBlacklisted
      ? "Lại là mày à? Tao nhớ cái mặt mày rồi đấy!"
      : "Cái gì cơ? Mày muốn ăn đòn à?";
    return api.sendMessage(`Sói: ${fallback}`, event.threadID);
  }
};

module.exports.handleReaction = () => {};
