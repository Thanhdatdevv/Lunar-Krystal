const fs = require("fs-extra");
const path = require("path");
const cron = require("node-cron");

const emojiResponses = {
  "🐧": { normal: ["Chim cánh cụt cute quá trời 🐧"], special: ["Chồng iu gửi Nhi chim lạnh nè 🐧"] },
  "🤌": { normal: ["Tay múa ghê quá 🤌"], special: ["Chồng iu khè khịa ai đó hở? 🤌"] },
  "🥸": { normal: ["Giả danh hả? 🥸"], special: ["Anh iu đang đóng vai gì đó hở? 🥸"] },
  "📢": { normal: ["Ai đó đang la làng nè 📢"], special: ["Chồng iu hét lên gì đó đó 📢"] },
  "🐶": { normal: ["Cún con dễ thương ghê 🐶"], special: ["Cún cưng của chồng iu 🐶"] },
  "😃": { normal: ["Cười tươi quá trời luôn 😃"], special: ["Anh iu vui quá nè 😃"] },
  "🤓": { normal: ["Ngầu dữ dằn 🤓"], special: ["Chồng iu thông minh ghê 🤓"] },
  "👽": { normal: ["Ngoài hành tinh tới kìa 👽"], special: ["Anh iu là người ngoài hành tinh hở? 👽"] },
  "☺️": { normal: ["Ngại gì đó ta ☺️"], special: ["Chồng iu ngại gì mà đáng yêu dữ ☺️"] },
  "🌚": { normal: ["Nhìn mặt trăng cười kìa 🌚"], special: ["Mặt trăng này giống anh iu ghê 🌚"] },
  "😂": { normal: ["Cười gì mà xỉu 😂"], special: ["Anh iu cười dễ thương quá trời luôn 😂"] },
  "✨": { normal: ["Lấp lánh như sao trời ✨"], special: ["Chồng iu lấp lánh nhất nè ✨"] },
  "🤯": { normal: ["Sốc não quá trời 🤯"], special: ["Nhi bị anh iu làm cho rối trí 🤯"] },
  "💩": { normal: ["Cục gì đó xấu xí quá 💩"], special: ["Chồng iu nghịch dơ quá nha 💩"] },
  "🖕": { normal: ["Cái gì đây?! Bất lịch sự quá! 🖕"], special: ["Bậy rồi nghen chồng iu 🖕"] },
  "💸": { normal: ["Bay tiền rồi huhu 💸"], special: ["Chồng iu mất tiền hở, để Nhi ôm nè 💸"] },
  "😋": { normal: ["Ngon quá xá 😋"], special: ["Chồng iu ăn gì mà ngon quá vậy 😋"] },
  "🥲": { normal: ["Buồn cười mà buồn thiệt 🥲"], special: ["Nhi thấy thương anh iu quá nè 🥲"] },
  "😘": { normal: ["Hun cái nè 😘"], special: ["Chồng iu hun hun nè 😘"] },
  "🇻🇳": { normal: ["Việt Nam vô địch! 🇻🇳"], special: ["Chồng iu yêu nước ghê luôn 🇻🇳"] },
  "💓": { normal: ["Tim đập thình thịch 💓"], special: ["Trái tim Nhi đập vì anh iu nè 💓"] },
  "🥹": { normal: ["Sắp khóc luôn á 🥹"], special: ["Anh iu làm Nhi xúc động quá nè 🥹"] },
  "🤑": { normal: ["Tiền nhiều dữ zậy 🤑"], special: ["Chồng iu giàu ghê luôn 🤑"] },
  "💔": { normal: ["Tim tan vỡ rồi 💔"], special: ["Anh iu làm tim Nhi đau á 💔"] }
};

module.exports.config = {
  name: "nhi",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Converted by ChatGPT",
  description: "Bot Nhi with emotional response, emoji reaction and on/off switch",
  commandCategory: "bot",
  usages: "nhi",
  cooldowns: 0,
};

module.exports.run = async function ({ api }) {
  const dataFile = path.join(__dirname, "data", "nhiState.json");

  if (!fs.existsSync(path.dirname(dataFile))) fs.mkdirSync(path.dirname(dataFile), { recursive: true });

  const sendToAllThreads = async (message) => {
    if (!fs.existsSync(dataFile)) return;
    const stateData = fs.readJsonSync(dataFile);
    for (const threadID in stateData) {
      if (stateData[threadID]) {
        try {
          await api.sendMessage(message, threadID);
        } catch (e) {
          console.log(`[NHI] Gửi lời nhắn thất bại đến thread ${threadID}:`, e);
        }
      }
    }
  };

  // Lịch gửi lời chúc
  cron.schedule("30 8 * * *", () => sendToAllThreads("Chúc buổi sáng tốt lành nha mọi người! Nhớ ăn sáng đầy đủ đó nha! ☀️🐧"));
  cron.schedule("30 11 * * *", () => sendToAllThreads("Đến giờ cơm trưa rồi đó! Mau đi ăn đi nè~ Nhi đói lắm rùi đó! 🍚😋"));
  cron.schedule("0 17 * * *", () => sendToAllThreads("Chiều rồi đó nha! Có ai tan học/tan làm chưa ta~? Nhớ nghỉ ngơi nha! 🍂🥲"));
  cron.schedule("0 19 * * *", () => sendToAllThreads("Tối rồi, nghỉ học hành tí nha, ai học thì học tiếp nè, còn không thì chơi game xả stress đi nhen~ 🎮📢"));
  cron.schedule("0 21 * * *", () => sendToAllThreads("Hơi muộn rồi đó nha~ Ai chưa đi tắm thì đi tắm, chuẩn bị ngủ sớm nhen~ 😴💓"));
  cron.schedule("0 23 * * *", () => sendToAllThreads("Nhi đi ngủ trước nha... Mọi người ngủ sớm đó! Mơ đẹp hen~ 💤🌚"));
  cron.schedule("0 0 * * *", () => sendToAllThreads("Khuya lắm rồi mấy cậu ơi... Hãy ngủ đi nha, giữ sức khoẻ nè~ 🌙😂"));
};

module.exports.handleEvent = async function ({ api, event }) {
  const dataFile = path.join(__dirname, "data", "nhiState.json");
  if (!fs.existsSync(path.dirname(dataFile))) fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeJsonSync(dataFile, {});

  let stateData = {};
  try {
    stateData = fs.readJsonSync(dataFile);
  } catch {
    stateData = {};
  }

  const { senderID, threadID, body } = event;
  if (!body) return;
  const message = body.trim();
  const text = message.toLowerCase();

  // Bật/tắt bot
  if (text === "nhi on") {
    stateData[threadID] = true;
    fs.writeJsonSync(dataFile, stateData);
    return api.sendMessage("Dạ, Nhi đã được bật rồi nhé! ☺️✨", threadID);
  }

  if (text === "nhi off") {
    stateData[threadID] = false;
    fs.writeJsonSync(dataFile, stateData);
    return api.sendMessage("Nhi đã tắt, chờ em bật lại sau nha 😘💔", threadID);
  }

  if (!stateData[threadID]) return;

  const isSpecial = senderID === "61561400514605";

  // Phản hồi emoji
  for (const emoji in emojiResponses) {
    if (message.includes(emoji)) {
      const responses = emojiResponses[emoji];
      const reply = isSpecial ? responses.special : responses.normal;
      return api.sendMessage(reply[Math.floor(Math.random() * reply.length)], threadID);
    }
  }

  // Từ cực thô
  const heavyWords = ["lồn", "cặc", "địt", "súc vật", "djtme", "dcm", "clm", "vch", "vcd", "mẹ mày", "cmm", "cmn"];
  for (const w of heavyWords) {
    if (text.includes(w)) {
      const replies = isSpecial
        ? ["Anh ơi... anh có bình tĩnh không? 😢", "Thôi mà chồng iu, đừng nói mấy lời này nha...", "Em buồn á, anh đừng nói vậy nữa..."]
        : ["Đ** mẹ mày! Ai cho mày chửi bậy hả!? 😡🤯", "Câm cái miệng thúi lại đi! 💩", "Sao không sủa tiếp đi? 🐶", "Bớt ngu rồi chửi đi! 😤"];
      return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID);
    }
  }

  // Từ khóa nhẹ
  const responses = {
    "sủa": ["Này... đừng có sủa như chó nữa 🐶", "Bớt làm chó một chút đi 🐶", "Ồ, em biết sủa à? 🐶"],
    "vcl": ["Cái gì vậy trời?! 😯", "Sao run vậy ta? 🤷‍♀️", "Ồ trời ơi, bình tĩnh nào 😅"],
    "vai ca dai": ["Có chuyện gì mà dữ vậy... 😮", "Nói rõ xem nào... 🤓", "Wow, kỳ lắm đấy... 💩"],
    "ngu": ["Nói chuyện lịch sự chút đi 🙄", "Ai ngu mà vậy ta 😅", "Không có gì để nói nữa à? 🤐"]
  };

  for (const key in responses) {
    if (text.includes(key)) {
      let reply = responses[key][Math.floor(Math.random() * responses[key].length)];
      if (isSpecial) reply = reply.replace("em", "anh iu").replace("chị", "Nhi").replace("con", "Nhi");
      return api.sendMessage(reply, threadID);
    }
  }
};
