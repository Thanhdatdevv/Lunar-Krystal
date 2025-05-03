// Module Sói AI: hỗn láo, phản emoji, mỉa mai chính tả & rep module.exports.config = { name: "soi", version: "1.2.0", hasPermission: 0, credits: "GPT-4 + Bạn chỉnh sửa", description: "Sói hỗn láo: chửi nhẹ, phản ứng sai chính tả, xúc phạm, rep khinh bỉ, khịa khi thu hồi ảnh/video", commandCategory: "fun", usages: "[on | off]", cooldowns: 3, envConfig: {} };

const fs = require("fs"); const path = require("path"); const axios = require("axios");

const soidataPath = path.join(__dirname, "cache", "soidata.json"); if (!fs.existsSync(soidataPath)) fs.writeFileSync(soidataPath, JSON.stringify({}));

const reactionMap = { "ngu": ["🤡", "Cái đầu mày dùng để làm cảnh à? Đúng là 🤡"], "sủa": ["🐶", "Mày sủa nghe còn não hơn tiếng chó luôn đó 🐶"], "mẹ mày": ["🖕", "Nhắc mẹ tao nữa tao tét mõm đấy 🖕"], "djtme": ["🖕", "Tao địt lại cả dòng họ mày đấy 🖕"], "dcm": ["🖕", "Bớt nói tục đi, bẩn server 🖕"], "clm": ["🖕", "Cái loại như mày chỉ biết clm là hết vốn từ 🖕"], "vcl": ["🤢", "Mày làm tao muốn ói luôn 🤢"], "vcd": ["🤮", "Cái mồm mày xứng đáng ăn đất 🤮"], "vch": ["🤮", "Nói chuyện với mày là hạ thấp IQ tao 🤮"], "sao": ["👀", "Sao con khùng? Nhìn gì dữ vậy 👀"], "cãi": ["😏", "Cãi với mày phí lời, tao còn việc phải làm 😏"] };

const flirtKeywords = [ "gái", "gái xinh", "con gái", "em gái", "crush", "mlem", "gái đẹp", "thích gái", "yêu gái", "tán gái", "gái rep", "được gái" ];

const repResponses = [ "Rep tao chi vậy trời? Muốn ăn chửi à?", "Tao mà rảnh rep mày thì mày cũng nên rảnh mà đi học lại.", "Người như mày mà cũng biết rep? Ghê gớm thật đấy.", "Cút! Tao không tiếp rác rep.", "Sủa cái gì đó? Về học lại phép lịch sự đi đồ mặt lờ.", "Chó cũng biết rep, nhưng đừng tưởng mày là chó khôn.", "Lần sau rep mà không xin phép là tao cắn á." ];

const wrongSpellings = [ /\bko\b/g, /\bk0\b/g, /\bkhong\b/g, /\bwa\b/g, /\bqua\b/g, /\bthik\b/g, /\bthích\b/g, /\bbik\b/g, /\bbiet\b/g, /\bbit\b/g, /\bhok\b/g, /\bh0k\b/g, /\bh0\b/g, /\bhem\b/g, /\bdz\b/g, /\bz\b/g, /\bj\b/g, /\boke\b/g, /\bok\b/g, /\blike\b/g, /\bplz\b/g, /\btks\b/g, /\bnì\b/g, /\bnìu\b/g, /\bnhìu\b/g, /\biu\b/g, /\byeu\b/g, /\bdag\b/g, /\bdang\b/g, /\bdag\s/g, /\bc0\b/g, /\b0\b/g ];

module.exports.handleEvent = async function ({ event, api }) { try { const { threadID, messageID, senderID, body, type, messageReply } = event;

// 1. Tin nhắn bị thu hồi
if (event.type === "message_unsend" && global?.logMessage?.[event.messageID]) {
  const info = global.logMessage[event.messageID];
  const { senderID, threadID, attachments } = info;
  const media = attachments?.find(att => att.type === "photo" || att.type === "video");

  if (media) {
    try {
      const res = await axios.get(media.url, { responseType: "stream" });
      const name = (await api.getUserInfo(senderID))[senderID]?.name || "Ai đó";

      return api.sendMessage({
        body: `${name} mày gửi cái gì mà cần phải thu đấy!??\nNày mọi người xem nó gửi gì này 👍📢`,
        mentions: [{ id: senderID, tag: name }],
        attachment: res.data
      }, threadID);
    } catch (err) {
      console.error("Lỗi khi tải lại media bị thu:", err);
    }
  }
}

if (!body) return;
const lowerBody = body.toLowerCase();

// 2. Từ ngữ thô tục
for (let keyword in reactionMap) {
  if (lowerBody.includes(keyword)) {
    const [emoji, replyText] = reactionMap[keyword];
    api.setMessageReaction(emoji, messageID, () => {}, true);
    api.sendMessage(replyText, threadID, messageID);
    return;
  }
}

// 3. Từ khóa mê gái
for (let flirt of flirtKeywords) {
  if (lowerBody.includes(flirt)) {
    return api.sendMessage(
      `Thấy gái là sủa à? Hormone dắt mũi mày hả? Cút ra sau xếp hàng.`,
      threadID, messageID
    );
  }
}

// 4. Sai chính tả phổ biến
for (let regex of wrongSpellings) {
  if (regex.test(lowerBody)) {
    return api.sendMessage(
      `Mày viết gì đấy? Lỗi chính tả đầy rẫy như cái não mày vậy. Viết lại cho tử tế đi.`,
      threadID, messageID
    );
  }
}

// 5. Rep người khác
if (type === "message_reply" && messageReply?.senderID !== api.getCurrentUserID()) {
  const random = repResponses[Math.floor(Math.random() * repResponses.length)];
  return api.sendMessage(random, threadID, messageID);
}

} catch (err) { console.error("Sói AI handleEvent error:", err); } };

module.exports.run = async function ({ api, event }) { return api.sendMessage("[Sói AI] Module đang hoạt động. Gâu!", event.threadID); };

