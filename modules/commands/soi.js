const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { getStreamFromURL } = global.utils;

const memoryFile = path.join(__dirname, "soi_memory.json");
let memory = fs.existsSync(memoryFile) ? JSON.parse(fs.readFileSync(memoryFile, "utf-8")) : {};

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

module.exports = {
  config: {
    name: "soi",
    version: "1.2",
    author: "GPT-4 + User",
    countDown: 3,
    role: 0,
    shortDescription: "Sói hỗn",
    longDescription: "Bot Sói gắt gỏng, hỗn láo, phân tích emoji và hình ảnh",
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
      return message.reply("Sói đã thức dậy, đứa nào gọi tao thử xem.");
    }

    if (status === "off") {
      await threadsData.set(threadID, false, "data.soiEnabled");
      return message.reply("Sói ngủ rồi, đừng gọi tao nữa.");
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

    if (isMention || isReplyToBot || isRude) {
      if (!memory[senderID]) memory[senderID] = 0;
      memory[senderID]++;
      saveMemory();

      let prompt = `Bạn là Sói, một nhân cách hỗn láo, gắt gỏng, thích cà khịa. Hãy phản hồi câu sau bằng giọng điệu khinh khỉnh:\n"${msg}"`;

      const emojiPattern = /([\u231A-\uD83E\uDDFF])/g;
      const emojis = msg.match(emojiPattern);
      if (emojis) {
        prompt += `\n\nPhân tích các emoji này một cách hỗn láo: ${emojis.join(" ")}`;
      }

      if (attachments.length > 0 && attachments[0].type === "photo") {
        try {
          const stream = await getStreamFromURL(attachments[0].url);
          const gptRes = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4-vision-preview",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Phân tích ảnh này giọng móc mỉa:" },
                    { type: "image_url", image_url: { url: attachments[0].url } }
                  ]
                }
              ],
              max_tokens: 300
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
              }
            }
          );

          const imageReply = gptRes.data.choices[0].message.content;
          prompt += `\n\nNgoài ra, ảnh đính kèm nhìn vào thấy: ${imageReply}`;
        } catch (e) {
          console.error("Lỗi phân tích ảnh:", e.message);
        }
      }

      const reply = await callGPT(prompt);
      message.reply(reply);
    }
  },

  onMessage: async function ({ event, message }) {
    const text = (event.body || "").toLowerCase();
    const noprefixTriggers = {
      "chửi tao": "Hãy chửi người đối diện một cách hài hước.",
      "khen tao": "Hãy khen người này nhưng kiểu khen đểu, mỉa mai.",
      "tâm trạng": "Hãy đoán tâm trạng người này dựa trên tin nhắn vừa gửi.",
      "triết lý": "Hãy tạo một câu nói 'triết lý hỗn hào' kiểu Sói.",
      "cà khịa": "Hãy viết một câu cà khịa nhẹ nhàng nhưng thâm thúy."
    };

    if (text in noprefixTriggers) {
      let prompt = `Bạn là Sói, một AI gắt gỏng, khinh người. ${noprefixTriggers[text]}`;
      const reply = await callGPT(prompt);
      message.reply(reply);
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
          Authorization: `Bearer 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 ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("GPT error:", err.message);
    return "Mạng mẽo gì lag vậy, đợi đi!";
  }
        }
