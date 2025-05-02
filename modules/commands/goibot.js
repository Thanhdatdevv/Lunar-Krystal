const axios = require("axios");

const API_KEY = "Ky5jfsLB"; // Thay bằng API key hợp lệ của bạn
const API_URL = "https://api.simsimi.net/v2/"; // Hoặc một API khác nếu bạn muốn

module.exports.config = {
  name: "goibot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "LunarKrystal",
  description: "Trò chuyện với bot qua API khi nhắc đến từ khoá",
  commandCategory: "Tiện ích",
  usages: "[tin nhắn chứa bot hoặc phản hồi tin nhắn của bot]",
  cooldowns: 2,
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body, messageReply } = event;

  // Nếu không có nội dung tin nhắn, thoát
  if (!body) return;

  // Kiểm tra nếu tin nhắn chứa từ "bot" hoặc là phản hồi tin nhắn của bot
  const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();
  if (body.toLowerCase().indexOf("bot") !== -1 || isReplyToBot) {
    try {
      // Xác định nội dung cần gửi đến API
      const query = isReplyToBot ? messageReply.body : body;

      const response = await axios.get(`${API_URL}?type=ask&ask=${encodeURIComponent(query)}&key=${API_KEY}`);
      const reply = response.data.answer || "Bot không hiểu bạn nói gì.";

      return api.sendMessage(reply, threadID, messageID);
    } catch (error) {
      console.error("API Error:", error);
      return api.sendMessage("Có lỗi xảy ra khi gọi API. Vui lòng thử lại sau!", threadID, messageID);
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // Gửi câu hỏi từ args đến API
  const question = args.join(" ");
  if (!question) return api.sendMessage("Bạn cần nhập nội dung để hỏi bot.", threadID, messageID);

  try {
    const response = await axios.get(`${API_URL}?type=ask&ask=${encodeURIComponent(question)}&key=${API_KEY}`);
    const reply = response.data.answer || "Bot không hiểu bạn nói gì.";

    return api.sendMessage(reply, threadID, messageID);
  } catch (error) {
    console.error("API Error:", error);
    return api.sendMessage("Có lỗi xảy ra khi gọi API. Vui lòng thử lại sau!", threadID, messageID);
  }
};
