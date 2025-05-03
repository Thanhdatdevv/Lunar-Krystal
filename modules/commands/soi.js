const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { getStreamFromURL } = global.utils;

const memoryFile = path.join(__dirname, "soidata.json"); // Đổi tên file
let memory = fs.existsSync(memoryFile) ? JSON.parse(fs.readFileSync(memoryFile, "utf-8")) : {};

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

module.exports.config = {
  name: "soi",
  version: "1.0.0",
  hasPermission: 0,
  credits: "GPT-4 + Bạn chỉnh sửa",
  description: "Sói hỗn láo, phản ứng khi bị rep, nhắc tên hoặc bị xúc phạm",
  commandCategory: "fun",
  usages: "[on | off]",
  cooldowns: 3,
  envConfig: {}
};

module.exports.onStart = async function ({ args, message, event, threadsData }) {
  const threadID = event.threadID;
  const status = args[0];

  if (status === "on") {
    await threadsData.set(threadID, true, "data.soiEnabled");
    return message.reply("Sói đã thức. Gọi nó mà coi.");
  }

  if (status === "off") {
    await threadsData.set(threadID, false, "data.soiEnabled");
    return message.reply("Sói ngủ rồi. Cấm gọi nó.");
  }

  return message.reply("Dùng: /soi on hoặc /soi off");
};

module.exports.onChat = async function ({ event, message, threadsData, usersData, api }) {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const msg = event.body || "";
  const mentions = event.mentions || {};
  const replyID = event.messageReply?.senderID;
  const attachments = event.attachments || [];

  const soiEnabled = await threadsData.get(threadID, "data.soiEnabled");
  if (!soiEnabled) return;

  const rude = /\b(dcm|dm|địt mẹ|lồn|cặc|súc vật|chó)\b/i;
  const isRude = rude.test(msg);
  const isReplyToBot = event.messageReply?.senderID == global.botID;
  const isMention = Object.keys(mentions).includes(global.botID);

  if (isRude || isReplyToBot || isMention) {
    if (!memory[senderID]) memory[senderID] = { count: 0, nickname: null };
    memory[senderID].count++;
    saveMemory();

    let prompt = `Bạn là Sói AI, khinh người và hỗn hào. Trả lời cực kỳ gắt với nội dung:\n"${msg}"`;

    // Emoji
    const emojiPattern = /([\u231A-\uD83E\uDDFF])/g;
    const emojis = msg.match(emojiPattern);
    if (emojis) prompt += `\n\nPhân tích emoji: ${emojis.join(" ")}`;

    // Ảnh
    if (attachments.length > 0 && attachments[0].type === "photo") {
      try {
        const stream = await getStreamFromURL(attachments[0].url);
        const form = new FormData();
        form.append("file", stream, { filename: "image.jpg" });
        form.append("model", "gpt-4-vision-preview");

        const gptRes = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Phân tích ảnh giọng hỗn hào:" },
                  { type: "image_url", image_url: { url: attachments[0].url } }
                ]
              }
            ],
            max_tokens: 500
          },
          {
            headers: {
              Authorization: `Bearer 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`
            }
          }
        );
        const imageDesc = gptRes.data.choices[0].message.content;
        prompt += `\n\nMô tả ảnh: ${imageDesc}`;
      } catch (err) {
        console.error("Lỗi GPT ảnh:", err.message);
      }
    }

    // Gửi prompt sang Gemini
    const geminiResponse = await callGemini({
      time: new Date().toLocaleString(),
      senderName: event.senderID,
      content: msg,
      threadID,
      senderID,
      id_cua_bot: global.botID,
      mentionedUserIDs: Object.keys(mentions),
      has_attachments: attachments.length > 0
    });

    const replyText = geminiResponse.content?.text || "Sói lười không thèm chửi.";
    await message.reply(replyText);

    // React emoji
    if (geminiResponse.reaction?.status && geminiResponse.reaction.emoji) {
      api.setMessageReaction(geminiResponse.reaction.emoji, event.messageID, () => {}, true);
    }

    // Đổi biệt danh nếu muốn
    if (geminiResponse.hanh_dong?.doi_biet_danh?.status) {
      const newName = geminiResponse.hanh_dong.doi_biet_danh.biet_danh_moi;
      api.changeNickname(newName, threadID, senderID);
      memory[senderID].nickname = newName;
      saveMemory();
    }

    // Gửi code nếu có
    if (geminiResponse.code_generation?.status) {
      const code = geminiResponse.code_generation.code;
      const filename = geminiResponse.code_generation.filename;
      const lang = geminiResponse.code_generation.language;
      const link = await uploadCodeToMocky(code);
      await message.reply(`Đây là code ${lang} của mày:\nTên file: ${filename}\n${link}`);
    }
  }
};

async function callGemini(input) {
  try {
    const res = await axios.post("https://your-gemini-api.com/ai", input);
    return res.data;
  } catch (err) {
    console.error("Gemini API fail:", err.message);
    return {};
  }
}

async function uploadCodeToMocky(code) {
  try {
    const res = await axios.post("https://api.mocky.io/api/mock", code, {
      headers: { "Content-Type": "text/plain" }
    });
    return res.data.link || "Không tạo được link.";
  } catch (err) {
    return "Lỗi khi upload code.";
  }
}
