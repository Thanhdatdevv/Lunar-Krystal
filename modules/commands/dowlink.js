const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "dowlink",
  version: "1.0",
  hasPermssion: 0,
  credits: "Dat Thanh",
  description: "Tự động tải video khi có link Facebook, YouTube, TikTok, Douyin",
  commandCategory: "Tiện ích",
  usages: "Gửi link video",
  cooldowns: 5,
};

module.exports.handleEvent = async function({ event, api }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  let link = body.match(/(https?:\/\/[^\s]+)/g);
  if (!link) return;

  link = link[0];

  let res, videoURL, filename = __dirname + `/cache/video.mp4`;
  try {
    if (link.includes("facebook.com") || link.includes("fb.watch")) {
      res = await axios.get(`https://fbapi.megaapi.repl.co/?url=${encodeURIComponent(link)}`);
      videoURL = res.data.hd || res.data.sd;
    }
    else if (link.includes("tiktok.com")) {
      res = await axios.get(`https://api.tikwm.com/video?url=${encodeURIComponent(link)}`);
      videoURL = res.data.data.play;
    }
    else if (link.includes("douyin.com")) {
      res = await axios.get(`https://www.tikwm.com/api?url=${encodeURIComponent(link)}`);
      videoURL = res.data.data.play;
    }
    else if (link.includes("youtube.com") || link.includes("youtu.be")) {
  const yt = await axios.get(`https://ytloader.in/api/button/video?url=${encodeURIComponent(link)}`);
  const match = yt.data.match(/href="(https:\/\/[^"]+?\.mp4.*?)"/);
  if (match && match[1]) {
    videoURL = match[1];
  } else {
    return api.sendMessage("Nhi Không thể tải video YouTube này.", threadID, messageID);
  }
    }
    if (!videoURL) return api.sendMessage("Không tải được video!", threadID, messageID);

    const response = await axios.get(videoURL, { responseType: "stream" });
    response.data.pipe(fs.createWriteStream(filename));
    response.data.on("end", () => {
      api.sendMessage({
        body: "Nhi Tải xong rồi nè!💗",
        attachment: fs.createReadStream(filename)
      }, threadID, () => fs.unlinkSync(filename), messageID);
    });
  } catch (e) {
    console.log(e);
    return api.sendMessage("Lỗi khi tải video òi kêu chồng mình fix đi🤗!", threadID, messageID);
  }
};

module.exports.run = () => {};
