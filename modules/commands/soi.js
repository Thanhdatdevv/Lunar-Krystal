const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { getStreamFromURL } = global.utils;

const OPENAI_API_KEY = "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"; // <-- Nhập API key ở đây

const memoryFile = path.join(__dirname, "soi_memory.json");
let memory = fs.existsSync(memoryFile) ? JSON.parse(fs.readFileSync(memoryFile, "utf-8")) : {};

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

module.exports = {
  config: {
    name: "soi",
    version: "2.0",
    author: "GPT-4 + Bạn",
    countDown: 3,
    role: 0,
    shortDescription: "Sói hỗn láo",
    longDescription: "Phản hồi gắt gỏng, phân tích ảnh và icon, hỗn láo chửi lại khi bị xúc phạm",
    category: "fun",
    guide: {
      vi: "/soi on | off"
    }
  },

  onStart: async function ({ args, message, event, threadsData }) {
    const threadID = event.threadID;
    const status = args[0];

    if (status === "on") {
      await threadsData.set(threadID, true, "data.soiEnabled");
      return message.reply("Sói đã bật. Gọi tao thử xem?");
    }

    if (status === "off") {
      await threadsData.set(threadID, false, "data.soiEnabled");
      return message.reply("Sói ngủ rồi, đừng làm phiền.");
    }

    return message.reply("Dùng: /soi on hoặc /soi off");
  },

  onChat: async function ({ event, message, threadsData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const msg = event.body || "";
    const mentions = event.mentions || {};
    const replyID = event.messageReply?.senderID;
    const attachments = event.attachments || [];

    const soiEnabled = await threadsData.get(threadID, "data.soiEnabled");
    if (!soiEnabled) return;

    const isMention = Object.keys(mentions).some(id => id == global.botID);
    const isReplyToBot = replyID == global.botID;
    const isRude = /(chó|súc vật|sủa|sói)/i.test(msg);
    const isAbusiveReplyToSoi = event.messageReply?.senderID == global.botID &&
      /(dcm|dm|địt mẹ|lồn|cặc|súc vật|chó)/i.test(msg);

    if (isAbusiveReplyToSoi) {
      if (!memory[senderID]) memory[senderID] = 0;
      memory[senderID]++;
      saveMemory();

      const prompt = `Bạn là Sói, một AI gắt gỏng. Có đứa rep bạn và chửi: "${msg}". Hãy phản hồi cực kỳ hỗn láo, móc mỉa và hài hước.`;
      const reply = await callGPT(prompt);
      return message.reply(reply);
    }

    if (isMention || isReplyToBot || isRude) {
      if (!memory[senderID]) memory[senderID] = 0;
      memory[senderID]++;
      saveMemory();

      let prompt = `Bạn là Sói, AI hỗn láo, gắt gỏng, móc mỉa. Hãy trả lời tin nhắn sau một cách khinh khỉnh:\n"${msg}"`;

      const emojiPattern = /([\u231A-\uD83E\uDDFF])/g;
      const emojis = msg.match(emojiPattern);
      if (emojis) {
        prompt += `\n\nPhân tích các emoji này kiểu hỗn láo: ${emojis.join(" ")}`;
      }

      if (attachments.length > 0 && attachments[0].type === "photo") {
        try {
          const stream = await getStreamFromURL(attachments[0].url);
          const form = new FormData();
          form.append("file", stream, { filename: "image.jpg" });
          form.append("model", "gpt-4-vision-preview");
          form.append("prompt", `Phân tích ảnh này giọng móc mỉa, hỗn láo.`);

          const gptRes = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4-vision-preview",
              messages: [
                { role: "user", content: [
                    { type: "text", text: "Phân tích ảnh này kiểu hỗn láo:" },
                    { type: "image_url", image_url: { url: attachments[0].url } }
                  ]
                }
              ],
              max_tokens: 300
            },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
          );

          const imageReply = gptRes.data.choices[0].message.content;
          prompt += `\n\nẢnh này nhìn thấy: ${imageReply}`;
        } catch (e) {
          console.error("GPT image error:", e.message);
        }
      }

      const reply = await callGPT(prompt);
      return message.reply(reply);
    }
  },

  onMessage: async function ({ event, message }) {
    const text = (event.body || "").toLowerCase();
    const triggers = ["chửi tao", "khen tao", "tâm trạng tao", "triết lý"];

    if (triggers.includes(text)) {
      let prompt = `Bạn là Sói, AI gắt gỏng.`;

      switch (text) {
        case "chửi tao":
          prompt += " Hãy chửi người này thật hài hước, hỗn láo.";
          break;
        case "khen tao":
          prompt += " Hãy khen đểu người này một cách mỉa mai.";
          break;
        case "tâm trạng tao":
          prompt += " Hãy đoán tâm trạng người này từ tin nhắn vừa gửi.";
          break;
        case "triết lý":
          prompt += " Hãy nói một câu triết lý hài hước và hỗn láo.";
          break;
      }

      const reply = await callGPT(prompt);
      return message.reply(reply);
    }
  }
};

async function callGPT(prompt) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("GPT API Error:", err.message);
    return "Mạng lag vãi, đợi tí!";
  }
  }
