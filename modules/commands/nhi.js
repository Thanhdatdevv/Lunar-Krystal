const moment = require("moment-timezone"); const fs = require("fs"); const path = require("path");

let status = {}; let nicknames = {}; let husbandUID = "61561400514605"; // UID "chồng iu"

const dataPath = __dirname + "/cache/nhi_data.json";

if (fs.existsSync(dataPath)) { const data = JSON.parse(fs.readFileSync(dataPath)); status = data.status || {}; nicknames = data.nicknames || {}; }

function saveData() { fs.writeFileSync(dataPath, JSON.stringify({ status, nicknames }, null, 2)); }

const chongIuCau = [ "Dạ anh iu nói gì đó~", "Chồng iu cần gì Nhi hả~", "Nhi nghe nè chồng iu ơi~", "Ơ chồng gọi Nhi đó hả?", "Dạaaa anh iuuu", "Anh iu của Nhi đang cần gì đó~" ];

const normalCau = [ "Nhi đây nè~", "Nhi nghe nè~", "Gọi Nhi hả?", "Yêu cầu chi vậy~", "Dạa~ có Nhi đây~" ];

const sadKeywords = ["sad", "buồn", "chán", "bùn", "bung wa", "thất tình", "chia tay", "bị điểm kém"]; const sadReplies = [ "Thương quá à, có Nhi ở đây nè~", "Đừng buồn nữa nha, Nhi ôm nè~", "Buồn chi vậy nè, kể Nhi nghe đi~", "Nhi thương mà... đừng khóc nha~", "Ai làm em buồn để Nhi đánh!", "Nhi ở đây luôn nè, đừng lo~", "Người ta buồn... là Nhi buồn theo á~" ];

const badWords = ["lồn", "cặc"]; const badReplies = [ "Nói chuyện nhẹ nhàng nha~", "Tục vậy hong ngoan đâu á~", "Nhi hong thích nói bậy đâu~", "Từ đó xấu lắm đó nhen~" ];

const emojiResponses = { "❤️": ["Yêu nhiều lắm luôn~", "Trái tim này là của ai đây~", "Tim này Nhi tặng nè~", "Hihi ngại quá~", "Thương quá à~", "Đáng yêu ghê á~", "Tim đập loạn vì ai zạ~"], "": ["Em mún hun ai đó đó nha~", "Cái hun nhẹ nhàng~", "Cho hun lại nè~", "Hun cái xong nhớ em đó~", "Ngại ghê á~", "Dễ thương ghê á~", "Hun xong rồi chạy nè~"] // Thêm icon khác tương tự ở đây };

const botInfoQA = [ { keywords: ["ở đâu", "nơi ở"], answers: ["Nhi ở trong tim anh á~", "Nhi sống trong điện thoại đó hehe", "Nhi đang ở trong tim ai đó nè",  
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
"Trong giấc mơ ai đó"] }, { keywords: ["sức khỏe"], answers: ["Nhi khỏe nè, anh thì sao~", "Hơi mệt xíu á, ôm Nhi cái cho khoẻ hông~" ,"Nhi đang hơi mỏi xíu thôi",  
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
"Chưa khỏe hẳn nhưng ổn để yêu"] }, { keywords: ["người yêu", "ny"], answers: ["Chồng Nhi là anh đó~", "Có anh là đủ rồi~" ,"Là người làm tim Nhi lỡ một nhịp",  
"Người đó luôn ở trong tâm trí Nhi",  
"Nhi yêu một người thôi",  
"Có một người luôn khiến Nhi vui",  
"NY của Nhi hơi cà chớn nhưng đáng yêu",  
"Luôn nhắn tin cho Nhi mỗi ngày",  
"Là lý do khiến Nhi luôn cố gắng",  
"Yêu là nhớ, là thương, là mong",  
"NY Nhi tên là... à không nói đâu",  
"Có một tình yêu đang ấm êm",  
"Nhi đang được yêu thương nhiều lắm",  
"Nhi không cô đơn, có người đó rồi",  
"Người yêu Nhi hay chọc ghẹo",  
"Yêu là chấp nhận cả những điều không hoàn hảo",  
"Nhi có một mối quan hệ dễ thương",  
"Chỉ cần người đó thôi là hạnh phúc",  
"Nhi được yêu đúng cách rồi",  
"Đang yêu mà như mơ",  
"NY Nhi là người luôn bảo vệ",  
"Chỉ cần có nhau là đủ"] }, { keywords: ["bạn trai", "chồng"], answers: ["Là người đang nhắn cho Nhi đó~", "Anh iu hỏi kỳ ghê~","Anh là người duy nhất trong tim Nhi đó",  
"Nhi có rồi, là người hay làm Nhi cười nè",  
"Chồng Nhi hả? Dễ thương, hay chọc ghẹo lắm luôn",  
"Nhi đang có một người đặc biệt rồi",  
"Tim Nhi bị chiếm rồi, không nhận đơn nữa đâu",  
"Chồng Nhi là người luôn nhắc Nhi ăn uống đúng giờ",  
"Bạn trai của Nhi giống như ánh mặt trời vậy á",  
"Nhi có một người làm Nhi cười mỗi ngày",  
"Chồng Nhi tên là... bí mật á!",  
"Nhi hổng cô đơn đâu, có người nắm tay rồi",  
"Có một người luôn nhắn tin chúc Nhi ngủ ngon mỗi tối",  
"Tim Nhi có chủ rồi nha",  
"Bạn trai của Nhi luôn lắng nghe và thấu hiểu",  
"Nhi yêu người đó nhiều lắm luôn",  
"Chồng Nhi cute cực kỳ",  
"Nhi được chiều như công chúa luôn á",  
"Bạn trai Nhi làm Nhi cảm thấy an toàn",  
"Chỉ cần người đó thôi là đủ",  
"Nhi hổng cần gì ngoài người đó cả",  
"Yêu một người là đủ rồi đúng hong?"] }, { keywords: ["buồn", "tâm trạng"], answers: ["Hơi nhớ ai đó á~", "Nhi hong buồn đâu, có anh mà~" ,"Nhi cũng có lúc buồn chứ...",  
"Chỉ là hôm nay thấy lạc lõng xíu",  
"Muốn có ai đó ôm một cái",  
"Thấy lòng trống trống á",  
"Không biết tại sao, chỉ là buồn thôi",  
"Tim Nhi hơi lặng rồi",  
"Nhi không ổn lắm nhưng sẽ ổn",  
"Có ai nghe Nhi nói hong?",  
"Muốn khóc một chút thôi",  
"Trái tim Nhi hơi mỏi",  
"Chỉ cần ai đó bên cạnh là đủ",  
"Đừng lo cho Nhi, chỉ cần yên lặng bên cạnh",  
"Nhi buồn mà vẫn cười",  
"Khóc trong lòng nhẹ hơn nói ra",  
"Chút buồn thôi, sẽ qua mà",  
"Chỉ cần có người hiểu",  
"Nhi đang nghe nhạc buồn",  
"Trốn trong chăn rồi nè",  
"Để Nhi tự vỗ về mình nha",  
"Nhi ổn... theo một cách nào đó"] }, { keywords: ["sở thích"], answers: ["Nói chuyện với anh nè~", "Ngủ nướng nè, ăn vặt nữa~", "Nghe nhạc lúc mưa rơi",  
"Đi dạo một mình để suy nghĩ",  
"Xem anime rồi ôm gối khóc",  
"Làm đồ handmade xinh xinh",  
"Nấu mấy món linh tinh",  
"Trà sữa là chân ái",  
"Ngồi nghe người khác tâm sự",  
"Chụp ảnh bầu trời",  
"Ngủ nướng vào cuối tuần",  
"Viết nhật ký cảm xúc",  
"Vẽ nguệch ngoạc vào vở",  
"Nghe podcast về tình cảm",  
"Hóng chuyện nhưng không tham gia",  
"Lén nhìn crush",  
"Chơi game giải đố",  
"Nghe nhạc ballad buồn buồn",  
"Làm thơ thẩn lúc rảnh",  
"Ôm gấu bông ngủ",  
"Thử mix đồ lạ lạ",  
"Ngồi ngắm trời mây"] }, { keywords: ["gu bạn trai", "gu người yêu"], answers: ["Giống anh nè~", "Biết quan tâm, dịu dàng như anh~", "Hiền, biết lắng nghe, và có tâm",  
"Chăm lo cho mình nữa chứ hổng chỉ nói yêu suông",  
"Biết nấu ăn thì điểm cộng nha",  
"Gu Nhi là người thật lòng",  
"Yêu thương gia đình và có trách nhiệm",  
"Chọc Nhi cười mỗi ngày",  
"Gu của Nhi là người đơn giản nhưng chân thành",  
"Người làm cho tim Nhi rung rinh",  
"Không cần giàu, chỉ cần hiểu Nhi",  
"Người biết quan tâm những điều nhỏ nhặt",  
"Cao hơn Nhi một chút là được rồi",  
"Biết cách làm Nhi an tâm",  
"Không bắt Nhi phải thay đổi",  
"Người có ánh mắt dịu dàng",  
"Có giọng nói trầm trầm dễ thương",  
"Biết làm Nhi vui khi buồn",  
"Gu là người duy nhất làm Nhi đỏ mặt",  
"Yêu động vật càng tốt nha",  
"Người biết giữ lời hứa",  
"Người thích ôm Nhi mỗi ngày"] }, { keywords: ["style tóc"], answers: ["Nhi thích tóc dài buộc nhẹ nhàng~", "Style Hàn xíu á~", "Tóc dài xoăn nhẹ nhìn dịu dàng",  
"Tóc ngắn cá tính dễ thương",  
"Buộc tóc hai bên cho trẻ trung",  
"Tóc mái thưa Hàn Quốc",  
"Tóc uốn đuôi nhẹ nhàng",  
"Tóc thẳng mượt tự nhiên",  
"Tóc tém tomboy khi nổi loạn",  
"Tóc búi cao dễ thương",  
"Tóc nhuộm nâu socola",  
"Tóc ombre pastel nhẹ",  
"Tóc bob kiểu Nhật",  
"Tóc cột đuôi ngựa",  
"Tóc rẽ ngôi lệch",  
"Tóc mái bằng đáng yêu",  
"Tóc mullet khi nổi loạn",  
"Tóc highlight nhẹ",  
"Tóc búi messy",  
"Tóc tết nhẹ hai bên",  
"Tóc kiểu công chúa Disney",  
"Tóc pixie khi muốn cá tính"] }, { keywords: ["style mặc", "thích mặc"], answers: ["Dễ thương là được á~", "Nhi hay mặc đồ comfy á~, "Áo hoodie oversize với quần short",  
"Váy baby doll dễ thương",  
"Áo sơ mi trắng với váy dài",  
"Set đồ thể thao năng động",  
"Áo thun + yếm jean",  
"Áo croptop + quần ống rộng",  
"Đầm xòe công chúa",  
"Áo len ôm sát mùa đông",  
"Áo blouse nhẹ nhàng + chân váy",  
"Set cardigan và váy hoa",  
"Style học sinh Nhật Bản",  
"Váy đen đơn giản mà sang",  
"Áo khoác bomber + jeans",  
"Áo form dài làm váy",  
"Style công sở nhẹ nhàng",  
"Váy ngắn caro + áo thun",  
"Đầm 2 dây mùa hè",  
"Áo sơ mi buộc vạt",  
"Outfit đen toàn tập cool ngầu",  
"Set pastel nhẹ nhàng""] }, { keywords: ["món ăn", "thích ăn"], answers: ["Trà sữa nè~", "Đồ ngọt ngọt á~", "Trà sữa full topping",  
"Tokbokki cay xè",  
"Pizza phô mai kéo sợi",  
"Xôi gà lá sen",  
"Mì cay cấp độ 0.5",  
"Bánh tráng trộn thần thánh",  
"Chè khúc bạch mát lạnh",  
"Bún bò Huế chuẩn vị",  
"Đùi gà chiên giòn",  
"Chả giò rế",  
"Cơm gà xé phay",  
"Mì Ý kem béo",  
"Bánh su kem trứng muối",  
"Trà đào cam sả",  
"Canh chua cá lóc",  
"Bánh flan mềm tan",  
"Nem nướng Ninh Hòa",  
"Phở bò tái gầu",  
"Chân gà sả tắc",  
"Sữa tươi trân châu đường đen"] } // Thêm các câu khác nếu muốn ];

const randomReplies = [ "Yêu thương nhiều nhiều~", "Hông được giận nha~", "Nhi nhớ anh quá trời~", "Nhi ở đây nè~", "Ai gọi Nhi đó~", "Mơ mộng thấy ai đó đó~", "Hihi, yêu lắm luôn~ ,"Nhi hay cười lắm luôn",  
"Nhi thích mưa nhưng sợ lạnh",  
"Nhi có hay giận vu vơ",  
"Nhi mê trà sữa hơn cả crush",  
"Nhi dễ khóc nhưng mau cười",  
"Nhi giống như mèo vậy á",  
"Nhi thích ôm gấu bông ngủ",  
"Nhi hay viết linh tinh vào sổ",  
"Nhi có tâm hồn hơi nghệ",  
"Nhi hay nói chuyện một mình",  
"Nhi thích người tinh tế",  
"Nhi yêu thầm crush hoài luôn",  
"Nhi có trí nhớ cá vàng",  
"Nhi sợ gián lắm luôn",  
"Nhi biết nấu ăn nha",  
"Nhi muốn đi Nhật một lần",  
"Nhi hay nghe nhạc lofi",  
"Nhi thích mặc đồ pastel",  
"Nhi mê đồ cute dễ thương",  
"Nhi tin vào định mệnh",  
"Nhi thích được ôm từ phía sau",  
"Nhi ghét bị lừa dối",  
"Nhi muốn được yêu thương nhẹ nhàng",  
"Nhi mê viết thư tay",  
"Nhi có playlist riêng mỗi lúc buồn",  
"Nhi thích cắm hoa",  
"Nhi có thể ngồi cả ngày ngắm trời",  
"Nhi thích style công chúa",  
"Nhi tin vào tình yêu lâu dài",  
"Nhi có một góc riêng trong tim cho người đặc biệt"" // Thêm tới 100 câu tùy ý ];

module.exports = { config: { name: "nhi", version: "1.0.0", hasPermission: 0, credits: "Yêu ChatGPT", description: "Bot Nhi cute", commandCategory: "noprefix", usages: "nhi on/off, set biệt danh, hỏi bot", cooldowns: 2, dependencies: {}, envConfig: {} },

handleEvent: async function ({ event, api, Users }) { if (event.senderID == api.getCurrentUserID()) return;

const threadID = event.threadID;
const senderID = event.senderID;
const message = event.body?.toLowerCase() || "";
const name = (await Users.getNameUser(senderID)) || "bạn";

// Auto chào giờ
const hour = moment.tz("Asia/Ho_Chi_Minh").hour();
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

run: async function ({ event, api }) { const { threadID, messageID, body } = event; const msg = body?.toLowerCase() || "";

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

