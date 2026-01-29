
import React, { useState } from 'react';
import { ContentType, PostFormat, DailyContext, KnowledgeItem, GeneratedPost, SavedPost, BrandMood } from '../types';
import { generateInstaContent } from '../services/geminiService';

interface Props {
  knowledge: KnowledgeItem[];
  context: DailyContext;
  history: SavedPost[];
  onSaveToHistory: (post: SavedPost) => void;
  onRemoveFromHistory: (id: string) => void;
}

const ContentGenerator: React.FC<Props> = ({ knowledge, context, history, onSaveToHistory, onRemoveFromHistory }) => {
  const [strategy, setStrategy] = useState<ContentType>(ContentType.VALUE);
  const [format, setFormat] = useState<PostFormat>(PostFormat.CAROUSEL);
  const [mood, setMood] = useState<BrandMood>(BrandMood.PROFESSIONAL);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const showCopyFeedback = (msg: string) => {
    setCopyStatus(msg);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleGenerate = async (isRegenerate = false) => {
    if (knowledge.length === 0) {
      alert("지식 저장소에 데이터를 먼저 추가해주세요!");
      return;
    }
    
    if (isRegenerate) {
      setRegenerating(true);
    } else {
      setLoading(true);
      setResult(null);
    }

    try {
      const post = await generateInstaContent(knowledge, context, strategy, format, mood);
      setResult(post);
      if (isRegenerate) showCopyFeedback("새로운 버전이 도착했습니다! ✨");
    } catch (error: any) {
      if (error.message === "API_KEY_ERROR") {
        const aistudio = (window as any).aistudio;
        if (aistudio?.openSelectKey) aistudio.openSelectKey();
      } else {
        alert("콘텐츠 생성 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const newSavedPost: SavedPost = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      savedAt: Date.now(),
    };
    onSaveToHistory(newSavedPost);
    showCopyFeedback("성공 보관함에 저장되었습니다! 💎");
  };

  const copyContent = (post: GeneratedPost) => {
    const fullText = `[${post.title}]\n\n${post.slides.map((s, i) => `Slide ${i+1}: ${s}`).join('\n')}\n\n--- Caption ---\n${post.caption}\n\n${post.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    showCopyFeedback("전체 내용이 복사되었습니다!");
  };

  const copySlides = (post: GeneratedPost) => {
    const text = post.slides.map((s, i) => `[슬라이드 ${i + 1}]\n${s}`).join('\n\n');
    navigator.clipboard.writeText(text);
    showCopyFeedback("슬라이드 내용이 복사되었습니다!");
  };

  const copyCaption = (post: GeneratedPost) => {
    const text = `${post.caption}\n\n${post.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    showCopyFeedback("캡션이 복사되었습니다!");
  };

  const handleRemix = (post: SavedPost) => {
    setResult(post);
    setStrategy(post.strategyType);
    setMood(post.brandMood);
    window.scrollTo({ top: 400, behavior: 'smooth' });
    showCopyFeedback("콘텐츠를 재확산 모드로 불러왔습니다. ✨");
  };

  return (
    <div className="space-y-12">
      {/* Input Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            브랜드 콘텐츠 엔진
          </h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 uppercase tracking-tighter">Owner Perspective v3.1</span>
          </div>
        </div>

        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">1. 콘텐츠 전략 (7-2-1)</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: ContentType.VALUE, label: '가치 제공 (70%)', desc: '전문 대표의 노하우 전수', color: 'indigo' },
                    { id: ContentType.RELATIONSHIP, label: '관계 형성 (20%)', desc: '나의 진솔한 철학 공유', color: 'orange' },
                    { id: ContentType.SALES, label: '구매 유도 (10%)', desc: '진심을 담은 서비스 제안', color: 'pink' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setStrategy(opt.id as ContentType)}
                      className={`p-4 text-left rounded-2xl border-2 transition-all group ${strategy === opt.id ? `border-${opt.color}-500 bg-${opt.color}-50/50` : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-bold text-sm ${strategy === opt.id ? `text-${opt.color}-700` : 'text-gray-700'}`}>{opt.label}</span>
                        {strategy === opt.id && <span className={`text-${opt.color}-500`}>✓</span>}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">2. 브랜드 무드 (스타일)</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: BrandMood.PROFESSIONAL, label: '전문가형', icon: '👔' },
                    { id: BrandMood.FRIENDLY, label: '친근한 형', icon: '🤝' },
                    { id: BrandMood.EMOTIONAL, label: '감성가형', icon: '🌙' },
                    { id: BrandMood.ENERGETIC, label: '열정가형', icon: '🔥' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setMood(opt.id as BrandMood)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${mood === opt.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-200'}`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">3. 출력 포맷</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: PostFormat.CAROUSEL, icon: '🎴', label: '카드뉴스' },
                    { id: PostFormat.SINGLE, icon: '🖼️', label: '단일 피드' },
                    { id: PostFormat.REELS, icon: '🎞️', label: '릴스 대본' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setFormat(opt.id as PostFormat)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${format === opt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'}`}
                    >
                      <span className="text-2xl mb-2">{opt.icon}</span>
                      <span className="text-[10px] font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 text-white h-full flex flex-col justify-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Owner Formula Alpha</p>
                <ul className="text-[11px] space-y-2 opacity-80 font-medium list-disc pl-4">
                  <li>브랜드 대표의 **1인칭 시점** 고정</li>
                  <li>**Hook-Empathy-Value-Story-CTA** 공식</li>
                  <li>고객과 직접 대화하는 **공감형 캡션**</li>
                  <li>후기를 대표의 **철학으로 재해석**</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleGenerate(false)}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all ${loading ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right active:scale-[0.98]'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                대표님의 목소리를 담는 중...
              </span>
            ) : '브랜드 피드 생성하기 ✨'}
          </button>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className={`bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden transition-all duration-500 ${regenerating ? 'opacity-40 scale-[0.99] grayscale-[0.5]' : 'opacity-100 scale-100'}`}>
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 flex flex-wrap gap-4 justify-between items-center text-white">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">1st Person Brand Post</p>
              <h3 className="text-xl font-black truncate">{result.title}</h3>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => handleGenerate(true)} 
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-black shadow-lg shadow-amber-900/20 transition-all active:scale-95 disabled:opacity-50"
                title="다른 버전 만들기"
              >
                <svg className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {regenerating ? '교체 중...' : '다시 만들기'}
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold border border-white/20 transition-all">⭐ 저장</button>
              <button onClick={() => copyContent(result)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold border border-transparent transition-all">전체 복사</button>
            </div>
          </div>
          
          <div className="p-8 space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  카드뉴스 슬라이드 구성
                </h4>
                <button onClick={() => copySlides(result)} className="text-[11px] font-bold text-indigo-600 hover:underline">슬라이드만 복사</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-6 snap-x custom-scrollbar">
                {result.slides.map((slide, idx) => (
                  <div key={idx} className="min-w-[280px] aspect-square bg-gray-50 border border-gray-100 rounded-3xl p-8 flex flex-col snap-center shadow-md relative group hover:border-indigo-200 transition-all">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">P.{idx + 1}</span>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-gray-800 text-base font-black leading-snug text-center whitespace-pre-wrap italic">"{slide}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                  브랜드 본문 캡션 (Owner Voice)
                </h4>
                <button onClick={() => copyCaption(result)} className="px-4 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">캡션만 복사</button>
              </div>
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 relative">
                <div className="absolute -top-3 left-8 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm">Perfect Formula Applied</div>
                <p className="text-sm leading-relaxed text-gray-700 font-bold whitespace-pre-wrap">{result.caption}</p>
                <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-200 pt-6">
                  {result.hashtags.map((tag, i) => (
                    <span key={i} className="text-indigo-600 text-[10px] font-black bg-indigo-50 px-2 py-1 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Archive */}
      {history.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-2 h-7 bg-amber-500 rounded-full"></span>
              성공 콘텐츠 보관함
            </h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{history.length} Saved Assets</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h4 className="font-black text-gray-800 text-sm truncate max-w-[180px]">{post.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{new Date(post.savedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => onRemoveFromHistory(post.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                  <span className="text-[10px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tighter">{post.strategyType} | {post.brandMood}</span>
                  <button onClick={() => handleRemix(post)} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">불러오기 및 재편집 →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {copyStatus && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-8 py-3 rounded-2xl font-black text-sm shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-6 duration-300 border border-white/10">
          {copyStatus}
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
