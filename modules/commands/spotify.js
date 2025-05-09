const axios = require('axios')
const fs = require('fs')
const path = require('path')

module.exports.config = {
    name: "spt",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "KyPhan",
    description: "spotify",
    commandCategory: "Giải Trí",
    usages: "spt",
    cooldowns: 5
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID)
    try {
        const index = parseInt(event.body)
        if (isNaN(index) || index < 1 || index > handleReply.results.length) {
            return send("Số không hợp lệ.")
        }
        api.unsendMessage(handleReply.messageID)

        const selectedSong = handleReply.results[index - 1]
        const { title, url, duration } = selectedSong

        const downloadUrlApi = `https://kyphandev.site/down/sptf?link=${encodeURIComponent(url)}`
        const downloadResponse = await axios.get(downloadUrlApi)
        const { medias } = downloadResponse.data
        if (!medias || medias.length === 0) {
            throw new Error("Không có dữ liệu media.")
        }

        const media = medias.find(m => m.type === "audio")
        if (!media || !media.url) {
            throw new Error("Không tìm thấy link audio.")
        }

        const downloadUrl = media.url
        const filePath = path.resolve(__dirname, `cache/${title}.mp3`)
        const audioData = (await axios.get(downloadUrl, { responseType: "arraybuffer" })).data
        fs.writeFileSync(filePath, Buffer.from(audioData))

        send({
            body: `Tiêu đề: ${title}\nThời lượng: ${duration}`,
            attachment: fs.createReadStream(filePath)
        }, () => fs.unlinkSync(filePath))
    } catch (error) {
        return send(`Lỗi: ${error.message}`)
    }
}

module.exports.run = async function ({ api, event, args }) {
    const send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID)
    try {
        let q = args.join(" ")
        if (!q) return send("Nhập từ khóa tìm kiếm.")

        const searchResult = await axios.get(`https://kyphandev.site/search/sptf?q=${encodeURIComponent(q)}`)
        const result = searchResult.data

        if (!result || result.length === 0) return send("Không tìm thấy kết quả.")

        const maxResults = 6
        let message = "Kết quả tìm kiếm:\n\n"

        for (let i = 0; i < Math.min(result.length, maxResults); i++) {
            const { title, duration } = result[i]
            message += `${i + 1}. ${title}\nThời lượng: ${duration}\n\n`
        }

        send({ body: message }, (error, info) => {
            if (error) return send(`Lỗi gửi tin nhắn: ${error.message}`)

            global.client.handleReply.push({
                type: "chooseSong",
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                results: result.slice(0, maxResults)
            })
        })
    } catch (error) {
        return send(`Lỗi: ${error.message}`)
    }
}
