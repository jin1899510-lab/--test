
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

  const handleInputKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.openSelectKey) {
      // 이 함수가 실행되면 시스템의 보안 API 키 입력 창이 뜹니다.
      await aistudio.openSelectKey();
      setHasKey(true);
      setConnectionStatus('idle');
    } else {
      alert("API 키 입력 도구를 불러올 수 없습니다. 환경을 확인해주세요.");
    }
  };

  const handleTest = async () => {
    setConnectionStatus('testing');
    const ok = await testConnection();
    setConnectionStatus(ok ? 'success' : 'error');
    if (ok) setHasKey(true);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f9fafb]">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">B</div>
            <div>
              <h1 className="font-black text-gray-900 leading-none tracking-tighter">BRAND BUILDER</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">AI Content Engine</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all border-2 ${
              hasKey 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-600 animate-bounce'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasKey ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasKey ? 'bg-emerald-500' : 'bg-indigo-600'}`}></span>
            </span>
            {hasKey ? '시스템 연결됨' : 'API 키 입력하기'}
          </button>
        </div>
      </header>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">API 보안 설정</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="bg-indigo-600 rounded-3xl p-8 text-white space-y-5 shadow-xl shadow-indigo-100">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border border-white/30 ${hasKey ? 'bg-emerald-500/30' : 'bg-amber-500/30'}`}>
                    {hasKey ? 'CONNECTED' : 'REQUIRED'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black mb-2">Gemini API 키 입력</h3>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                    콘텐츠 생성을 위해 본인의 API 키를 입력해야 합니다.<br/>
                    아래 버튼을 누르면 나타나는 시스템 창에 키를 복사해서 넣어주세요.
                  </p>
                </div>
                <button
                  onClick={handleInputKey}
                  className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-sm font-black hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                >
                  지금 API 키 입력 및 연결
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleTest}
                  disabled={connectionStatus === 'testing'}
                  className="w-full py-4 border-2 border-gray-100 text-gray-500 rounded-2xl text-sm font-black hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {connectionStatus === 'testing' ? '연결 상태 확인 중...' : '연결 상태 테스트'}
                </button>
                {connectionStatus === 'success' && <p className="text-center text-xs text-emerald-600 font-black animate-bounce">✨ API가 성공적으로 연결되었습니다!</p>}
                {connectionStatus === 'error' && <p className="text-center text-xs text-red-500 font-black">❌ 연결에 실패했습니다. 키를 다시 입력해주세요.</p>}
              </div>

              <div className="text-center">
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] text-gray-400 hover:text-indigo-600 font-bold underline underline-offset-4"
                >
                  구글 AI 스튜디오 결제 및 한도 안내 확인
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-10">
            <KnowledgeBase 
              items={knowledge} 
              onAdd={(item) => setKnowledge([item, ...knowledge])} 
              onRemove={(id) => setKnowledge(knowledge.filter(k => k.id !== id))} 
            />
            <DailyContextForm 
              context={context} 
              onChange={setContext} 
            />
          </div>
          <div className="lg:col-span-8">
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

export default App;
