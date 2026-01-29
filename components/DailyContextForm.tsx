
import React from 'react';
import { DailyContext } from '../types';
import { WeatherIcons, MoodLabels } from '../constants';

interface Props {
  context: DailyContext;
  onChange: (context: DailyContext) => void;
}

const DailyContextForm: React.FC<Props> = ({ context, onChange }) => {
  const updateField = (field: keyof DailyContext, value: string) => {
    // 이미 선택된 값이면 해제(Empty string)하여 선택 안 함 상태 지원
    if ((field === 'mood' || field === 'weather') && context[field] === value) {
      onChange({ ...context, [field]: '' });
    } else {
      onChange({ ...context, [field]: value });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728L5.757 5.757" /></svg>
        </span>
        오늘의 맥락
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">현재 날씨 (선택 사항)</label>
          <div className="flex gap-3">
            {Object.keys(WeatherIcons).map(w => (
              <button
                key={w}
                onClick={() => updateField('weather', w)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${context.weather === w ? 'border-orange-500 bg-orange-50 scale-105 z-10' : 'border-gray-50 bg-gray-50/50 grayscale hover:grayscale-0'}`}
              >
                {WeatherIcons[w as keyof typeof WeatherIcons]}
                <span className={`text-[10px] font-bold ${context.weather === w ? 'text-orange-600' : 'text-gray-500'}`}>{w}</span>
              </button>
            ))}
          </div>
          {context.weather && (
            <div className="mt-2 text-right">
              <button 
                onClick={() => updateField('weather', context.weather)}
                className="text-[10px] text-gray-300 hover:text-gray-500 font-bold"
              >
                날씨 선택 취소
              </button>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">나의 기분 (선택 사항)</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MoodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => updateField('mood', key)}
                className={`px-4 py-2 rounded-full border-2 text-xs font-bold transition-all ${
                  context.mood === key 
                  ? 'border-purple-500 bg-purple-500 text-white shadow-md shadow-purple-100' 
                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
            {context.mood && (
              <button 
                onClick={() => updateField('mood', context.mood)}
                className="text-[10px] text-gray-300 hover:text-gray-500 font-bold ml-1"
              >
                기분 선택 취소
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 pt-2 border-t border-gray-50">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">특별한 이벤트</label>
          <input
            type="text"
            placeholder="예: 팔로워 1만 달성, 신제품 런칭 날"
            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all"
            value={context.event}
            onChange={(e) => updateField('event', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">비하인드 스토리</label>
          <textarea
            placeholder="오늘 있었던 사소한 깨달음이나 기록하고 싶은 이야기가 있나요?"
            className="w-full h-24 px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none resize-none text-sm transition-all"
            value={context.story}
            onChange={(e) => updateField('story', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyContextForm;
