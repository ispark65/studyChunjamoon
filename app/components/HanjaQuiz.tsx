'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Hanja {
  id: number;
  character: string;
  sound: string;
  meaning: string;
}

interface HanjaQuizProps {
  hanjasToQuiz: Hanja[]; // Changed from start/end
  onQuizEnd: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const HanjaQuiz: React.FC<HanjaQuizProps> = ({ hanjasToQuiz, onQuizEnd }) => {
  const [quizHanjas, setQuizHanjas] = useState<Hanja[]>([]);
  const [currentHanja, setCurrentHanja] = useState<Hanja | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizExited, setQuizExited] = useState<boolean>(false);

  const loadNewQuestion = useCallback((hanjaList: Hanja[], index: number) => {
    if (index >= hanjaList.length) {
      setQuizFinished(true);
      setCurrentHanja(null);
      return;
    }
    const hanja = hanjaList[index];
    setCurrentHanja(hanja);
    setIsAnswered(false);
    setIsCorrect(null);

    const correctOption = `${hanja.sound} / ${hanja.meaning}`;
    
    const otherOptions = shuffleArray(
      hanjaList
        .filter(h => h.id !== hanja.id)
        .map(h => `${h.sound} / ${h.meaning}`)
    );

    const incorrectOptions = [...new Set(otherOptions.filter(o => o !== correctOption))].slice(0, 3);

    while (incorrectOptions.length < 3) {
      incorrectOptions.push(`오답 ${incorrectOptions.length + 1}`);
    }

    const allOptions = shuffleArray([correctOption, ...incorrectOptions]);
    setOptions(allOptions);
  }, []);

  useEffect(() => {
    if (hanjasToQuiz.length > 0) {
      // Filter out hanjas with empty character, sound, or meaning
      const validHanjas = hanjasToQuiz.filter(h => 
        h.character && h.character.trim() !== '' &&
        h.sound && h.sound.trim() !== '' &&
        h.meaning && h.meaning.trim() !== ''
      );

      if (validHanjas.length > 0) {
        const shuffled = shuffleArray(validHanjas);
        const selectedForQuiz = shuffled.slice(0, 20); // Take up to 20
        setQuizHanjas(selectedForQuiz);
        loadNewQuestion(selectedForQuiz, 0);
      } else {
        setQuizFinished(true); // No valid hanjas to quiz
      }
    } else {
      setQuizFinished(true); // No hanjas provided, end quiz.
    }
  }, [hanjasToQuiz, loadNewQuestion]);

  const handleAnswer = (selectedOption: string) => {
    if (!currentHanja) return;
    setIsAnswered(true);
    const correctOption = `${currentHanja.sound} / ${currentHanja.meaning}`;
    if (selectedOption === correctOption) {
      setIsCorrect(true);
      setCorrectAnswersCount(prevCount => prevCount + 1);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = quizIndex + 1;
    if (nextIndex < quizHanjas.length) {
      setQuizIndex(nextIndex);
      loadNewQuestion(quizHanjas, nextIndex);
    } else {
      setQuizFinished(true);
    }
  };

  const handleExitQuiz = () => {
    setQuizExited(true);
    setCurrentHanja(null);
  };

  const handleRestart = useCallback(() => {
    setQuizFinished(false);
    setQuizExited(false);
    setQuizIndex(0);
    setCorrectAnswersCount(0);
    
    const validHanjas = hanjasToQuiz.filter(h => 
      h.character && h.character.trim() !== '' &&
      h.sound && h.sound.trim() !== '' &&
      h.meaning && h.meaning.trim() !== ''
    );

    if (validHanjas.length > 0) {
      const shuffled = shuffleArray(validHanjas);
      const selectedForQuiz = shuffled.slice(0, 20);
      setQuizHanjas(selectedForQuiz);
      loadNewQuestion(selectedForQuiz, 0);
    } else {
      setQuizFinished(true); 
    }
  }, [hanjasToQuiz, loadNewQuestion]);

  if (quizFinished || quizExited) {
    return (
      <div className="card p-4 shadow-sm text-center">
        <h2 className="mb-4">퀴즈 종료!</h2>
        <p className="fs-4">총 {quizHanjas.length} 문제 중 {correctAnswersCount} 문제 정답!</p>
        <button className="btn btn-primary mt-3 me-2" onClick={handleRestart}>다시 시작</button>
        <button className="btn btn-secondary mt-3" onClick={onQuizEnd}>돌아가기</button>
      </div>
    );
  }

  if (!currentHanja) {
    return <div className="text-center p-4">퀴즈를 준비 중입니다...</div>;
  }

  return (
    <div className="card p-4 shadow-sm text-center">
      <h2 className="mb-4 display-1">{currentHanja.character}</h2>
      <div className="row g-2 mb-4">
        {options.map((option, index) => (
          <div key={index} className="col-6">
            <button
              className={`btn btn-lg w-100 ${isAnswered ? (option === (currentHanja.sound + ' / ' + currentHanja.meaning) ? 'btn-success' : 'btn-outline-danger') : 'btn-outline-primary'}`}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
            >
              {option}
            </button>
          </div>
        ))}
      </div>
      {isAnswered && (
        <div className="mt-3">
          {isCorrect ? (
            <p className="text-success fs-4">정답입니다!</p>
          ) : (
            <p className="text-danger fs-4">오답입니다. 정답은 {currentHanja.sound} / {currentHanja.meaning} 입니다.</p>
          )}
          <button className="btn btn-info mt-3 me-2" onClick={handleNextQuestion}>다음 문제</button>
          <button className="btn btn-danger mt-3" onClick={handleExitQuiz}>퀴즈 종료</button>
        </div>
      )}
      {!isAnswered && (
        <div className="mt-3">
          <button className="btn btn-danger" onClick={handleExitQuiz}>퀴즈 종료</button>
        </div>
      )}
    </div>
  );
};