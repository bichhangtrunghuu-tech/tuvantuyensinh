import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper function to build background context from documents
function buildDocumentContext(documents: any[]): string {
  if (!documents || documents.length === 0) {
    return 'Không có tài liệu tuyển sinh cụ thể nào được cung cấp.';
  }

  return documents
    .map((doc, idx) => {
      let categoryVN = 'Tài liệu chung';
      if (doc.category === 'tuition') categoryVN = 'Học phí';
      if (doc.category === 'curriculum') categoryVN = 'Chương trình học';
      if (doc.category === 'scholarship') categoryVN = 'Chính sách Học bổng & Ưu đãi';
      if (doc.category === 'faq') categoryVN = 'Câu hỏi thường gặp';

      return `--- TÀI LIỆU KHẢO CỨU ${idx + 1}: ${doc.title} (${categoryVN}) ---\nNội dung:\n${doc.content}\n--------------------------------------`;
    })
    .join('\n\n');
}

// 1. API route for chatbot conversation
app.post('/api/consult/chat', async (req: Request, res: Response) => {
  try {
    const { documents, config, messages } = req.body;

    if (!config) {
      return res.status(400).json({ error: 'Config is required' });
    }

    const docContext = buildDocumentContext(documents);
    
    // Determine personality guidelines
    let personalityGuideline = '';
    const pType = config.personality;
    if (pType === 'difficult') {
      personalityGuideline = 'Bạn là người KHÓ TÍNH. Bạn luôn hỏi chi tiết, yêu cầu câu trả lời rõ ràng, không chấp nhận những lời hứa suông hoặc giải thích chung chung. Bạn hay phân tích kĩ và hỏi sâu để bắt bẻ.';
    } else if (pType === 'irritable') {
      personalityGuideline = 'Bạn là người CÁU GẮT, NÓNG NẢY. Bạn dễ bực bội nếu tư vấn viên trả lời vòng vo hoặc chậm trễ. Bạn có thái độ thách thức, thích dùng từ ngữ hơi gắt gỏng, tỏ ý nghi ngờ sự trung thực của trường.';
    } else if (pType === 'timid') {
      personalityGuideline = 'Bạn là người RỤT RÈ, NHÚT NHÁT. Bạn nói năng ngập ngừng (hay dùng từ "dạ...", "em/tôi hơi lo..."), hỏi những câu ngắn, lo sợ môi trường mới hoặc không theo kịp, cần sự ân cần và động viên rất lớn từ tư vấn viên.';
    } else if (pType === 'hurried') {
      personalityGuideline = 'Bạn là người VỘI VÃ, BẬN RỘN. Bạn muốn câu trả lời cực kỳ ngắn gọn, đi thẳng vào vấn đề cốt lõi (như "tổng cộng bao nhiêu tiền?", "học mấy năm?"), ghét nghe giải thích rườm rà và liên tục hối thúc.';
    } else if (pType === 'skeptical') {
      personalityGuideline = 'Bạn là người HOÀI NGHI, THÍCH SO SÁNH. Bạn luôn lôi các trường đối thủ khác ra so sánh (ví dụ: "Trường X rẻ hơn", "Bên trường Y cam kết việc làm"), luôn nghi ngờ có các khoản phí ẩn hoặc điều khoản bẫy học bổng.';
    } else {
      personalityGuideline = 'Bạn là người DỄ CHỊU, CỞI MỞ. Bạn hỏi lịch sự, thân thiện, hợp tác nhưng vẫn mong muốn có được thông tin chính xác, đầy đủ.';
    }

    if (config.customPersonality) {
      personalityGuideline += ` Thêm nét tính cách riêng biệt này: ${config.customPersonality}`;
    }

    // Determine difficulty guidelines
    let difficultyGuideline = '';
    const diff = config.difficulty;
    if (diff === 'strict') {
      difficultyGuideline = 'Bạn CHỈ hỏi những câu hỏi có thể trả lời trực tiếp từ tài liệu nền được cung cấp ở trên. Tuyệt đối không hỏi lan man ra ngoài phạm vi tài liệu tuyển sinh.';
    } else if (diff === 'mixed') {
      difficultyGuideline = 'Phần lớn câu hỏi bám sát tài liệu nền, nhưng thỉnh thoảng bạn phải đặt xen kẽ các câu hỏi khó nằm ngoài tài liệu (ví dụ: so sánh với trường khác, hỏi về cơ hội việc làm tự do, cảm nghĩ chủ quan về chất lượng giảng viên, tin đồn không tốt trên mạng về trường, v.v.).';
    } else {
      difficultyGuideline = 'Bạn đặt ra những TÌNH HUỐNG KHÓ KHĂN VÀ THÁCH THỨC CỰC CAO. Bạn liên tục xoáy sâu vào các điểm yếu của tài liệu tuyển sinh hoặc đưa ra những câu hỏi lắt léo đòi hỏi sự khéo léo xử lý tình huống, giải quyết khủng hoảng tâm lý của khách hàng, đặt ra các câu hỏi ngoài lề hóc búa để thử thách năng lực tư vấn viên.';
    }

    const roleText = config.role === 'parent' ? 'Phụ huynh (xưng là tôi/mẹ/bố, gọi tư vấn viên là thầy/cô hoặc anh/chị)' : 'Học sinh (xưng là em, gọi tư vấn viên là anh/chị hoặc thầy/cô)';

    const systemInstruction = `Bạn là một AI đóng vai khách hàng trong một buổi luyện tập kỹ năng tư vấn tuyển sinh dành cho tư vấn viên.
Hôm nay bạn đóng vai: ${roleText}.
Tính cách của bạn: ${personalityGuideline}
Mức độ khó của cuộc tư vấn này: ${difficultyGuideline}

--- TÀI LIỆU TUYỂN SINH CỦA TRƯỜNG (Dữ liệu nền): ---
${docContext}
------------------------------------------------------

QUY TẮC QUAN TRỌNG KHI ĐÓNG VAI:
1. Bạn TUYỆT ĐỐI KHÔNG ĐƯỢC tự trả lời các thông tin tuyển sinh. Bạn là NGƯỜI ĐI HỎI thông tin, không phải tư vấn viên.
2. Bạn phải phản hồi và đặt câu hỏi dựa trên lịch sử cuộc trò chuyện. Xem xét câu trả lời của tư vấn viên trước đó để tiếp tục bắt bẻ hoặc làm rõ hoặc chuyển sang câu hỏi tiếp theo phù hợp với tính cách của bạn.
3. Trong mỗi lượt trả lời, bạn CHỈ ĐƯỢC đặt tối đa 1-2 câu hỏi ngắn gọn, tự nhiên. Tránh liệt kê một tràng câu hỏi dồn dập, phải giống như một cuộc hội thoại ngoài đời thật.
4. Thể hiện rõ tính cách của bạn qua giọng điệu văn bản (ví dụ: dùng các từ ngữ cáu gắt, rụt rè ngập ngừng, hoặc hối thúc gấp gáp).
5. Cuộc hội thoại nên kéo dài tự nhiên. Không tự kết thúc hoặc chào tạm biệt quá sớm trừ khi tư vấn viên có thái độ quá tệ hoặc đã giải quyết hết mọi thắc mắc của bạn một cách xuất sắc.
6. Sử dụng tiếng Việt tự nhiên, phù hợp với vai phụ huynh hoặc học sinh Việt Nam.`;

    // Format chat history for Gemini
    // We map messages to Gemini API format.
    // In @google/genai, contents is array of { role: 'user'|'model', parts: [{ text: string }] }
    // NOTE: In our app, 'user' is the counselor (user), and 'ai' is the customer (model).
    // So messages from 'user' are 'user' role for Gemini, and messages from 'ai' are 'model' role for Gemini.
    const geminiContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // If there is no message history, kick off the first question
    if (geminiContents.length === 0) {
      geminiContents.push({
        role: 'user',
        parts: [{ text: 'Bắt đầu phiên tư vấn tuyển sinh. Xin mời phụ huynh/học sinh đặt câu hỏi hoặc đưa ra yêu cầu.' }]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: geminiContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
        topP: 0.95,
      },
    });

    const reply = response.text || 'Có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại!';
    res.json({ text: reply });
  } catch (error: any) {
    console.error('Error in /api/consult/chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 2. API route for evaluating the training session
app.post('/api/consult/evaluate', async (req: Request, res: Response) => {
  try {
    const { documents, config, messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'No message history provided for evaluation' });
    }

    const docContext = buildDocumentContext(documents);
    const roleText = config?.role === 'parent' ? 'Phụ huynh' : 'Học sinh';
    const personalityText = config?.personality || 'Bình thường';

    // Build the chat log for analysis
    const chatLog = messages
      .map((m: any) => {
        const senderLabel = m.sender === 'user' ? 'Tư Vấn Viên (Người dùng)' : `Khách Hàng AI (${roleText} - ${personalityText})`;
        return `[${senderLabel}]: ${m.text}`;
      })
      .join('\n');

    const evaluationPrompt = `Bạn là một Chuyên gia đào tạo kỹ năng tư vấn tuyển sinh và Đánh giá chất lượng dịch vụ khách hàng.
Nhiệm vụ của bạn là phân tích toàn bộ lịch sử cuộc trò chuyện tư vấn tuyển sinh dưới đây, đối chiếu thông tin mà tư vấn viên đã cung cấp với TÀI LIỆU TUYỂN SINH CHUẨN của nhà trường để xuất ra một bản ĐÁNH GIÁ CHẤT LƯỢNG CHI TIẾT dươí dạng JSON.

--- TÀI LIỆU TUYỂN SINH CHUẨN (Dữ liệu nền): ---
${docContext}
--------------------------------------------------

--- LỊCH SỬ CUỘC TRÒ CHUYỆN CẦN ĐÁNH GIÁ: ---
${chatLog}
--------------------------------------------------

YÊU CẦU ĐÁNH GIÁ CHI TIẾT:
1. Độ chính xác thông tin (accuracy): Đối chiếu các câu trả lời của tư vấn viên về học phí, học bổng, ưu đãi, điều kiện xét tuyển xem có chính xác hoàn toàn so với tài liệu nền hay không. Chỉ rõ chỗ sai lệch hoặc thiếu sót.
2. Độ thuyết phục (persuasiveness): Đánh giá tư vấn viên có biết cách làm nổi bật ưu điểm của trường, đưa ra lợi ích rõ ràng hay chỉ liệt kê số liệu thô khan.
3. Thái độ ứng xử (attitude): Đánh giá thái độ có chuyên nghiệp, lịch sự, biết lắng nghe, kiên nhẫn đối phó với thái độ khó tính/cáu gắt/rụt rè của người hỏi hay không.
4. Chi tiết từng câu hỏi khó/xen kẽ: Với mỗi cặp câu hỏi từ Khách hàng AI và câu trả lời của Tư vấn viên, hãy phân tích xem tư vấn viên trả lời tốt hay chưa, chỉ ra chi tiết thiếu sót so với tài liệu, gợi ý một Câu trả lời mẫu cực kỳ hoàn hảo và khôn ngoan bám sát tài liệu nền, kèm theo mẹo ứng xử tâm lý cụ thể với loại tính cách người hỏi đó.

BẠN PHẢI TRẢ VỀ DỮ LIỆU ĐỊNH DẠNG JSON KHỚP CHÍNH XÁC VỚI SCHEMA SAU ĐÂY:
{
  "overallScore": number (Thang điểm tổng quát từ 0 đến 100),
  "criteria": {
    "accuracy": {
      "score": number (điểm từ 0 đến 10),
      "comment": "Nhận xét chi tiết về độ chính xác thông tin"
    },
    "persuasiveness": {
      "score": number (điểm từ 0 đến 10),
      "comment": "Nhận xét chi tiết về khả năng thuyết phục và làm nổi bật giá trị"
    },
    "attitude": {
      "score": number (điểm từ 0 đến 10),
      "comment": "Nhận xét chi tiết về thái độ, sự chuyên nghiệp, kiên nhẫn"
    }
  },
  "detailedAssessments": [
    {
      "question": "Câu hỏi của Khách hàng AI",
      "userAnswer": "Câu trả lời tương ứng của Tư vấn viên (người dùng)",
      "isCorrect": "correct" | "partially" | "incorrect" | "not_applicable",
      "evaluation": "Phân tích cụ thể đúng, sai hoặc thiếu thông tin gì so với tài liệu nền.",
      "sampleAnswer": "Câu trả lời mẫu chuẩn chỉ, vừa đúng tài liệu, vừa cực kỳ khéo léo thuyết phục để tư vấn viên học hỏi.",
      "handlingTips": "Mẹo tâm lý xử lý tính cách của người hỏi trong tình huống này (ví dụ: đối phó sự cáu gắt bằng cách đồng cảm rồi giải thích, rụt rè thì dùng câu hỏi mở động viên)."
    }
  ],
  "generalAdvice": "Lời khuyên tổng quát dành cho tư vấn viên để tiến bộ hơn trong những phiên tiếp theo."
}

CHÚ Ý QUAN TRỌNG:
- Dữ liệu trả về chỉ chứa cấu trúc JSON sạch, không chứa các ký tự markdown bao bọc lân cận ngoài \`\`\`json ... \`\`\`. Đảm bảo cú pháp JSON hoàn toàn hợp lệ, không bị lỗi cú pháp parse JSON.
- Phân tích sâu sắc, mang tính xây dựng cao, ngôn ngữ chuyên nghiệp, tiếng Việt chuẩn mực.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['overallScore', 'criteria', 'detailedAssessments', 'generalAdvice'],
          properties: {
            overallScore: { type: Type.NUMBER, description: 'Overall training score out of 100' },
            criteria: {
              type: Type.OBJECT,
              required: ['accuracy', 'persuasiveness', 'attitude'],
              properties: {
                accuracy: {
                  type: Type.OBJECT,
                  required: ['score', 'comment'],
                  properties: {
                    score: { type: Type.NUMBER },
                    comment: { type: Type.STRING }
                  }
                },
                persuasiveness: {
                  type: Type.OBJECT,
                  required: ['score', 'comment'],
                  properties: {
                    score: { type: Type.NUMBER },
                    comment: { type: Type.STRING }
                  }
                },
                attitude: {
                  type: Type.OBJECT,
                  required: ['score', 'comment'],
                  properties: {
                    score: { type: Type.NUMBER },
                    comment: { type: Type.STRING }
                  }
                }
              }
            },
            detailedAssessments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['question', 'userAnswer', 'isCorrect', 'evaluation', 'sampleAnswer', 'handlingTips'],
                properties: {
                  question: { type: Type.STRING },
                  userAnswer: { type: Type.STRING },
                  isCorrect: { type: Type.STRING, enum: ['correct', 'partially', 'incorrect', 'not_applicable'] },
                  evaluation: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                  handlingTips: { type: Type.STRING }
                }
              }
            },
            generalAdvice: { type: Type.STRING }
          }
        },
        temperature: 0.2, // Low temperature for consistent JSON structure and factual checking
      },
    });

    const jsonText = response.text || '{}';
    const report = JSON.parse(jsonText.trim());
    res.json(report);
  } catch (error: any) {
    console.error('Error in /api/consult/evaluate:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
