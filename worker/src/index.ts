import { GoogleGenerativeAI } from '@google/generative-ai';
import { TencentCloud } from 'tencentcloud-sdk-nodejs';

interface Env {
  TENCENT_SECRET_ID: string;
  TENCENT_SECRET_KEY: string;
  GEMINI_API_KEY: string;
  API_KEY: string;
  R2_BUCKET: string;
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
  R2_CUSTOM_DOMAIN: string;
}

interface UploadResponse {
  success: boolean;
  text?: string;
  message?: string;
}

interface CorrectResponse {
  success: boolean;
  correctedEssay?: string;
  message?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 验证API密钥
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== env.API_KEY) {
      return new Response(JSON.stringify({ success: false, message: '无效的API密钥' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);

    // 处理上传图片请求
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      return handleUpload(request, env);
    }

    // 处理批改作文请求
    if (url.pathname === '/api/correct' && request.method === 'POST') {
      return handleCorrect(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// 处理图片上传和OCR识别
async function handleUpload(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (images.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: '请上传至少一张图片'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 上传图片到R2存储
    const imageUrls = await Promise.all(images.map(async (image) => {
      const key = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      await env.R2_BUCKET.put(key, image);
      return `https://${env.R2_CUSTOM_DOMAIN}/${key}`;
    }));

    // 使用腾讯云OCR识别文字
    const OcrClient = TencentCloud.ocr.v20181119.Client;
    const client = new OcrClient({
      credential: {
        secretId: env.TENCENT_SECRET_ID,
        secretKey: env.TENCENT_SECRET_KEY,
      },
      region: 'ap-guangzhou',
    });

    const ocrResults = await Promise.all(imageUrls.map(async (url) => {
      const result = await client.GeneralBasicOCR({ ImageUrl: url });
      return result.TextDetections?.map(item => item.DetectedText).join('\n') || '';
    }));

    const combinedText = ocrResults.join('\n\n');

    return new Response(JSON.stringify({
      success: true,
      text: combinedText
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理作文批改
async function handleCorrect(request: Request, env: Env): Promise<Response> {
  try {
    const { essay, scoringStandard } = await request.json();

    if (!essay) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供作文内容'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 初始化Gemini AI
    const ai = new Ai(env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });

    // 构建提示词
    let prompt = `请帮我批改以下作文，给出详细的修改建议和评分：\n\n${essay}`;
    
    if (essayRequirement) {
      prompt += `\n\n作文要求：\n${essayRequirement}`;
    }
    
    if (scoringStandard) {
      prompt += `\n\n评分标准：\n${scoringStandard}`;
    }

    // 使用Gemini生成批改结果
    const result = await model.generateContent(prompt);
    const correctedEssay = result.response.text();

    return new Response(JSON.stringify({
      success: true,
      correctedEssay
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}