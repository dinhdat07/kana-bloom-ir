
import React from 'react';
import Button from './Button';

interface DPadProps {
  onMove: (dx: number, dy: number) => void;
}

const DPad: React.FC<DPadProps> = ({ onMove }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-40 mx-auto">
      <div></div> {/* Top-left empty */}
      <Button onClick={() => onMove(0, -1)} className="text-2xl p-2 h-14 w-14 flex items-center justify-center">↑</Button>
      <div></div> {/* Top-right empty */}

      <Button onClick={() => onMove(-1, 0)} className="text-2xl p-2 h-14 w-14 flex items-center justify-center">←</Button>
      <div className="h-14 w-14"></div> {/* Center empty or reset button */}
      <Button onClick={() => onMove(1, 0)} className="text-2xl p-2 h-14 w-14 flex items-center justify-center">→</Button>

      <div></div> {/* Bottom-left empty */}
      <Button onClick={() => onMove(0, 1)} className="text-2xl p-2 h-14 w-14 flex items-center justify-center">↓</Button>
      <div></div> {/* Bottom-right empty */}
    </div>
  );
};

export default DPad;
