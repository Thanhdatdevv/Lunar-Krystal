const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

// Cấu hình OpenAI
const configuration = new Configuration({
  apiKey: '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' // <-- Thay bằng API Key của bạn
});
const openai = new OpenAIApi(configuration);

module.exports = {
  config: {
    name: 'olivia',
    version: '1.0',
    hasPermission: 0,
    credits: 'Dat Thanh',
    description: 'AI Olivia phản hồi như ChatGPT',
    commandCategory: 'AI',
    usages: '',
    cooldowns: 2,
  },

  onCall: async function ({ message, args, event, api }) {
    const input = args.join(' ').trim();
    const senderID = event.senderID;
    const mentionBot = event.body?.toLowerCase()?.includes("olivia");
    const isReplyToBot = event.messageReply && event.messageReply.senderID === api.getCurrentUserID();

    if (!input && !isReplyToBot && !mentionBot) return;

    // Tên gọi đặc biệt nếu là UID chồng iu
    const loverID = "61561400514605";
    let senderName = event.senderID === loverID ? "chồng iu❤️" : (await getUserName(api, senderID));

    // Nội dung gửi cho OpenAI
    const userMessage = input || event.body;
    const prompt = `Olivia là một AI dễ thương, thông minh và tình cảm, trả lời tự nhiên như con người. Người hỏi là ${senderName}:\n\n${senderName}: ${userMessage}\nOlivia:`;

    try {
      const gptResponse = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.6,
        stop: [`\n`],
      });

      const reply = gptResponse.data.choices[0].text.trim();
      return message.reply(reply);

    } catch (error) {
      console.error('Lỗi khi gọi OpenAI:', error);
      return message.reply('Xin lỗi, Olivia đang bị mệt, thử lại sau nha.');
    }
  }
};

// Hàm lấy tên người dùng
async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return userInfo[userID]?.name || "bạn";
  } catch {
    return "bạn";
  }
}
