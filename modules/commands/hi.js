module.exports.config = {
  name: "hi",
  version: "1.0.0",
  hasPermssion: 1,
  credit: "Sam",
  description: "Hi gửi sticker",
  commandCategory: "Nhóm",
  usages: "[text]",
  cooldowns: 5
}

module.exports.handleEvent = async ({ event, api, Users }) => {
  let KEY = [ 
    "hăi",
    "hello",
    "hi",
    "hai",
    "chào",
    "hí",
    "hú",
    "helu",
    "hiii",
    "lô",
    "hii",
    "helo",
    "haii",
    "xin chào",
    "chào mn",
    "hi mn"
  ];
  let thread = global.data.threadData.get(event.threadID) || {};
  if (typeof thread["hi"] == "undefined", thread["hi"] == false) return
  else {
  if (KEY.includes(event.body.toLowerCase()) !== false) {
    let data = [
      "2523892817885618",
      "2523892964552270",
      "2523893081218925",
      "2523893217885578",
      "2523893384552228",
      "2523892544552312",
      "2523892391218994",
      "2523891461219087",
      "2523891767885723",
      "2523891204552446",
      "2523890691219164",
    
