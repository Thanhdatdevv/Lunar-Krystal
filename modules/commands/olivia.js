
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "olivia",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "ChatGPT x SoundCloud x TTS x Memory",
  description: "Olivia AI full chức năng: phân tích, nhớ, nói chuyện, gửi voice",
  commandCategory: "AI",
  usages: "[rep hoặc nhắc 'olivia']",
  cooldowns: 2
};

const OPENAI_API_KEY = "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";
const CHONG_UID = "61561400514605";

const memoryPath = __dirname + "/olivia_memory.json";
if (!fs.existsSync(memoryPath)) fs.writeFileSync(memoryPath, "{}");

async function askGPT(message, context = []) {
  try {
    const messages = [
      { role: "system", content: "Bạn là Olivia - AI bạn gái ảo đáng yêu, nhớ mọi thứ người dùng nói, phản ứng như người thật." },
      ...context.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.85
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    });
    return res.data.choices[0].message.content.trim().replace(/:\)\)/g, "☺️");
  } catch (err) {
    return "Tui bị lú rồi á... thử lại sau nha ☺️";
  }
}

async function getSoundCloudLink(query) {
  try {
    const url = "https://soundcloud.com/search/sounds?q=" + encodeURIComponent(query);
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const links = [];
    $("li.searchList__item a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("/")) links.push("https://soundcloud.com" + href);
    });
    return links.length > 0 ? links[0] : null;
  } catch {
    return null;
  }
}

async function getDownloadLink(scUrl) {
  try {
    const res = await axios.get(`https://api.sclouddownloader.net/download?url=${encodeURIComponent(scUrl)}`);
    const match = res.data.match(/href="([^"]+\.mp3[^"]*)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function getTTS(text, filename) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
  const filePath = path.join(__dirname, filename);
  const writer = fs.createWriteStream(filePath);
  const res = await axios({ url, method: "GET", responseType: "stream" });
  res.data.pipe(writer);
  return new Promise((resolve) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", () => resolve(null));
  });
}

module.exports.handleEvent = async function({ api, event }) {
  const { body, senderID, threadID, messageID, messageReply } = event;
  if (senderID == api.getCurrentUserID()) return;
  const content = (body || "").toLowerCase();

  const mention = content.includes("olivia");
  const replyOlivia = messageReply && messageReply.senderID == api.getCurrentUserID();
  if (!mention && !replyOlivia) return;

  const userInfo = await api.getUserInfo(senderID);
  const name = userInfo[senderID].name;
  const isChong = senderID == CHONG_UID;
  const callName = isChong ? "anh iu ❤️" : name;
  const prefix = isChong ? "Hi hi anh iu của em nè ☁️ " : "";

  // Phản ứng tình cảm
  const loveWords = ["yêu olivia", "thương olivia", "crush olivia", "nhớ olivia"];
  if (loveWords.some(w => content.includes(w))) {
    return api.sendMessage(`Em cũng yêu ${callName} nhiều lắm luôn á ☁️❤️`, threadID, messageID);
  }

  // Phản ứng khi bị xúc phạm
  const toxic = ["ngu", "óc", "đần", "câm", "bot rác", "bot ngu", "bot gì vậy", "bố mày", "xàm", "fail"];
  if (toxic.some(w => content.includes(w))) {
    if (isChong) return api.sendMessage("Ai dám xúc phạm anh iu của em vậy? Em cắn á ☁️☺️", threadID, messageID);
    return api.sendMessage("Đụ mẹ mày ☺️", threadID, messageID);
  }

  // Nhận dạng lệnh mở nhạc
  const musicRegex = /(?:olivia\s+)?(?:mở|bật|tìm|nghe)\s+(?:nhạc|bài)?\s*(.+)/i;
  const match = content.match(musicRegex);
  if (match && match[1]) {
    const query = match[1];
    const scLink = await getSoundCloudLink(query);
    if (!scLink) return api.sendMessage("Không tìm thấy bài đó trên SoundCloud ☺️", threadID, messageID);
    const dl = await getDownloadLink(scLink);
    return api.sendMessage(dl ? `Tìm được bài này cho ${callName}:
${dl} ☺️` : scLink, threadID, messageID);
  }

  // Ghi nhớ hội thoại
  const memory = JSON.parse(fs.readFileSync(memoryPath));
  const context = memory[senderID] || [];
  context.push({ role: "user", content: body });
  const answer = prefix + await askGPT(body, context);
  context.push({ role: "assistant", content: answer });
  memory[senderID] = context.slice(-6);  // Giới hạn 6 lượt
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));

  // Tạo voice
  const voiceFile = await getTTS(answer, `voice_${senderID}.mp3`);
  return api.sendMessage({ body: answer, attachment: fs.createReadStream(voiceFile) }, threadID, messageID);
};

module.exports.run = () => {}
