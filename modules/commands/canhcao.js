const fs = require("fs");
const path = __dirname + "/cache/canhcao.json";
const VIOLATION_WORDS = ["đụ", "chịch", "lồn", "cặc", "vú"];
let data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};

module.exports.config = {
  name: "canhcao",
  version: "1.0",
  hasPermssion: 1,
  credits: "Dat Thanh",
  description: "Cảnh cáo người dùng vi phạm từ ngữ",
  commandCategory: "Quản trị nhóm",
  usages: "/canhcao [menu|del|kick|listvipham]",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { senderID, body, threadID, messageID } = event;

  if (!body || event.isGroup === false || senderID === api.getCurrentUserID()) return;

  const lower = body.toLowerCase();
  const violated = VIOLATION_WORDS.find(word => lower.includes(word));
  if (!violated) return;

  const name = await Users.getNameUser(senderID);
  if (!data[senderID]) data[senderID] = { count: 0 };
  data[senderID].count += 1;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));

  const count = data[senderID].count;
  const warning = `[ 𝗖𝗔̉𝗡𝗛 𝗕𝗔́𝗢 ]
⚠️ ${name} (UID: ${senderID}) đã vi phạm từ: "${violated}"
Bạn còn (${count}/3) lần trước khi bị kick.`;

  api.sendMessage({
    body: warning,
    mentions: [{ tag: name, id: senderID }]
  }, threadID, () => {
    api.setMessageReaction("😡", messageID, () => {}, true);
    if (count >= 3) {
      api.removeUserFromGroup(senderID, threadID);
      delete data[senderID];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }
  });
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, messageReply, mentions } = event;
  const command = args[0]?.toLowerCase();

  switch (command) {
    case "menu": {
      return api.sendMessage(`[ 𝗖𝗔̉𝗡𝗛 𝗖𝗔́𝗢 𝗕𝗢𝗧 ]

⚠️ Vi phạm: ${VIOLATION_WORDS.join(", ")}

- Gửi tin nhắn chứa từ bị cấm sẽ bị cảnh cáo
- Cảnh cáo 3 lần sẽ bị kick

Lệnh hỗ trợ:
/canhcao listvipham
/canhcao del (rep hoặc tag hoặc uid)
/canhcao kick (rep hoặc tag hoặc uid)`, threadID, messageID);
    }

    case "listvipham": {
      if (Object.keys(data).length === 0)
        return api.sendMessage("Không có ai đang bị cảnh cáo.", threadID, messageID);

      let msg = "📋 𝗗𝗔𝗡𝗛 𝗦𝗔́𝗖𝗛 𝗩𝗜 𝗣𝗛𝗔̣𝗠:\n\n";
      let i = 1;
      for (let id in data) {
        const name = await Users.getNameUser(id) || "Không rõ";
        msg += `#${i++}. 👤 ${name}\n🆔 UID: ${id}\n⚠️ Số lần vi phạm: ${data[id].count}\n\n`;
      }
      return api.sendMessage(msg, threadID, messageID);
    }

    case "del": {
      const targetID = getTargetID({ event, args });
      if (!targetID || !data[targetID]) return api.sendMessage("Không tìm thấy người vi phạm.", threadID, messageID);
      delete data[targetID];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("✅ Đã xóa người khỏi danh sách vi phạm.", threadID, messageID);
    }

    case "kick": {
      const targetID = getTargetID({ event, args });
      if (!targetID || !data[targetID]) return api.sendMessage("Không tìm thấy người vi phạm.", threadID, messageID);
      api.removeUserFromGroup(targetID, threadID, err => {
        if (err) return api.sendMessage("❌ Không thể kick người dùng.", threadID, messageID);
        delete data[targetID];
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        return api.sendMessage("✅ Đã kick người khỏi nhóm và xóa khỏi danh sách vi phạm.", threadID, messageID);
      });
      break;
    }

    default: return api.sendMessage("Sai cú pháp. Dùng: /canhcao menu", threadID, messageID);
  }
};

function getTargetID({ event, args }) {
  if (event.messageReply) return event.messageReply.senderID;
  if (Object.keys(event.mentions || {}).length > 0) return Object.keys(event.mentions)[0];
  if (args[1]) return args[1];
  return null;
}
