const fs = require("fs");
const axios = require("axios");
const path = require("path");
const soidataPath = path.join(__dirname, "soidata.json");

let SOI_STATUS = {};
let THU_DAI = {};

if (fs.existsSync(soidataPath)) {
  const data = JSON.parse(fs.readFileSync(soidataPath, "utf-8"));
  SOI_STATUS = data.SOI_STATUS || {};
  THU_DAI = data.THU_DAI || {};
}

module.exports.config = {
  name: "soi",
  version: "1.0.2",
  hasPermission: 0,
  credits: "Dat Thanh",
  description: "Sói hỗn láo, phản ứng khi bị rep, nhắc tên hoặc bị xúc phạm",
  commandCategory: "fun",
  usages: "[on | off]",
  cooldowns: 3,
  envConfig: {}
};

module.exports.run = async function ({ event, api, args }) {
  const { threadID, messageID } = event;
  const status = args[0];

  if (status === "on") {
    SOI_STATUS[threadID] = true;
    saveData();
    return api.sendMessage("Sói đã bật chế độ hỗn.", threadID, messageID);
  }

  if (status === "off") {
    SOI_STATUS[threadID] = false;
    saveData();
    return api.sendMessage("Sói đã im miệng.", threadID, messageID);
  }

  return api.sendMessage("Dùng: /soi on | off", threadID, messageID);
};

module.exports.handleEvent = async function ({ event, api, Users }) {
  const { threadID, messageID, senderID, mentions, type, body, isGroup, replyToMessage } = event;

  const botID = api.getCurrentUserID();
  if (senderID == botID || !SOI_STATUS[threadID]) return;

  const name = (await Users.getNameUser(senderID)) || "mày";
  const isMentioned = mentions?.[botID];
  const isReplyToBot = replyToMessage?.senderID == botID;
  const isInsult = /sói|óc|đần|ngu|địt|lol|lồn|xàm|im|câm/i.test(body);

  if (isMentioned || isReplyToBot || isInsult || THU_DAI[senderID]) {
    if (!THU_DAI[senderID]) THU_DAI[senderID] = 1;
    else THU_DAI[senderID] += 1;
    saveData();

    const prompt = buildPrompt(name, body, THU_DAI[senderID]);
    const reply = await callOpenAI(prompt);

    const emoji = ["😏", "🖕", "🤡", "🙄", "💢"][Math.floor(Math.random() * 5)];
    api.sendMessage({ body: reply, mentions: [{ id: senderID, tag: name }] }, threadID, messageID);
    api.setMessageReaction(emoji, messageID, () => {}, true);

    // Gán biệt danh nếu chưa có
    api.getThreadInfo(threadID, (err, info) => {
      if (!err) {
        const found = info.nicknames[senderID];
        if (!found || !found.includes("Đần")) {
          api.changeNickname(`Đần ${name}`, threadID, senderID);
        }
      }
    });
  }
};

function buildPrompt(name, message, rank) {
  const level = rank >= 5 ? "Cừu thù truyền kiếp" : rank >= 3 ? "Gắt gỏng" : "Hơi cay";
  return `Mày là con sói AI cực kỳ hỗn láo. Mỗi khi có người nói đến mày, mày sẽ chửi lại một cách khinh bỉ, hài hước và không quá tục tĩu. Người đang bị mày chửi tên là ${name}, đã xúc phạm mày cấp độ: ${level}. Tin nhắn: "${message}". Hãy trả lời lại bằng một câu chửi ngắn gọn, cay độc và có chút mỉa mai.`;
}

async function callOpenAI(prompt) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.8
      },
      {
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json"
        }
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (e) {
    return "Mạng lag à? Chửi không nổi luôn!";
  }
}

function saveData() {
  fs.writeFileSync(soidataPath, JSON.stringify({ SOI_STATUS, THU_DAI }, null, 2));
}
