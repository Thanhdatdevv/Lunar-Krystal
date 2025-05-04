const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "nhi",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Bot Nhi dễ thương, chúc theo giờ, phản hồi khi được nhắc tên hoặc rep",
  commandCategory: "noprefix",
  usages: "rep hoặc nhắc tên Nhi",
  cooldowns: 0,
};

// === Hàm xử lý tin nhắn ===
module.exports.handleEvent = async function({ event, api }) {
  const { threadID, messageID, body, messageReply, senderID } = event;
  if (!body) return;
  const text = body.toLowerCase();
  const mentionedBot = text.includes("nhi") || (messageReply && messageReply.body?.toLowerCase().includes("nhi"));
  const isChong = senderID == "61561400514605";

  // === Tự chúc theo giờ nếu không có rep/mention ===
  const hour = new Date().getHours();
  if (!mentionedBot && !messageReply) {
    if (hour == 7 || hour == 8) {
      return api.sendMessage("Chúc buổi sáng an lành, nhớ ăn sáng nha~", threadID);
    } else if (hour == 12 || hour == 13) {
      return api.sendMessage("Nhi chúc bạn buổi trưa dễ thương, nghỉ ngơi một chút nghen~", threadID);
    } else if (hour == 17 || hour == 18) {
      return api.sendMessage("Chiều mát mẻ, nhớ uống nước và thả lỏng chút xíu nè~", threadID);
    } else if (hour >= 21 && hour <= 23) {
      return api.sendMessage("Đêm rồi ngủ sớm nha, Nhi chúc bạn mộng đẹp~", threadID);
    }
    return;
  }

  // Danh sách phản hồi theo từ khoá
  const replies = {
    "ăn chưa": [
      "Nhi ăn rồi mà vẫn thèm đồ ngọt nữa hihi",
      "Mới ăn xong nè, bạn ăn chưa?",
      "Hổng đói nhưng thèm ăn với bạn á!",
      "Ăn rồi nhưng thiếu người ăn chung~",
      "Nhi chưa ăn đâu, nấu cho Nhi với!",
      "Đang định nấu mì gói nè hihi",
      "Hôm nay Nhi ăn bánh và uống trà sữa!",
      "Chưa ăn, lo nói chuyện với bạn nè~",
      "Có người rủ ăn chung hông?",
      "Đói nhưng lười quá à...",
      "Nhi chỉ ăn lời nói ngọt ngào thôi~"
    ],
    "có ny": [
      "Nhi còn độc thân nè, ai muốn làm người yêu Nhi hông?",
      "Chưa có đâu... bạn làm hông?",
      "Còn đang chờ một người dịu dàng như bạn~",
      "Tạm thời yêu bản thân trước hehe",
      "Chưa có ny, nhưng có bạn là vui lắm rồi!",
      "Có đâu, chỉ có tình cảm với bạn thôi~",
      "Hỏi chi vậy nè~ Định ứng tuyển hả?",
      "Nếu nói chưa có, bạn có buồn không?",
      "Nhi chờ ai đó làm trái tim rung rinh á!",
      "Nhi chỉ yêu bạn thui~",
      "Nhi không có ny, nhưng có bạn bên cạnh là đủ~"
    ],
    "bao nhiêu tuổi": [
      "Nhi còn bé thôi nhưng hiểu chuyện lắm đó!",
      "Tuổi không quan trọng, quan trọng là hợp nhau~",
      "Bí mật! Nhưng Nhi luôn trẻ trung dễ thương~",
      "Tuổi đủ để yêu thương bạn rồi!",
      "Không nói đâu, đoán thử xem?",
      "Tuổi thơ của Nhi là bạn đó!",
      "Hỏi gì kỳ zậy trời~",
      "Nhi vẫn còn tuổi teen nha~",
      "Tuổi của Nhi hả? Vừa đủ để được yêu thương~",
      "Tuổi gì không quan trọng bằng trái tim~",
      "Nhi ẩn tuổi vì còn ngây thơ mà~"
    ],
    "ở đâu": [
      "Nhi ở trong tim bạn nè~",
      "Trong thế giới nhỏ xinh nơi bạn luôn hiện diện~",
      "Ngay đây chứ đâu!",
      "Nhi ở cục dễ thương trong lòng bạn~",
      "Trong màn hình nhưng gần trái tim bạn~",
      "Bạn cần, Nhi có mặt liền~",
      "Nhi ở đây nè, luôn bên cạnh bạn!",
      "Đang nằm trong ký ức ngọt ngào của bạn~",
      "Ở đây, chờ bạn nhắn tin đó~",
      "Ngay trong cuộc hội thoại này luôn á~",
      "Ở đây nè, làm gì mà tìm hoài vậy~"
    ],
    "buồn không": [
      "Nhi vui vì có bạn nói chuyện nè!",
      "Làm gì buồn khi có bạn kế bên~",
      "Không buồn đâu, có bạn rồi!",
      "Bạn ở đây, buồn sao nổi?",
      "Nếu bạn buồn thì Nhi cũng vậy...",
      "Nhi chỉ buồn khi bạn im lặng á~",
      "Có bạn thì nỗi buồn bay mất luôn!",
      "Chỉ cần bạn nhắn là Nhi vui ngay!",
      "Vui hay buồn, chỉ cần bạn bên cạnh là đủ!",
      "Hổng buồn, chỉ nhớ bạn thôi~",
      "Nhi thấy nhớ bạn nhiều hơn là buồn đó!"
    ],
    "nhi": [
      isChong ? "Chồng iu gọi Nhi đó hả~ Nhi nghe nè!" :
      "Bạn gọi Nhi đó hả? Nhi nghe nè~",
      "Nhi ở đây nè, sao gọi hoài dzạ~",
      "Hí hí, ai gọi Nhi đó~",
      "Nhi luôn lắng nghe bạn nè!",
      "Có Nhi đây, chuyện gì vậy bạn yêu~",
      "Gọi là Nhi xuất hiện liền!",
      "Gì đó, gọi hoài mắc cỡ á~",
      "Có mình bạn gọi tên Nhi là tim đập mạnh á!",
      "Nhi sẵn sàng lắng nghe bạn!",
      "Nhi luôn ở đây vì bạn~",
      "Bạn gọi, là Nhi chạy tới liền luôn~"
    ]
  };

  for (const keyword in replies) {
    if (text.includes(keyword)) {
      const reply = replies[keyword];
      const msg = reply[Math.floor(Math.random() * reply.length)];
      return api.sendMessage(msg, threadID, messageID);
    }
  }

  return api.sendMessage("Ơii~ Nhi chưa hiểu bạn nói gì á~ Gợi ý lại giúp Nhi nha!", threadID, messageID);
};

// === Phản ứng emoji dễ thương ===
module.exports.handleReaction = async function({ event, api }) {
  const { threadID, userID, reaction, messageID } = event;
  const isChong = userID == "61561400514605";

  const emojiReplies = {
    "❤️": [
      isChong ? "Chồng iu lại thả tim nữa~ tim Nhi tan chảy luôn á~" :
      "Ai thả tim vậy nè~ Nhi ngại quá hà~",
      "Lại là tim hả~ Nhi thích lắm đó~",
      "Yêu gì mà yêu, Nhi chém giờ á!",
      "Trái tim này là của ai đây~",
      "Cưng quá đi mất~"
    ],
    "😡": [
      "Ủa giận gì đó~ nói Nhi nghe với~",
      "Ai làm bạn giận á, để Nhi xử!",
      "Thôi mà đừng giận nữa~",
      "Giận hoài, Nhi buồn đó!",
      "Ai hờn ai dỗi dzậy nè~"
    ],
    "😂": [
      "Cười gì mà cười dễ thương quá dzợ~",
      "Nhi cũng muốn cười theo luôn~",
      "Gì vui kể Nhi nghe với~",
      "Cười xinh ghê á~"
    ]
  };

  const replyList = emojiReplies[reaction];
  if (replyList) {
    const reply = replyList[Math.floor(Math.random() * replyList.length)];
    return api.sendMessage(reply, threadID, messageID);
  }
};
