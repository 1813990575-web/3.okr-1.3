// SidebarActionButton.tsx - 侧边栏底部新建目标按钮
// Apple 风格设计：低调背景、圆角矩形、呼吸感

import type { JSX } from 'react';
import { motion } from 'framer-motion';

interface SidebarActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SidebarActionButton({ onClick, disabled = false }: SidebarActionButtonProps): JSX.Element {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center gap-2
        py-3 px-4 rounded-xl
        bg-gray-100/50 hover:bg-gray-200/80
        text-stone-600 hover:text-stone-800
        text-sm font-medium
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        border border-stone-200/50
        shadow-sm hover:shadow-md
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Plus Icon */}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span>新建目标</span>
    </motion.button>
  );
}
