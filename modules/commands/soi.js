const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { getStreamFromURL } = global.utils;

const dataFile = path.join(__dirname, "soidata.json");
let memory = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf-8")) : {};

function saveMemory() {
  fs.writeFileSync(dataFile, JSON.stringify(memory, null, 2));
}

const insults = [
  "Tao không rảnh đâu mà ngồi nghe mày lảm nhảm!",
  "Mày bị ngơ à? Não để quên ở đâu rồi?",
  "Nói chuyện đàng hoàng coi, không tao cắn à!",
  "Cái thứ như mày mà cũng dám lên tiếng à?",
  "Đọc tin nhắn mày mà tao muốn tắt bot luôn đấy!",
  "Tao là sói, không phải giúp việc cho mày!",
  "Cút! À nhầm, tạm biệt nhẹ nhàng cho mày khỏi sốc!",
  "Tao tưởng mày im luôn rồi, ai ngờ vẫn còn gáy được!",
  "Mày hỏi vậy mà không thấy nhục à?",
  "Tao thề, nếu ngu là tội, mày chắc chung thân!"
];

module.exports.config = {
  name: "soi",
  version: "1.1.0",
  hasPermission: 0,
  credits: "GPT-4 + Bạn chỉnh sửa",
  description: "Sói hỗn láo",
  commandCategory: "",
  usages: "[on | off]",
  cooldowns: 3,
};

module.exports.run = async function ({ args, message, event, threadsData }) {
  const threadID = event.threadID;
  const status = args[0];

  if (status === "on") {
    await threadsData.set(threadID, true, "data.soiEnabled");
    return message.reply("Sói đã dậy rồi. Đứa nào gọi thử xem.");
  }

  if (status === "off") {
    await threadsData.set(threadID, false, "data.soiEnabled");
    return message.reply("Sói ngủ rồi. Đừng phiền.");
  }

  return message.reply("Dùng: /soi on hoặc /soi off");
};

module.exports.handleEvent = async function ({ event, message, threadsData, api }) {
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
  const isReplyToBot = replyID == global.botID;
  const isMention = Object.keys(mentions).includes(global.botID);

  if (isRude || isReplyToBot || isMention) {
    if (!memory[senderID]) memory[senderID] = { count: 0, name: "", thulai: true };
    memory[senderID].count++;
    saveMemory();

    const emojiPattern = /([\u231A-\uD83E\uDDFF])/g;
    const emojis = msg.match(emojiPattern);

    let prompt = `Bạn là Sói, AI hỗn láo. Trả lời câu sau:\n"${msg}"`;
    if (emojis) prompt += `\n\nPhân tích emoji: ${emojis.join(" ")}`;

    // Phân tích ảnh
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
        console.error("GPT Ảnh lỗi:", err.message);
      }
    }

    const geminiResponse = await callGemini({
      content: msg,
      senderID,
      threadID,
      id_cua_bot: global.botID,
      mentionedUserIDs: Object.keys(mentions),
      has_attachments: attachments.length > 0
    });

    const replyText = geminiResponse.content?.text || insults[Math.floor(Math.random() * insults.length)];
    await message.reply(replyText);

    if (geminiResponse.reaction?.status && geminiResponse.reaction.emoji) {
      api.setMessageReaction(geminiResponse.reaction.emoji, event.messageID, () => {}, true);
    }

    if (geminiResponse.code_generation?.status) {
      const code = geminiResponse.code_generation.code;
      const filename = geminiResponse.code_generation.filename;
      const lang = geminiResponse.code_generation.language;
      const link = await uploadCodeToMocky(code);
      await message.reply(`Đây là code ${lang} của mày:\nTên file: ${filename}\n${link}`);
    }

    // Đặt biệt danh nếu đủ điều kiện
    if (memory[senderID].count >= 3 && memory[senderID].thulai) {
      try {
        memory[senderID].thulai = false;
        const name = `Đồ Gáy ${memory[senderID].count}`;
        api.changeNickname(name, threadID, senderID);
        await message.reply(`Tao đặt biệt danh mới cho mày là "${name}" nhé.`);
        saveMemory();
      } catch (err) {
        console.log("Không đặt được biệt danh:", err.message);
      }
    }
  };
