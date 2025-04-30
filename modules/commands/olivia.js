
const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
  name: "olivia",
  version: "5.2.0",
  hasPermssion: 0,
  credits: "ChatGPT x SoundCloud",
  description: "Olivia AI trả lời thông minh và tìm nhạc SoundCloud",
  commandCategory: "AI",
  usages: "[olivia + câu hỏi hoặc mở nhạc]",
  cooldowns: 2
};

const OPENAI_API_KEY = "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";

async function askGPT(message) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Bạn là một trợ lý AI thân thiện tên Olivia, luôn tư vấn và đặt câu hỏi ngược lại người dùng." },
          { role: "user", content: message }
        ],
        temperature: 0.9
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    return res.data.choices[0].message.content.trim().replace(/:\)\)/g, "☺️");
  } catch (error) {
    return "Tui bị lú rồi á... thử lại sau nha ☺️";
  }
}

async function getSoundCloudLink(query) {
  try {
    const searchUrl = "https://soundcloud.com/search/sounds?q=" + encodeURIComponent(query);
    const res = await axios.get(searchUrl);
    const $ = cheerio.load(res.data);
    const links = [];
    $("li.searchList__item a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("/")) links.push("https://soundcloud.com" + href);
    });
    return links.length > 0 ? links[0] : null;
  } catch (e) {
    return null;
  }
}

async function getDownloadLink(soundcloudUrl) {
  try {
    const res = await axios.get(`https://api.sclouddownloader.net/download?url=${encodeURIComponent(soundcloudUrl)}`);
    const matches = res.data.match(/href="([^"]+\.mp3[^"]*)"/);
    return matches ? matches[1] : null;
  } catch (e) {
    return null;
  }
}

module.exports.handleEvent = async function({ api, event }) {
  const { body, senderID, threadID, messageID, messageReply } = event;
  if (senderID == api.getCurrentUserID()) return;
  const content = (body || "").toLowerCase();

  const mentionOlivia = content.includes("olivia");
  const isReplyToOlivia = messageReply && messageReply.senderID == api.getCurrentUserID();

  if (!mentionOlivia && !isReplyToOlivia) return;

  const userName = (await api.getUserInfo(senderID))[senderID].name.split(" ").slice(-1)[0];
  const musicTrigger = ["mở nhạc", "play", "nghe nhạc", "bật nhạc", "mở bài", "nghe bài"];

  if (musicTrigger.some(w => content.includes(w))) {
    const match = content.match(/(?:mở nhạc|nghe nhạc|bật nhạc|mở bài|nghe bài|play) (.+)/);
    if (match && match[1]) {
      const songName = match[1];
      const scLink = await getSoundCloudLink(songName);
      if (!scLink) return api.sendMessage("Không tìm thấy bài đó trên SoundCloud á ☺️", threadID, messageID);
      const dlLink = await getDownloadLink(scLink);
      if (!dlLink) return api.sendMessage(`Tìm được bài này nè ${userName}: ${scLink}\nNhưng chưa tải được file nhạc ☺️`, threadID, messageID);
      return api.sendMessage(`Tìm được bài này nè ${userName}:
${dlLink} ☺️`, threadID, messageID);
    }
  }

  const question = body || (messageReply && messageReply.body) || "Bạn muốn hỏi gì nè ☺️";
  const answer = await askGPT(question);
  return api.sendMessage(answer, threadID, messageID);
};

module.exports.run = () => {}
