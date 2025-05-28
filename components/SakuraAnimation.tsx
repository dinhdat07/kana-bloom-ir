
import React, { useState, useEffect, useMemo } from 'react';
import SakuraPetal from './SakuraPetal';
// Fixed: Add PetalEventConfig and PetalDifficultyContext to imports
import { PetalEventConfig, PetalDifficultyContext } from '../types';


interface SakuraAnimationProps {
  numPetals?: number;
  // Fixed: Add petalEventConfig to props
  petalEventConfig?: PetalEventConfig | null;
  // Fixed: Add petalDifficultyContext to props
  petalDifficultyContext?: PetalDifficultyContext;
}

const SakuraAnimation: React.FC<SakuraAnimationProps> = ({ numPetals = 20, petalEventConfig, petalDifficultyContext }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const petals = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];
    // TODO: Future enhancement - use petalEventConfig and petalDifficultyContext to modify petal behavior
    return Array.from({ length: numPetals }).map((_, i) => (
      <SakuraPetal key={i} id={i} screenWidth={dimensions.width} screenHeight={dimensions.height} />
    ));
  }, [numPetals, dimensions.width, dimensions.height, petalEventConfig, petalDifficultyContext]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return null; // Don't render until dimensions are known
  }

  return <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">{petals}</div>;
};

export default SakuraAnimation;
