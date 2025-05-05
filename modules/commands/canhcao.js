// Module: canhcao.js

const fs = require("fs"); const path = require("path"); const warningPath = path.join(__dirname, "cache", "warnings.json");

if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache")); if (!fs.existsSync(warningPath)) fs.writeFileSync(warningPath, JSON.stringify({}));

module.exports.config = { name: "canhcao", version: "1.1.0", hasPermssion: 1, credits: "Dat Thanh", description: "Cảnh cáo thành viên dùng từ ngữ không phù hợp và tự động kick nếu vượt quá giới hạn", commandCategory: "Quản trị nhóm", usages: "[menu|listvipham|del|kick]", cooldowns: 3 };

const VIOLATION_WORDS = ["đụ", "chịch", "lồn", "cặc", "vú"]; const MAX_WARNINGS = 3;

module.exports.handleEvent = async function ({ event, api, Users }) { try { if (event.senderID === api.getCurrentUserID()) return; const { threadID, messageID, senderID, body } = event; if (!body) return;

const content = body.toLowerCase();
const violatedWord = VIOLATION_WORDS.find(word => content.includes(word));
if (!violatedWord) return;

const warningsData = JSON.parse(fs.readFileSync(warningPath));
if (!warningsData[senderID]) warningsData[senderID] = { count: 0 };

warningsData[senderID].count += 1;
fs.writeFileSync(warningPath, JSON.stringify(warningsData, null, 2));

const name = await Users.getNameUser(senderID);
const count = warningsData[senderID].count;

api.sendMessage({
  body: `⚠️ Cảnh báo: ${name} (UID: ${senderID}) đã vi phạm từ ngữ quy định: "${violatedWord}"

Hiện tại bạn đang ở mức cảnh cáo (${count}/${MAX_WARNINGS}) Nếu vi phạm thêm sẽ bị loại khỏi nhóm!`, mentions: [{ tag: name, id: senderID }] }, threadID, async (err, info) => { if (!err) api.reactToMessage(info.messageID, '😡'); });

if (count >= MAX_WARNINGS) {
  delete warningsData[senderID];
  fs.writeFileSync(warningPath, JSON.stringify(warningsData, null, 2));
  return api.removeUserFromGroup(senderID, threadID);
}

} catch (err) { console.error("[canhcao.handleEvent]", err); } };

module.exports.run = async function ({ api, event, args, Users }) { const { threadID, messageID, senderID, mentions } = event; const warningsData = JSON.parse(fs.readFileSync(warningPath));

const command = args[0]?.toLowerCase(); switch (command) { case "menu": { return api.sendMessage("[ 𝗖𝗔̉𝗡𝗛 𝗖𝗔́𝗢 𝗕𝗢𝗧 ]\n\n⚠️ Vi phạm: " + VIOLATION_WORDS.join(", ") + \n\n- Gửi tin nhắn chứa từ bị cấm sẽ bị cảnh cáo\n- Cảnh cáo 3 lần sẽ bị kick\n\nLệnh hỗ trợ:\n/canhcao listvipham\n/canhcao del (rep hoặc tag hoặc uid)\n/canhcao kick (rep hoặc tag hoặc uid), threadID); }

case "listvipham": {
  if (!Object.keys(warningsData).length)
    return api.sendMessage("✅ Không có người vi phạm nào!", threadID);

  let msg = "📋 Danh sách người vi phạm:\n\n";
  let i = 1;
  for (const [id, info] of Object.entries(warningsData)) {
    const name = await Users.getNameUser(id);
    msg += `#${i++}. 👤 ${name || "Không rõ"}\n🆔 UID: ${id}\n⚠️ Số lần vi phạm: ${info.count}\n\n`;
  }

  return api.sendMessage(msg, threadID);
}

case "del": {
  let targetID = Object.keys(mentions)[0] || event.messageReply?.senderID || args[1];
  if (!targetID || !warningsData[targetID]) return api.sendMessage("Không tìm thấy người dùng trong danh sách vi phạm!", threadID);
  delete warningsData[targetID];
  fs.writeFileSync(warningPath, JSON.stringify(warningsData, null, 2));
  return api.sendMessage(`✅ Đã xóa khỏi danh sách cảnh cáo UID: ${targetID}`, threadID);
}

case "kick": {
  let targetID = Object.keys(mentions)[0] || event.messageReply?.senderID || args[1];
  if (!targetID || !warningsData[targetID]) return api.sendMessage("Không tìm thấy người dùng trong danh sách vi phạm!", threadID);
  delete warningsData[targetID];
  fs.writeFileSync(warningPath, JSON.stringify(warningsData, null, 2));
  api.removeUserFromGroup(targetID, threadID, err => {
    if (err) return api.sendMessage("Không thể kick người dùng!", threadID);
    return api.sendMessage(`👢 Đã kick UID: ${targetID} khỏi nhóm`, threadID);
  });
  break;
}

default:
  return api.sendMessage("[ 𝗖𝗔𝗡𝗛 𝗖𝗔́𝗢 ] → Sai cú pháp, hãy dùng /canhcao menu để xem hướng dẫn.", threadID);

} };

