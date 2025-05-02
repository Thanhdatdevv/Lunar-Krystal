const axios = require("axios");
const get = axios.get;

const API_URL = "https://api.simsimi.net/v2/";

module.exports.config = {
  name: "goibot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "LunarKrystal",
  description: "Trò chuyện với bot qua API khi nhắc đến",
  commandCategory: "Tiện ích",
  usages: "[tin nhắn chứa bot hoặc phản hồi tin nhắn của bot]",
  cooldowns: 2,
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body, senderID, messageReply } = event;

  // Bỏ qua nếu là tin nhắn của bot
  if (senderID == api.getCurrentUserID()) return;

  // Nếu không có nội dung tin nhắn, thoát
  if (!body) return;

  // Kiểm tra nếu tin nhắn chứa từ "bot" hoặc là phản hồi tin nhắn của bot
  const isReplyToBot = messageReply && messageReply.senderID == api.getCurrentUserID();
  if (body.toLowerCase().indexOf("bot") !== -1 || isReplyToBot) {
    try {
      // Xác định nội dung cần gửi đến API
      const query = isReplyToBot ? messageReply.body : body;
      const response = await get(`${API_URL}?type=ask&ask=${encodeURIComponent(query)}`);
      const reply = response.data.answer || "Bot không hiểu bạn nói gì.";

      return api.sendMessage(reply, threadID, messageID);
    } catch (error) {
      return api.sendMessage("Có lỗi xảy ra khi gọi API. Vui lòng thử lại sau!", threadID, messageID);
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  const question = args.join(" ");
  if (!question) return api.sendMessage("Bạn cần nhập nội dung để hỏi bot.", threadID, messageID);

  try {
    const response = await get(`${API_URL}?type=ask&ask=${encodeURIComponent(question)}`);
    const reply = response.data.answer || "Bot không hiểu bạn nói gì.";

    return api.sendMessage(reply, threadID, messageID);
  } catch (error) {
    return api.sendMessage("Có lỗi xảy ra khi gọi API. Vui lòng thử lại sau!", threadID, messageID);
  }
};
