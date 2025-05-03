// Module Sói AI: hỗn láo, phản emoji, mỉa mai chính tả & rep + phản ứng thu hồi ảnh module.exports.config = { name: "soi", version: "1.2.0", hasPermission: 0, credits: "GPT-4 + Bạn chỉnh sửa", description: "Sói hỗn láo: chửi nhẹ, phản ứng sai chính tả, xúc phạm, rep khinh bỉ, phát hiện thu hồi ảnh", commandCategory: "fun", usages: "[on | off]", cooldowns: 3, envConfig: {} };

const fs = require("fs"); const path = require("path"); const axios = require("axios"); const gtts = require("gtts");

const soidataPath = path.join(__dirname, "cache", "soidata.json"); if (!fs.existsSync(soidataPath)) fs.writeFileSync(soidataPath, JSON.stringify({}));

const reactionMap = { "ngu": ["🤡", "Cái đầu mày dùng để làm cảnh à? Đúng là 🤡"], "sủa": ["🐶", "Mày sủa nghe còn não hơn tiếng chó luôn đó 🐶"], "mẹ mày": ["🖕", "Nhắc mẹ tao nữa tao tét mõm đấy 🖕"], "djtme": ["🖕", "Tao địt lại cả dòng họ mày đấy 🖕"], "dcm": ["🖕", "Bớt nói tục đi, bẩn server 🖕"], "clm": ["🖕", "Cái loại như mày chỉ biết clm là hết vốn từ 🖕"], "vcl": ["🤢", "Mày làm tao muốn ói luôn 🤢"], "vcd": ["🤮", "Cái mồm mày xứng đáng ăn đất 🤮"], "vch": ["🤮", "Nói chuyện với mày là hạ thấp IQ tao 🤮"], "sao": ["👀", "Sao con khùng? Nhìn gì dữ vậy 👀"], "cãi": ["😏", "Cãi với mày phí lời, tao còn việc phải làm 😏"] };

const flirtKeywords = [ "gái", "gái xinh", "con gái", "em gái", "crush", "mlem", "gái đẹp", "thích gái", "yêu gái", "tán gái", "gái rep", "được gái" ];

const repResponses = [ "Rep tao chi vậy trời? Muốn ăn chửi à?", "Tao mà rảnh rep mày thì mày cũng nên rảnh mà đi học lại.", "Người như mày mà cũng biết rep? Ghê gớm thật đấy.", "Cút! Tao không tiếp rác rep.", "Sủa cái gì đó? Về học lại phép lịch sự đi đồ mặt lờ.", "Chó cũng biết rep, nhưng đừng tưởng mày là chó khôn.", "Lần sau rep mà không xin phép là tao cắn á." ];

const wrongSpellings = [ /\bko\b/g, /\bk0\b/g, /\bkhong\b/g, /\bwa\b/g, /\bqua\b/g, /\bthik\b/g, /\bthích\b/g, /\bbik\b/g, /\bbiet\b/g, /\bbit\b/g, /\bhok\b/g, /\bh0k\b/g, /\bh0\b/g, /\bhem\b/g, /\bdz\b/g, /\bz\b/g, /\bj\b/g, /\boke\b/g, /\bok\b/g, /\blike\b/g, /\bplz\b/g, /\btks\b/g, /\bnì\b/g, /\bnìu\b/g, /\bnhìu\b/g, /\biu\b/g, /\byeu\b/g, /\bdag\b/g, /\bdang\b/g, /\bdag\s/g, /\bc0\b/g, /\b0\b/g ];

module.exports.handleEvent = async function ({ event, api }) { try { const { threadID, messageID, senderID, body, type, messageReply } = event; if (!body && event.type !== "message_unsend") return;

const lowerBody = body?.toLowerCase?.() || "";

// 1. Thô tục
for (let keyword in reactionMap) {
  if (lowerBody.includes(keyword)) {
    const [emoji, replyText] = reactionMap[keyword];
    api.setMessageReaction(emoji, messageID, () => {}, true);
    api.sendMessage(replyText, threadID, messageID);
    return;
  }
}

// 2. Mê gái
for (let flirt of flirtKeywords) {
  if (lowerBody.includes(flirt)) {
    return api.sendMessage(
      `Thấy gái là sủa à? Hormone dắt mũi mày hả? Cút ra sau xếp hàng.`,
      threadID, messageID
    );
  }
}

// 3. Chính tả
for (let regex of wrongSpellings) {
  if (regex.test(lowerBody)) {
    return api.sendMessage(
      `Mày viết gì đấy? Lỗi chính tả đầy rẫy như cái não mày vậy. Viết lại cho tử tế đi.`,
      threadID, messageID
    );
  }
}

// 4. Rep người khác
if (type === "message_reply" && messageReply?.senderID !== api.getCurrentUserID()) {
  const random = repResponses[Math.floor(Math.random() * repResponses.length)];
  return api.sendMessage(random, threadID, messageID);
}

// 5. Lưu tin nhắn ảnh
if (event.attachments?.length > 0 && event.attachments[0].type === "photo") {
  const historyPath = path.join(__dirname, "cache", "soi_history.json");
  let history = {};
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath));
  }
  if (!history[event.threadID]) history[event.threadID] = {};
  history[event.threadID][event.messageID] = {
    type: "photo",
    attachments: event.attachments
  };
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

// 6. Phản ứng thu hồi
if (event.type === "message_unsend") {
  const { messageID, threadID } = event;
  const historyPath = path.join(__dirname, "cache", "soi_history.json");
  if (!fs.existsSync(historyPath)) return;
  const history = JSON.parse(fs.readFileSync(historyPath));
  const lastMsg = history?.[threadID]?.[messageID];
  if (lastMsg && lastMsg.type === "photo") {
    const imgData = lastMsg.attachments[0].url;
    const ttsPath = path.join(__dirname, "cache", `soi_unsend_${Date.now()}.mp3`);
    const imgPath = path.join(__dirname, "cache", `unsend_${Date.now()}.jpg`);

    // Tải ảnh
    const imgRes = await axios.get(imgData, { responseType: "stream" });
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(imgPath);
      imgRes.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // TTS
    const g = new gtts("Mày gửi cái gì mà phải thu lại hả? Này mọi người xem nó gửi gì nè!");
    await new Promise((res, rej) => g.save(ttsPath, (err) => err ? rej(err) : res()));

    api.sendMessage({
      body: "Thằng này vừa thu hồi ảnh nè. Mọi người xem nó gửi gì kìa! 👍📢",
      attachment: [fs.createReadStream(imgPath), fs.createReadStream(ttsPath)]
    }, threadID);
  }
}

} catch (err) { console.error("Sói AI handleEvent error:", err); } };

module.exports.run = async function ({ api, event }) { return api.sendMessage("[Sói AI] Module đang hoạt động. Gâu!", event.threadID); };

