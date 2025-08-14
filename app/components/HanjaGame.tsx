
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Hanja {
  id: number;
  character: string;
  sound: string;
  meaning: string;
}

interface HanjaGameProps {
  hanjasToGame: Hanja[];
  onGameEnd: () => void;
}

export const HanjaGame: React.FC<HanjaGameProps> = ({ hanjasToGame, onGameEnd }) => {
  const [sequential, setSequential] = useState(true);
  const [difficulty, setDifficulty] = useState(1);
  const [highlightCorrect, setHighlightCorrect] = useState(true);
  const [gameHanjas, setGameHanjas] = useState<Hanja[]>([]);
  const [boardHanjas, setBoardHanjas] = useState<Hanja[]>([]);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  useEffect(() => {
    const storedBestTime = localStorage.getItem('bestTime');
    if (storedBestTime) {
      setBestTime(Number(storedBestTime));
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'running') {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const handleStartGame = useCallback(() => {
    setTime(0);
    setCorrectCount(0);
    setSelectedButtonIndex(null);
    setShowWinAnimation(false);

    const availableHanjas = hanjasToGame;
    if (availableHanjas.length < 40) {
      alert("게임에 필요한 한자가 부족합니다. (40자 이상 필요)");
      return;
    }

    let selectedHanjas: Hanja[] = [];
    const groups: Hanja[][] = [];
    for (let i = 0; i <= availableHanjas.length - 8; i += 8) {
      groups.push(availableHanjas.slice(i, i + 8));
    }

    if (groups.length < 5) {
      alert("게임에 필요한 한자 그룹이 부족합니다. (5그룹 이상 필요)");
      return;
    }

    if (sequential) { // "모두연속" YES
      const startGroupIdx = Math.floor(Math.random() * (groups.length - 5 + 1));
      const selectedGroups = groups.slice(startGroupIdx, startGroupIdx + 5);
      selectedHanjas = selectedGroups.flat();
    } else { // "모두연속" NO
      const groupIndices = Array.from({ length: groups.length }, (_, i) => i);
      const selectedGroupIndices: number[] = [];
      while (selectedGroupIndices.length < 5 && groupIndices.length > 0) {
        const randIdx = Math.floor(Math.random() * groupIndices.length);
        const groupIndex = groupIndices.splice(randIdx, 1)[0];
        selectedGroupIndices.push(groupIndex);
      }

      selectedGroupIndices.sort((a, b) => a - b);

      const selectedGroups = selectedGroupIndices.map(idx => groups[idx]);
      selectedHanjas = selectedGroups.flat();
    }

    setGameHanjas(selectedHanjas);

    const shuffledHanjas = [...selectedHanjas];

    // Difficulty logic
    if (difficulty === 1) { // 20 correct, based on groups of 2
        const correctIndices = new Set<number>();
        const groupsOfTwo = Array.from({ length: 20 }, (_, i) => i * 2);
        groupsOfTwo.forEach(startIdx => {
            const randInGroup = Math.floor(Math.random() * 2);
            correctIndices.add(startIdx + randInGroup);
        });
        const incorrectIndices = Array.from({ length: 40 }, (_, i) => i).filter(i => !correctIndices.has(i));
        const incorrectHanjas = incorrectIndices.map(i => shuffledHanjas[i]);
        const shuffledIncorrectHanjas = [...incorrectHanjas].sort(() => Math.random() - 0.5);
        incorrectIndices.forEach((originalIndex, i) => {
            shuffledHanjas[originalIndex] = shuffledIncorrectHanjas[i];
        });
    } else if (difficulty === 2) { // 10 correct
        const correctIndices = new Set<number>();
        const groupsOfFour = Array.from({ length: 10 }, (_, i) => i * 4);
        groupsOfFour.forEach(startIdx => {
            const randInGroup = Math.floor(Math.random() * 4);
            correctIndices.add(startIdx + randInGroup);
        });
        const incorrectIndices = Array.from({ length: 40 }, (_, i) => i).filter(i => !correctIndices.has(i));
        const incorrectHanjas = incorrectIndices.map(i => shuffledHanjas[i]);
        const shuffledIncorrectHanjas = [...incorrectHanjas].sort(() => Math.random() - 0.5);
        incorrectIndices.forEach((originalIndex, i) => {
            shuffledHanjas[originalIndex] = shuffledIncorrectHanjas[i];
        });
    } else { // difficulty 3 - Fisher-Yates shuffle
        for (let i = shuffledHanjas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledHanjas[i], shuffledHanjas[j]] = [shuffledHanjas[j], shuffledHanjas[i]];
        }
    }

    setBoardHanjas(shuffledHanjas);
    setGameState('running');
  }, [hanjasToGame, sequential, difficulty]);

  const handleButtonClick = (index: number) => {
    if (gameState !== 'running') return;

    if (selectedButtonIndex === null) {
      setSelectedButtonIndex(index);
    } else {
      const newBoardHanjas = [...boardHanjas];
      [newBoardHanjas[selectedButtonIndex], newBoardHanjas[index]] = [newBoardHanjas[index], newBoardHanjas[selectedButtonIndex]];
      setBoardHanjas(newBoardHanjas);
      setSelectedButtonIndex(null);

      const newCorrectCount = newBoardHanjas.reduce((count, hanja, i) => {
        return count + (hanja.id === gameHanjas[i].id ? 1 : 0);
      }, 0);
      setCorrectCount(newCorrectCount);

      if (newCorrectCount === 40) {
        setGameState('stopped');
        setShowWinAnimation(true);
        if (bestTime === null || time < bestTime) {
          setBestTime(time);
          localStorage.setItem('bestTime', time.toString());
        }
        setTimeout(() => setShowWinAnimation(false), 3000);
      }
    }
  };

  const handlePauseResume = () => {
    if (gameState === 'running') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('running');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">짝 맞추기 학습게임</h2>
      <div className="card p-4 shadow-sm">
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={sequential} onChange={e => setSequential(e.target.checked)} id="sequentialCheck" />
              <label className="form-check-label" htmlFor="sequentialCheck">
                모두연속
              </label>
            </div>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}>
              <option value={1}>1단계</option>
              <option value={2}>2단계</option>
              <option value={3}>3단계</option>
            </select>
          </div>
          <div className="col-md-4">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={highlightCorrect} onChange={e => setHighlightCorrect(e.target.checked)} id="highlightCheck" />
              <label className="form-check-label" htmlFor="highlightCheck">
                맞춘글자색표시
              </label>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <button className="btn btn-primary me-2" onClick={gameState === 'stopped' ? handleStartGame : handlePauseResume}>
              {gameState === 'stopped' ? '시작' : gameState === 'paused' ? '재시작' : '멈춤'}
            </button>
            <button className="btn btn-secondary" onClick={onGameEnd}>나가기</button>
          </div>
          <div>
            <span>시간: {formatTime(time)}</span>
            <span className="ms-3">정답수: {correctCount} / 40</span>
            <span className="ms-3">베스트 랭킹: {bestTime ? formatTime(bestTime) : '00:00'}</span>
          </div>
        </div>

        <div className="grid-container">
          {boardHanjas.map((hanja, index) => (
            <button
              key={index}
              className={`btn btn-outline-secondary hanja-button ${
                selectedButtonIndex === index ? 'btn-primary' : ''
              } ${
                highlightCorrect && boardHanjas[index]?.id === gameHanjas[index]?.id ? 'btn-warning' : ''
              } ${
                showWinAnimation && boardHanjas[index]?.id === gameHanjas[index]?.id ? 'btn-success win-animation' : ''
              }`}
              onClick={() => handleButtonClick(index)}
              disabled={gameState !== 'running'}
            >
              {hanja.character}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
