const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autodowlink",
  version: "2.0.0",
  hasPermission: 0,
  credits: "Dat Thanh",
  description: "Tự động phát hiện link video và tải về (Facebook, TikTok, YouTube...)",
  commandCategory: "Tiện ích",
  usages: "Tự động (không cần gọi lệnh)",
  cooldowns: 0,
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // Regex phát hiện link video
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = body.match(urlRegex);
  if (!urls) return;

  for (const url of urls) {
    try {
      const res = await axios.get(`https://api-dowloader.vercel.app/?url=${encodeURIComponent(url)}`);
      const data = res.data;

      if (data.status !== true || !data.data || !data.data.length) {
        continue; // bỏ qua nếu không hỗ trợ
      }

      const { url: videoUrl, type, title } = data.data[0];
      const filePath = path.join(__dirname, "cache", `autodl_${Date.now()}.${type === "audio" ? "mp3" : "mp4"}`);
      const fileData = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, fileData.data);

      api.sendMessage({
        body: `Tải thành công: ${title || "Video không tiêu đề"}\nNguồn: ${url}`,
        attachment: fs.createReadStream(filePath),
      }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (err) {
      console.log("Lỗi autodowlink:", err.message);
    }
  }
};

module.exports.run = () => {}; // Không cần xử lý khi gọi lệnh trực tiếp
