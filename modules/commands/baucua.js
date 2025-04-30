var request = require("request");
const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, createWriteStream, createReadStream, ensureDirSync } = require("fs-extra");

module.exports.config = {
    name: "baucua",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Dat Thanh",
    description: "Game bầu cua có đặt cược",
    commandCategory: "Trò Chơi",
    usages: "#baucua 𝐠𝐚̀/𝐭𝐨̂𝐦/𝐛𝐚̂̀𝐮/𝐜𝐮𝐚/𝐜𝐚́/𝐧𝐚𝐢] 𝐡𝐨𝐚̣̆𝐜 [🐓/🦞/🍐/🦀/🐬/🦌] 𝐒𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐜𝐮̛𝐨̛̣𝐜 (𝐥𝐮̛𝐮 𝐲́ 𝐩𝐡𝐚̉𝐢 𝐭𝐫𝐞̂𝐧 𝟏𝟎𝟎$) lắc ra x1 +300$, x2 x2$, x3 x3$",
    cooldowns: 2
};

module.exports.onLoad = async function () {
    ensureDirSync(__dirname + '/cache/ảnh');

    if (!existsSync(__dirname + '/cache/ảnh/ga.jpg')) {
        request('https://i.imgur.com/Vz17qhg.jpg').pipe(createWriteStream(__dirname + '/cache/ảnh/ga.jpg'));
    }
    if (!existsSync(__dirname + '/cache/ảnh/tom.jpg')) {
        request('https://i.imgur.com/Ep0MukF.jpg').pipe(createWriteStream(__dirname + '/cache/ảnh/tom.jpg'));
    }
    if (!existsSync(__dirname + '/cache/ảnh/bau.jpg')) {
        request('https://i.imgur.com/Qp3StfB.jpg').pipe(createWriteStream(__dirname + '/cache/ảnh/bau.jpg'));
    }
    if (!existsSync(__dirname + '/cache/ảnh/cua.jpg')) {
        request('https://i.imgur.com/J5MPPMW.jpg').pipe(createWriteStream(__dirname + '/cache/ảnh/cua.jpg'));
    }
    if (!existsSync(__dirname + '/cache/ảnh/ca.jpg')) {
        request('https://i.imgur.com/JNQr0qI.jpg').pipe(createWriteStream(__dirname + '/cache/ảnh/ca.jpg'));
    }
    if (!existsSync(__dirname + '/cache/ảnh/nai.jpg')) {
        request('https://i.imgur.com/UYhUZf8.jpg').pipe(createWriteStream(__dirname + '/cache/ảnh/nai.jpg'));
    }
    if (!existsSync(__dirname + '/cache/ảnh/baucua.gif')) {
        request('https://i.imgur.com/dlrQjRL.gif').pipe(createWriteStream(__dirname + '/cache/ảnh/baucua.gif'));
    }
};

async function get(one,two,three) {
    var x1;
        switch (one) {
            case "ga": x1 = "🐓"; break;
            case "tom": x1 = '🦞'; break;
            case "bau": x1 = '🍐'; break;
            case "cua": x1 = '🦀'; break;
            case "ca": x1 = '🐬'; break;
            case "nai": x1 = '🦌';
        }
    var x2;
        switch (two) {
            case "ga": x2 = "🐓"; break;
            case "tom": x2 = '🦞'; break;
            case "bau": x2 = '🍐'; break;
            case "cua": x2 = '🦀'; break;
            case "ca": x2 = '🐬'; break;
            case "nai": x2 = '🦌';
        }
    var x3;
        switch (three) {
            case "ga": x3 = "🐓"; break;
            case "tom": x3 = '🦞'; break;
            case "bau": x3 = '🍐'; break;
            case "cua": x3 = '🦀'; break;
            case "ca": x3 = '🐬'; break;
            case "nai": x3 = '🦌';
        }
    var all = [x1, x2, x3];
    return full = all;
}
var full = [];

module.exports.run = async function({ api, event, args, Currencies }) {
    var out = (msg) => api.sendMessage(msg,event.threadID, event.messageID);
    const slotItems = ["ga", "tom", "bau", "cua", "ca", "nai"];
    const moneyUser = (await Currencies.getData(event.senderID)).money;
    var moneyBet = parseInt(args[1]);

    if (!args[0] || !isNaN(args[0])) return api.sendMessage("𝐇𝐚̃𝐲 𝐁𝐚̂́𝐦 : #𝐛𝐚𝐮𝐜𝐮𝐚 [𝐛𝐚̂̀𝐮/𝐜𝐮𝐚/𝐜𝐚́/𝐧𝐚𝐢/𝐠𝐚̀/𝐭𝐨̂𝐦] [𝐬𝐨̂́ 𝐭𝐢𝐞̂̀𝐧]",event.threadID, event.messageID);
    if (isNaN(moneyBet) || moneyBet <= 0) return api.sendMessage("𝐒𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐝𝐚̣̆𝐭 𝐜𝐮̛𝐨̛̣𝐜 𝐤𝐡𝐨̂𝐧𝐠 𝐝𝐮̛𝐨̛̣𝐜 𝐝𝐞̂̉ 𝐭𝐫𝐨̂́𝐧𝐠 𝐡𝐨𝐚̣̆𝐜 𝐥𝐚̀ 𝐬𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐚̂𝐦", event.threadID, event.messageID);
    if (moneyBet > moneyUser) return api.sendMessage("𝐒𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐛𝐚̣𝐧 𝐝𝐚̣̆𝐭 𝐥𝐨̛́𝐧 𝐡𝐨̛𝐧 𝐬𝐨̂́ 𝐝𝐮̛ 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧!", event.threadID, event.messageID);
    if (moneyBet < 100) return api.sendMessage("𝐒𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐝𝐚̣̆𝐭 𝐤𝐡𝐨̂𝐧𝐠 𝐝𝐮̛𝐨̛̣𝐜 𝐝𝐮̛𝐨̛́𝐢 𝟏𝟎𝟎 𝐝𝐨̂!", event.threadID, event.messageID);

    var number = [], win = false;
    for (let i = 0; i < 3; i++) number[i] = slotItems[Math.floor(Math.random() * slotItems.length)];

    var itemm, icon;
    switch (args[0].toLowerCase()) {
        case "bầu": itemm = "bau"; icon = '🍐'; break;
        case "cua": itemm = "cua"; icon = '🦀'; break;
        case "cá": itemm = "ca"; icon = '🐟'; break;
        case "nai": itemm = "nai"; icon = '🦌'; break;
        case "gà": itemm = "ga"; icon = '🐓'; break;
        case "tôm": itemm = "tom"; icon = '🦞'; break;
        default: return api.sendMessage("𝐇𝐚̃𝐲 𝐁𝐚̂́𝐦 : #𝐛𝐚𝐮𝐜𝐮𝐚 [𝐛𝐚̂̀𝐮/𝐜𝐮𝐚/𝐜𝐚́/𝐧𝐚𝐢/𝐠𝐚̀/𝐭𝐨̂𝐦] [𝐬𝐨̂́ 𝐭𝐢𝐞̂̀𝐧]",event.threadID, event.messageID);
    }

    await get(number[0], number[1], number[2]);
    api.sendMessage({body:"𝐂𝐡𝐨̛̀ 𝐛𝐨𝐭 𝐥𝐚̆́𝐜 𝐜𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐦𝐚𝐲 𝐦𝐚̆́𝐧🍀",attachment: createReadStream(__dirname + "/cache/ảnh/baucua.gif")},event.threadID,async (error,info) => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        api.unsendMessage(info.messageID);
        await new Promise(resolve => setTimeout(resolve, 100));

        var array = [number[0], number[1], number[2]];
        var listimg = array.map(string => createReadStream(__dirname + `/cache/ảnh/${string}.jpg`));
        var i = array.filter(e => e == itemm).length;

        if (i > 0) {
            var mon = i === 1 ? moneyBet + 300 : moneyBet * i;
            await Currencies.increaseMoney(event.senderID, mon);
            return api.sendMessage({body:`𝐊𝐞̂́𝐭 𝐪𝐮𝐚̉: ${full.join(" | ")}\n𝐁𝐚̣𝐧 𝐭𝐡𝐚̆́𝐧𝐠 𝐯𝐚̀ 𝐧𝐡𝐚̣̂𝐧 ${mon}$ \n➢ 𝐁𝐨𝐭 𝐥𝐚̆́𝐜 𝐫𝐚 ${i} 𝐜𝐨𝐧 ${icon}`,attachment: listimg},event.threadID, event.messageID);
        } else {
            await Currencies.decreaseMoney(event.senderID, moneyBet);
            return api.sendMessage({body:`𝐊𝐞̂́𝐭 𝐪𝐮𝐚̉: ${full.join(" | ")}\n𝐁𝐚̣𝐧 𝐭𝐡𝐮𝐚 𝐯𝐚̀ 𝐛𝐢̣ 𝐭𝐫𝐮̛̀ ${moneyBet}$ 💸\n𝐯𝐢̀ 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐨́ 𝐜𝐨𝐧 ${icon}`,attachment: listimg},event.threadID, event.messageID);
        }
    }, event.messageID);
};
