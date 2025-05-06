module.exports = {
    name: 'nhi_image',
    description: 'Phân tích ảnh người dùng gửi và phản hồi dễ thương',

    async execute(bot, message) {
        // Kiểm tra nếu người dùng đã bật lệnh "nhi on" để kích hoạt chức năng phân tích ảnh
        if (message.text.toLowerCase() === 'nhi on') {
            // Kiểm tra nếu người dùng gửi ảnh
            if (message.image) {
                const imageUrl = message.image.url;  // Lấy URL ảnh được gửi từ message

                try {
                    // Gọi API phân tích ảnh (Ví dụ sử dụng API phân tích ảnh của Google Vision hoặc dịch vụ khác)
                    const response = await fetch('https://your-image-analysis-api.com/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageUrl })  // Gửi URL ảnh để phân tích
                    });
                    const result = await response.json();  // Lấy kết quả từ API

                    // Giả sử API trả về một mô tả ảnh trong result.description
                    const description = result.description || 'Chưa thể mô tả ảnh này';

                    // Tạo câu trả lời dễ thương cho người dùng
                    const responseMessage = `
                        Ôi, nhìn này! 🥰
                        ${description}
                        Có vẻ như ảnh này rất đặc biệt đấy! 😊
                        Bạn muốn kể thêm về ảnh này không? Chia sẻ với Nhi nhé! 💖
                    `;
                    
                    // Gửi câu trả lời về nhóm nơi tin nhắn được gửi
                    bot.sendMessage(message.chat.id, responseMessage);  
                } catch (error) {
                    console.error('Lỗi phân tích ảnh:', error);
                    bot.sendMessage(message.chat.id, 'Nhi không thể phân tích ảnh này, nhưng có thể thử lại nhé! 😅');
                }
            } else {
                bot.sendMessage(message.chat.id, 'Nhi chưa nhận được ảnh nào từ bạn! Gửi ảnh thử xem nào. 😊');
            }
        }
    }
};
