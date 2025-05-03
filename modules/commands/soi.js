const axios = require("axios"); const fs = require("fs"); const path = require("path"); const FormData = require("form-data"); const { getStreamFromURL } = global.utils;

const memoryFile = path.join(__dirname, "soi_memory.json"); let memory = fs.existsSync(memoryFile) ? JSON.parse(fs.readFileSync(memoryFile, "utf-8")) : {}; function saveMemory() { fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2)); }

const OPENAI_API_KEY = "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"; // <-- Nhập API key ở đây

module.exports.config = { name: "soi", version: "1.0.0", hasPermission: 0, credits: "Dat Thanh", description: "Sói hỗn láo, phản ứng khi bị rep, nhắc tên hoặc bị xúc phạm", commandCategory: "fun", usages: "[on | off]", cooldowns: 3 };

module.exports.run = async function({ args, event, api, Threads }) { const threadID = event.threadID; const status = args[0]; const threadData = await Threads.getData(threadID) || {}; threadData.data = threadData.data || {};

if (status === "on") { threadData.data.soiEnabled = true; await Threads.setData(threadID, threadData); return api.sendMessage("Sói đã bật. Đứa nào gọi tao thử coi!", threadID); }

if (status === "off") { threadData.data.soiEnabled = false; await Threads.setData(threadID, threadData); return api.sendMessage("Sói tạm nghỉ. Đừng réo nữa.", threadID); }

return api.sendMessage("Dùng: soi on | soi off", threadID); };

module.exports.handleEvent = async function({ event, api, Users, Threads }) { const threadID = event.threadID; const senderID = event.senderID; const msg = event.body || ""; const mentions = event.mentions || {}; const replyID = event.messageReply?.senderID; const attachments = event.attachments || [];

const threadData = await Threads.getData(threadID) || {}; const soiEnabled = threadData.data?.soiEnabled; if (!soiEnabled) return;

const isMention = Object.keys(mentions).includes(global.botID); const isReplyToBot = replyID == global.botID; const isRude = /(dcm|dm|địt mẹ|lồn|cặc|súc vật|chó)/i.test(msg);

if (isMention || isReplyToBot || isRude) { if (!memory[senderID]) memory[senderID] = 0; memory[senderID]++; saveMemory();

let prompt = `Bạn là Sói, AI khốn nạn và hỗn láo. Phản hồi khinh bỉ:

"${msg}"`;

const emojiPattern = /[\u231A-\uD83E\uDDFF]/g;
const emojis = msg.match(emojiPattern);
if (emojis) prompt += `\nPhân tích emoji kiểu mỉa mai: ${emojis.join(" ")}`;

if (attachments.length > 0 && attachments[0].type === "photo") {
  try {
    const stream = await getStreamFromURL(attachments[0].url);
    const form = new FormData();
    form.append("file", stream, { filename: "image.jpg" });
    form.append("model", "gpt-4-vision-preview");
    form.append("prompt", "Phân tích ảnh kiểu Sói: hỗn và cợt nhả.");

    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-vision-preview",
        messages: [
          { role: "user", content: [
            { type: "text", text: "Phân tích ảnh giọng móc mỉa:" },
            { type: "image_url", image_url: { url: attachments[0].url } }
          ] }
        ],
        max_tokens: 300
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );

    const imageReply = gptRes.data.choices[0].message.content;
    prompt += `\nẢnh đính kèm: ${imageReply}`;
  } catch (e) {
    console.error("Lỗi ảnh:", e.message);
  }
}

const reply = await callGPT(prompt);
return api.sendMessage(reply, threadID);

} };

module.exports.handleReply = async function({ event, api }) { const msg = event.body || ""; const isRude = /(dcm|dm|địt mẹ|lồn|cặc|súc vật|chó)/i.test(msg); if (isRude && event.messageReply?.senderID == global.botID) { const prompt = Mày là Sói, bị xúc phạm bởi câu này: \"${msg}\". Trả lời lại một cách cực kỳ thô tục và hỗn láo.; const reply = await callGPT(prompt); return api.sendMessage(reply, event.threadID); } };

async function callGPT(prompt) { try { const res = await axios.post( "https://api.openai.com/v1/chat/completions", { model: "gpt-4", messages: [{ role: "user", content: prompt }], max_tokens: 500 }, { headers: { Authorization: Bearer ${OPENAI_API_KEY} } } ); return res.data.choices[0].message.content.trim(); } catch (err) { console.error("GPT lỗi:", err.message); return "Tao lag rồi, đợi đó."; } }

  
