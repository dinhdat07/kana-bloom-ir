
import React, { useEffect, useState, useMemo } from 'react';
import { UI_COLORS } from '../uiConstants'; // Updated import

interface SakuraPetalProps {
  id: number;
  screenWidth: number;
  screenHeight: number;
}

const SakuraPetal = ({ id, screenWidth, screenHeight }: SakuraPetalProps): JSX.Element => {
  const [size, setSize] = useState(() => {
    const width = Math.random() * 12 + 9; // width between 9px and 21px (slightly larger avg)
    return { 
      width, 
      height: width * (Math.random() * 0.25 + 0.55) // height 0.55 to 0.8 of width (slightly plumper)
    };
  });

  const fallSpeed = useMemo(() => Math.random() * 1.2 + 0.6, []); 
  const rotationSpeed = useMemo(() => (Math.random() - 0.5) * 2.5, []); 
  const initialSwayPhase = useMemo(() => Math.random() * Math.PI * 2, []);
  const swayAmplitude = useMemo(() => (Math.random() * 18 + 12) * (size.width / 15), [size.width]); 
  const swayFrequency = useMemo(() => (Math.random() * 0.016 + 0.006) / fallSpeed, [fallSpeed]);

  const [position, setPosition] = useState(() => {
    const randomInitialProgress = Math.random(); 
    const effectiveFallDistance = screenHeight + size.height * 3; 
    const initialTop = (randomInitialProgress * effectiveFallDistance) - (size.height * 2); 
    const timeToFallOneScreenHeight = screenHeight / fallSpeed; 
    const simulatedFramesFallen = randomInitialProgress * timeToFallOneScreenHeight * 1.5; 
    const initialRotation = (Math.random() * 360 + simulatedFramesFallen * rotationSpeed) % 360;
    const initialBaseLeft = Math.random() * screenWidth;
    const initialSwayOffset = swayAmplitude * Math.sin(initialTop * swayFrequency + initialSwayPhase);

    return {
      top: initialTop,
      left: initialBaseLeft + initialSwayOffset,
      baseLeft: initialBaseLeft,
      rotation: initialRotation,
    };
  });

  useEffect(() => {
    if (screenWidth === 0 || screenHeight === 0) return; 

    let animationFrameId: number;
    
    const animate = () => {
      setPosition(prev => {
        const newTop = prev.top + fallSpeed;
        const swayOffset = swayAmplitude * Math.sin(newTop * swayFrequency + initialSwayPhase);
        const currentLeft = prev.baseLeft + swayOffset;

        if (newTop > screenHeight + size.height) {
          const newWidth = Math.random() * 12 + 9;
          const newHeight = newWidth * (Math.random() * 0.25 + 0.55);
          setSize({ width: newWidth, height: newHeight }); 

          const newBaseLeft = Math.random() * screenWidth;
          return {
            top: -newHeight * 2, 
            left: newBaseLeft + (swayAmplitude * Math.sin((-newHeight * 2) * swayFrequency + initialSwayPhase)),
            baseLeft: newBaseLeft,
            rotation: Math.random() * 360,
          };
        }

        return {
          ...prev,
          top: newTop,
          left: currentLeft,
          rotation: (prev.rotation + rotationSpeed) % 360,
        };
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [screenWidth, screenHeight, fallSpeed, rotationSpeed, initialSwayPhase, swayAmplitude, swayFrequency, size.height]); 

  const gradientId = `petalGradient-${id}`;

  return (
    <div
      className={`absolute pointer-events-none`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: `rotate(${position.rotation}deg) translateZ(0)`, 
        opacity: 0.8, // Slightly more opaque for better visibility
        willChange: 'transform, opacity', 
      }}
    >
      <svg
        width={size.width}
        height={size.height}
        viewBox="0 0 100 100"
        style={{
          filter: `drop-shadow(0 0 4px ${UI_COLORS.petalGlow})`, // Slightly stronger glow
          overflow: 'visible', 
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: UI_COLORS.petalHighlight, stopOpacity: 1 }} /> 
            <stop offset="60%" style={{ stopColor: UI_COLORS.petalFill, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255, 160, 173, 0.85)', stopOpacity: 1 }} />{/* Richer shadow tone */}
          </linearGradient>
        </defs>
        <path
           d="M50 0 C10 25, 10 70, 50 100 C90 70, 90 25, 50 0 M45 5 Q50 15 55 5 Z"
           fill={`url(#${gradientId})`}
        />
      </svg>
    </div>
  );
};

export default SakuraPetal;
