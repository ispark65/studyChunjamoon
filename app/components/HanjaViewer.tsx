'use client';

import React from 'react';

interface Hanja {
  id: number;
  character: string;
  sound: string;
  meaning: string;
}

interface HanjaViewerProps {
  hanjasToView: Hanja[];
  onBack: () => void;
}

export const HanjaViewer: React.FC<HanjaViewerProps> = ({ hanjasToView, onBack }) => {
  if (!hanjasToView || hanjasToView.length === 0) {
    return (
      <div className="card p-4 shadow-sm text-center">
        <p>표시할 한자가 없습니다.</p>
        <button className="btn btn-secondary mt-4" onClick={onBack}>돌아가기</button>
      </div>
    );
  }

  const hanjasByGroup: { [key: number]: Hanja[] } = {};
  hanjasToView.forEach(hanja => {
    const groupId = Math.floor((hanja.id - 1) / 8);
    if (!hanjasByGroup[groupId]) {
      hanjasByGroup[groupId] = [];
    }
    hanjasByGroup[groupId].push(hanja);
  });

  const groupIds = Object.keys(hanjasByGroup).map(Number).sort((a, b) => a - b);

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="card-title text-center mb-4">천자문 열람</h2>
      <div className="hanja-viewer">
        {groupIds.map(groupId => (
          <div key={groupId} className="hanja-row d-flex justify-content-around mb-3">
            {Array.from({ length: 8 }).map((_, index) => {
              const hanja = hanjasByGroup[groupId].find(h => (h.id - 1) % 8 === index);
              if (hanja) {
                return (
                  <div key={hanja.id} className="hanja-item border p-2 rounded text-center" style={{ flex: '1' }}>
                    <p className="fs-1 fw-bold mb-1">{hanja.character}</p>
                    <p className="mb-0">음: {hanja.sound}</p>
                    <p className="mb-0">훈: {hanja.meaning}</p>
                  </div>
                );
              } else {
                return <div key={index} className="hanja-item-placeholder p-2 text-center" style={{ flex: '1' }} />;
              }
            })}
          </div>
        ))}
      </div>
      <button className="btn btn-secondary mt-4 w-100" onClick={onBack}>돌아가기</button>
    </div>
  );
};