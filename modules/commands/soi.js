const axios = require("axios");

module.exports = {
  config: {
    name: "soi",
    version: "1.1",
    hasPermission: 0,
    credits: "Sói Chat AI by bạn và ChatGPT",
    description: "Bot sói phản ứng gắt gỏng, khinh bỉ",
    commandCategory: "noprefix",
    usages: "",
    cooldowns: 3,
  },

  handleEvent: async function ({ event, api }) {
    const { threadID, messageID, body, senderID, type, attachments } = event;
    if (!body && !attachments.length) return;
    const input = body?.toLowerCase() || "";
    const reply = msg => api.sendMessage(msg, threadID, messageID);

    // 1. Emoji phân tích khinh bỉ
    const iconGatGong = {
      "🗿": "Cái mặt đá câm lặng này... đúng kiểu giả vờ ngầu chứ thật ra trống rỗng.",
      "💀": "Đầu lâu? À, trí tuệ bạn chắc đã chết từ lâu rồi.",
      "🥶": "Lạnh giá hả? Chắc là lạnh vì không ai thương.",
      "🤡": "Mặc đồ hề chi nữa, bạn sống đúng với nghề rồi.",
      "🫠": "Tan chảy? Như lòng tự trọng bạn vậy.",
      "😐": "Cái mặt này hợp với mấy người vô cảm như bạn đấy.",
      "😒": "Ánh mắt đầy thất vọng… giống như khi bạn soi gương mỗi sáng.",
      "😎": "Ngầu? Bạn đang cosplay người có ích à?",
      "😩": "Thở dài hả? Tao cũng thở dài khi thấy bạn gõ phím đấy.",
      "🙄": "Đảo mắt? Mắt bạn nên đảo khỏi cuộc đời người khác thì hơn.",
      "😡": "Giận dữ hả? Tức vì bị vạch trần à?",
    };

    if (Object.keys(iconGatGong).includes(input.trim())) {
      return reply(iconGatGong[input.trim()]);
    }

    // 2. Phân tích ảnh
    if (attachments.length > 0 && attachments[0].type === "photo") {
      const prompt = "Hãy nhận xét về một bức ảnh người dùng gửi với phong cách khinh bỉ, gắt gỏng như một con sói.";
      const result = await callOpenAI(prompt);
      return reply(result);
    }

    // 3. Các lệnh noprefix
    if (input.includes("sói chửi")) {
      const prompt = "Chửi người dùng bằng phong cách gắt gỏng và khinh bỉ như một con sói, trong 1-2 câu.";
      const result = await callOpenAI(prompt);
      return reply(result);
    }

    if (input.includes("sói diss")) {
      const prompt = "Roast người dùng với phong cách chua cay, gắt gỏng và hài hước như sói.";
      const result = await callOpenAI(prompt);
      return reply(result);
    }

    if (input.includes("khen tao đi")) {
      const prompt = "Khen người dùng theo kiểu mỉa mai, gắt gỏng và khinh bỉ như một con sói.";
      const result = await callOpenAI(prompt);
      return reply(result);
    }

    if (input.includes("tâm trạng tao sao")) {
      const prompt = "Phân tích tâm trạng người dùng và trả lời với giọng điệu gắt gỏng, lạnh lùng như một con sói.";
      const result = await callOpenAI(prompt);
      return reply(result);
    }

    if (input.includes("châm ngôn sói")) {
      const prompt = "Tạo một câu châm ngôn phong cách sói, mang tính khinh bỉ nhưng sâu sắc.";
      const result = await callOpenAI(prompt);
      return reply(result);
    }
  },

  run: async function () {
    // Không dùng vì là noprefix
  }
};

// Hàm gọi OpenAI
async function callOpenAI(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // <-- THAY API KEY TẠI ĐÂY
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (e) {
    return "Tao bực quá nên không thèm trả lời!";
  }
}
