// GoalTreeSidebar.tsx - 目标树状侧边栏
// game rules: 支持递归渲染 OKR 层级结构，支持展开/折叠和高亮选中
// 支持两种模式：左侧边栏模式 (sidebar) 和中间面板模式 (middle)

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGoalStore } from '../store/goalStore';
import type { Goal } from '../db/schema';
import { GoalTreeContextMenu } from './GoalTreeContextMenu';

// 树节点引用映射 - 使用模块级变量确保全局唯一
const goalNodeRefs = new Map<string, HTMLDivElement>();

interface GoalTreeSidebarProps {
  mode?: 'sidebar' | 'middle';
  width?: number;
}

export function GoalTreeSidebar({ mode = 'sidebar', width }: GoalTreeSidebarProps) {
  const {
    goals,
    selectedGoalId,
    expandedGoalIds,
    getChildGoals,
    selectGoal,
    toggleExpandGoal,
    expandGoalWithParents,
    deleteGoal,
    moveGoalBefore,
  } = useGoalStore();

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    goalId: string;
    goalTitle: string;
  } | null>(null);

  // 拖拽状态
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const [dragOverGoalId, setDragOverGoalId] = useState<string | null>(null);

  // 获取根级目标（没有 parentId 的目标）
  const rootGoals = getChildGoals(null);

  // 当选中目标变化时，自动展开父节点并滚动到视图
  useEffect(() => {
    if (selectedGoalId) {
      // 展开父节点链
      expandGoalWithParents(selectedGoalId);
      
      // 延迟滚动，确保 DOM 已更新
      setTimeout(() => {
        const element = goalNodeRefs.get(selectedGoalId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [selectedGoalId, expandGoalWithParents]);

  // 关闭右键菜单
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // 根据模式选择样式
  const isMiddleMode = mode === 'middle';
  
  return (
    <div 
      className={`
        h-full flex flex-col
        ${isMiddleMode 
          ? 'bg-stone-50/50'  // 中间模式：透明背景，无边框
          : 'w-[220px] bg-[#fafaf9] border-r border-stone-200/60'  // 侧边栏模式：原有样式
        }
      `}
      style={isMiddleMode && width ? { width } : undefined}
    >
      {/* Top Bar - 独立的上方面板，用于拖拽应用 */}
      <div 
        className="h-10 bg-stone-50/80 flex items-center px-4 flex-shrink-0" 
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} 
      />

      {/* 目标树标题 - 中间模式不显示标题 */}
      {!isMiddleMode && (
        <div className="px-3 py-2 border-b border-stone-200/50">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">目标目录</h2>
        </div>
      )}

      {/* 目标树内容 */}
      <div className="flex-1 overflow-y-auto py-2">
        {rootGoals.length === 0 ? (
          <div className="px-3 py-4 text-xs text-stone-400 text-center">
            暂无目标
          </div>
        ) : (
          rootGoals.map(goal => (
            <GoalTreeNode
              key={goal.id}
              goal={goal}
              depth={0}
              selectedGoalId={selectedGoalId}
              expandedGoalIds={expandedGoalIds}
              onSelect={selectGoal}
              onToggleExpand={toggleExpandGoal}
              getChildGoals={getChildGoals}
              mode={mode}
              onContextMenu={setContextMenu}
              // 拖拽相关
              draggedGoalId={draggedGoalId}
              dragOverGoalId={dragOverGoalId}
              setDraggedGoalId={setDraggedGoalId}
              setDragOverGoalId={setDragOverGoalId}
              onMoveGoal={moveGoalBefore}
            />
          ))
        )}
      </div>

      {/* Footer - 仅在侧边栏模式显示 */}
      {!isMiddleMode && (
        <div className="p-3 border-t border-stone-200/50">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100/60 rounded-lg transition-all duration-200 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            搜索
            <span className="ml-auto text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">⌘K</span>
          </button>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <GoalTreeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          goalId={contextMenu.goalId}
          goalTitle={contextMenu.goalTitle}
          onClose={handleCloseContextMenu}
          onDelete={deleteGoal}
        />
      )}
    </div>
  );
}

// 树节点组件
interface GoalTreeNodeProps {
  goal: Goal;
  depth: number;
  selectedGoalId: string | null;
  expandedGoalIds: Set<string>;
  onSelect: (goalId: string) => void;
  onToggleExpand: (goalId: string) => void;
  getChildGoals: (parentId: string | null) => Goal[];
  mode: 'sidebar' | 'middle';
  onContextMenu: (menu: { x: number; y: number; goalId: string; goalTitle: string }) => void;
  // 拖拽相关
  draggedGoalId: string | null;
  dragOverGoalId: string | null;
  setDraggedGoalId: (id: string | null) => void;
  setDragOverGoalId: (id: string | null) => void;
  onMoveGoal: (draggedId: string, targetId: string) => Promise<void>;
}

function GoalTreeNode({
  goal,
  depth,
  selectedGoalId,
  expandedGoalIds,
  onSelect,
  onToggleExpand,
  getChildGoals,
  mode,
  onContextMenu,
  draggedGoalId,
  dragOverGoalId,
  setDraggedGoalId,
  setDragOverGoalId,
  onMoveGoal,
}: GoalTreeNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const children = getChildGoals(goal.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedGoalIds.has(goal.id);
  const isSelected = selectedGoalId === goal.id;
  const isMiddleMode = mode === 'middle';
  const isRoot = depth === 0;
  
  // 拖拽状态
  const isDragging = draggedGoalId === goal.id;
  const isDragOver = dragOverGoalId === goal.id;

  // 注册 ref - 使用唯一的 key 确保不同模式不会冲突
  useEffect(() => {
    if (nodeRef.current) {
      goalNodeRefs.set(goal.id, nodeRef.current);
    }
    return () => {
      goalNodeRefs.delete(goal.id);
    };
  }, [goal.id]);

  const handleClick = () => {
    onSelect(goal.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(goal.id);
  };

  // 处理右键点击
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu({
      x: e.clientX,
      y: e.clientY,
      goalId: goal.id,
      goalTitle: goal.title,
    });
  };

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent) => {
    setDraggedGoalId(goal.id);
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽时的透明度
    e.dataTransfer.setData('text/plain', goal.id);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedGoalId(null);
    setDragOverGoalId(null);
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // 不能拖拽到自己身上
    if (draggedGoalId && draggedGoalId !== goal.id) {
      setDragOverGoalId(goal.id);
    }
  };

  // 拖拽离开
  const handleDragLeave = () => {
    setDragOverGoalId(null);
  };

  // 放置
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId && draggedId !== goal.id) {
      await onMoveGoal(draggedId, goal.id);
    }
    
    setDraggedGoalId(null);
    setDragOverGoalId(null);
  };

  // 计算缩进 - 参考第二张图的样式
  const indentStyle = { paddingLeft: `${16 + depth * 24}px` };

  return (
    <div ref={nodeRef} id={`goal-node-${goal.id}`}>
      {/* 节点行 */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={indentStyle}
        className={`
          flex items-center gap-3 cursor-pointer
          transition-all duration-150
          ${isMiddleMode 
            ? 'py-2 pr-4'  // 中间模式：更大的 padding
            : 'py-1.5 pr-2'  // 侧边栏模式：紧凑
          }
          ${isSelected 
            ? 'bg-stone-200/70' 
            : 'hover:bg-stone-100/60'
          }
          ${isDragging ? 'opacity-50' : ''}
          ${isDragOver ? 'border-t-2 border-blue-400' : ''}
        `}
      >
        {/* 完成状态指示器 - 空心圆圈 */}
        <div
          className={`
            rounded-full flex-shrink-0 border
            ${isMiddleMode ? 'w-4 h-4' : 'w-3 h-3'}
            ${goal.isCompleted 
              ? 'bg-green-400 border-green-400' 
              : 'bg-transparent border-stone-300'
            }
          `}
        />

        {/* 标题 - 左对齐，单行省略 */}
        <span 
          className={`
            text-left flex-1 truncate whitespace-nowrap overflow-hidden
            ${isMiddleMode 
              ? isRoot 
                ? 'text-sm text-stone-800 font-medium'  // 父目标：深色
                : 'text-sm text-stone-400'              // 子任务：浅灰色
              : 'text-xs text-stone-600'
            }
            ${isSelected ? 'font-medium' : ''}
          `} 
          title={goal.title}
        >
          {goal.title}
        </span>

        {/* 展开/收起按钮 - 仅对有子目标的项目显示 */}
        {hasChildren && (
          <button
            onClick={handleToggleExpand}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-stone-200/50 transition-colors flex-shrink-0"
          >
            <svg
              className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <GoalTreeNode
              key={child.id}
              goal={child}
              depth={depth + 1}
              selectedGoalId={selectedGoalId}
              expandedGoalIds={expandedGoalIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              getChildGoals={getChildGoals}
              mode={mode}
              onContextMenu={onContextMenu}
              draggedGoalId={draggedGoalId}
              dragOverGoalId={dragOverGoalId}
              setDraggedGoalId={setDraggedGoalId}
              setDragOverGoalId={setDragOverGoalId}
              onMoveGoal={onMoveGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 导出获取节点 ref 的方法（供外部使用）
export function getGoalNodeElement(goalId: string): HTMLDivElement | undefined {
  return goalNodeRefs.get(goalId);
}
