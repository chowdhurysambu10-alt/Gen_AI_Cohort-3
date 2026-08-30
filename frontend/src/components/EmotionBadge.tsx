'use client';

import React from 'react';
import { EmotionType } from '../types';
import { getEmotionConfig } from '../utils/formatters';

interface EmotionBadgeProps {
  emotion: EmotionType | string | null | undefined;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function EmotionBadge({
  emotion,
  size = 'sm',
  showLabel = true,
  className = '',
}: EmotionBadgeProps) {
  if (!emotion) return null;

  const config = getEmotionConfig(emotion);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-soft-xs transition-transform duration-150 hover:scale-105 ${
        config.badgeClass
      } ${sizeClasses[size]} ${className}`}
      title={`Detected Emotion: ${config.label}`}
    >
      <span className="leading-none">{config.emoji}</span>
      {showLabel && <span className="leading-none font-semibold">{config.label}</span>}
    </span>
  );
}
