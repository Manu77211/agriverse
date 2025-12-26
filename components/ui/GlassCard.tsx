'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function GlassCard({ children, className = '', delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -8, scale: 1.02 } : undefined}
      className={`
        relative overflow-hidden
        bg-white/10 backdrop-blur-xl
        border border-white/20
        rounded-2xl shadow-2xl
        ${hover ? 'cursor-pointer transition-shadow duration-300 hover:shadow-green-500/20' : ''}
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function GlassCardSolid({ children, className = '', delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -5, scale: 1.01 } : undefined}
      className={`
        relative overflow-hidden
        bg-white/90 backdrop-blur-xl
        border border-gray-200/50
        rounded-2xl shadow-xl
        ${hover ? 'cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10' : ''}
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
