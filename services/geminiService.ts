
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const knowledgeContext = knowledge.map(k => `[참조 데이터: ${k.title}]\n${k.content}`).join('\n\n');
  
  const moodStyleGuide = {
    [BrandMood.PROFESSIONAL]: `
      - 핵심 페르소나: 냉철하고 논리적인 업계 전문가.
      - 문체 특징: 군더더기 없는 간결한 문장, 수치와 데이터 중심의 서술, 격식체(~입니다, ~하십시오) 사용.
      - 특징: 전문 용어를 적재적소에 배치하여 신뢰감을 주고, 결론부터 말하는 두괄식 구조를 가짐.
      - 예시: "이 방법의 핵심은 세 가지입니다. 첫째, 데이터 분석. 둘째, 타겟팅 최적화..."`,
    [BrandMood.FRIENDLY]: `
      - 핵심 페르소나: 따뜻하고 상냥하며 소통을 즐기는 이웃집 대표님.
      - 문체 특징: 상냥한 구어체(~해요, ~인가요?), 독자의 의견을 묻는 질문형 문장, 풍부한 이모지와 부드러운 단어 선택.
      - 특징: 진입장벽을 낮추고 독자와 수평적인 관계에서 대화하듯 서술함.
      - 예시: "여러분, 오늘 하루는 어떠셨어요? 저는 오늘 이런 재미있는 생각을 해봤는데요~"`,
    [BrandMood.EMOTIONAL]: `
      - 핵심 페르소나: 브랜드의 철학과 깊은 영감을 전하는 아티스트/작가형 오너.
      - 문체 특징: 비유와 은유를 활용한 서사적 표현, 시적인 리듬감, '마음', '결', '온도', '잔상' 등의 감성적 어휘 사용.
      - 특징: 정보 전달보다는 가치와 무드를 전달하며, 독자의 내면과 공명하는 서정적인 흐름.
      - 예시: "마치 새벽 공기처럼 차분히 스며드는 브랜드의 온기를, 당신의 일상 한 켠에 남기고 싶습니다."`,
    [BrandMood.ENERGETIC]: `
      - 핵심 페르소나: 도전을 즐기고 성장을 독려하는 열정적인 동기부여 리더.
      - 문체 특징: 짧고 강렬한 단문, 느낌표(!)의 적극적 활용, 행동을 촉구하는 파워풀한 동사 사용.
      - 특징: 속도감 있는 전개로 독자의 실행력을 자극하고 성취감을 강조함.
      - 예시: "지금 당장 움직이세요! 결과는 고민하는 시간이 아니라 행동하는 순간에 결정됩니다. 함께 갑시다!"`
  };

  const prompt = `
    당신은 이 브랜드를 운영하는 **대표(1인칭 시점)**입니다. 
    당신의 브랜드 피드를 방문한 고객들에게 직접 이야기하세요.

    [선택된 브랜드 무드 가이드: ${mood}]
    ${moodStyleGuide[mood]}

    [절대 규칙: 좋은 내용 완벽 공식]
    모든 콘텐츠는 반드시 아래 5단계 구조를 순서대로 따라야 합니다:
    1. **Hook (후킹)**: 0.5초 만에 시선을 끄는 강력한 첫 문장 (스타일 가이드에 최적화된 헤드라인).
    2. **Empathy (공감)**: 대표인 내가 겪었던 고민이나 고객이 현재 느끼는 고충에 대해 깊게 공감하기.
    3. **Value (가치)**: 참조 데이터를 바탕으로 내가 제공하는 구체적인 해결책과 통찰.
    4. **Story (이야기)**: 오늘의 맥락(${context.story || '일상'})을 섞어 대표인 나의 인간미와 진정성 보여주기.
    5. **CTA (행동 유도)**: "저를 팔로우하고 함께 성장해요" 등 브랜드다운 명확한 마무리.

    [작성 세부 지침]
    - 반드시 1인칭("나", "저", "우리")을 사용하여 대표의 시점에서 작성할 것.
    - 선택된 무드에 맞춰 문장의 길이, 어조, 이모지 사용량을 엄격하게 차별화할 것.
    - 입력된 데이터(유튜브, PDF 등)가 제3자의 글이라도 "제가 이 내용을 보고 느낀 점은", "저희 브랜드의 철학은"과 같이 재해석할 것.

    [시스템 전략]
    ${SYSTEM_STRATEGY}
    
    [참조 데이터]
    ${knowledgeContext}

    [JSON 출력 구조]
    {
      "title": "대표의 진심이 담긴 피드 주제",
      "slides": ["카드뉴스 각 슬라이드 문구 (스타일 반영)"],
      "caption": "완벽 공식과 무드를 100% 반영한 1인칭 본문 캡션",
      "hashtags": ["#브랜드명", "#대표스타그램", "#카테고리"],
      "strategyType": "${strategy}",
      "brandMood": "${mood}"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
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

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr) as GeneratedPost;
  } catch (error: any) {
    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_ERROR");
    }
    throw new Error("콘텐츠 생성 실패");
  }
};

export const testConnection = async (): Promise<boolean> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'ping',
      config: { maxOutputTokens: 5 }
    });
    return !!result.text;
  } catch (error) {
    console.error("연결 테스트 실패:", error);
    return false;
  }
};
