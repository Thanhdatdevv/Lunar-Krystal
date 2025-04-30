const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "olivia",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Olivia AI ",
  commandCategory: "AI",
  usages: "[ảnh hoặc nhắc olivia]",
  cooldowns: 2
};

const OPENAI_API_KEY = "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";

const greetings = {
  morning: "Chào buổi sáng nha, chúc bạn một ngày thật năng lượng nè ☀️",
  noon: "Chào buổi trưa, nghỉ ngơi chút rồi tiếp tục chiến nha 🍱",
  afternoon: "Chiều rồi đó, uống miếng nước cho đỡ mệt nha ☕",
  evening: "Tối rồi, nhớ nghỉ ngơi và đừng thức khuya quá nhen ✨"
};

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return greetings.morning;
  if (hour >= 11 && hour < 14) return greetings.noon;
  if (hour >= 14 && hour < 18) return greetings.afternoon;
  return greetings.evening;
}

async function askGPT(text, imageUrl = null) {
  const messages = [
    { role: "system", content: "Bạn là Olivia - một cô gái AI thân thiện, dễ thương, biết tự xưng là 'Olivia'." },
    { role: "user", content: imageUrl ? `Hãy mô tả ảnh này: ${imageUrl}` : text }
  ];
  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.8
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    });
    return res.data.choices[0].message.content;
  } catch (err) {
    return "Olivia đang hơi lag xíu, thử lại sau nha ☺️";
  }
}

module.exports.handleEvent = async function({ api, event }) {
  const { body, senderID, threadID, messageID, messageReply, attachments } = event;
  if (senderID == api.getCurrentUserID()) return;

  const content = (body || "").toLowerCase();
  const mentionOlivia = content.includes("olivia");
  const isReplyToOlivia = messageReply && messageReply.senderID == api.getCurrentUserID();
  const hasPhoto = attachments && attachments.length > 0 && attachments[0].type === "photo";

  if (hasPhoto) {
    const photoUrl = attachments[0].url;
    const reply = await askGPT("", photoUrl);
    return api.sendMessage("Olivia xem ảnh nè:
" + reply, threadID, messageID);
  }

  if (mentionOlivia || isReplyToOlivia) {
    const greeting = getTimeGreeting();
    const reply = await askGPT(body);
    return api.sendMessage(greeting + "
" + reply, threadID, messageID);
  }
};

module.exports.run = () => {}
