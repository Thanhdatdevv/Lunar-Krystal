module.exports.config = {
  name: "resend",
  eventType: ["message_unsend"],
  version: "1.1",
  credits: "Dat Thanh",
  description: "Gửi lại tin nhắn bị thu hồi (ảnh, video, file...)"
};

module.exports.handleEvent = async function({ api, event, Users }) {
  const { messageID, senderID, threadID } = event;

  if (!global._unsendMessages) return;

  const msg = global._unsendMessages[messageID];
  if (!msg) return;

  const name = (await Users.getNameUser(senderID)) || "Người dùng";
  let msgText = `⚠️ 𝗕𝗔̣𝗡 𝗧𝗨̛𝗢̛̉𝗡𝗚 𝗕𝗔̣𝗡 𝗫𝗢𝗔́ 𝗟𝗔̀ 𝗧𝗛𝗢𝗔́𝗧 𝗔̀ 👀\n`;
  msgText += `Người thu hồi: ${name} (UID: ${senderID})\n`;
  if (msg.body) msgText += `💬 Nội dung: ${msg.body}`;

  const sendData = {
    body: msgText,
    attachment: msg.attachments || []
  };

  return api.sendMessage(sendData, threadID);
};

module.exports.run = async () => {};
