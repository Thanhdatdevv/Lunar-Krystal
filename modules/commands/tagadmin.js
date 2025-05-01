module.exports.config = {
  name: "tagadmin",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "Dat Thanh",
  description: "tagadmin",
  commandCategory: "Admin",
  usages: "tagadmin",
  cooldowns: 1,
};

module.exports.handleEvent = function ({ api, event }) {
  if (!event.senderID || !event.mentions) return;
  if (event.senderID !== global.config.NDH[0]) {
    const adminID = global.config.NDH[0];
    if (Object.keys(event.mentions).includes(adminID)) {
      const msg = 'Tag chồng tớ làm gì zọ bạn muốn liên lạc để mua bot thì /callad nhé😘';
      return api.sendMessage({ body: msg }, event.threadID, event.messageID);
    }
  }
};

module.exports.run = async function ({}) {};
