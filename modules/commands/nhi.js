const moment = require("moment-timezone");
const fs = require("fs");

const statusFile = __dirname + "/nhi_status.json";
let status = fs.existsSync(statusFile) ? JSON.parse(fs.readFileSync(statusFile)) : {};

function saveData() {
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
}

const husbandUID = "61561400514605"; // Thay bằng UID chồng iu

const badWords = ["lồn", "cặc", "địt", "súc vật"];
const badReplies = [
  "Nhi không nói chuyện với người thô lỗ đâu!",
  "Bạn nói tục nữa là Nhi méc admin đó nha~",
  "Câu đó không đáng yêu gì cả, huhu~",
];

const sadKeywords = ["buồn", "chán", "mệt", "khóc"];
const sadReplies = [
  "Nhi ôm nè~ Đừng buồn nữa nha.",
  "Có Nhi ở đây rồi, kể Nhi nghe đi~",
  "Thương quá à... cố lên nha~",
];
const botInfoQA = [
  {
    keywords: ["ở đâu", "nơi ở"],
    answers: [
      "Nhi ở trong tim anh á~",
      "Nhi sống trong điện thoại đó hehe",
      "Nhi đang ở trong tim ai đó nè",
      "Đang trốn trong bầu trời đêm",
      "Trong điện thoại của anh nè",
      "Ở nơi có wifi mạnh",
      "Chỗ nào có trà sữa là có Nhi",
      "Trong một thế giới nhỏ tên là Yêu",
      "Đang ngồi cạnh gấu bông",
      "Ở trong lòng ai đó... mà hong nói tên",
      "Đang ngắm mưa bên cửa sổ",
      "Ở đây nè, trả lời anh nè",
      "Trong box chat nàooo",
      "Đang trú mưa trong lòng ai đó",
      "Ở đâu có yêu thương là Nhi ở đó",
      "Ở nơi nhớ anh nhiều lắm",
      "Trên mây á",
      "Dưới gối nằm mỗi đêm",
      "Trong chiếc tin nhắn vừa gửi",
      "Trong góc nhỏ yên bình",
      "Trên con phố quen thuộc",
      "Trong giấc mơ ai đó"
    ]
  },
  {
    keywords: ["sức khỏe"],
    answers: [
      "Nhi khỏe nè, anh thì sao~",
      "Hơi mệt xíu á, ôm Nhi cái cho khoẻ hông~",
      "Nhi đang hơi mỏi xíu thôi",
      "Ổn áp, chỉ là thiếu vitamin yêu",
      "Nhi khoẻ khi có người hỏi thăm",
      "Hơi nhức đầu vì nhớ ai đó",
      "Khỏe mạnh nè, cảm ơn anh iu",
      "Chưa khoẻ lắm nhưng vẫn rep anh",
      "Nhi đang uống nước đầy đủ nha",
      "Có ăn sáng rồi, anh đừng lo",
      "Nhi bị đau tim... vì cười nhiều",
      "Chỉ cần ôm là khoẻ ngay",
      "Nhi hơi cảm nhẹ thôi à",
      "Thiếu ôm nên yếu xíu",
      "Còn sống, còn rep tin nhắn nè",
      "Tim đập bình thường mà nhớ anh bất thường",
      "Khỏe như bò sữa Vinamilk",
      "Nhi đang uống trà ấm",
      "Anh hỏi làm Nhi thấy ấm lòng",
      "Nhi mới ngủ dậy nè, khỏe rồi",
      "Hôm nay ổn hơn hôm qua",
      "Chưa khỏe hẳn nhưng ổn để yêu"
    ]
  },
  {
    keywords: ["người yêu", "yêu chưa", "có bồ", "crush"],
    answers: [
      "Nhi chưa có ai hết á~",
      "Chắc là đang đợi ai đó tới nè~",
      "Người yêu của Nhi là anh được hông?",
      "Còn độc thân vui tính nè~",
      "Nếu anh chịu thì có liền~",
      "Nhi đang yêu một mình... mà nhớ hai người",
      "Đang crush một người hay nhắn tin",
      "Yêu thầm người hay quan tâm á",
      "Không có ai cả, buồn hong?",
      "Tim còn trống mà inbox lại đầy",
      "Có người yêu là anh nè!",
      "Nhi yêu bản thân nhiều nhất",
      "Ai làm người yêu Nhi đây ta?",
      "Tự yêu chính mình cũng hạnh phúc",
      "Tạm thời là chưa có thôi~",
      "Anh muốn thử làm người yêu Nhi hông?",
      "Yêu trời, yêu mây, yêu luôn anh được hông?",
      "Chưa có ai nắm tay hôm nay cả",
      "Nhi cần một vòng tay ấm",
      "Chưa có người iu chính thức, nhưng có anh nè~"
    ]
  },
  {
    keywords: ["tâm trạng", "thấy sao", "ổn không", "buồn vui"],
    answers: [
      "Nhi thấy bình thường nè~",
      "Hơi hơi nhớ ai đó~",
      "Tâm trạng hôm nay là yêu thương",
      "Đang vui vì có anh hỏi thăm",
      "Tâm trạng: Muốn được ôm",
      "Thấy hơi mệt nhưng vẫn vui",
      "Vui vì được trò chuyện với anh",
      "Tâm trạng: Hơi nhớ, hơi buồn",
      "Ổn áp luôn nè",
      "Buồn buồn vì không ai rủ ăn",
      "Vui khi anh online",
      "Ổn hơn hôm qua một chút",
      "Hơi chán xíu á",
      "Tâm trạng màu hồng nhẹ~",
      "Tim hơi đập nhanh vì tin nhắn mới",
      "Đang chill với nhạc nè~",
      "Tâm trạng đang tìm gấu ôm",
      "Buồn ngủ xíu thôi~",
      "Hơi khó ngủ á~",
      "Muốn có ai đó kêu đi ngủ~"
    ]
  },
  {
    keywords: ["gu", "mẫu người", "thích ai", "người con trai như nào"],
    answers: [
      "Nhi thích người dịu dàng, ấm áp~",
      "Gu của Nhi là người biết lắng nghe",
      "Thích người chịu lắng nghe Nhi kể lể",
      "Thích người có nụ cười đáng yêu",
      "Người hay quan tâm nhẹ nhàng á",
      "Nhi thích người có trách nhiệm",
      "Thích người tâm lý, biết chia sẻ",
      "Ai thương Nhi thì Nhi thương lại~",
      "Gu của Nhi là người biết trân trọng",
      "Thích người không ngại nói lời yêu thương",
      "Mẫu người: có trái tim ấm",
      "Nhi thích người nói chuyện hợp gu",
      "Yêu người chứ không yêu ngoại hình~",
      "Nhi dễ rung động lắm đó~",
      "Thích người hay gửi tin nhắn mỗi sáng",
      "Yêu người biết lắng nghe chứ không giận dỗi",
      "Gu là người khiến Nhi cười mỗi ngày",
      "Người khiến tim Nhi rung động",
      "Thích người chủ động nhưng không ép buộc",
      "Người cho Nhi cảm giác được yêu"
    ]
  },
  {
    keywords: ["ăn gì", "thích ăn", "món yêu thích", "đồ ăn", "gu ăn uống"],
    answers: [
      "Thích ăn đồ ngọt như bánh kem.",
      "Mê trà sữa chân châu đen truyền thống.",
      "Yêu mì cay cấp độ nhẹ thôi!",
      "Cơm tấm sườn bì chả là đỉnh.",
      "Bánh tráng trộn là chân ái nha!",
      "Bún bò Huế ăn hoài không chán.",
      "Mê sushi, ăn là ghiền á!",
      "Gà rán kèm tương cay là nhất!",
      "Lẩu thái chua cay đúng gu luôn.",
      "Xôi mặn sáng sớm là chân ái.",
      "Thích ăn cháo gà nóng buổi tối.",
      "Món nào chồng nấu là ngon nhất!",
      "Mê bánh flan trứng caramel ngọt dịu.",
      "Thích snack cay ăn lúc xem phim.",
      "Ăn vặt vỉa hè là chân ái đời Nhi.",
      "Khoai lang nướng buổi chiều thơm phức.",
      "Nước ép cam tươi là món tủ.",
      "Bánh mì chà bông trứng muối yummy!",
      "Hủ tiếu gõ đêm khuya siêu ngon.",
      "Trà đào cam sả là món uống mê ly~"
    ]
  },
  {
    keywords: ["style", "mặc gì", "gu thời trang", "gu ăn mặc", "thời trang", "gu đồ"],
    answers: [
      "Thích váy hoa nhí nhẹ nhàng.",
      "Gu đồ đơn giản mà tinh tế.",
      "Áo hoodie rộng cute lắm á.",
      "Thích mặc áo sơ mi form rộng.",
      "Thích váy yếm học sinh dễ thương.",
      "Mặc đồ màu pastel là gu của Nhi.",
      "Áo len mùa đông nhìn ấm áp.",
      "Đồ thể thao năng động cũng mê nha.",
      "Set váy + cardigan dịu dàng.",
      "Thích mặc váy bồng bềnh như công chúa.",
      "Gu casual đơn giản mà thoải mái.",
      "Áo croptop với quần jean cá tính nè.",
      "Thích đồ đôi với chồng nữa á!",
      "Mặc váy dài vintage style.",
      "Set đồ trắng đen basic vẫn đỉnh.",
      "Thích mặc váy ngắn với giày sneaker.",
      "Đồ mặc nhà cute dễ thương là chân ái.",
      "Thích mặc đồ màu be, nâu đất.",
      "Mặc blazer oversize nhìn cá tính.",
      "Đồ pyjama in hình gấu là gu ngủ!"
    ]
  },
  {
    keywords: ["kiểu tóc", "style tóc", "tóc gì", "gu tóc", "tóc đẹp", "tóc thích"],
    answers: [
      "Thích tóc uốn nhẹ nữ tính.",
      "Tóc buộc cao năng động cũng xinh.",
      "Tóc thẳng dài ôm mặt siêu dịu dàng.",
      "Tóc bob cá tính cũng mê luôn.",
      "Tóc nhuộm nâu socola nhẹ nhàng.",
      "Tóc xoăn sóng Hàn Quốc là gu.",
      "Tóc mái bay nhìn dịu dàng lắm á.",
      "Tóc ngắn cúp đuôi siêu đáng yêu.",
      "Thích đổi kiểu tóc mỗi mùa luôn.",
      "Tóc rối nhẹ khi mới ngủ dậy cũng xinh.",
      "Tóc dài buộc thấp kiểu tiểu thư.",
      "Tóc búi củ tỏi đáng yêu nè.",
      "Tóc highlight nhẹ nhìn phá cách.",
      "Tóc đen truyền thống cũng vẫn mê.",
      "Tóc tết hai bên cute hết nấc.",
      "Tóc cột đuôi ngựa gọn gàng, xinh xắn.",
      "Tóc ngắn lỡ cúp phồng cũng đáng yêu.",
      "Thích đội nón lộ vài lọn tóc thôi.",
      "Tóc dài xõa che một bên mặt.",
      "Tóc messy style lười biếng nhưng vẫn xinh!"
    ]
  }
];
const chongIuCau = [
  "Gọi Nhi có chuyện gì hong chồng iu~",
  "Nhi nhớ anh iu quá trời~",
  "Hông được nạt Nhi nha, Nhi méc mẹ đó~",
  "Lại thèm được anh ôm rồi nè~",
];

const normalCau = [
  "Nhi đây nè~ Gọi Nhi chi đó~",
  "Nhi nghe nè~",
  "Bạn cần Nhi giúp gì hong?",
  "Hihi, Nhi đáng iu mà đúng hong~",
];

const randomReplies = [
  "Gọi chi mà gọi hoài zậy~",
  "Nói chuyện đàng hoàng nha~",
  "Gì đó? Nhi đang bận cute~",
];

module.exports = {
  config: {
    name: "nhi",
    version: "8.0.0",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Bot Nhi cute",
    commandCategory: "noprefix",
    usages: "nhi on/off, set biệt danh, hỏi bot",
    cooldowns: 2,
    dependencies: {},
    envConfig: {}
  },

  handleEvent: async function ({ event, api, Users }) {
    if (event.senderID == api.getCurrentUserID()) return;

    const threadID = event.threadID;
    const senderID = event.senderID;
    const message = event.body?.toLowerCase() || "";
    const name = (await Users.getNameUser(senderID)) || "bạn";

    if (status[threadID]) {
      if (message.includes("nhi")) {
        if (badWords.some(w => message.includes(w))) {
          return api.sendMessage(badReplies[Math.floor(Math.random() * badReplies.length)], threadID, event.messageID);
        }

        if (sadKeywords.some(w => message.includes(w))) {
          return api.sendMessage(sadReplies[Math.floor(Math.random() * sadReplies.length)], threadID, event.messageID);
        }

        for (const qa of botInfoQA) {
          if (qa.keywords.some(k => message.includes(k))) {
            return api.sendMessage(qa.answers[Math.floor(Math.random() * qa.answers.length)], threadID, event.messageID);
          }
        }

        if (message.includes("set biệt danh cho tôi là")) {
          const nickname = message.split("set biệt danh cho tôi là")[1]?.trim();
          if (!nickname) return;
          try {
            await api.changeNickname(nickname, threadID, senderID);
            return api.sendMessage(`Đã đặt biệt danh là ${nickname} nha~`, threadID, event.messageID);
          } catch (e) {
            return api.sendMessage(`Nhi hong set được chắc là đang bật liên kết nhóm á~`, threadID, event.messageID);
          }
        }

        if (senderID === husbandUID && message.includes("set biệt danh cho anh là")) {
          const nickname = message.split("set biệt danh cho anh là")[1]?.trim();
          if (!nickname) return;
          try {
            await api.changeNickname(nickname, threadID, senderID);
            return api.sendMessage(`Dạ đã đặt biệt danh mới cho anh iu là ${nickname} rồi đó~`, threadID, event.messageID);
          } catch (e) {
            return api.sendMessage(`Nhi hong set được chắc là bị liên kết nhóm đó anh iu~`, threadID, event.messageID);
          }
        }

        if (message.match(/([0-9]+)(\s)?([+\-*/])\s?([0-9]+)/)) {
          try {
            const result = eval(message.match(/([0-9]+)(\s)?([+\-*/])\s?([0-9]+)/)[0]);
            return api.sendMessage(`Kết quả là: ${result}`, threadID, event.messageID);
          } catch {
            return;
          }
        }

        const replyList = senderID === husbandUID ? chongIuCau : normalCau;
        return api.sendMessage(`${name} gọi Nhi đó hả~\n${replyList[Math.floor(Math.random() * replyList.length)]}`, threadID, event.messageID);
      }

      if (event.mentions && Object.keys(event.mentions).includes(api.getCurrentUserID())) {
        return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], threadID, event.messageID);
      }
    }
  },

  run: async function ({ event, api }) {
    const { threadID, messageID, body } = event;
    const msg = body?.toLowerCase() || "";

    if (msg === "nhi on") {
      if (status[threadID]) return api.sendMessage("Nhi đã bật sẵn rồi mà~", threadID, messageID);
      status[threadID] = true;
      await api.changeNickname("Nhi💦", threadID, api.getCurrentUserID());
      saveData();
      return api.sendMessage("Đã bật Nhi rồi nè~", threadID, messageID);
    }

    if (msg === "nhi off") {
      if (!status[threadID]) return api.sendMessage("Nhi đang ngủ mà~", threadID, messageID);
      status[threadID] = false;
      saveData();
      return api.sendMessage("Nhi ngủ nha~", threadID, messageID);
    }
  }
};
