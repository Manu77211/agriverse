'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  loading?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  loading = false,
}: AnimatedButtonProps) {
  const baseStyles = `
    relative overflow-hidden font-semibold rounded-xl
    transition-all duration-300 ease-out
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500
      text-white shadow-lg shadow-green-500/30
      hover:shadow-xl hover:shadow-green-500/40
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-400 before:via-emerald-400 before:to-teal-400
      before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
    `,
    secondary: `
      bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500
      text-white shadow-lg shadow-orange-500/30
      hover:shadow-xl hover:shadow-orange-500/40
    `,
    outline: `
      bg-transparent border-2 border-green-500 text-green-600
      hover:bg-green-500 hover:text-white
    `,
    ghost: `
      bg-white/10 backdrop-blur-sm text-white border border-white/20
      hover:bg-white/20
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {loading && (
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {children}
      </span>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.button>
  );
}
