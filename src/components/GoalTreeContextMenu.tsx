// GoalTreeContextMenu.tsx - 目标树右键菜单
// game rules: 提供删除等操作选项

import { useEffect, useRef } from 'react';

interface GoalTreeContextMenuProps {
  x: number;
  y: number;
  goalId: string;
  goalTitle: string;
  onClose: () => void;
  onDelete: (goalId: string) => void;
}

export function GoalTreeContextMenu({
  x,
  y,
  goalId,
  goalTitle,
  onClose,
  onDelete,
}: GoalTreeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  // 处理删除
  const handleDelete = () => {
    if (confirm(`确定要删除 "${goalTitle}" 吗？\n注意：这将同时删除其所有子目标。`)) {
      onDelete(goalId);
    }
    onClose();
  };

  // 计算菜单位置，确保不超出视口
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-[140px]"
    >
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        删除
      </button>
    </div>
  );
}
