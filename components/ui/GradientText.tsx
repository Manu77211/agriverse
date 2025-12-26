'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: 'green' | 'orange' | 'blue' | 'rainbow';
}

export function GradientText({ children, className = '', gradient = 'green' }: GradientTextProps) {
  const gradients = {
    green: 'from-green-400 via-emerald-500 to-teal-500',
    orange: 'from-orange-400 via-amber-500 to-yellow-500',
    blue: 'from-blue-400 via-cyan-500 to-teal-500',
    rainbow: 'from-pink-500 via-purple-500 to-indigo-500',
  };

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-r ${gradients[gradient]} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </motion.span>
  );
}

interface AnimatedHeadingProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedHeading({ children, className = '', delay = 0 }: AnimatedHeadingProps) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.h1>
  );
}

export function AnimatedParagraph({ children, className = '', delay = 0 }: AnimatedHeadingProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.p>
  );
}
