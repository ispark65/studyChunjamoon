'use client';

import React, { useState } from 'react';
import { HanjaQuiz } from './components/HanjaQuiz';
import { HanjaViewer } from './components/HanjaViewer';

export default function Home() {
  const [startNumber, setStartNumber] = useState<number | string>('');
  const [endNumber, setEndNumber] = useState<number | string>('');
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [mode, setMode] = useState<'input' | 'quiz' | 'viewer'>('input'); // input, quiz, viewer

  const handleStart = (selectedMode: 'quiz' | 'viewer') => {
    const start = Number(startNumber);
    const end = Number(endNumber);

    if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end) {
      alert('유효한 시작 번호와 끝 번호를 입력해주세요. (시작 <= 끝)');
      return;
    }
    setRange({ start, end });
    setMode(selectedMode);
  };

  const handleBackToInput = () => {
    setMode('input');
    setRange(null);
    setStartNumber('');
    setEndNumber('');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">천자문 마스터</h1>
      {mode === 'input' && (
        <div className="card p-4 shadow-sm">
          <h2 className="card-title text-center mb-4">학습 범위 설정</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleStart('quiz'); }}>
            <div className="mb-3">
              <label htmlFor="startNumber" className="form-label">시작 번호:</label>
              <input
                type="number"
                className="form-control"
                id="startNumber"
                value={startNumber}
                onChange={(e) => setStartNumber(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="endNumber" className="form-label">끝 번호:</label>
              <input
                type="number"
                className="form-control"
                id="endNumber"
                value={endNumber}
                onChange={(e) => setEndNumber(e.target.value)}
                min="1"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-2">학습 시작</button>
            <button type="button" className="btn btn-info w-100" onClick={() => handleStart('viewer')}>열람하기</button>
          </form>
        </div>
      )}

      {mode === 'quiz' && range && (
        <div className="mt-5">
          <HanjaQuiz start={range.start} end={range.end} onQuizEnd={handleBackToInput} />
        </div>
      )}

      {mode === 'viewer' && range && (
        <div className="mt-5">
          <HanjaViewer start={range.start} end={range.end} onBack={handleBackToInput} />
        </div>
      )}
    </div>
  );
}
