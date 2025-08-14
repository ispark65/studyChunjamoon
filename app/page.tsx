'use client';

import React, { useState, useEffect } from 'react';
import { HanjaQuiz } from './components/HanjaQuiz';
import { HanjaViewer } from './components/HanjaViewer';
import { HanjaGame } from './components/HanjaGame';

interface Hanja {
  id: number;
  character: string;
  sound: string;
  meaning: string;
}

export default function Home() {
  const [startNumber, setStartNumber] = useState<number | string>('');
  const [endNumber, setEndNumber] = useState<number | string>('');
  const [mode, setMode] = useState<'input' | 'quiz' | 'viewer' | 'game'>('input');
  const [selectedPresets, setSelectedPresets] = useState<number[]>([]);
  const [allHanjas, setAllHanjas] = useState<Hanja[]>([]);
  const [hanjasForQuiz, setHanjasForQuiz] = useState<Hanja[]>([]);
  const [hanjasForViewer, setHanjasForViewer] = useState<Hanja[]>([]); // Changed to Hanja array
  const [hanjasForGame, setHanjasForGame] = useState<Hanja[]>([]);

  useEffect(() => {
    // Fetch all hanjas once when the component mounts
    const fetchAllHanjas = async () => {
      try {
        const response = await fetch('/thousand_characters.json');
        const data: Hanja[] = await response.json();
        setAllHanjas(data);
      } catch (error) {
        console.error("Failed to fetch hanja data:", error);
        alert("천자문 데이터를 불러오는 데 실패했습니다.");
      }
    };
    fetchAllHanjas();
  }, []);

  const presetRanges = Array.from({ length: 10 }, (_, i) => ({
    start: i * 100 + 1,
    end: (i + 1) * 100,
    label: `${i * 100 + 1}~${(i + 1) * 100}`,
  }));

  const handlePresetClick = (presetIndex: number) => {
    setSelectedPresets(prevSelected => {
      const newSelection = prevSelected.includes(presetIndex)
        ? prevSelected.filter(item => item !== presetIndex)
        : [...prevSelected, presetIndex];
      // Sort the selection for predictable order
      newSelection.sort((a, b) => a - b);
      return newSelection;
    });
  };

  const handleStart = (selectedMode: 'quiz' | 'viewer' | 'game') => {
    let hanjasToProcess: Hanja[] = [];

    if (selectedPresets.length > 0) {
      selectedPresets.forEach(presetIndex => {
        const range = presetRanges[presetIndex];
        const filtered = allHanjas.filter(h => h.id >= range.start && h.id <= range.end);
        hanjasToProcess.push(...filtered);
      });
    } else {
      const start = Number(startNumber);
      const end = Number(endNumber);
      if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end) {
        alert('유효한 시작 번호와 끝 번호를 입력해주세요. (시작 <= 끝)');
        return;
      }
      hanjasToProcess = allHanjas.filter(h => h.id >= start && h.id <= end);
    }

    if (hanjasToProcess.length === 0) {
      alert("선택된 범위에 해당하는 한자가 없습니다.");
      return;
    }

    if (selectedMode === 'quiz') {
      setHanjasForQuiz(hanjasToProcess);
    } else if (selectedMode === 'viewer') { // viewer mode
      setHanjasForViewer(hanjasToProcess);
    } else { // game mode
      setHanjasForGame(hanjasToProcess);
    }
    setMode(selectedMode);
  };

  const handleBackToInput = () => {
    setMode('input');
    // Reset quiz/viewer/game data but keep selections for convenience
    setHanjasForQuiz([]);
    setHanjasForViewer([]);
    setHanjasForGame([]);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">천자문 마스터</h1>
      {mode === 'input' && (
        <div className="card p-4 shadow-sm">
          <h2 className="card-title text-center mb-4">학습 범위 설정</h2>
          
          <div className="mb-3">
            <p className="form-label fw-bold">간편 범위 선택 (다중 선택 가능):</p>
            {/* Rigid 5-column layout */}
            <div className="row row-cols-5 g-2">
              {presetRanges.map((preset, index) => (
                <div key={index} className="col d-grid">
                  <button
                    type="button"
                    className={`btn ${selectedPresets.includes(index) ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handlePresetClick(index)}
                  >
                    {preset.label}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr />

          {selectedPresets.length === 0 && (
            <form onSubmit={(e) => { e.preventDefault(); handleStart('quiz'); }}>
              <p className="form-label fw-bold">또는, 직접 범위 입력:</p>
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
            </form>
          )}

          <div className="d-grid gap-2 mt-4">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => handleStart('quiz')}>퀴즈 학습 시작</button>
            <button type="button" className="btn btn-success btn-lg" onClick={() => handleStart('game')}>게임 학습 시작</button>
            <button type="button" className="btn btn-info btn-lg" onClick={() => handleStart('viewer')}>열람하기</button>
          </div>
        </div>
      )}

      {mode === 'quiz' && (
        <div className="mt-5">
          <HanjaQuiz hanjasToQuiz={hanjasForQuiz} onQuizEnd={handleBackToInput} />
        </div>
      )}

      {mode === 'viewer' && (
        <div className="mt-5">
          <HanjaViewer hanjasToView={hanjasForViewer} onBack={handleBackToInput} />
        </div>
      )}

      {mode === 'game' && (
        <div className="mt-5">
          <HanjaGame hanjasToGame={hanjasForGame} onGameEnd={handleBackToInput} />
        </div>
      )}
    </div>
  );
}