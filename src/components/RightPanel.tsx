import { useState, useEffect, useRef } from 'react';
import { useGoalStore } from '../store/goalStore';
import { DatePicker } from './DatePicker';
import dayjs from 'dayjs';

// 悬浮图标区域的固定宽度
const HOVER_ACTIONS_WIDTH = 'w-12';

export function RightPanel() {
  const {
    selectedGoalId,
    getGoalById,
    getChildGoals,
    addGoal,
    splitGoal,
    selectGoal,
    deleteGoal,
    updateGoalTitle,
    toggleGoalCompletion,
    getGoalProgress,
    updateGoalDates,
    toggleShowDeadline,
    getDeadlineStatus,
  } = useGoalStore();

  const selectedGoal = selectedGoalId ? getGoalById(selectedGoalId) : null;
  const childGoals = selectedGoalId ? getChildGoals(selectedGoalId) : [];
  const progress = selectedGoalId ? getGoalProgress(selectedGoalId) : { completed: 0, total: 0 };
  const deadlineStatus = selectedGoalId ? getDeadlineStatus(selectedGoalId) : null;

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [titleInput, setTitleInput] = useState(selectedGoal?.title || '');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (selectedGoal) {
      setTitleInput(selectedGoal.title);
    }
  }, [selectedGoal?.id]);

  if (!selectedGoal) {
    return (
      <div className="flex-1 h-full bg-white flex flex-col">
        <div className="h-10 border-b border-gray-200/50 flex items-center px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">选择一个目标</h3>
            <p className="text-sm text-gray-500">点击左侧"新目标"开始创建</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddChildGoal = async () => {
    if (!newGoalTitle.trim()) {
      setIsAdding(false);
      return;
    }
    await addGoal(newGoalTitle, selectedGoalId);
    setNewGoalTitle('');
  };

  const handleSplit = async (goalId: string, isAlreadySplit: boolean) => {
    if (isAlreadySplit) {
      // 已拆分目标，进入详情页（剥洋葱）
      selectGoal(goalId);
    } else {
      // 未拆分目标，执行拆分
      await splitGoal(goalId);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value);
  };

  const handleTitleBlur = () => {
    if (selectedGoalId && titleInput !== selectedGoal.title) {
      updateGoalTitle(selectedGoalId, titleInput);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleToggleCurrentGoal = () => {
    if (selectedGoalId) {
      toggleGoalCompletion(selectedGoalId);
    }
  };

  // 格式化日期显示
  const getDateDisplayText = () => {
    if (!selectedGoal.startDate || !selectedGoal.endDate) {
      return '执行时间';
    }
    const start = dayjs(selectedGoal.startDate).format('YY/MM/DD');
    const end = dayjs(selectedGoal.endDate).format('YY/MM/DD');
    const days = dayjs(selectedGoal.endDate).diff(dayjs(selectedGoal.startDate), 'day') + 1;
    return `${start} - ${end} (${days}天)`;
  };

  return (
    <div className="flex-1 h-full bg-white flex flex-col">
      {/* Top Bar */}
      <div className="h-10 border-b border-gray-200/50 flex items-center px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Checkbox - 灰色样式 */}
          <button
            onClick={handleToggleCurrentGoal}
            className={`mt-1 w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0 flex items-center justify-center ${
              selectedGoal.isCompleted
                ? 'bg-gray-300 border-gray-300'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {selectedGoal.isCompleted && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            {/* Deadline Tag + Title */}
            <div className="flex items-center gap-3">
              {/* Deadline Tag - 红色半透明，移到标题前方 */}
              {deadlineStatus && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                  deadlineStatus.isOverdue 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-red-50 text-red-500'
                }`}>
                  {deadlineStatus.text}
                </span>
              )}
              <input
                type="text"
                value={titleInput}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className={`flex-1 text-2xl font-semibold bg-transparent border-none outline-none placeholder-gray-300 ${
                  selectedGoal.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}
                placeholder="目标标题"
              />
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-4 mt-3">
              {progress.total > 0 && (
                <span className="text-sm text-gray-500">
                  {progress.completed}/{progress.total}
                </span>
              )}
              {/* 执行时间按钮 */}
              <button 
                onClick={() => setIsDatePickerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {getDateDisplayText()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Child Goals List - 移除空状态占位提示 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {childGoals.length > 0 && (
          <div className="flex flex-col items-start space-y-1">
            {childGoals.map((child) => (
              <ChildGoalItem
                key={child.id}
                goal={child}
                onSplit={() => handleSplit(child.id, child.isSplit)}
                onToggleComplete={() => toggleGoalCompletion(child.id)}
                onUpdateTitle={(newTitle) => {
                  if (newTitle !== child.title) {
                    updateGoalTitle(child.id, newTitle);
                  }
                }}
                onDelete={() => deleteGoal(child.id)}
              />
            ))}
          </div>
        )}

        {/* Add Child Goal - 紧跟在上方区域下方 */}
        {isAdding ? (
          <div className="mt-6 flex items-center w-full">
            <div className={`${HOVER_ACTIONS_WIDTH} flex-shrink-0`} />
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddChildGoal();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewGoalTitle('');
                }
              }}
              onBlur={() => {
                if (!newGoalTitle.trim()) {
                  setIsAdding(false);
                } else {
                  handleAddChildGoal();
                }
              }}
              placeholder="输入子目标名称..."
              className="ml-3 flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 min-w-0"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加子目标
          </button>
        )}
      </div>

      {/* Date Picker Modal */}
      <DatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        startDate={selectedGoal.startDate}
        endDate={selectedGoal.endDate}
        showDeadline={selectedGoal.showDeadline}
        onSave={(start, end, show) => {
          if (selectedGoalId) {
            updateGoalDates(selectedGoalId, start, end);
            if (show !== selectedGoal.showDeadline) {
              toggleShowDeadline(selectedGoalId);
            }
          }
        }}
      />
    </div>
  );
}

interface ChildGoalItemProps {
  goal: { id: string; title: string; isSplit: boolean; isCompleted: boolean };
  onSplit: () => void;
  onToggleComplete: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onDelete?: () => void;
}

function ChildGoalItem({ goal, onSplit, onToggleComplete, onUpdateTitle, onDelete }: ChildGoalItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const handleRowClick = () => {
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editTitle.trim() && editTitle !== goal.title) {
      onUpdateTitle(editTitle);
    } else {
      setEditTitle(goal.title);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditTitle(goal.title);
    setIsEditing(false);
  };

  return (
    <div
      className="group relative flex items-center w-full py-2 hover:bg-gray-50 rounded-lg transition-colors pl-12 pr-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Actions - 绝对定位在左侧 padding 区域 */}
      <div className="absolute left-2 flex items-center gap-x-3">
        {isHovered && (
          <>
            {/* Grip/Drag Icon - 竖向六个点 (2列3行) */}
            <button
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              title="拖拽排序"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3 h-3.5" fill="currentColor" viewBox="0 0 8 12">
                <circle cx="2.5" cy="2" r="1" />
                <circle cx="5.5" cy="2" r="1" />
                <circle cx="2.5" cy="6" r="1" />
                <circle cx="5.5" cy="6" r="1" />
                <circle cx="2.5" cy="10" r="1" />
                <circle cx="5.5" cy="10" r="1" />
              </svg>
            </button>
            {/* Split Icon - 始终显示，无论是否已拆分 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSplit();
              }}
              className={`w-4 h-4 flex items-center justify-center transition-colors ${
                goal.isSplit ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400 hover:text-blue-600'
              }`}
              title={goal.isSplit ? '进入详情' : '拆分目标'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Checkbox - 灰色样式 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className={`w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0 flex items-center justify-center ${
          goal.isCompleted
            ? 'bg-gray-300 border-gray-300'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {goal.isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title - 灰色文字 */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
          }}
          className="ml-3 flex-1 text-sm text-gray-700 bg-transparent border-none outline-none min-w-0"
        />
      ) : (
        <span
          className={`ml-3 flex-1 text-sm cursor-text text-left ${
            goal.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
          }`}
          onClick={handleRowClick}
        >
          {goal.title}
        </span>
      )}

      {/* Split indicator */}
      {goal.isSplit && (
        <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded flex-shrink-0 ml-2">
          已拆分
        </span>
      )}

      {/* More Actions - 三个点图标 */}
      <div className="relative ml-2" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMoreMenu(!showMoreMenu);
          }}
          className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
            isHovered || showMoreMenu
              ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
              : 'text-transparent'
          }`}
          title="更多操作"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMoreMenu && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(false);
                // TODO: 执行时间
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              执行时间
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(false);
                // TODO: 专注
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              专注
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(false);
                onDelete?.();
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
