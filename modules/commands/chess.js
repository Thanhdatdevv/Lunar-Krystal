const { Chess } = require("chess.js");
const fs = require("fs");
const path = __dirname + "/chessData.json";

module.exports.config = {
  name: "chess",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Chơi cờ vua 2 người bằng text",
  commandCategory: "game",
  usages: "[new | move e2 e4 | board | resign]",
  cooldowns: 1
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID, messageID } = event;
  const sub = args[0];
  if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

  let data = JSON.parse(fs.readFileSync(path));
  if (!data[threadID]) data[threadID] = null;

  if (sub === "new") {
    data[threadID] = {
      game: new Chess().fen(),
      white: senderID,
      black: null
    };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage("Đã bắt đầu ván cờ mới\nBạn là quân Trắng\nNgười khác gõ `chess join` để chơi quân Đen.", threadID, messageID);
}

  if (sub === "join") {
    if (!data[threadID] || data[threadID].black)
      return api.sendMessage("Không có ván cờ nào đang chờ hoặc đã đủ người.", threadID, messageID);
    if (data[threadID].white === senderID)
      return api.sendMessage("Bạn không thể chơi cả hai bên!", threadID, messageID);
    data[threadID].black = senderID;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage("Bạn đã tham gia ván cờ với quân Đen.", threadID, messageID);
  }

  if (sub === "board") {
    if (!data[threadID])
      return api.sendMessage("Chưa có ván cờ nào đang diễn ra.", threadID, messageID);
    const game = new Chess(data[threadID].game);
    return api.sendMessage(game.ascii(), threadID, messageID);
  }

  if (sub === "resign") {
    if (!data[threadID])
      return api.sendMessage("Không có ván cờ nào đang diễn ra.", threadID, messageID);
    const side = senderID === data[threadID].white ? "Trắng" : "Đen";
    delete data[threadID];
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage(`Người chơi ${side} đã đầu hàng. Ván cờ kết thúc.`, threadID, messageID);
  }

  if (sub === "move") {
    if (!data[threadID])
      return api.sendMessage("Không có ván cờ nào đang diễn ra.", threadID, messageID);

    const moveFrom = args[1];
    const moveTo = args[2];
    if (!moveFrom || !moveTo)
      return api.sendMessage("Vui lòng nhập nước đi. Ví dụ: chess move e2 e4", threadID, messageID);

    const game = new Chess(data[threadID].game);
    const turn = game.turn() === "w" ? data[threadID].white : data[threadID].black;

    if (turn !== senderID)
      return api.sendMessage("Chưa đến lượt bạn.", threadID, messageID);

    const move = game.move({ from: moveFrom, to: moveTo, promotion: "q" });

    if (!move)
      return api.sendMessage("Nước đi không hợp lệ.", threadID, messageID);

    data[threadID].game = game.fen();
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    let msg = game.ascii();
    if (game.in_checkmate()) {
      msg += `
Chiếu hết! ${senderID === data[threadID].white ? "Trắng" : "Đen"} thắng!`;
      delete data[threadID];
    }

    return api.sendMessage(msg, threadID, messageID);
  }

  return api.sendMessage("Sai cú pháp. Dùng: new, join, board, move e2 e4, resign", threadID, messageID);
};
