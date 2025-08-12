'use client';

import React, { useState, useEffect } from 'react';

interface Hanja {
  id: number;
  character: string;
  sound: string;
  meaning: string;
}

interface HanjaViewerProps {
  start: number;
  end: number;
  onBack: () => void;
}

export const HanjaViewer: React.FC<HanjaViewerProps> = ({ start, end, onBack }) => {
  const [hanjas, setHanjas] = useState<Hanja[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHanjas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/thousand_characters.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allHanjas: Hanja[] = await response.json();
        const filteredHanjas = allHanjas.filter(hanja => hanja.id >= start && hanja.id <= end);
        setHanjas(filteredHanjas);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHanjas();
  }, [start, end]);

  if (loading) {
    return <div className="text-center p-4">한자 데이터를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-danger">데이터 로드 중 오류 발생: {error}</div>;
  }

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="card-title text-center mb-4">천자문 열람 ({start} ~ {end})</h2>
      <div className="hanja-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
        {hanjas.length > 0 ? (
          hanjas.map(hanja => (
            <div key={hanja.id} className="hanja-item border p-2 rounded">
              <p className="fs-3 fw-bold mb-1">{hanja.character}</p>
              <p className="mb-0">음: {hanja.sound}</p>
              <p className="mb-0">훈: {hanja.meaning}</p>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full">해당 범위에 한자가 없습니다.</p>
        )}
      </div>
      <button className="btn btn-secondary mt-4 w-100" onClick={onBack}>돌아가기</button>
    </div>
  );
};

