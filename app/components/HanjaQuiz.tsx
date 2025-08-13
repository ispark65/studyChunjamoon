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
    const allOtherHanjas = hanjaList.filter(h => h.id !== hanja.id);
    const incorrectOptions: string[] = [];

    while (incorrectOptions.length < 3 && allOtherHanjas.length > 0) {
      const randomIndex = Math.floor(Math.random() * allOtherHanjas.length);
      const randomHanja = allOtherHanjas[randomIndex];
      const randomOption = `${randomHanja.sound} / ${randomHanja.meaning}`;
      
      if (!incorrectOptions.includes(randomOption) && randomOption !== correctOption) {
        incorrectOptions.push(randomOption);
      }
      // Prevent infinite loops if not enough unique options are available
      allOtherHanjas.splice(randomIndex, 1);
    }
    
    // Fill remaining options if not enough unique ones were found
    while (incorrectOptions.length < 3) {
        incorrectOptions.push(`오답 ${incorrectOptions.length + 1}`);
    }

    const allOptions = [correctOption, ...incorrectOptions];
    setOptions(shuffleArray(allOptions));
  }, []);

  useEffect(() => {
    // The parent component now provides the hanjas. We just shuffle and start.
    if (hanjasToQuiz.length > 0) {
      const shuffled = shuffleArray(hanjasToQuiz);
      const selectedForQuiz = shuffled.slice(0, 20); // Take up to 20
      setQuizHanjas(selectedForQuiz);
      loadNewQuestion(selectedForQuiz, 0);
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

  if (quizFinished || quizExited) {
    return (
      <div className="card p-4 shadow-sm text-center">
        <h2 className="mb-4">퀴즈 종료!</h2>
        <p className="fs-4">총 {quizHanjas.length} 문제 중 {correctAnswersCount} 문제 정답!</p>
        <button className="btn btn-primary mt-3" onClick={onQuizEnd}>돌아가기</button>
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