
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
  // 매 요청 시 새로운 인스턴스를 생성하여 최신 세션 키를 반영하여 레이스 컨디션 방지
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const knowledgeContext = knowledge.map(k => `[참조 데이터: ${k.title}]\n${k.content}`).join('\n\n');
  
  const moodStyleGuide = {
    [BrandMood.PROFESSIONAL]: "냉철하고 논리적인 전문가 문체. 수치와 데이터 중심, 격식체 사용.",
    [BrandMood.FRIENDLY]: "따뜻하고 상냥한 이웃집 대표님 문체. 질문형 문장과 이모지 활용.",
    [BrandMood.EMOTIONAL]: "비유와 은유를 활용한 서사적 표현. 시적인 리듬감과 감성 어휘 사용.",
    [BrandMood.ENERGETIC]: "짧고 강렬한 단문, 느낌표와 행동 촉구형 동사 사용."
  };

  const prompt = `
    당신은 브랜드 대표입니다. 1인칭 시점으로 작성하세요.
    브랜드 무드: ${mood} (${moodStyleGuide[mood]})
    전략: ${strategy}
    
    [구성]
    1. Hook (후킹 문구)
    2. Empathy (공감)
    3. Value (참조 데이터 기반 가치)
    4. Story (오늘의 맥락: ${context.story})
    5. CTA (행동 유도)

    [참조 데이터]
    ${knowledgeContext}

    반드시 지정된 JSON 형식으로만 응답하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
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
    if (!text) throw new Error("API 응답이 비어있습니다.");
    return JSON.parse(text) as GeneratedPost;
  } catch (error: any) {
    console.error("API 오류:", error);
    // 가이드라인에 따라 특정 오류 발생 시 키 선택 대화상자를 유도하기 위한 에러 메시지 반환
    if (error?.message?.includes("401") || error?.message?.includes("API key") || error?.message?.includes("Requested entity was not found.")) {
      throw new Error("API_KEY_ERROR");
    }
    throw new Error("콘텐츠 생성 중 오류가 발생했습니다.");
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    // API 호출 직전에 인스턴스를 생성하여 최신 키 사용 보장
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'hi',
      config: { 
        maxOutputTokens: 5,
        // maxOutputTokens 설정 시 thinkingBudget을 함께 설정하여 응답이 차단되지 않도록 함
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return !!result.text;
  } catch (error: any) {
    console.error("Test connection error:", error);
    return false;
  }
};
