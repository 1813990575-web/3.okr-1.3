// ReorderableList.tsx - 基于 framer-motion 的通用排序列表组件
// 提供 Apple 风格的拖拽交互：抓取时微增阴影、背景变白，其他项自动滑开
// IxD 设计：拖拽手柄隔离，整行其余部分保持干净的点击/编辑区域

import React, { useState, useCallback } from 'react';
import { Reorder, AnimatePresence, motion, useDragControls } from 'framer-motion';

// 列表项必须实现的接口
export interface ReorderableItem {
  id: string;
}

// 组件 Props
interface ReorderableListProps<T extends ReorderableItem> {
  items: T[];
  onReorder: (newOrder: T[]) => void;
  onReorderComplete?: (newOrder: T[]) => void | Promise<void>;
  renderItem: (item: T, index: number, dragHandleProps: DragHandleProps) => React.ReactNode;
  axis?: 'y' | 'x';
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
}

// 拖拽手柄 props - 传递给 renderItem 用于隔离拖拽区域
export interface DragHandleProps {
  dragControls: ReturnType<typeof useDragControls>;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

// 列表项布局动画 - 让其他项像有『磁力』一样自动滑开
// 优化：降低 stiffness 和 damping，减少收起时的回弹拉扯
const LAYOUT_TRANSITION = {
  type: 'spring' as const,
  stiffness: 300,  // 降低弹性系数，减少回弹
  damping: 30,     // 增加阻尼，让动画更平稳
  mass: 0.5,
};

// Apple 风格阴影 - 边缘羽化、柔和
const APPLE_SHADOW = {
  normal: '0 0px 0px rgba(0, 0, 0, 0)',
  dragging: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.02)',
  whileDrag: '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.03)',
};

export function ReorderableList<T extends ReorderableItem>({
  items,
  onReorder,
  onReorderComplete,
  renderItem,
  axis = 'y',
  className = '',
  itemClassName = '',
  disabled = false,
}: ReorderableListProps<T>) {
  const [localItems, setLocalItems] = useState<T[]>(items);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // 同步外部 items 变化
  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // 处理重新排序
  const handleReorder = useCallback(
    (newOrder: T[]) => {
      setLocalItems(newOrder);
      onReorder(newOrder);
    },
    [onReorder]
  );

  // 拖拽开始
  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  // 拖拽结束
  const handleDragEnd = useCallback(async () => {
    const currentDraggingId = draggingId;
    setDraggingId(null);
    if (onReorderComplete && currentDraggingId) {
      await onReorderComplete(localItems);
    }
  }, [draggingId, localItems, onReorderComplete]);

  if (disabled) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={item.id} className={itemClassName}>
            {renderItem(item, index, {
              dragControls: {} as ReturnType<typeof useDragControls>,
              isDragging: false,
              onPointerDown: () => {},
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Reorder.Group
      axis={axis}
      values={localItems}
      onReorder={handleReorder}
      className={className}
      as="div"
    >
      {/* 移除 mode="popLayout"，使用默认同步布局，树形折叠更稳定 */}
      <AnimatePresence>
        {localItems.map((item, index) => (
          <ReorderableListItem
            key={item.id}
            item={item}
            index={index}
            isDragging={draggingId === item.id}
            onDragStart={() => handleDragStart(item.id)}
            onDragEnd={handleDragEnd}
            className={itemClassName}
          >
            {(dragHandleProps) => renderItem(item, index, dragHandleProps)}
          </ReorderableListItem>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}

// 单个可排序项组件
interface ReorderableListItemProps<T> {
  item: T;
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  className?: string;
  children: (dragHandleProps: DragHandleProps) => React.ReactNode;
}

function ReorderableListItem<T extends ReorderableItem>({
  item,
  isDragging,
  onDragStart,
  onDragEnd,
  className = '',
  children,
}: ReorderableListItemProps<T>) {
  // 使用 dragControls 实现拖拽手柄隔离
  const dragControls = useDragControls();

  // 处理指针按下 - 直接启动拖拽
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragControls.start(e);
  }, [dragControls]);

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false} // 禁用整行监听，只通过 dragControls 触发
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      as="div"
      className={`${className} overflow-hidden`}  // 添加 overflow-hidden 防止残留高度撑开父容器
      // 布局动画 - 只进行位置动画，避免尺寸变化导致文字拉扯
      layout="position"
      transition={LAYOUT_TRANSITION}
      // 初始和退出动画
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        // 拖拽时放大
        scale: isDragging ? 1.03 : 1,
        // Apple 风格：抓取瞬间微增阴影，背景稍微变白
        boxShadow: isDragging ? APPLE_SHADOW.dragging : APPLE_SHADOW.normal,
        backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
        zIndex: isDragging ? 50 : 1,
      }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}  // 缩短退出动画时间
      // 拖拽时的弹簧动画
      dragTransition={{
        bounceStiffness: 300,  // 降低弹性系数
        bounceDamping: 30,     // 增加阻尼
      }}
      // 拖拽弹性
      dragElastic={0.1}
      style={{
        position: 'relative',
        borderRadius: isDragging ? '10px' : '0px',
        // 使用 will-change 优化性能
        willChange: isDragging ? 'transform, box-shadow' : 'auto',
      }}
      whileDrag={{
        scale: 1.03,
        boxShadow: APPLE_SHADOW.whileDrag,
      }}
    >
      {children({
        dragControls,
        isDragging,
        onPointerDown: handlePointerDown,
      })}
    </Reorder.Item>
  );
}

// 拖拽手柄组件 - 六点图标
// IxD 关键：只有这个区域负责触发拖拽，整行其余部分保持干净的点击/编辑区域
interface DragHandleComponentProps {
  onPointerDown: (e: React.PointerEvent) => void;
  isDragging: boolean;
  className?: string;
}

export function DragHandle({
  onPointerDown,
  isDragging,
  className = '',
}: DragHandleComponentProps) {
  return (
    <motion.div
      className={`
        flex flex-col gap-[3px] cursor-grab active:cursor-grabbing p-1.5 rounded
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        ${isDragging ? 'opacity-100' : ''}
        ${className}
      `}
      onPointerDown={onPointerDown}
      whileTap={{ scale: 0.95 }}
    >
      {/* 六点拖拽图标 */}
      <div className="flex gap-[3px]">
        <div className="w-[3px] h-[3px] rounded-full bg-stone-300" />
        <div className="w-[3px] h-[3px] rounded-full bg-stone-300" />
      </div>
      <div className="flex gap-[3px]">
        <div className="w-[3px] h-[3px] rounded-full bg-stone-300" />
        <div className="w-[3px] h-[3px] rounded-full bg-stone-300" />
      </div>
      <div className="flex gap-[3px]">
        <div className="w-[3px] h-[3px] rounded-full bg-stone-300" />
        <div className="w-[3px] h-[3px] rounded-full bg-stone-300" />
      </div>
    </motion.div>
  );
}
