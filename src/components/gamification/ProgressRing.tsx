import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  gradientColors?: string[];
  animated?: boolean;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  gradientColors = ['hsl(var(--primary))', 'hsl(var(--primary-glow))'],
  animated = true,
  showPercentage = true,
  children
}) => {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <motion.circle
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          className="drop-shadow-lg"
        />
        
        {/* Glow effect */}
        <motion.circle
          stroke={gradientColors[0]}
          fill="transparent"
          strokeWidth={strokeWidth + 2}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          opacity={0.3}
          className="blur-sm"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-foreground">
              {Math.round(progress)}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};