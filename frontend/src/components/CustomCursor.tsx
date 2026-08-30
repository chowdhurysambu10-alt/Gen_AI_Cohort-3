'use client';

import React, { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run on devices with fine pointer (mouse)
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, textarea, [role="button"], .cursor-pointer');
        setIsHovering(Boolean(interactive));
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth trailing loop for ring
    const animateRing = () => {
      const ease = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      reqRef.current = requestAnimationFrame(animateRing);
    };

    reqRef.current = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <>
      {/* Precision Center Dot */}
      <div
        ref={cursorDotRef}
        aria-hidden="true"
        style={{ willChange: 'transform' }}
        className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 pointer-events-none z-[9999] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${isHovering ? 'scale-150 bg-purple-500 shadow-glow-primary' : ''}`}
      />

      {/* Smooth Trailing Glow Ring */}
      <div
        ref={cursorRingRef}
        aria-hidden="true"
        style={{ willChange: 'transform' }}
        className={`fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-full border border-indigo-500/50 dark:border-indigo-400/50 pointer-events-none z-[9998] transition-[width,height,opacity,background-color,border-color] duration-200 ease-out backdrop-blur-[0.5px] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${
          isHovering
            ? 'w-12 h-12 -ml-6 -mt-6 bg-indigo-500/10 dark:bg-indigo-400/15 border-indigo-500 dark:border-indigo-400'
            : ''
        } ${isClicking ? 'scale-90 bg-indigo-500/20' : ''}`}
      />
    </>
  );
}
