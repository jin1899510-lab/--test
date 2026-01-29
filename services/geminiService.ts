
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_STRATEGY } from "../constants";
import { ContentType, PostFormat, DailyContext, KnowledgeItem, GeneratedPost, BrandMood } from "../types";

export const generateInstaContent = async (
  knowledge: KnowledgeItem[],
  context: DailyContext,
  strategy: ContentType,
  format: PostFormat,
  mood: BrandMood
): Promise<GeneratedPost> => {
  // 매 요청 시 새로운 인스턴스를 생성하여 플랫폼에서 주입한 최신 API 키를 즉시 반영
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const knowledgeContext = knowledge.map(k => `[참조 데이터: ${k.title}]\n${k.content}`).join('\n\n');
  
  const moodStyleGuide = {
    [BrandMood.PROFESSIONAL]: "전문적이고 신뢰감 있는 문체, 논리적 구조, 격식체.",
    [BrandMood.FRIENDLY]: "친근하고 다정한 문체, 공감 위주, 부드러운 구어체.",
    [BrandMood.EMOTIONAL]: "서사적이고 감성적인 문체, 비유와 은유 활용.",
    [BrandMood.ENERGETIC]: "열정적이고 도전적인 문체, 짧고 강렬한 문장."
  };

  const prompt = `
    당신은 브랜드 대표입니다. 1인칭 시점으로 고객에게 이야기하듯 작성하세요.
    브랜드 무드: ${mood}
    스타일 가이드: ${moodStyleGuide[mood]}
    전략 유형: ${strategy} (7-2-1 전략 반영)

    [참조 데이터]
    ${knowledgeContext}

    [오늘의 맥락]
    날씨: ${context.weather}, 기분: ${context.mood}, 이벤트: ${context.event}, 이야기: ${context.story}

    [필수 구조]
    1. Hook: 시선을 끄는 강력한 첫 문장
    2. Empathy: 고객의 고민에 대한 공감
    3. Value: 참조 데이터에서 추출한 핵심 정보
    4. Story: 오늘의 맥락을 섞은 인간적인 연결
    5. CTA: 팔로우나 저장 유도

    응답은 반드시 한국어로, 지정된 JSON 형식을 지켜주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        // Pro 모델의 사고 능력을 극대화하기 위해 thinkingBudget 설정
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            slides: { type: Type.ARRAY, items: { type: Type.STRING } },
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategyType: { type: Type.STRING },
            brandMood: { type: Type.STRING }
          },
          required: ["title", "slides", "caption", "hashtags", "strategyType", "brandMood"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("결과물이 생성되지 않았습니다.");
    return JSON.parse(text) as GeneratedPost;
  } catch (error: any) {
    console.error("Content Gen Error:", error);
    // API 키 관련 오류(401, 404, invalid 등) 발생 시 사용자에게 키 재입력 유도
    if (error?.message?.includes("401") || error?.message?.includes("API key") || error?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_ERROR");
    }
    throw new Error("콘텐츠 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'API 연결 확인용 짧은 인사말을 생성해줘.',
      config: { maxOutputTokens: 20 }
    });
    return !!result.text;
  } catch {
    return false;
  }
};
