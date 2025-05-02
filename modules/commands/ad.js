module.exports = {
  config: {
    name: "ad",
    version: "1.8",
    hasPermission: 0,
    credits: "Dat Thanh",
    description: "Bot rep khi nhắc đến admin",
    commandCategory: "Tiện ích",
    usages: "",
    cooldowns: 0
  },

  handleEvent: async function ({ event, api, Users }) {
    const { body, threadID, messageID, mentions, senderID } = event;
    if (!body) return;

    const text = body.toLowerCase();
    const ADMIN_UID = "61561400514605"; // Thay bằng UID Facebook admin của bạn

    const keywordMatch =
      text.includes("dat") ||
      text.includes("đạt") ||
      text.includes("thanhdat") ||
      text.includes("datthanh");

    const mentionMatch = mentions && Object.keys(mentions).includes(ADMIN_UID);

    if (keywordMatch || mentionMatch) {
