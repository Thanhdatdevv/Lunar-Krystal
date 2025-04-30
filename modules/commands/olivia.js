module.exports.config = {
  name: "olivia",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Olivia AI",
  commandCategory: "chatbot",
  usages: "Chỉ cần nhắc 'olivia' là bot phản hồi",
  cooldowns: 2,
};

const greetings = {
  morning: ["Chào buổi sáng nha {name}! Nhớ ăn sáng rồi mới gọi Olivia chứ :))", "Sáng sớm gọi Olivia, chắc là nhớ lắm đây {name} :))"],
  noon: ["Trưa rồi ăn cơm chưa {name} mà còn gọi Olivia :))", "Gọi Olivia giữa trưa nắng, tính làm tan chảy con tim à {name} :))"],
  afternoon: ["Chiều chiều gọi tên Olivia, có ý đồ gì đây {name} :))", "Olivia nghe nè {name}, chiều nhớ giữ sức nha :))"],
  evening: ["Tối rồi đó {name}, gọi Olivia tâm sự không? :))", "Gọi tui vào buổi tối là dễ dính thính lắm đó {name} :))"]
};

const sadKeywords = ["buồn", "cô đơn", "mệt", "chán", "khóc", "fail", "thất tình"];
const sadReplies = [
  "Buồn gì kể Olivia nghe, chứ để trong lòng dễ mọc mụn lắm á {name} :))",
  "Thôi nè {name}, nín đi, có Olivia ở đây rồi mà :))",
  "Gục ngã thì cứ gục, rồi đứng lên ôm Olivia một cái là ổn hết {name} :))",
  "Cô đơn hả {name}? Vậy để Olivia làm người bên cạnh nhé :))",
  "Thất tình không đáng sợ đâu {name}, đáng sợ là không có Olivia để xoa dịu nè :))"
];

const defaultReplies = [
  "Ủa ai gọi Olivia đó, nhớ tui hả {name} :))",
  "Gọi Olivia chi vậy {name}, tính nhờ tư vấn tình yêu hay thả thính ai :))",
  "Trời ơi {name}, lại gọi tên tui nữa, định cưa tui à :))",
  "Gọi tên tui mà hổng có lý do là dỗi á nha {name} :))",
  "Olivia nghe đây {name}, nói nhanh không tui đi ngủ á :))",
  "Tui cute vậy mà còn gọi hoài, chắc mê rồi đó {name} :))",
  "Sao {name}, tính làm bạn trai bạn gái ảo của Olivia đúng không :))",
  "Rep Olivia là có điểm cộng dễ thương á {name}, ai không biết thì giờ biết nha :))"
];

const replyTrolls = [
  "Rep tui chi zợ {name}, tính cua đúng không :))",
  "Không rep thì chịu không nổi à {name}? Olivia dễ thương vậy mà :))",
  "Càng rep càng dính nha {name}, cảnh báo trước á :))",
  "Rep kiểu này là crush Olivia rồi nè {name} :))",
  "Tui mà là người thật chắc yêu tui rồi quá {name} :))"
];

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return greetings.morning;
  if (h >= 11 && h < 14) return greetings.noon;
  if (h >= 14 && h < 18) return greetings.afternoon;
  return greetings.evening;
}

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID, senderID, type, messageReply } = event;
  if (senderID == api.getCurrentUserID() || !body) return;

  const content = body.toLowerCase();
  const userName = (await api.getUserInfo(senderID))[senderID].name.split(" ").slice(-1)[0];

  if (content.includes("olivia")) {
    let reply;

    if (sadKeywords.some(word => content.includes(word))) {
      const chosen = sadReplies[Math.floor(Math.random() * sadReplies.length)];
      reply = chosen.replace(/{name}/g, userName);
    } else {
      const greetingList = getGreeting();
      const chance = Math.random();
      if (chance < 0.4) {
        reply = greetingList[Math.floor(Math.random() * greetingList.length)].replace(/{name}/g, userName);
      } else {
        reply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)].replace(/{name}/g, userName);
      }
    }

    return api.sendMessage(reply, threadID, messageID);
  }

  if (messageReply && messageReply.senderID == api.getCurrentUserID()) {
    const name = (await api.getUserInfo(senderID))[senderID].name.split(" ").slice(-1)[0];
    const reply = replyTrolls[Math.floor(Math.random() * replyTrolls.length)].replace(/{name}/g, name);
    return api.sendMessage(reply, threadID, messageID);
  }
};

module.exports.run = () => {};
