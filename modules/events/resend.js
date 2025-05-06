const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "resend",
  eventType: ["message", "message_unsend"],
  version: "1.0.0",
  credits: "Dat Thanh",
  description: "Gửi lại tin nhắn đã thu hồi"
};

let messageStore = {};

module.exports.handleEvent = async function ({ api, event }) {
  const { type, messageID, senderID, threadID, body, attachments } = event;

  // Lưu tin nhắn
  if (type === "message") {
    messageStore[messageID] = {
      body,
      attachments,
      senderID,
      threadID,
      timestamp: Date.now()
    };
    return;
  }

  // Khi tin nhắn bị thu hồi
  if (type === "message_unsend" && messageStore[messageID]) {
    const msg = messageStore[messageID];
    const name = await getUserName(api, msg.senderID);

    let resendText = `『 𝙍𝙀𝙎𝙀𝙉𝘿 』\n━━━━━━━━━━━━\n`;
    resendText += `👤 𝗧𝗲̂𝗻: ${name}\n`;
    resendText += `🕒 𝗫𝗼𝗮́ 𝗟𝨈́𝗰: ${new Date().toLocaleTimeString()}\n`;
    resendText += `📝 𝗡𝗼̣̂𝗶 𝗗𝘂𝗻𝗴: ${msg.body || "Không có nội dung"}\n`;
    resendText += `\n» 𝙱𝚊̣𝚗 𝚝𝚞̛𝚘̛̉𝚗𝚐 𝚋𝚊̣𝚗 𝚡𝚘́𝚊 𝚕𝚊̀ 𝚝𝚑𝚘𝚊́𝚝 𝚊̀ 👀`;

    const files = [];

    if (msg.attachments.length > 0) {
      for (const item of msg.attachments) {
        try {
          const res = await axios.get(item.url, { responseType: "stream" });
          files.push(res.data);
        } catch (err) {
          console.log("Không thể gửi lại tệp:", err.message);
        }
      }
    }

    api.sendMessage({ body: resendText, attachment: files }, msg.threadID);
    delete messageStore[messageID];
  }
};

async function getUserName(api, userID) {
  try {
    const info = await api.getUserInfo(userID);
    return info[userID].name || "Người dùng";
  } catch {
    return "Người dùng";
  }
}
