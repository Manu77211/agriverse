'use client';

import { motion } from 'framer-motion';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  delay?: number;
}

export function StepCard({ step, title, description, delay = 0 }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative flex gap-6"
    >
      {/* Step number */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/30"
      >
        {step}
      </motion.div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Connecting line */}
      {step < 4 && (
        <div className="absolute left-7 top-14 w-0.5 h-full bg-gradient-to-b from-green-400 to-transparent" />
      )}
    </motion.div>
  );
}
