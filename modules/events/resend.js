const axios = require("axios");

module.exports.config = { name: "resend", eventType: ["message_unsend"], version: "1.0.2", credits: "GPT Dev", description: "Gửi lại tin nhắn hoặc file bị thu hồi" };

module.exports.handleEvent = async function ({ event, api }) { const { messageID, threadID } = event; const msg = global._messageStore?.[messageID]; if (!msg) return;

let name = "Không rõ"; try { const info = await api.getUserInfo(msg.senderID); name = info[msg.senderID]?.name || name; } catch {}

let content = ━━━━━━━━━━━━━━━\n𝗕𝗔̣𝗡 𝗧𝗨̛𝗢̛̉𝗡𝗚 𝗫𝗢𝗔́ 𝗟𝗔̀ 𝗧𝗛𝗢𝗔́𝗧 𝗔̀ 👀\n━━━━━━━━━━━━━━━\n👤 𝗧𝗲̂𝗻: ${name}\n🆔 UID: ${msg.senderID}\n📝 Nội dung: ${msg.body || "Không có văn bản"};

const attachments = []; for (const item of msg.attachments || []) { try { const res = await axios.get(item.url, { responseType: "stream" }); attachments.push(res.data); } catch (e) { console.log("Lỗi tải file:", e.message); } }

return api.sendMessage({ body: content, attachment: attachments }, threadID); };

