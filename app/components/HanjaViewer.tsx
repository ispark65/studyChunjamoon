'use client';

import React from 'react';

interface Hanja {
  id: number;
  character: string;
  sound: string;
  meaning: string;
}

interface HanjaViewerProps {
  hanjasToView: Hanja[]; // Changed from start/end
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

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="card-title text-center mb-4">천자문 열람</h2>
      <div className="hanja-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)' }}>
        {hanjasToView.map(hanja => (
          <div key={hanja.id} className="hanja-item border p-2 rounded text-center">
            <p className="fs-1 fw-bold mb-1">{hanja.character}</p>
            <p className="mb-0">음: {hanja.sound}</p>
            <p className="mb-0">훈: {hanja.meaning}</p>
          </div>
        ))}
      </div>
      <button className="btn btn-secondary mt-4 w-100" onClick={onBack}>돌아가기</button>
    </div>
  );
};