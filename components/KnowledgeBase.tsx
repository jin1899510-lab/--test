
import React, { useState, useRef } from 'react';
import { KnowledgeItem } from '../types';

interface Props {
  items: KnowledgeItem[];
  onAdd: (item: KnowledgeItem) => void;
  onRemove: (id: string) => void;
}

const KnowledgeBase: React.FC<Props> = ({ items, onAdd, onRemove }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState<'file' | 'text'>('text');
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!input || !title) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      content: input,
      timestamp: Date.now(),
    });
    setInput('');
    setTitle('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
      setTitle(file.name.split('.')[0]);
      setType('file');
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </span>
        나의 지식 창고
      </h2>
      
      <div className="space-y-3">
        <div className="flex gap-2 mb-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            파일 불러오기 (.txt)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt,.md,.csv"
          />
        </div>

        <input
          type="text"
          placeholder="지식의 제목을 적어주세요"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div className="relative">
          <textarea
            placeholder="PDF 내용, 블로그 글, 혹은 개인적인 생각들을 자유롭게 붙여넣으세요..."
            className="w-full h-40 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (type === 'file') setType('text');
            }}
          />
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-500 font-medium px-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            유튜브 스크립트나 영상 텍스트를 그대로 붙여넣으셔도 완벽하게 분석합니다.
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 mt-2"
        >
          지식 저장소에 추가하기
        </button>
      </div>

      <div className="mt-6 space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg">{item.type === 'file' ? '📂' : '✍️'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-gray-800 truncate">{item.title}</p>
                <p className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              className="text-gray-300 hover:text-red-500 p-1 flex-shrink-0 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
