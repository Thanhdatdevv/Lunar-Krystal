module.exports.config = {
  name: "casino",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Quảng bá Casino Nhà Thanh",
  commandCategory: "hệ thống",
  usages: "/casino",
  cooldowns: 5
};

const banner = `
╔══════════════════════════════════════════╗
     🎰 𝐂𝐀𝐒𝐈𝐍𝐎 𝐍𝐇À 𝐓𝐇𝐀𝐍𝐇 🎲
╚══════════════════════════════════════════╝

✨ 𝗛𝗔̃𝗬 𝗩𝗜𝗦𝗜𝗧 𝗖𝗔𝗦𝗜𝗡𝗢 𝗡𝗛À 𝗧𝗛𝗔𝗡𝗛 𝗟𝗜𝗘̂̀𝗡 𝗧𝗔𝗬 🌟
 
💥 **LÝ DO BẠN PHẢI VÀO NGAY**:
   🎁 **Tặng 100TR VND** cho anh em khởi nghiệp! 🎉
   💳 **Thiếu tiền?** Nhà cái hỗ trợ vay dễ dàng! 💸
   🏆 **Thắng nhiều - Thưởng lớn**! 🚀

🌟 **HÃY VÀO NHÀ THANH LIỀN TAY ĐỂ ĐÁNH CỜ BẠC NÀO!** 💰

🎲 **CÁC GAME HẤP DẪN**: Tài Xỉu, Ba Cào, Xì Dách 🔥

⏳ **ƯU ĐÃI ĐẶC BIỆT**: 
  - Chơi dễ thắng, dễ nhận thưởng!
  - 𝗖𝗮𝗽𝗶𝘁𝗮𝗹 𝗙𝗿𝗲𝗲 𝗙𝗼𝗿 𝗠𝗲𝗺𝗯𝗲𝗿𝘀.

🎯 **LỢI ÍCH VỚI NHÀ THANH**:
    💰 **Khả năng kiếm tiền cực kỳ nhanh chóng!**
    🚀 **Thử thách cực kỳ thú vị cho anh em!**

💥 **Còn chần chừ gì nữa mà không vào ngay?** 💥
`;

module.exports.handleEvent = async ({ api, event }) => {
  const { body, threadID, messageID } = event;
  if (!body) return;
  const content = body.toLowerCase();

  if (["cờ bạc", "casino", "tài xỉu", "xì dách"].some(key => content.includes(key))) {
    return api.sendMessage(banner, threadID, messageID);
  }
};

module.exports.run = async ({ api, event }) => {
  return api.sendMessage(banner, event.threadID, event.messageID);
};
