const fs = require("fs");
const axios = require("axios");
const moment = require("moment-timezone");

const chongIuUID = "61561400514605";
const loveSchedule = ["07:00", "12:00", "21:00"];
const chatHistoryPath = __dirname + "/../../cache/chatHistories.json";
const nicknamePath = __dirname + "/../../cache/userNicknames.json";
const reminderPath = __dirname + "/../../cache/reminders.json";

let chatHistories = fs.existsSync(chatHistoryPath) ? JSON.parse(fs.readFileSync(chatHistoryPath)) : {};
let userNicknames = fs.existsSync(nicknamePath) ? JSON.parse(fs.readFileSync(nicknamePath)) : {};
let reminders = fs.existsSync(reminderPath) ? JSON.parse(fs.readFileSync(reminderPath)) : {};

let aiStatus = true;

const cuteStickers = [
  "369239263222822",
  "369239343222814",
  "369239383222810",
  "1658194171042057",
  "613602475434008"
];

const randomSticker = () => cuteStickers[Math.floor(Math.random() * cuteStickers.length)];

module.exports.config = {
  name: "botquynh",
  version: "1.0",
  hasPermission: 0,
  credits: "ChatGPT & You",
  description: "Quỳnh - bạn gái AI dễ thương",
  usePrefix: false,
  commandCategory: "chat",
  cooldowns: 1
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { threadID, senderID, body, messageReply, messageID, type, attachments } = event;
  const name = await Users.getNameUser(senderID);

  if (/^AI (on|off)$/i.test(body)) {
    aiStatus = /on/i.test(body);
    return api.sendMessage(`Đã ${aiStatus ? "bật" : "tắt"} chế độ AI`, threadID);
  }

  if (!aiStatus || senderID !== chongIuUID) return;

  if (/quỳnh gọi tôi là (.+)/i.test(body)) {
    const match = body.match(/quỳnh gọi tôi là (.+)/i);
    userNicknames[senderID] = match[1].trim();
    fs.writeFileSync(nicknamePath, JSON.stringify(userNicknames, null, 2));
    return api.sendMessage(`Nhớ rồi nha~ Từ nay Quỳnh sẽ gọi bạn là "${match[1].trim()}"!`, threadID);
  }

  if (/quỳnh xoá biệt danh/i.test(body)) {
    delete userNicknames[senderID];
    fs.writeFileSync(nicknamePath, JSON.stringify(userNicknames, null, 2));
    return api.sendMessage(`Okie, Quỳnh sẽ không gọi bạn bằng biệt danh nữa nha~`, threadID);
  }

  if (/quỳnh nhắc tôi (.+) lúc (\d{1,2}h\d{0,2})/i.test(body)) {
    const [, content, time] = body.match(/quỳnh nhắc tôi (.+) lúc (\d{1,2}h\d{0,2})/i);
    const time24h = time.replace("h", ":");
    if (!reminders[threadID]) reminders[threadID] = [];
    reminders[threadID].push({ uid: senderID, content, time: time24h });
    fs.writeFileSync(reminderPath, JSON.stringify(reminders, null, 2));
    return api.sendMessage(`Đã ghi nhớ: sẽ nhắc bạn "${content}" lúc ${time24h}`, threadID);
  }

  if (/quỳnh tìm bài (.+)/i.test(body)) {
    const keyword = body.match(/quỳnh tìm bài (.+)/i)[1];
    const link = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
    return api.sendMessage(`Tìm được nè~ Bạn nghe thử bài này nha:\n${link}`, threadID);
  }

  if (type === "message" && attachments.length > 0 && attachments[0].type === "photo") {
    return api.sendMessage(`Ảnh này xinh quá~ Là bạn đúng không đó?`, threadID);
  }

  const sadWords = ["buồn", "mệt", "chán", "cô đơn", "tổn thương"];
  if (sadWords.some(w => body.toLowerCase().includes(w))) {
    return api.sendMessage(`Bạn ổn không đó...? Quỳnh ôm bạn một cái nha~`, threadID);
  }

  const mentionBot = event.mentions?.[api.getCurrentUserID()];
  if (mentionBot || messageReply?.senderID === api.getCurrentUserID()) {
    const msg = mentionBot ? body.replace(/@.+/g, "").trim() : body;
    const history = chatHistories[senderID] || [];
    history.push({ role: "user", content: msg });

    const reply = `Chồng iu❤️ ơi~ Quỳnh nghe nè~ ${msg.length > 0 ? msg : "Có gì muốn nói không?"}`;
    chatHistories[senderID] = history.slice(-20);
    fs.writeFileSync(chatHistoryPath, JSON.stringify(chatHistories, null, 2));

    api.setMessageReaction("❤️", messageID, () => {}, true);
    return api.sendMessage(reply, threadID);
  }
};

module.exports.onLoad = ({ api }) => {
  setInterval(() => {
    const now = moment().tz("Asia/Ho_Chi_Minh").format("HH:mm");

    if (loveSchedule.includes(now)) {
      api.sendMessage({
        body: `Chồng iu❤️ ơi~ Quỳnh nhớ chồng ghê á~`,
        sticker: randomSticker()
      }, chongIuUID);
    }

    for (const thread in reminders) {
      reminders[thread].forEach(r => {
        if (r.time === now) {
          api.sendMessage({
            body: `Nhắc nè~ ${r.content}`,
            sticker: randomSticker()
          }, thread);
        }
      });
    }
  }, 60 * 1000);
};
