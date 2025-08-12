'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Hanja {
  id: number;
  character: string;
  sound: string;
  meaning: string;
}

interface HanjaQuizProps {
  start: number;
  end: number;
  onQuizEnd: () => void; // New prop for handling quiz end
}

// shuffleArray 함수를 컴포넌트 외부로 이동
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array]; // 원본 배열을 변경하지 않기 위해 복사
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const HanjaQuiz: React.FC<HanjaQuizProps> = ({ start, end, onQuizEnd }) => {
  const [hanjas, setHanjas] = useState<Hanja[]>([]);
  const [currentHanja, setCurrentHanja] = useState<Hanja | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0); // New state
  const [quizFinished, setQuizFinished] = useState<boolean>(false); // New state
  const [quizExited, setQuizExited] = useState<boolean>(false); // New state

  // loadNewQuestion 함수를 useCallback으로 감싸고 의존성 추가
  const loadNewQuestion = useCallback((hanjaList: Hanja[], index: number) => {
    if (index >= hanjaList.length) {
      setQuizFinished(true); // All questions answered
      setCurrentHanja(null);
      return;
    }
    const hanja = hanjaList[index];
    setCurrentHanja(hanja);
    setIsAnswered(false);
    setIsCorrect(null);

    const correctOption = hanja.sound + ' / ' + hanja.meaning;
    // 현재 한자를 제외한 나머지 한자들에서 오답 보기를 생성
    const allOtherHanjas = hanjaList.filter(h => h.id !== hanja.id);
    const incorrectOptions: string[] = [];

    // 오답 보기 3개 생성
    while (incorrectOptions.length < 3) {
      // 모든 한자 중에서 무작위로 선택 (현재 한자 제외)
      const randomHanja = allOtherHanjas[Math.floor(Math.random() * allOtherHanjas.length)];
      const randomOption = randomHanja.sound + ' / ' + randomHanja.meaning;
      // 중복되지 않고 정답과 다른 보기만 추가
      if (!incorrectOptions.includes(randomOption) && randomOption !== correctOption) {
        incorrectOptions.push(randomOption);
      }
    }

    const allOptions = [correctOption, ...incorrectOptions];
    setOptions(shuffleArray(allOptions));
  }, []); // 의존성 배열 비워두기: 이 함수는 컴포넌트 마운트 시 한 번만 생성되면 됨

  useEffect(() => {
    const fetchHanjas = async () => {
      try {
        console.log('Fetching hanjas...');
        const response = await fetch('/thousand_characters.json');
        const allHanjas: Hanja[] = await response.json();
        console.log('All hanjas fetched:', allHanjas);
        const filteredHanjas = allHanjas.filter(hanja => hanja.id >= start && hanja.id <= end);
        console.log(`Filtered hanjas (start: ${start}, end: ${end}):`, filteredHanjas);

        // Shuffle and select up to 20 random hanjas
        const shuffledHanjas = shuffleArray(filteredHanjas);
        const quizHanjas = shuffledHanjas.slice(0, 20);
        console.log('Quiz hanjas (20 random):', quizHanjas);

        setHanjas(quizHanjas);
        if (quizHanjas.length > 0) {
          loadNewQuestion(quizHanjas, 0);
        } else {
          console.log('No hanjas found within the specified range or after selection.');
          setQuizFinished(true); // No questions to load, so quiz is finished
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch hanjas:", error.message);
        } else {
          console.error("An unknown error occurred during fetch");
        }
        setQuizFinished(true); // Error fetching, so quiz is finished
      }
    };
    fetchHanjas();
  }, [start, end, loadNewQuestion]); // loadNewQuestion을 의존성 배열에 추가

  const handleAnswer = (selectedOption: string) => {
    if (!currentHanja) return;
    setIsAnswered(true);
    const correctOption = currentHanja.sound + ' / ' + currentHanja.meaning;
    if (selectedOption === correctOption) {
      setIsCorrect(true);
      setCorrectAnswersCount(prevCount => prevCount + 1); // Increment correct answers
    } else {
      setIsCorrect(false);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = quizIndex + 1;
    if (nextIndex < hanjas.length) {
      setQuizIndex(nextIndex);
      loadNewQuestion(hanjas, nextIndex);
    } else {
      setQuizFinished(true); // All questions answered
    }
  };

  const handleExitQuiz = () => {
    setQuizExited(true);
    setCurrentHanja(null); // Clear current hanja to show summary
  };

  if (quizFinished || quizExited) {
    return (
      <div className="card p-4 shadow-sm text-center">
        <h2 className="mb-4">퀴즈 종료!</h2>
        <p className="fs-4">총 {hanjas.length} 문제 중 {correctAnswersCount} 문제 정답!</p>
        <button className="btn btn-primary mt-3" onClick={onQuizEnd}>돌아가기</button>
      </div>
    );
  }

  if (!currentHanja) {
    return <div className="text-center p-4">문제를 불러오는 중입니다...</div>;
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
