const axios = require("axios");

module.exports.config = {
  name: "resend",
  eventType: ["message", "message_unsend"],
  version: "2.0.0",
  credits: "Dat Thanh",
  description: "Gửi lại tin nhắn hoặc file bị thu hồi"
};

const messageStore = {};

module.exports.handleEvent = async ({ event, api }) => {
  const { type, messageID, senderID, threadID, body, attachments } = event;

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

  if (type === "message_unsend") {
    const msg = messageStore[messageID];
    if (!msg) return;

    let name = "Người dùng";
    try {
      const userInfo = await api.getUserInfo(msg.senderID);
      name = userInfo[msg.senderID]?.name || name;
    } catch {}

    let messageText = `『 𝙍𝙀𝙎𝙀𝙉𝘿 』\n━━━━━━━━━━━━\n`;
    messageText += `👤 𝗧𝗲̂𝗻: ${name}\n`;
    messageText += `🕒 𝗫𝗼𝗮́ 𝗟𝨈́𝗰: ${new Date().toLocaleTimeString()}\n`;
    messageText += `📝 𝗡𝗼̣̂𝗶 𝗗𝘂𝗻𝗴: ${msg.body || "Không có văn bản"}\n`;
    messageText += `\n» 𝙱𝚊̣𝚗 𝚝𝚞̛𝚘̛̉𝚗𝚐 𝚡𝚘́𝚊 𝚕𝚖𝚊̀ 𝚔𝚘 𝚊𝚒 𝚋𝚒𝚎̂́𝚝 𝚊̀ 👀`;

    const attachmentsStream = [];
    for (const attachment of msg.attachments || []) {
      try {
        const stream = await axios.get(attachment.url, { responseType: "stream" });
        attachmentsStream.push(stream.data);
      } catch (e) {
        console.log("Lỗi tải file bị xoá:", e.message);
      }
    }

    api.sendMessage(
      {
        body: messageText,
        attachment: attachmentsStream
      },
      msg.threadID
    );

    delete messageStore[messageID];
  }
};
