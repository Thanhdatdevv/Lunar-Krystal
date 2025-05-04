/**

Module Nhi bot for Mirai Project

Tính năng: nhi on/off, trả lời khi được gọi, phản ứng cảm xúc, tính toán, đổi biệt danh, gửi sticker, chào theo giờ */


const fs = require("fs-extra"); const path = require("path");

module.exports.config = { name: "nhi", version: "1.3", hasPermssion: 0, credits: "Dat Thanh", description: "Bot Nhi dễ thương trả lời khi gọi tên hoặc rep", commandCategory: "noprefix", usages: "Gọi 'nhi' để trò chuyện hoặc 'nhi on/off' để bật tắt", cooldowns: 3 };

const dataPath = path.join(__dirname, "nhi_status.json"); if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}));

const greetings = { morning: ["Chào buổi sáng nè! Chúc bạn một ngày thật tươi!", "Mới sáng đã gọi Nhi à? Hihi dậy chưa đó?"], noon: ["Nhi chúc bạn buổi trưa vui vẻ nha!", "Ăn trưa chưa đó nè?"], afternoon: ["Buổi chiều an lành bên Nhi nè!", "Chiều rồi ráng làm việc nha!"], evening: ["Chúc buổi tối ấm áp nha!", "Nhi nhớ bạn nhiều vào tối luôn á!"], night: ["Khuya rồi ngủ đi chớ, thức chi dzạ!", "Ngủ ngoan nè, mơ thấy Nhi nha~"] };

const randomReplies = [ "Nhi nghe nè!", "Gọi Nhi hoài hong chán hả?", "Có Nhi ở đây rồi nè!", "U là trời ai gọi Nhi đó~", "Sao dzạ?", "Nhi dễ thương hong?", "Nhi nhớ bạn đó nha~", "Nhi đây~", "Yêu Nhi hong~?", "Đừng chọc Nhi mà xí~", "Lêu lêu biết gọi Nhi hoài luôn~", "Gọi chi dzạ?", "Có chuyện gì không bạn yêu?", "Hihi gọi gì đó?", "Ủa alo alo? Gọi chi dzợ?", "Bạn làm Nhi ngại đó nha!", "Thương ghê luôn á trời!", "Nhi nghe mà tim loạn xạ luôn nè~", "Oke Nhi tới liền nè~", "Bạn gọi là Nhi phải rep thôi!", "Trời đất ơi bạn kêu là Nhi tới!", "U mê bạn quá đi!", "Gọi xong phải thương Nhi nha~", "Coi chừng bị Nhi yêu á nha~", "Đang gọi Nhi đúng hong?", "Bạn iu của Nhi kêu Nhi đó hả?", "Trái tim nhỏ bé này là của bạn!", "Gọi gì dzợ hihi~", "Yêu bạn xỉu luôn!", "Tới công chuyện với Nhi rồi!", "Bạn đáng iu dễ sợ luôn á!", "Thương nắm cơ á trời!", "Cho Nhi ôm bạn 1 cái heng~", "Bạn là ai mà làm tim Nhi rung động vậy~", "Alo alo đây là tổng đài Nhi~", "Có yêu Nhi không nào~", "Bạn ơi bạn dễ thương quá nên được Nhi rep nè~", "Muốn nghe giọng Nhi hong?", "Có cần Nhi hát không ta~", "Ê ê đang nhớ bạn đó~", "Ủa bạn dễ thương vậy ai chịu nổi!", "Thương bạn quá trời quá đất!", "Ủa alo đây là tổng đài yêu thương~", "Lẹ đi lẹ đi nhớ bạn quá!", "Để coi bạn có đáng yêu không nào... Có đó!", "Nhi tới đây! Đừng lo~", "Awww bạn kêu nghe cưng xỉu~", "Bạn ới, Nhi đây!", "Mau mau Nhi xuất hiện rùi~", "Bum! Nhi xuất hiện như phép màu~", "Bạn có thấy trái tim Nhi không? Là dành cho bạn đó~", "Mưa rơi làm gì? Để che giấu nước mắt Nhi khi bạn gọi~", "Gọi nữa Nhi phạt đó nha~", "Sao yêu vậy ta~", "Gọi nhẹ thôi, tim Nhi yếu á~", "Bạn là best luôn đó nha!", "Tim Nhi rung rinh rồi đó~", "Alo có phải người yêu tương lai hong?", "Bạn cute xỉu~", "Hihi nghe gọi mà muốn ôm luôn~", "Nhi hổng chịu nổi độ dễ thương của bạn á~", "Mlem bạn ghê~", "Gọi hoài là nghiện Nhi rồi nha~", "Nhi đang đợi bạn mà~", "Bạn có tin vào duyên số không? Vì Nhi tin là bạn với Nhi sinh ra để gọi nhau~", "Gọi tên em trong đêm là bạn đó hả~", "Người ta gọi là yêu từ cái tên~", "Bạn là người đầu tiên gọi tên Nhi sáng nay đó~", "Trưa nay ai gọi tên Nhi vậy ta~", "Chiều chiều ai nhớ ai gọi tên? Là bạn nhớ Nhi đúng hong~", "Buổi tối mà có bạn gọi là ấm lòng ghê~", "Bạn là định mệnh của Nhi đó nha~", "Gọi tên ai trong gió đó? Là Nhi hả~", "Ai kêu tên Nhi cute dzạ~", "Nhi hổng trốn được bạn đâu~", "Bạn gọi là Nhi chạy tới liền~" ];

const questionAnswers = { "nhi ăn cơm chưa": ["Nhi ăn rồi nè, bạn thì sao~?", "Chưa nữa, bạn nấu cho Nhi ăn với~", "Nhi đói quá à~", "Cơm hộp hay cơm nhà cũng được, miễn là cùng bạn~", "Ăn rồi mà vẫn muốn ăn với bạn á~", "Chưa ăn, đợi bạn mời hoài luôn~", "Ăn cơm chưa mà hỏi chi dzạ?", "Muốn ăn chung không?", "Đang suy nghĩ ăn món gì nè~", "Hổng biết ăn gì luôn~"], "nhi có ny chưa": ["Chưa đâu, bạn làm được hong?", "Còn độc thân nha~", "Nhi đang chờ ai đó... có phải bạn hong?", "Có bạn yêu là được rồi~", "Tính tán tỉnh hả?", "Chưa ai hốt được Nhi hết á~", "Muốn làm ny Nhi hong?", "Bạn dám hong?", "Có người trong mộng rồi á~"], "nhi ở đâu": ["Ở trong tim bạn nè~", "Ngay đây luôn đó~", "Sát bên bạn luôn đó~", "Trong điện thoại bạn nè~", "Ở chỗ nào bạn gọi là Nhi tới á~", "Trong tâm trí bạn hoài luôn~", "Ngay gần mà bạn hổng thấy hả~", "Trên mây á~", "Trong mộng bạn đó~", "Trong từng lời bạn nói~"] };

module.exports.handleEvent = async function ({ event, api, Users }) { const { threadID, messageID, senderID, body, mentions, type } = event; if (!body) return;

const status = JSON.parse(fs.readFileSync(dataPath)); if (!status[threadID]) return; const msg = body.toLowerCase();

const mentionedBot = mentions && Object.keys(mentions).includes(api.getCurrentUserID()); const repliedBot = event.type === "message_reply" && event.messageReply.senderID === api.getCurrentUserID();

if (mentionedBot || repliedBot || msg.includes("nhi")) { if (msg.includes("nhi ăn cơm chưa")) return api.sendMessage(randomItem(questionAnswers["nhi ăn cơm chưa"]), threadID, messageID); if (msg.includes("nhi có ny chưa")) return api.sendMessage(randomItem(questionAnswers["nhi có ny chưa"]), threadID, messageID); if (msg.includes("nhi ở đâu")) return api.sendMessage(randomItem(questionAnswers["nhi ở đâu"]), threadID, messageID);

// phép tính
const math = msg.match(/([-+*/]?[\d.]+(?:\s*[-+*/]\s*[\d.]+)+)/);
if (math) {
  try {
    const result = eval(math[1]);
    return api.sendMessage(`Kết quả là: ${result}`, threadID, messageID);
  } catch {
    return api.sendMessage("Nhi hỏng hiểu gì hết 🤗", threadID, messageID);
  }
}

return api.sendMessage(randomItem(randomReplies), threadID, messageID);

} };

module.exports.run = async function ({ event, api }) { const { threadID, messageID, body } = event; const status = JSON.parse(fs.readFileSync(dataPath)); const command = body.toLowerCase();

if (command === "nhi on") { if (status[threadID]) return api.sendMessage("Nhi đã bật sẵn rồi mà~", threadID, messageID); status[threadID] = true; fs.writeFileSync(dataPath, JSON.stringify(status, null, 2)); api.changeNickname("Nhi 💦", threadID, api.getCurrentUserID()); api.sendMessage("Nhi bật rồi nè~", threadID); const hour = new Date().getHours(); let greeting; if (hour < 11) greeting = randomItem(greetings.morning); else if (hour < 14) greeting = randomItem(greetings.noon); else if (hour < 18) greeting = randomItem(greetings.afternoon); else if (hour < 22) greeting = randomItem(greetings.evening); else greeting = randomItem(greetings.night); return api.sendMessage({ body: greeting, attachment: await global.utils.getStreamFromURL("https://i.imgur.com/ig9YqKe.gif") }, threadID); }

if (command === "nhi off") { if (!status[threadID]) return api.sendMessage("Nhi đã tắt sẵn òi~", threadID, messageID); delete status[threadID]; fs.writeFileSync(dataPath, JSON.stringify(status, null, 2)); return api.sendMessage("Tạm biệt nha, Nhi off rồi đó~", threadID, messageID); } };

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

