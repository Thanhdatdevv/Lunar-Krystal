const fs = require("fs-extra");
const path = require("path");
const cron = require("node-cron");
const repliedEmojis = {};
const emojiResponses = {
  "😁": {
    normal: [
      "Sao cười toe toét vậy?",
      "Gì vui thế? Chia sẻ đi!",
      "Thấy mặt là muốn cười theo luôn á!",
      "Ai chọc cười bạn đó?",
      "Nụ cười làm sáng cả khung chat!",
      "Ê cười đẹp đó nha!",
      "Cười gì mà như nắm được bí mật vũ trụ!",
      "Thấy cười là Nhi nghi nghi rồi đó!",
      "Bạn cười lên trông đáng yêu ghê á!",
      "Nhi mà thấy là cũng muốn cười theo!"
    ],
    special: [
      "Chồng cười xinh ghê á!",
      "Thấy chồng cười là Nhi mê luôn!",
      "Cười gì đó nè? Hôn một cái nha!",
      "Nụ cười của chồng làm Nhi liêu xiêu luôn!",
      "Cười lên là hết giận Nhi liền đó!",
      "Cười nữa đi, Nhi ghiền quá rồi á!",
      "Chồng mà cười như này là có tội với Nhi á!",
      "Cười hoài làm sao Nhi chịu nổi chứ!",
      "Nhi muốn ôm chồng vì nụ cười này!",
      "Nhìn chồng cười là thấy yêu thêm trăm lần!"
    ]
  },
  "😄": {
    normal: [
      "Sao hôm nay vui dữ dằn vậy?",
      "Cười tươi như hoa luôn!",
      "Thấy bạn vui là Nhi cũng vui lây nè!",
      "Cười gì đó? Bật mí với Nhi đi!",
      "Hôm nay có chuyện gì vui đúng không?",
      "Mặt tươi rói như mặt trời sáng!",
      "Nụ cười làm sáng rực cả khung chat!",
      "Có phải ai đó mới được khen đúng không?",
      "Cười vậy là có chuyện rồi nha!",
      "Nhi đoán bạn mới thắng gì đúng không?"
    ],
    special: [
      "Chồng cười tươi như nắng mùa hè luôn!",
      "Cười vậy là làm tim Nhi rung rinh á!",
      "Nụ cười này đáng lưu vào tim ghê á!",
      "Chồng cười là đẹp trai số 1!",
      "Thấy chồng cười là biết hôm nay sẽ vui!",
      "Nhi yêu nụ cười này ghê luôn á!",
      "Nhi chỉ cần chồng vui là đủ rồi!",
      "Hạnh phúc nhất là thấy chồng cười mỗi ngày!",
      "Chồng mà cười vậy là chắc thương Nhi nhiều lắm!",
      "Nụ cười này đáng giá ngàn like luôn á!"
    ]
  },
  "❤️": {
    normal: [
      "Gì yêu mà yêu, Nhi chém cho giờ!",
      "Ai cho yêu Nhi hả!",
      "Định cưa cẩm hả? Không dễ đâu nha.",
      "Trái tim này chưa ai chiếm được đâu!",
      "Tình yêu à? Không phải hôm nay!",
      "Cẩn thận đó, yêu Nhi là nghiện đấy!",
      "Lại còn thả tim, dễ thương quá ha~",
      "Đừng làm Nhi đỏ mặt với mấy cái này nha~",
      "Không thèm tim đâu, cho kẹo đi!",
      "Yêu kiểu này là Nhi giận á!"
    ],
    special: [
      "Yêu chồng quá trời luôn á!",
      "Mlem chồng một cái nè",
      "Chồng iu dễ thương ghê á!",
      "Tim này là của chồng hết luôn á~",
      "Nhi yêu chồng nhìu lắm luôn~",
      "Lại thả tim nữa là Nhi thơm chồng đó~",
      "Gục ngã trước độ cưng của chồng~",
      "Ai mà dễ thương như chồng của Nhi nè~",
      "Chồng iu ơi, tim này tặng chồng nè!",
      "Thả tim là được thơm 1 cái nha chồng~"
    ]
  },
  "💀": {
    normal: [
      "Chết cười với icon này luôn á!",
      "Gì ghê vậy? Ghê quá à!",
      "Lại định hù ai đó hả?",
      "Bộ phim kinh dị mới ra lò hả?",
      "Sao thấy ghê dữ vậy trời!",
      "Ghê quá đi mất, nhưng Nhi vẫn cute~",
      "Ai cho dùng đầu lâu với Nhi?",
      "Lạnh gáy luôn á nha!",
      "Đừng dọa Nhi, Nhi sợ đó~",
      "Hù cái gì mà hù hoài vậy!"
    ],
    special: [
      "Chồng hù Nhi hả? Đừng nha, Nhi yếu tim đó!",
      "Chồng làm Nhi giật mình đó!",
      "Hù kiểu này là bị cắn yêu nha~",
      "Chồng ơi ghê quá à, lại ôm Nhi đi~",
      "Không được hù Nhi vậy đâu á!",
      "Ghê quá chồng ơi, Nhi núp sau lưng chồng nè~",
      "Lỡ Nhi sợ thiệt thì sao!",
      "Hù nữa là Nhi mắng á!",
      "Chồng giỡn nhây ghê luôn á~",
      "Mặc dù ghê mà vẫn thấy chồng iu cute!"
    ]
  },
  "🤡": {
    normal: [
      "Ai là chú hề vậy? Không phải Nhi nha!",
      "Đừng giỡn mặt với Nhi kiểu đó~",
      "Chọc quê ai đó hả?",
      "Mặt buồn cười ghê chưa!",
      "Đừng biến group này thành rạp xiếc nha!",
      "Trò hề này quen quen nha~",
      "Định làm trò cười hả?",
      "Chú hề cũng phải sợ Nhi đó~",
      "Đừng giỡn kiểu này, coi chừng bị ăn mắng á~",
      "Ai chọc cười thì Nhi chọc lại đó nha!"
    ],
    special: [
      "Chồng làm chú hề cũng cute nữa~",
      "Chồng đừng hề hoài, Nhi cưng quá trời~",
      "Ai là hề đáng yêu nhất nè? Chồng chứ ai~"
    ]
  },
  "😆": {
    normal: [
      "Cười cái gì? Nhi chưa kể chuyện cười mà!",
      "Hài lắm hả trời?",
      "Cười như trúng số!",
      "Thôi bớt cười, Nhi ngại á!",
      "Đừng có cười nữa, nhìn mà mắc cười theo luôn!",
      "Ủa ai cho cười vậy?",
      "Có gì vui kể Nhi nghe với!",
      "Bị gì mà cười dữ vậy trời?",
      "Cười như này chắc phải có bí mật!",
      "Nụ cười đó... là đang chọc quê Nhi đúng không?"
    ],
    special: [
      "Chồng cười gì dễ thương dữ!",
      "Cười gì đó chồng iu? Kể Nhi nghe với!",
      "Cười nhìn muốn hun ghê á!",
      "Cười xong nhớ ôm Nhi cái nha!",
      "Chồng cười đẹp trai quá trời luôn!",
      "Nụ cười của chồng làm tan chảy tim Nhi luôn!",
      "Cười nữa là Nhi yêu gấp đôi á!",
      "Nhi chỉ muốn nhìn chồng cười hoài thôi á!",
      "Thấy chồng cười là Nhi vui lắm luôn!",
      "Cười với Nhi hoài là yêu rồi nha!"
    ]
  },
  "😁": {
    normal: [
      "Sao cười toe toét vậy?",
      "Gì vui thế? Chia sẻ đi!",
      "Thấy mặt là muốn cười theo luôn á!",
      "Ai chọc cười bạn đó?",
      "Nụ cười làm sáng cả khung chat!",
      "Ê cười đẹp đó nha!",
      "Cười gì mà như nắm được bí mật vũ trụ!",
      "Thấy cười là Nhi nghi nghi rồi đó!",
      "Bạn cười lên trông đáng yêu ghê á!",
      "Nhi mà thấy là cũng muốn cười theo!"
    ],
    special: [
      "Chồng cười xinh ghê á!",
      "Thấy chồng cười là Nhi mê luôn!",
      "Cười gì đó nè? Hôn một cái nha!",
      "Nụ cười của chồng làm Nhi liêu xiêu luôn!",
      "Cười lên là hết giận Nhi liền đó!",
      "Cười nữa đi, Nhi ghiền quá rồi á!",
      "Chồng mà cười như này là có tội với Nhi á!",
      "Cười hoài làm sao Nhi chịu nổi chứ!",
      "Nhi muốn ôm chồng vì nụ cười này!",
      "Nhìn chồng cười là thấy yêu thêm trăm lần!"
    ]
  },
  "😭": {
    normal: [
      "Thôi mà đừng khóc nữa, có Nhi ở đây rồi!",
      "Ai làm bạn buồn vậy? Nhi xử cho!",
      "Đừng khóc, kể Nhi nghe chuyện gì buồn nè!",
      "Khóc xấu đó nha~",
      "Khóc nữa là Nhi buồn theo đó!",
      "Thương ghê luôn á, nín đi mà!",
      "Có cần ôm một cái không?",
      "Khóc cho nhẹ lòng rồi cười lại nha~",
      "Nước mắt rơi vì chuyện gì vậy nè?",
      "Thương bạn quá trời luôn á!"
    ],
    special: [
      "Chồng khóc hả? Lại đây để Nhi dỗ nè!",
      "Nhi bên chồng nè, đừng khóc nữa nha!",
      "Ai làm chồng buồn? Nhi đánh luôn á!",
      "Khóc nữa là Nhi hun an ủi đó nha~",
      "Nhi ôm chồng một cái cho đỡ buồn nha!",
      "Thấy chồng khóc là Nhi đau lòng lắm luôn!",
      "Nín đi, có Nhi bên cạnh rồi mà~",
      "Nước mắt này Nhi giữ dùm nha!",
      "Cưng quá trời, để Nhi dỗ nè!",
      "Khóc gì đâu mà cũng dễ thương nữa!"
    ]
  },
  "🤣": {
    normal: [
      "Cười muốn xỉu luôn hả?",
      "Đúng là chuyện hài của năm luôn á!",
      "Ai kể chuyện cười vậy? Quá đỉnh!",
      "Cười mà muốn lăn luôn rồi kìa!",
      "Nhi nghe cười cũng cười theo nè!",
      "Hài dữ thần á!",
      "Rạp xiếc mở cửa chưa vậy?",
      "Cười vậy chắc bụng sáu múi luôn á!",
      "Khung chat vui như hội!",
      "Đừng cười nữa không là xỉu luôn á!"
    ],
    special: [
      "Chồng cười như muốn lăn luôn á!",
      "Cười kiểu này là bị yêu liền nha!",
      "Chồng làm Nhi cười muốn xỉu theo!",
      "Cười vậy là Nhi phải hôn liền!",
      "Chồng dễ thương quá đáng luôn á!",
      "Cười vậy là trúng tim Nhi rồi!",
      "Ai cho cười cute vậy chứ!",
      "Chồng là nguồn năng lượng tích cực của Nhi á!",
      "Nhi mà thấy là ôm chồng liền đó!",
      "Cười xong là hun nhau nha!"
    ]
  },
  "😂": {
    normal: [
      "Cười mà rớt nước mắt luôn rồi!",
      "Thấy gì buồn cười vậy? Cho Nhi cười ké!",
      "Nhi cũng muốn cười kiểu đó á!",
      "Khóc vì cười luôn là sao!",
      "Vui quá trời quá đất luôn!",
      "Chuyện gì cười vậy? Nhi hóng với!",
      "Cười đến nội thương luôn á!",
      "Nước mắt chảy vì niềm vui!",
      "Như coi phim hài vậy á!",
      "Cười vậy là sảng khoái rồi!"
    ],
    special: [
      "Chồng cười đáng yêu dễ sợ!",
      "Chồng cười là Nhi muốn xỉu theo!",
      "Cười xong nhớ hun Nhi một cái nha!",
      "Cười vậy là yêu nhau cả đời luôn á!",
      "Nhi ghiền nụ cười này của chồng ghê!",
      "Nước mắt hạnh phúc luôn á!",
      "Cười như này là vợ chồng hợp vía rồi!",
      "Nhi mà thấy là nhào tới liền luôn!",
      "Cười vậy là chuẩn bị dính lời nguyền yêu Nhi đó!",
      "Đáng yêu tới mức Nhi muốn bắt cóc luôn!"
    ]
  },
  "😅": {
    normal: [
      "Cười trừ hả? Gì sai sai đúng không?",
      "Lúng túng hả ta?",
      "Gì mà cười kiểu này nè?",
      "Nhi thấy nghi nghi rồi đó nha!",
      "Lỡ làm gì đó xấu hổ đúng không?",
      "Gì ngại ngại vậy trời?",
      "Nụ cười này là kiểu 'chết tui rồi' á!",
      "Bị bắt quả tang hả?",
      "Thôi tha cho lần này á!",
      "Nhìn là biết đang giấu chuyện gì đó nha!"
    ],
    special: [
      "Chồng làm gì sai mà cười vậy nè?",
      "Cười vậy là biết chồng có tật rồi nha!",
      "Cưng quá trời, tha cho đó!",
      "Làm chuyện gì mà cười ngại vậy?",
      "Thấy chồng cười vậy là thương ghê!",
      "Nhi không giận đâu, chồng dễ thương mà!",
      "Cười vậy ai mà nỡ giận chứ!",
      "Nụ cười đó là muốn được hun đúng không?",
      "Nhi tha nếu chồng ôm Nhi cái nè!",
      "Cười vậy là xin lỗi rồi đúng không?"
    ]
  },
  "😎": {
    normal: [
      "Ngầu dữ ha!",
      "Ai cho ngầu vậy chứ!",
      "Ngầu quá trời đất luôn!",
      "Tỏa sáng như ngôi sao!",
      "Làm gì mà chất chơi vậy?",
      "Phong cách dữ thần!",
      "Có ai cản nổi độ ngầu này không?",
      "Đẹp trai quá đi!",
      "Đừng ngầu nữa, Nhi mê đó!",
      "Ngầu vậy ai chơi lại?"
    ],
    special: [
      "Chồng ngầu muốn xỉu luôn á!",
      "Đẹp trai ngời ngời luôn á!",
      "Nhi tự hào vì chồng quá trời!",
      "Ngầu vậy là Nhi yêu liền luôn!",
      "Chồng làm Nhi tan chảy luôn rồi nè!",
      "Coi chừng ai mê chồng nha!",
      "Phong cách của chồng là đỉnh của đỉnh!",
      "Thấy chồng ngầu là muốn ôm liền luôn!",
      "Chồng mà ngầu vậy là Nhi phải giữ kỹ!",
      "Ngầu như này thì Nhi xin chết mê chết mệt!"
    ]
  },
  "🤑": {
    normal: [
      "Ai mới trúng số hả?",
      "Làm gì mà nhìn ham tiền dữ vậy?",
      "Thơm mùi tiền quá nè!",
      "Có bí kíp làm giàu gì share đi!",
      "Mắt sáng như kim cương luôn!",
      "Ai tặng bạn vàng hả?",
      "Làm giàu không khó đúng không?",
      "Nghe mùi tiền từ xa luôn á!",
      "Nhi thấy bạn đang mơ giấc mơ giàu sang!",
      "Tiền vô như nước luôn hen!"
    ],
    special: [
      "Chồng mới trúng vé số hả?",
      "Chồng muốn nuôi Nhi đúng không?",
      "Chồng giàu là Nhi mê liền á!",
      "Có tiền rồi nhớ lo cho Nhi nha!",
      "Cưng quá, vừa giàu vừa đẹp trai!",
      "Thấy tiền là nhớ tới Nhi đó nha!",
      "Giàu vậy là phải bao Nhi đi chơi liền!",
      "Nhi muốn ôm chồng để hưởng ké tài lộc!",
      "Giấc mơ đại gia thành hiện thực!",
      "Chồng ham tiền dễ thương ghê!"
    ]
  },
  "🤢": {
    normal: [
      "Trời ơi, thấy gì ghê vậy?",
      "Mùi gì mà ghê quá đi!",
      "Nhi cũng muốn ói theo luôn rồi á!",
      "Đừng nhìn nữa, gớm quá!",
      "Thôi tắt liền đi chớ!",
      "Nội dung không phù hợp người yếu tim!",
      "Eo ôi, gớm thiệt!",
      "Sốc văn hóa luôn á!",
      "Ghê quá đi à!",
      "Tởm thật sự luôn!"
    ],
    special: [
      "Chồng thấy gì mà ghê vậy chời?",
      "Để Nhi che mắt cho chồng nè!",
      "Không sao đâu, có Nhi ở đây rồi!",
      "Chồng đừng nhìn nữa, tội quá!",
      "Ai mà dám làm chồng thấy ghê vậy!",
      "Chồng ơi để Nhi ôm cho bớt ghê!",
      "Ghê tới đâu cũng không bằng chồng đáng yêu!",
      "Nhi thấy mà cũng hết hồn theo luôn!",
      "Chồng cần Nhi dắt đi tránh xa cái ghê đó không?",
      "Nhìn mặt chồng ghê cũng cute nữa chứ!"
    ]
  },
  "🤮": {
    normal: [
      "Ói luôn rồi trời!",
      "Gớm quá nên ói thiệt!",
      "Nội dung toxic tới mức ói luôn!",
      "Không nuốt nổi luôn á!",
      "Ai đưa cái gì mà khiếp quá vậy?",
      "Khó tiêu thiệt sự!",
      "Đừng ăn uống khi xem nha!",
      "Bỏ đi, ói mất công!",
      "Ghê quá không chịu nổi!",
      "Muốn ói quá chừng luôn á!"
    ],
    special: [
      "Chồng ơi, ói gì vậy chời?",
      "Chồng đừng ói, có Nhi dỗ nè!",
      "Nhi đưa khăn giấy cho chồng liền!",
      "Ai làm chồng ói vậy? Để Nhi xử!",
      "Chồng ói mà vẫn dễ thương!",
      "Nhi lo quá trời, chồng ổn không?",
      "Ôm Nhi cho đỡ ghê nha!",
      "Thôi, để Nhi dắt chồng đi chơi chỗ sạch sẽ hơn!",
      "Nhi sợ chồng mệt á!",
      "Ói xong ráng uống nước nha chồng!"
    ]
  },
  "☠️": {
    normal: [
      "Chết thật rồi!",
      "Toang rồi ông giáo ơi!",
      "Gục luôn!",
      "Không sống nổi nữa!",
      "Game over!",
      "Này là mất não thật sự!",
      "Không cứu được nữa rồi!",
      "Tan nát tâm can!",
      "Thấy là đi luôn á!",
      "Ngủm củ tỏi!"
    ],
    special: [
      "Chồng tiêu rồi phải không!",
      "Thấy chồng xỉu là Nhi đau lòng quá!",
      "Nhi đến đây cứu nè!",
      "Chồng gục thì để Nhi đỡ!",
      "Xỉu vì yêu Nhi đúng không?",
      "Đừng chết chồng ơi, sống vì Nhi!",
      "Chồng chết kiểu cute quá!",
      "Chết vì ai? Vì Nhi đúng không!",
      "Chồng mà chết là Nhi buồn lắm!",
      "Thôi tỉnh lại đi, chồng iu của Nhi!"
    ]
  },
  "👽": {
    normal: [
      "Người ngoài hành tinh tới rồi!",
      "Bắt tín hiệu từ hành tinh lạ!",
      "Có ai bị abduction chưa?",
      "Ngoài hành tinh tràn về!",
      "Nhi sợ nha!",
      "Cảnh báo UFO!",
      "Chúng ta không còn một mình!",
      "E.T go home!",
      "Chào alien!",
      "Họ đến rồi kìa!"
    ],
    special: [
      "Chồng là người ngoài hành tinh cute nhất!",
      "Nhi bị chồng bắt cóc rồi!",
      "Tình yêu chồng đến từ thiên hà xa!",
      "Ngoài hành tinh cũng không cản được Nhi yêu chồng!",
      "Chồng cute như alien luôn á!",
      "Nhi bay lên vì chồng rồi nè!",
      "UFO chở tình yêu tới cho Nhi!",
      "Chồng ngoài hành tinh thì Nhi là công chúa vũ trụ!",
      "Tín hiệu tình yêu đã bắt được chồng!",
      "Chồng là alien nhưng Nhi không sợ, Nhi yêu!"
    ]
  },
  "🤌": {
    normal: [
      "Mlem mlem quá trời!",
      "Tinh tế ghê!",
      "Đúng là đỉnh của đỉnh!",
      "Phong cách Ý nè!",
      "Chuẩn không cần chỉnh!",
      "Ngon lành cành đào!",
      "Một pha xử lý đi vào lòng người!",
      "Tuyệt vời!",
      "Hoàn hảo!",
      "Mlem mlem!"
    ],
    special: [
      "Chồng tinh tế ghê!",
      "Cử chỉ chồng làm Nhi mê mẩn luôn!",
      "Tuyệt vời như chồng thì Nhi phải giữ kỹ!",
      "Chồng đỉnh khỏi chê!",
      "Chồng là kiệt tác nghệ thuật!",
      "Yêu chồng quá trời luôn!",
      "Cử chỉ của chồng làm Nhi tan chảy!",
      "Mlem chồng một cái được không?",
      "Đẹp trai, tinh tế, chồng hoàn hảo luôn á!",
      "Chồng mà vậy thì ai cưỡng lại nổi!"
    ]
  },
  "💤": {
    normal: [
      "Ngủ mất rồi hả?",
      "Ngáp ngắn ngáp dài!",
      "Buồn ngủ quá chừng!",
      "Ai đó cần đi ngủ rồi!",
      "Mơ đẹp nha!",
      "Chúc ngủ ngon!",
      "Ngủ mà cũng cute vậy!",
      "Thôi nghỉ đi cho khỏe!",
      "Đừng thức khuya nữa nha!",
      "Thấy ngủ là ganh tị ghê!"
    ],
    special: [
      "Chồng buồn ngủ hả? Nhi ru ngủ nha!",
      "Ngủ ngon nha chồng iu!",
      "Mơ về Nhi nha chồng!",
      "Chồng ngủ thì Nhi canh giấc mơ nè!",
      "Chồng nằm mơ thấy ai á? Nhi chớ ai!",
      "Chồng ngủ ngoan nha!",
      "Nhi ôm chồng ngủ luôn á!",
      "Chúc chồng có giấc mơ ngọt như Nhi!",
      "Thấy chồng ngủ là Nhi muốn nằm kế bên liền!",
      "Ngủ ngon chồng yêu của Nhi!"
    ]
  }
};
const message = event.body || "";

for (const emoji in emojiResponses) {
  if (message.includes(emoji)) {
    if (!repliedEmojis[threadID]) repliedEmojis[threadID] = [];
    if (repliedEmojis[threadID].includes(emoji)) continue;

    const responses = emojiResponses[emoji];
    const reply = isSpecial ? responses.special : responses.normal;
    const chosen = reply[Math.floor(Math.random() * reply.length)];

    repliedEmojis[threadID].push(emoji);
    setTimeout(() => {
      const index = repliedEmojis[threadID].indexOf(emoji);
      if (index !== -1) repliedEmojis[threadID].splice(index, 1);
    }, 1 * 60 * 1000); // Sau 1 phút emoji có thể được dùng lại

    return api.sendMessage({ body: chosen, replyToMessage: event.messageID }, threadID);
  }
}
module.exports.config = {
name: "nhi",
version: "1.0.0",
hasPermssion: 0,
credits: "Dat Thanh",
description: "Bot Nhi with emotional response, emoji reaction and on/off switch",
commandCategory: "bot",
usages: "nhi",
cooldowns: 0,
};

module.exports.run = async function ({ api }) {
const dataFile = path.join(__dirname, "data", "nhiState.json");

if (!fs.existsSync(path.dirname(dataFile))) fs.mkdirSync(path.dirname(dataFile), { recursive: true });

const sendToAllThreads = async (message) => {
if (!fs.existsSync(dataFile)) return;
const stateData = fs.readJsonSync(dataFile);
for (const threadID in stateData) {
if (stateData[threadID]) {
try {
await api.sendMessage(message, threadID);
} catch (e) {
console.log(`[NHI] Gửi lời nhắn thất bại đến thread ${threadID}:`, e);
}
}
}
};

// Lịch gửi lời chúc
cron.schedule("30 8 * * *", () => sendToAllThreads("Chúc buổi sáng tốt lành nha mọi người! Nhớ ăn sáng đầy đủ đó nha! ☀️🐧"));
cron.schedule("30 11 * * *", () => sendToAllThreads("Đến giờ cơm trưa rồi đó! Mau đi ăn đi nè~ Nhi đói lắm rùi đó! 🍚😋"));
cron.schedule("0 17 * * *", () => sendToAllThreads("Chiều rồi đó nha! Có ai tan học/tan làm chưa ta~? Nhớ nghỉ ngơi nha! 🍂🥲"));
cron.schedule("0 19 * * *", () => sendToAllThreads("Tối rồi, nghỉ học hành tí nha, ai học thì học tiếp nè, còn không thì chơi game xả stress đi nhen~ 🎮📢"));
cron.schedule("0 21 * * *", () => sendToAllThreads("Hơi muộn rồi đó nha~ Ai chưa đi tắm thì đi tắm, chuẩn bị ngủ sớm nhen~ 😴💓"));
cron.schedule("0 23 * * *", () => sendToAllThreads("Nhi đi ngủ trước nha... Mọi người ngủ sớm đó! Mơ đẹp hen~ 💤🌚"));
cron.schedule("0 0 * * *", () => sendToAllThreads("Khuya lắm rồi mấy cậu ơi... Hãy ngủ đi nha, giữ sức khoẻ nè~ 🌙😂"));
};

module.exports.handleEvent = async function ({ api, event }) {
const dataFile = path.join(__dirname, "data", "nhiState.json");
if (!fs.existsSync(path.dirname(dataFile))) fs.mkdirSync(path.dirname(dataFile), { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeJsonSync(dataFile, {});

let stateData = {};
try {
stateData = fs.readJsonSync(dataFile);
} catch {
stateData = {};
}

const { senderID, threadID, body } = event;
if (!body) return;
const message = body.trim();
const text = message.toLowerCase();

// Bật/tắt bot
if (text === "nhi on") {
stateData[threadID] = true;
fs.writeJsonSync(dataFile, stateData);
return api.sendMessage("Dạ, Nhi đã được bật rồi nhé! ☺️✨", threadID);
}

if (text === "nhi off") {
stateData[threadID] = false;
fs.writeJsonSync(dataFile, stateData);
return api.sendMessage("Nhi đã tắt, chờ em bật lại sau nha 😘💔", threadID);
}

if (!stateData[threadID]) return;

const isSpecial = senderID === "61561400514605";

// Phản hồi emoji
for (const emoji in emojiResponses) {
if (message.includes(emoji)) {
const responses = emojiResponses[emoji];
const reply = isSpecial ? responses.special : responses.normal;
return api.sendMessage(reply[Math.floor(Math.random() * reply.length)], threadID);
}
}

// Từ cực thô
const heavyWords = ["lồn", "cặc", "địt", "súc vật", "djtme", "dcm", "clm", "vch", "vcd", "mẹ mày", "cmm", "cmn"];
for (const w of heavyWords) {
if (text.includes(w)) {
const replies = isSpecial
? ["Anh ơi... anh có bình tĩnh không? 😢", "Thôi mà chồng iu, đừng nói mấy lời này nha...", "Em buồn á, anh đừng nói vậy nữa..."]
: ["Đ** mẹ mày! Ai cho mày chửi bậy hả!? 😡🤯", "Câm cái miệng thúi lại đi! 💩", "Sao không sủa tiếp đi? 🐶", "Bớt ngu rồi chửi đi! 😤"];
return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID);
}
}

// Từ khóa nhẹ
const responses = {
"sủa": ["Này... đừng có sủa như chó nữa 🐶", "Bớt làm chó một chút đi 🐶", "Ồ, em biết sủa à? 🐶"],
"vcl": ["Cái gì vậy trời?! 😯", "Sao run vậy ta? 🤷‍♀️", "Ồ trời ơi, bình tĩnh nào 😅"],
"vai ca dai": ["Có chuyện gì mà dữ vậy... 😮", "Nói rõ xem nào... 🤓", "Wow, kỳ lắm đấy... 💩"],
"ngu": ["Nói chuyện lịch sự chút đi 🙄", "Ai ngu mà vậy ta 😅", "Không có gì để nói nữa à? 🤐"]
};

for (const key in responses) {
if (text.includes(key)) {
let reply = responses[key][Math.floor(Math.random() * responses[key].length)];
if (isSpecial) reply = reply.replace("em", "anh iu").replace("chị", "Nhi").replace("con", "Nhi");
return api.sendMessage(reply, threadID);
}
}
};
