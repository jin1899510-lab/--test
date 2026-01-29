
import React, { useState, useEffect } from 'react';
import KnowledgeBase from './components/KnowledgeBase';
import DailyContextForm from './components/DailyContextForm';
import ContentGenerator from './components/ContentGenerator';
import { KnowledgeItem, DailyContext, SavedPost } from './types';
import { testConnection } from './services/geminiService';

const App: React.FC = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(() => {
    const saved = localStorage.getItem('insta_knowledge');
    return saved ? JSON.parse(saved) : [];
  });

  const [context, setContext] = useState<DailyContext>(() => {
    const saved = localStorage.getItem('insta_context');
    return saved ? JSON.parse(saved) : { weather: '', mood: '', event: '', story: '' };
  });

  const [history, setHistory] = useState<SavedPost[]>(() => {
    const saved = localStorage.getItem('insta_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [hasKey, setHasKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    localStorage.setItem('insta_knowledge', JSON.stringify(knowledge));
    localStorage.setItem('insta_context', JSON.stringify(context));
    localStorage.setItem('insta_history', JSON.stringify(history));
  }, [knowledge, context, history]);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio?.hasSelectedApiKey) {
        setHasKey(await aistudio.hasSelectedApiKey());
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.openSelectKey) {
      await aistudio.openSelectKey();
      // 가이드라인 준수: openSelectKey 호출 후 즉시 성공으로 가정하여 진행
      setHasKey(true);
    } else {
      alert("이 환경에서는 API 키 선택 도구를 지원하지 않습니다.");
    }
  };

  const handleTest = async () => {
    setConnectionStatus('testing');
    const ok = await testConnection();
    setConnectionStatus(ok ? 'success' : 'error');
    if (ok) setHasKey(true);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f8f9fa]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">B</div>
            <h1 className="font-black text-gray-800 tracking-tighter">BRAND BUILDER</h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all border ${
              hasKey ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600 animate-pulse'
            }`}
          >
            {hasKey ? '● API 연결됨' : '○ API 연결 필요'}
          </button>
        </div>
      </header>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900">환경 설정</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-900 uppercase">Gemini API 키 연결</span>
                  <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  브랜드 콘텐츠 엔진을 사용하려면 Google AI Studio에서 발급받은 API 키가 필요합니다.
                  유료 플랜이 활성화된 프로젝트의 키를 선택해주세요.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleOpenKeySelector}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    API 키 선택하기
                  </button>
                </div>
                <div className="pt-1 text-center">
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline font-bold"
                  >
                    결제 및 한도 안내 확인하기
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleTest}
                  disabled={connectionStatus === 'testing'}
                  className="w-full py-3 border-2 border-gray-100 text-gray-600 rounded-xl text-sm font-black hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {connectionStatus === 'testing' ? '연결 확인 중...' : '연결 테스트하기'}
                </button>
                {connectionStatus === 'success' && <p className="text-center text-[10px] text-emerald-600 font-bold">✓ 연결에 성공했습니다!</p>}
                {connectionStatus === 'error' && <p className="text-center text-[10px] text-red-500 font-bold">✗ 연결에 실패했습니다. 키를 다시 확인해주세요.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <KnowledgeBase 
              items={knowledge} 
              onAdd={(item) => setKnowledge([...knowledge, item])} 
              onRemove={(id) => setKnowledge(knowledge.filter(k => k.id !== id))} 
            />
            <DailyContextForm 
              context={context} 
              onChange={setContext} 
            />
          </div>
          <div className="lg:col-span-2">
            <ContentGenerator 
              knowledge={knowledge} 
              context={context} 
              history={history}
              onSaveToHistory={(post) => setHistory([post, ...history])}
              onRemoveFromHistory={(id) => setHistory(history.filter(h => h.id !== id))}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// index.tsx의 default export 에러 수정을 위해 명시적으로 export default 추가
export default App;
