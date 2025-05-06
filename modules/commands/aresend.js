const axios = require('axios');

let messageStorage = new Map();

module.exports.config = {
  name: "resend",
  version: "1.0.1",
  hasPermission: 0,
  credits: "GPT Dev",
  description: "Gửi lại ảnh/video/file nếu thành viên thu hồi",
  commandCategory: "Nhóm",
  usages: "",
  cooldowns: 5,
};

module.exports.handleEvent = async function ({ event, api }) {
  const { threadID, messageID, type, senderID } = event;

  // Ghi nhớ tin nhắn nếu có đính kèm
  if (event.attachments?.length > 0) {
    messageStorage.set(messageID, {
      senderID,
      attachments: event.attachments,
      body: event.body || '',
    });

    // Tự xoá sau 5 phút
    setTimeout(() => messageStorage.delete(messageID), 5 * 60 * 1000);
  }

  // Nếu có unsend
  if (type === "message_unsend") {
    const cached = messageStorage.get(messageID);
    if (!cached) return;

    const userName = await api.getUserInfo(cached.senderID)
      .then(res => res[cached.senderID]?.name || "Không rõ");

    const msg = {
      body: `━━━━━━━━━━━━━━━\n𝗕𝗔̣𝗡 𝗧𝗨̛𝗢̛̉𝗡𝗚 𝗫𝗢𝗔́ 𝗟𝗔̀ 𝗧𝗛𝗢𝗔́𝗧 𝗔̀ 👀\n━━━━━━━━━━━━━━━\n👤 𝗧𝗲̂𝗻: ${userName}\n🆔 𝗨𝗜𝗗: ${cached.senderID}\n💬 𝗡𝗼̣̂𝗶 𝗗𝘂𝗻𝗴: ${cached.body || "[Không có nội dung]"}`
    };

    // Gửi lại file đính kèm (nếu có)
    if (cached.attachments.length > 0) {
      msg.attachment = [];

      for (const item of cached.attachments) {
        try {
          const res = await axios.get(item.url, { responseType: 'stream' });
          msg.attachment.push(res.data);
        } catch (err) {
          console.log("Lỗi tải lại file:", err.message);
        }
      }
    }

    return api.sendMessage(msg, threadID);
  }
};
