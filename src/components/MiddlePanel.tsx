import { useState } from 'react';
import { useGoalStore } from '../store/goalStore';

interface MiddlePanelProps {
  width: number;
}

export function MiddlePanel({ width }: MiddlePanelProps) {
  const { goals, selectedGoalId, selectGoal, getSplitGoals, getChildGoals, toggleGoalCompletion, getDeadlineStatus } = useGoalStore();

  // 获取所有被拆分的目标
  const splitGoals = getSplitGoals();

  // 如果没有被拆分的目标，中间面板为空
  if (splitGoals.length === 0) {
    return null;
  }

  // 找到根级别的被拆分目标（parentId 为 null 且 isSplit 为 true）
  const rootSplitGoals = splitGoals.filter(g => g.parentId === null);

  return (
    <div 
      className="h-full bg-gray-50/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col flex-shrink-0"
      style={{ width }}
    >
      {/* Top Bar - 上方条，与左侧对齐 */}
      <div className="h-10 border-b border-gray-200/50 flex items-center px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        {/* 预留空间，后续可添加按钮 */}
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {rootSplitGoals.map(goal => (
          <GoalTreeNode
            key={goal.id}
            goal={goal}
            selectedGoalId={selectedGoalId}
            onSelect={selectGoal}
            onToggleComplete={toggleGoalCompletion}
            getDeadlineStatus={getDeadlineStatus}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}

interface GoalTreeNodeProps {
  goal: { id: string; title: string; parentId: string | null; isSplit: boolean; isCompleted: boolean };
  selectedGoalId: string | null;
  onSelect: (goalId: string) => void;
  onToggleComplete: (goalId: string) => void;
  getDeadlineStatus: (goalId: string) => { text: string; isOverdue: boolean } | null;
  depth: number;
}

function GoalTreeNode({ goal, selectedGoalId, onSelect, onToggleComplete, getDeadlineStatus, depth }: GoalTreeNodeProps) {
  const { getChildGoals } = useGoalStore();
  const childGoals = getChildGoals(goal.id);
  const isSelected = selectedGoalId === goal.id;
  const deadlineStatus = getDeadlineStatus(goal.id);
  
  // 本地状态：控制展开/折叠
  const [isExpanded, setIsExpanded] = useState(true);

  // 是否有子目标
  const hasChildren = childGoals.length > 0;

  // 切换展开/折叠状态
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // 切换完成状态
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(goal.id);
  };

  return (
    <div>
      <div
        className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors duration-200 cursor-pointer ${
          isSelected
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100/50'
        }`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
        onClick={() => onSelect(goal.id)}
      >
        {/* Expand/Collapse indicator - 可点击 */}
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg 
              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Checkbox - 灰色勾选框 */}
        <button
          onClick={handleToggleComplete}
          className={`w-4 h-4 rounded-full border-2 transition-colors flex-shrink-0 flex items-center justify-center ${
            goal.isCompleted
              ? 'bg-gray-300 border-gray-300'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {goal.isCompleted && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Goal title - 灰色文字 */}
        <span className={`text-sm truncate ${isSelected ? 'font-medium' : ''} ${goal.isCompleted ? 'text-gray-400 line-through' : ''}`}>
          {goal.title}
        </span>

        {/* Deadline Tag - 红色半透明标签 */}
        {deadlineStatus && (
          <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
            deadlineStatus.isOverdue 
              ? 'bg-red-100 text-red-600' 
              : 'bg-red-50 text-red-500'
          }`}>
            {deadlineStatus.text}
          </span>
        )}
      </div>

      {/* Render children if expanded */}
      {isExpanded && hasChildren && childGoals.map(child => (
        <GoalTreeNode
          key={child.id}
          goal={child}
          selectedGoalId={selectedGoalId}
          onSelect={onSelect}
          onToggleComplete={onToggleComplete}
          getDeadlineStatus={getDeadlineStatus}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
