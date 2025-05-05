// shopxe.js - Module Quản lý Mua Bán Xe cho Mirai Project

const fs = require("fs-extra"); const path = require("path"); const axios = require("axios"); const moment = require("moment-timezone");

const dataPath = path.join(__dirname, "shopxe_data.json"); if (!fs.existsSync(dataPath)) fs.writeJSONSync(dataPath, { users: {}, xe: [] }); const database = fs.readJSONSync(dataPath);

// Giá xe demo (có thể mở rộng thêm) const dsXe = [ { ten: "Lamborghini Aventador", loai: "sieudua", gia: 15000000000 }, { ten: "Ferrari SF90", loai: "sieudua", gia: 12000000000 }, { ten: "Ducati Panigale V4", loai: "pkl", gia: 1000000000 }, { ten: "SH 150i", loai: "tayga", gia: 120000000 }, { ten: "Vision 2023", loai: "tayga", gia: 40000000 } ];

function saveData() { fs.writeJSONSync(dataPath, database); }
function genBienSo() {
  const num = Math.floor(Math.random() * 300) + 76000;
  return `RZX${num}`;
}

module.exports = { config: { name: "shopxe", version: "1.0", credits: "Dat Thanh", description: "Quản lý mua bán xe, chức năng chuyenxe, gopxe", commandCategory: "Tiện ích", usages: "/shopxe <lệnh>", hasPrefix: true, cooldowns: 3 }, run: async function ({ api, event, args }) { const { threadID, senderID, messageID, mentions } = event; const name = (await api.getUserInfo(senderID))[senderID].name; const userData = database.users[senderID] || { kho: [], noGop: [] }; if (!database.users[senderID]) database.users[senderID] = userData;

const sub = args[0];

if (sub === "list") {
  let msg = "Danh sách xe hiện có:"; for (const xe of dsXe) msg += • ${xe.ten} - ${xe.gia.toLocaleString()} VND ; return api.sendMessage(msg, threadID, messageID); }

if (sub === "muaxe") {
  const tenXe = args.slice(1).join(" ");
  const xe = dsXe.find(x => x.ten.toLowerCase() === tenXe.toLowerCase());
  if (!xe) return api.sendMessage("Xe không tồn tại!", threadID, messageID);

  // Tiền tạm demo: người dùng luôn mua được
  const bienSo = genBienSo();
  const now = moment().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");
  const thongTin = {
    ten: xe.ten,
    bienSo,
    ngayMua: now,
    cccd: senderID,
    chuXe: name
  };
  userData.kho.push(thongTin);
  saveData();

  return api.sendMessage(
    `\u2708\ufe0f \u0110\u00e3 mua ${xe.ten} thành công!

\n\u2728 Giấy chứng nhận sở hữu xe:\n\n⚡\ufe0f Tên chủ xe: ${name}\n⚡\ufe0f CCCD chủ xe: ${senderID}\n⚡\ufe0f Ngày mua: ${now}\n⚡\ufe0f Biển số xe: ${bienSo}`, threadID, messageID ); }

if (sub === "kho") {
  if (userData.kho.length === 0) return api.sendMessage("Bạn chưa sở hữu chiếc xe nào!", threadID);
  let msg = `\u{1F4C2} Kho xe của ${name}:
; userData.kho.forEach((x, i) => { msg += #${i + 1}. ${x.ten} - Biển số: ${x.bienSo} `; }); return api.sendMessage(msg, threadID); }

if (sub === "menu") {
  return api.sendMessage(`\u{1F6E3}\uFE0F MENU LỆNH SHOPXE:\n

/shopxe list - Xem danh sách xe\n/shopxe muaxe <tên xe> - Mua xe\n/shopxe banxe <tên xe> - Bán xe\n/shopxe kho - Xem kho xe\n/shopxe chuyenxe @tên - Chuyển xe\n/shopxe gopxe <tên xe> - Mua xe trả góp`, threadID); }

if (sub === "banxe") {
  const ten = args.slice(1).join(" ");
  const index = userData.kho.findIndex(x => x.ten.toLowerCase() === ten.toLowerCase());
  if (index === -1) return api.sendMessage("Bạn không sở hữu xe này!", threadID);
  userData.kho.splice(index, 1);
  saveData();
  return api.sendMessage(`\u{1F6E0} \u0110ã bán xe ${ten} thành công.`, threadID);
}

if (sub === "chuyenxe") {
  const tag = Object.keys(mentions)[0];
  if (!tag) return api.sendMessage("Vui lòng tag người muốn chuyển.", threadID);
  const ten = args.slice(1).join(" ").replace(mentions[tag], "").trim();
  const index = userData.kho.findIndex(x => x.ten.toLowerCase() === ten.toLowerCase());
  if (index === -1) return api.sendMessage("Bạn không sở hữu xe này!", threadID);

  return api.sendMessage(
    `\u{1F4DD} Bạn chắc chắn muốn chuyển xe ${ten} cho ${mentions[tag]}?\n\u{2764}\uFE0F Hãy thả tim tin nhắn này để xác nhận.`,
    threadID,
    (err, info) => {
      global.client.handleReaction.push({
        name: "shopxe-chuyen",
        messageID: info.messageID,
        author: senderID,
        tag, ten, index
      });
    }
  );
}

if (sub === "gopxe") {
  const ten = args.slice(1).join(" ");
  const xe = dsXe.find(x => x.ten.toLowerCase() === ten.toLowerCase());
  if (!xe) return api.sendMessage("Xe không tồn tại!", threadID);
  const datcoc = Math.floor(xe.gia * 0.25);
  userData.noGop.push({ ten: xe.ten, tong: xe.gia, conlai: xe.gia - datcoc, ngay: Date.now() });
  saveData();
  return api.sendMessage(
    `\u{1F4B3} \u0110 đã đặt cọc ${datcoc.toLocaleString()} VND để mua ${xe.ten}.\nMỗi ngày không góp sẽ bị tính lãi 2%.`,
    threadID
  );
}

},

handleReaction: async function ({ api, event, handleReaction }) { const { userID, messageID } = event; if (userID !== handleReaction.author) return; const { tag, ten, index } = handleReaction; const nguoiChuyen = database.users[handleReaction.author]; const nguoiNhan = database.users[tag] || { kho: [] }; if (!database.users[tag]) database.users[tag] = nguoiNhan;

const xe = nguoiChuyen.kho[index];
nguoiChuyen.kho.splice(index, 1);
xe.cccd = tag;
xe.chuXe = (await api.getUserInfo(tag))[tag].name;
nguoiNhan.kho.push(xe);
saveData();

api.unsendMessage(messageID);
return api.sendMessage(
  `\u{1F4B5} \u0110 đã chuyển xe ${ten} thành công cho ${xe.chuXe}.
\n\u2728 Cập nhật giấy sở hữu mới.`, event.threadID ); } };

