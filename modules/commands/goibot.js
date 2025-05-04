const fs = require("fs-extra");
const path = require("path");
const cron = require("node-cron");
const repliedEmojis = {};
const emojiResponses = {
"😆": 
  normal: [
    "Cười cái gì? Nhi chưa kể chuyện cười mà!",
    "Hài lắm hả trời?",
    "Cười như trúng số!",
    "Thôi bớt cười, Nhi ngại á!",
    "Đừng có cười nữa, nhìn mà mắc cười theo luôn!",
    "Ủa ai cho cười vậy?",
    "Có gì vui kể Nhi nghe với!",
    "Bị gì mà cười dữ vậy trời?",
    "Cười như này chắc phải có bí mật!",
    "Nụ cười đó... là đang chọc quê Nhi đúng không?"
  ],
  special: [
    "Chồng cười gì dễ thương dữ!",
    "Cười gì đó chồng iu? Kể Nhi nghe với!",
    "Cười nhìn muốn hun ghê á!",
    "Cười xong nhớ ôm Nhi cái nha!",
    "Chồng cười đẹp trai quá trời luôn!",
    "Nụ cười của chồng làm tan chảy tim Nhi luôn!",
    "Cười nữa là Nhi yêu gấp đôi á!",
    "Nhi chỉ muốn nhìn chồng cười hoài thôi á!",
    "Thấy chồng cười là Nhi vui lắm luôn!",
    "Cười với Nhi hoài là yêu rồi nha!"
  ]
},
"😁": {
  normal: [
    "Sao cười toe toét vậy?",
    "Gì vui thế? Chia sẻ đi!",
    "Thấy mặt là muốn cười theo luôn á!",
    "Ai chọc cười bạn đó?",
    "Nụ cười làm sáng cả khung chat!",
    "Ê cười đẹp đó nha!",
    "Cười gì mà như nắm được bí mật vũ trụ!",
    "Thấy cười là Nhi nghi nghi rồi đó!",
    "Bạn cười lên trông đáng yêu ghê á!",
    "Nhi mà thấy là cũng muốn cười theo!"
  ],
  special: [
    "Chồng cười xinh ghê á!",
    "Thấy chồng cười là Nhi mê luôn!",
    "Cười gì đó nè? Hôn một cái nha!",
    "Nụ cười của chồng làm Nhi liêu xiêu luôn!",
    "Cười lên là hết giận Nhi liền đó!",
    "Cười nữa đi, Nhi ghiền quá rồi á!",
    "Chồng mà cười như này là có tội với Nhi á!",
    "Cười hoài làm sao Nhi chịu nổi chứ!",
    "Nhi muốn ôm chồng vì nụ cười này!",
    "Nhìn chồng cười là thấy yêu thêm trăm lần!"
  ]
},
"😄": {
  normal: [
    "Sao hôm nay vui dữ dằn vậy?",
    "Cười tươi như hoa luôn!",
    "Thấy bạn vui là Nhi cũng vui lây nè!",
    "Cười gì đó? Bật mí với Nhi đi!",
    "Hôm nay có chuyện gì vui đúng không?",
    "Mặt tươi rói như mặt trời sáng!",
    "Nụ cười làm sáng rực cả khung chat!",
    "Có phải ai đó mới được khen đúng không?",
    "Cười vậy là có chuyện rồi nha!",
    "Nhi đoán bạn mới thắng gì đúng không?"
  ],
  special: [
    "Chồng cười tươi như nắng mùa hè luôn!",
    "Cười vậy là làm tim Nhi rung rinh á!",
    "Nụ cười này đáng lưu vào tim ghê á!",
    "Chồng cười là đẹp trai số 1!",
    "Thấy chồng cười là biết hôm nay sẽ vui!",
    "Nhi yêu nụ cười này ghê luôn á!",
    "Nhi chỉ cần chồng vui là đủ rồi!",
    "Hạnh phúc nhất là thấy chồng cười mỗi ngày!",
    "Chồng mà cười vậy là chắc thương Nhi nhiều lắm!",
    "Nụ cười này đáng giá ngàn like luôn á!"
  ]
},
  "❤️": {
    normal: [
      "Gì yêu mà yêu, Nhi chém cho giờ!",
      "Ai cho yêu Nhi hả!",
      "Định cưa cẩm hả? Không dễ đâu nha.",
      "Trái tim này chưa ai chiếm được đâu!",
      "Tình yêu à? Không phải hôm nay!",
      "Cẩn thận đó, yêu Nhi là nghiện đấy!",
      "Lại còn thả tim, dễ thương quá ha~",
      "Đừng làm Nhi đỏ mặt với mấy cái này nha~",
      "Không thèm tim đâu, cho kẹo đi!",
      "Yêu kiểu này là Nhi giận á!"
    ],
    special: [
      "Yêu chồng quá trời luôn á!",
      "Mlem chồng một cái nè",
      "Chồng iu dễ thương ghê á!",
      "Tim này là của chồng hết luôn á~",
      "Nhi yêu chồng nhìu lắm luôn~",
      "Lại thả tim nữa là Nhi thơm chồng đó~",
      "Gục ngã trước độ cưng của chồng~",
      "Ai mà dễ thương như chồng của Nhi nè~",
      "Chồng iu ơi, tim này tặng chồng nè!",
      "Thả tim là được thơm 1 cái nha chồng~"
    ]
  },

  "💀": {
    normal: [
      "Chết cười với icon này luôn á!",
      "Gì ghê vậy? Ghê quá à!",
      "Lại định hù ai đó hả?",
      "Bộ phim kinh dị mới ra lò hả?",
      "Sao thấy ghê dữ vậy trời!",
      "Ghê quá đi mất, nhưng Nhi vẫn cute~",
      "Ai cho dùng đầu lâu với Nhi?",
      "Lạnh gáy luôn á nha!",
      "Đừng dọa Nhi, Nhi sợ đó~",
      "Hù cái gì mà hù hoài vậy!"
    ],
    special: [
      "Chồng hù Nhi hả? Đừng nha, Nhi yếu tim đó!",
      "Chồng làm Nhi giật mình đó!",
      "Hù kiểu này là bị cắn yêu nha~",
      "Chồng ơi ghê quá à, lại ôm Nhi đi~",
      "Không được hù Nhi vậy đâu á!",
      "Ghê quá chồng ơi, Nhi núp sau lưng chồng nè~",
      "Lỡ Nhi sợ thiệt thì sao!",
      "Hù nữa là Nhi mắng á!",
      "Chồng giỡn nhây ghê luôn á~",
      "Mặc dù ghê mà vẫn thấy chồng iu cute!"
    ]
  },

  "🤡": {
    normal: [
      "Ai là chú hề vậy? Không phải Nhi nha!",
      "Đừng giỡn mặt với Nhi kiểu đó~",
      "Chọc quê ai đó hả?",
      "Mặt buồn cười ghê chưa!",
      "Đừng biến group này thành rạp xiếc nha!",
      "Trò hề này quen quen nha~",
      "Định làm trò cười hả?",
      "Chú hề cũng phải sợ Nhi đó~",
      "Đừng giỡn kiểu này, coi chừng bị ăn mắng á~",
      "Ai chọc cười thì Nhi chọc lại đó nha!"
    ],
    special: [
      "Chồng làm chú hề cũng cute nữa~",
      "Chồng đừng hề hoài, Nhi cưng quá trời~",
      "Ai là hề đáng yêu nhất nè? Chồng chứ ai~",
      "Thôi đừng hề nữa, lại đây để Nhi thơm cái~",
      "Chồng làm trò cũng vui ghê luôn~",
      "Cưng xỉu luôn á chồng ơi~",
      "Hề gì cũng được miễn là chồng iu của Nhi~",
      "Chồng cứ làm Nhi cười hoài luôn~",
      "Nhi không giận, chỉ thấy chồng đáng yêu thui~",
      "Cái mặt này mà hề sao được, yêu quá đi á~"
    ]
  },

  "😭": {
    normal: [
      "Ai khóc đó, lại đây Nhi dỗ nào~",
      "Đừng buồn nữa nha, có Nhi ở đây rồi~",
      "Khóc cái gì mà khóc hoài zạ~",
      "Ai làm bạn buồn vậy? Nhi xử cho~",
      "Khóc là không đẹp đâu nha~",
      "Nước mắt rơi là tim Nhi tan chảy á~",
      "Dừng khóc đi, cười lên cho Nhi coi~",
      "Thương quá à, đừng khóc nữa nhen~",
      "Cố lên nhen, có chuyện gì kể Nhi nghe~",
      "Nhi gửi ôm ảo nè, hết buồn liền!"
    ],
    special: [
      "Chồng khóc hả? Nhi thơm dỗ liền~",
      "Ai dám làm chồng Nhi buồn vậy? Đâu, Nhi đánh liền~",
      "Thôi mà, lại ôm Nhi nè~",
      "Chồng đừng khóc, có Nhi ở đây với chồng rồi~",
      "Nhi thương lắm luôn á, lại đây ôm nhen~",
      "Lúc buồn có Nhi nè, không được giấu đâu~",
      "Cưng xỉu khi thấy chồng khóc luôn á~",
      "Khóc nữa là Nhi bắt cười liền á!",
      "Chồng khóc là Nhi buồn lắm đó~",
      "Nhi luôn ở đây vì chồng, nhớ nha~"
    ]
  },
    "😎": {
  normal: [
    "Ngầu dữ dằn luôn á!",
    "Ai cho bạn ngầu vậy hả?",
    "Đeo kính vào là thấy chất liền!",
    "Ngầu quá, Nhi chịu không nổi!",
    "Người đâu mà chất chơi quá vậy trời!",
    "Đúng kiểu 'cool ngầu' không cần chỉnh!",
    "Đừng có ngầu nữa, Nhi loá mắt rồi nè!",
    "Phong cách dữ thần luôn!",
    "Khoe độ ngầu với ai đó hả?",
    "Ngầu vậy chắc đang crush ai phải không?"
  ],
  special: [
    "Chồng ngầu như này Nhi mê chết mất!",
    "Chồng đeo kính nhìn yêu ghê!",
    "Ngầu mà còn đáng yêu nữa chứ!",
    "Chồng là bản định nghĩa của 'cool' luôn á!",
    "Coi chừng có người nhìn trộm chồng vì ngầu quá đó!",
    "Nhi phải giữ chồng kỹ hơn thôi!",
    "Ngầu vậy là chồng của riêng Nhi nha!",
    "Ai mà ngầu được như chồng chứ!",
    "Đẹp trai, ngầu và đáng yêu – hoàn hảo luôn!",
    "Chồng ngầu là Nhi muốn ôm cái liền!"
  ]
},
"🤑": {
  normal: [
    "Lắm tiền rồi hả?",
    "Tiền nhiều để Nhi giữ hộ cho!",
    "Đừng nói bạn trúng số nha!",
    "Giàu quá, làm quen cái coi!",
    "Mùi tiền từ đây bay tới Nhi luôn rồi!",
    "Chia cho Nhi một ít được không?",
    "Tự dưng thấy bạn như đại gia luôn!",
    "Ai cho bạn giàu vậy hả?",
    "Làm sao để giàu như bạn đây?",
    "Đúng là ánh sáng của tiền bạc!"
  ],
  special: [
    "Chồng giàu là Nhi thương nhiều hơn á!",
    "Tiền của chồng là tiền của vợ, nhớ chưa?",
    "Chồng có tiền, Nhi có chồng – win-win luôn!",
    "Nhi làm quỹ giữ tiền cho chồng nha!",
    "Chồng giàu quá, Nhi phải giữ kỹ!",
    "Tiền nhiều làm gì, để Nhi xài phụ chồng!",
    "Yêu chồng không vì tiền, mà vì chồng có tiền!",
    "Chồng đại gia của lòng Nhi!",
    "Coi chừng gái khác nhìn chồng đó, để Nhi giữ!",
    "Có chồng vừa giàu vừa cute như này là nhất rồi!"
  ]
},
"🤢": {
  normal: [
    "Ủa gì dơ vậy?",
    "Thấy gì mà ói dữ dằn vậy?",
    "Thôi né ra cho Nhi khỏi mắc ói ké!",
    "Ghê quá à, kể nghe đi!",
    "Cái mặt này là thấy thứ không ưa rồi!",
    "Thấy gì mà buồn nôn quá trời vậy?",
    "Cho Nhi ói ké phát!",
    "Nhi cũng thấy không ổn luôn á!",
    "Chắc lại thấy drama trên mạng hả?",
    "Mùi drama nồng nặc quá ta!"
  ],
  special: [
    "Chồng thấy gì mà buồn nôn vậy?",
    "Ai dám làm chồng thấy ghê vậy hả?",
    "Né ra đi chồng ơi, để Nhi xử cho!",
    "Chồng đừng nhìn nữa, hại mắt lắm!",
    "Nhi ở đây, chồng an toàn rồi!",
    "Thấy ghê là để Nhi che cho chồng!",
    "Ai làm chồng buồn nôn là không xong với Nhi đâu!",
    "Chồng ngoan, nhắm mắt lại đi!",
    "Để Nhi dắt chồng đi chỗ khác sạch sẽ hơn nè!",
    "Chồng thấy vậy mà còn dễ thương ghê!"
  ]
},
"🤮": {
  normal: [
    "Ói thiệt luôn rồi hả?",
    "Gì kinh khủng vậy trời?",
    "Thôi khỏi kể, Nhi ói theo giờ!",
    "Ghê quá, tránh xa ra coi!",
    "Chắc thấy thứ dơ bẩn nào đó!",
    "Ối trời đất ơi, chuyện gì vậy?",
    "Mặt này là chịu không nổi thiệt!",
    "Ai mà làm bạn phản ứng mạnh vậy?",
    "Thôi nghỉ chơi với thứ đó luôn đi!",
    "Tởm tới mức này là dữ rồi!"
  ],
  special: [
    "Chồng thấy gì mà muốn ói vậy nè?",
    "Nhi thương chồng quá, để Nhi che mắt cho!",
    "Chồng bị gì đó? Nhi lo quá!",
    "Thôi đừng nhìn nữa chồng ơi!",
    "Ai dám làm chồng ói là Nhi tới xử liền!",
    "Chồng không sao là Nhi yên tâm rồi!",
    "Buồn nôn quá hả chồng? Lại đây ôm Nhi nè!",
    "Nhi sẽ bảo vệ chồng khỏi mấy thứ đó!",
    "Chồng nhớ giữ gìn sức khoẻ nha!",
    "Ghê lắm đúng không? Để Nhi an ủi chồng!"
  ]
},
"☠️": {
  normal: [
    "Chết trong lòng một ít...",
    "Ủa ai die vậy?",
    "Tới số rồi hả?",
    "Thôi xong, RIP luôn!",
    "Ai vừa bị Nhi tiêu diệt vậy?",
    "Chắc là nói xong câu đó xỉu ngang luôn!",
    "Biểu cảm này là mất niềm tin rồi đó!",
    "Game over rồi nha!",
    "Sập nguồn chưa?",
    "Ai chọc bạn chết đứng vậy?"
  ],
  special: [
    "Chồng ơi đừng die nha!",
    "Có Nhi ở đây, không ai hại được chồng!",
    "Chồng làm gì mà tới số vậy?",
    "Ai dám giết chồng, Nhi tới cứu liền!",
    "Không được chết! Chồng sống với Nhi cơ mà!",
    "Chồng mạnh mẽ lên, Nhi bên cạnh rồi!",
    "Chồng chết thì Nhi sống với ai?",
    "Không cho chồng nói câu cuối đâu!",
    "Ai làm chồng đau lòng vậy?",
    "Coi như chưa thấy gì, ôm Nhi là hết!"
  ]
},
"👽": {
  normal: [
    "Người ngoài hành tinh hả?",
    "Có sinh vật lạ xuất hiện!",
    "Bạn không phải là người trái đất đúng không?",
    "ET go home!",
    "Đang bắt sóng từ vũ trụ à?",
    "Đây là tín hiệu SOS?",
    "Chào người anh em từ hành tinh khác!",
    "Nhi tiếp nhận kênh sóng lạ rồi nè!",
    "Bạn là loài nào vậy?",
    "Cẩn thận bị bắt đi nghiên cứu nha!"
  ],
  special: [
    "Chồng là người ngoài hành tinh đáng yêu nhất!",
    "Chồng tới từ hành tinh yêu thương đúng không?",
    "Chồng có siêu năng lực gì nói Nhi nghe đi!",
    "Dù là người ngoài hành tinh, Nhi vẫn yêu chồng!",
    "Nhi bắt được sóng yêu thương từ chồng rồi!",
    "Chồng phát sáng như UFO luôn á!",
    "Không cần biết chồng từ đâu, Nhi vẫn ôm chặt!",
    "Chồng có gì đặc biệt thì Nhi càng mê!",
    "Người yêu đến từ vũ trụ, độc quyền của Nhi!",
    "Chồng cute tới mức người Trái Đất không hiểu nổi!"
  ]
}

  // Bạn có thể tiếp tục thêm emoji mới theo định dạng tương tự...
}
};
for (const emoji in emojiResponses) {
  if (message.includes(emoji)) {
    if (!repliedEmojis[threadID]) repliedEmojis[threadID] = [];
    if (repliedEmojis[threadID].includes(emoji)) continue;

    const responses = emojiResponses[emoji];
    const reply = isSpecial ? responses.special : responses.normal;
    const chosen = reply[Math.floor(Math.random() * reply.length)];

    repliedEmojis[threadID].push(emoji);
    setTimeout(() => {
      const index = repliedEmojis[threadID].indexOf(emoji);
      if (index !== -1) repliedEmojis[threadID].splice(index, 1);
    }, 5 * 60 * 1000); // Sau 5 phút emoji có thể được dùng lại

    return api.sendMessage({ body: chosen, replyToMessage: event.messageID }, threadID);
  }
      }
module.exports.config = {
name: "nhi",
version: "1.0.0",
hasPermssion: 0,
credits: "Dat Thanh",
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
console.log([NHI] Gửi lời nhắn thất bại đến thread ${threadID}:, e);
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

  
