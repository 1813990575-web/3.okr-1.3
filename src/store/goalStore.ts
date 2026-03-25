import { create } from 'zustand';
import { db, type Goal } from '../db/schema';

interface GoalState {
  goals: Goal[];
  selectedGoalId: string | null;
  isLoading: boolean;

  // Actions
  loadGoals: () => Promise<void>;
  addGoal: (title: string, parentId?: string | null) => Promise<string>;
  splitGoal: (goalId: string) => Promise<void>;
  selectGoal: (goalId: string | null) => void;
  getGoalById: (goalId: string) => Goal | undefined;
  getChildGoals: (parentId: string | null) => Goal[];
  getSplitGoals: () => Goal[];
  updateGoalTitle: (goalId: string, newTitle: string) => Promise<void>;
  toggleGoalCompletion: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  getGoalProgress: (goalId: string) => { completed: number; total: number };
  // 时间相关
  updateGoalDates: (goalId: string, startDate: number | null, endDate: number | null) => Promise<void>;
  toggleShowDeadline: (goalId: string) => Promise<void>;
  getDeadlineStatus: (goalId: string) => { text: string; isOverdue: boolean } | null;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  selectedGoalId: null,
  isLoading: false,

  // 从数据库加载所有目标
  loadGoals: async () => {
    set({ isLoading: true });
    try {
      const goals = await db.goals.toArray();
      set({ goals, isLoading: false });
      console.log('[Store] Loaded goals:', goals.length);
    } catch (error) {
      console.error('[Store] Failed to load goals:', error);
      set({ isLoading: false });
    }
  },

  // 添加新目标
  addGoal: async (title: string, parentId: string | null = null) => {
    const now = Date.now();
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      parentId,
      isSplit: false,
      isCompleted: false,
      startDate: null,
      endDate: null,
      showDeadline: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.goals.add(newGoal);
      set((state) => ({
        goals: [...state.goals, newGoal],
      }));
      console.log('[Store] Added goal:', newGoal.id);
      return newGoal.id;
    } catch (error) {
      console.error('[Store] Failed to add goal:', error);
      throw error;
    }
  },

  // 拆分目标
  splitGoal: async (goalId: string) => {
    const { goals } = get();

    // 找到目标及其父链
    const goalToSplit = goals.find(g => g.id === goalId);
    if (!goalToSplit) {
      console.error('[Store] Goal not found:', goalId);
      return;
    }

    // 收集需要标记 isSplit 的目标（当前目标及其所有祖先）
    const goalsToUpdate = new Set<string>();
    goalsToUpdate.add(goalId);

    // 向上遍历父链
    let currentParentId = goalToSplit.parentId;
    while (currentParentId) {
      goalsToUpdate.add(currentParentId);
      const parent = goals.find(g => g.id === currentParentId);
      currentParentId = parent?.parentId || null;
    }

    try {
      // 批量更新数据库
      await db.transaction('rw', db.goals, async () => {
        for (const id of goalsToUpdate) {
          await db.goals.update(id, { isSplit: true, updatedAt: Date.now() });
        }
      });

      // 更新本地状态
      set((state) => ({
        goals: state.goals.map(g =>
          goalsToUpdate.has(g.id) ? { ...g, isSplit: true } : g
        ),
        selectedGoalId: goalId,
      }));

      console.log('[Store] Split goal:', goalId, 'Updated:', Array.from(goalsToUpdate));
    } catch (error) {
      console.error('[Store] Failed to split goal:', error);
      throw error;
    }
  },

  // 选择目标
  selectGoal: (goalId: string | null) => {
    set({ selectedGoalId: goalId });
    console.log('[Store] Selected goal:', goalId);
  },

  // 通过 ID 获取目标
  getGoalById: (goalId: string) => {
    return get().goals.find(g => g.id === goalId);
  },

  // 获取子目标
  getChildGoals: (parentId: string | null) => {
    return get().goals.filter(g => g.parentId === parentId);
  },

  // 获取所有被拆分的目标（用于中间面板）
  getSplitGoals: () => {
    return get().goals.filter(g => g.isSplit);
  },

  // 更新目标标题
  updateGoalTitle: async (goalId: string, newTitle: string) => {
    try {
      await db.goals.update(goalId, { title: newTitle, updatedAt: Date.now() });
      set((state) => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, title: newTitle } : g
        ),
      }));
      console.log('[Store] Updated goal title:', goalId, newTitle);
    } catch (error) {
      console.error('[Store] Failed to update goal title:', error);
      throw error;
    }
  },

  // 切换目标完成状态
  toggleGoalCompletion: async (goalId: string) => {
    const goal = get().getGoalById(goalId);
    if (!goal) {
      console.error('[Store] Goal not found:', goalId);
      return;
    }

    const newStatus = !goal.isCompleted;

    try {
      await db.goals.update(goalId, { isCompleted: newStatus, updatedAt: Date.now() });
      set((state) => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, isCompleted: newStatus } : g
        ),
      }));
      console.log('[Store] Toggled goal completion:', goalId, newStatus);
    } catch (error) {
      console.error('[Store] Failed to toggle goal completion:', error);
      throw error;
    }
  },

  // 删除目标及其所有子目标
  deleteGoal: async (goalId: string) => {
    const { goals } = get();

    // 收集需要删除的所有目标（包括子目标）
    const goalsToDelete = new Set<string>();

    // 递归收集子目标
    const collectChildren = (parentId: string) => {
      goalsToDelete.add(parentId);
      const children = goals.filter(g => g.parentId === parentId);
      for (const child of children) {
        collectChildren(child.id);
      }
    };

    collectChildren(goalId);

    try {
      // 批量删除数据库
      await db.transaction('rw', db.goals, async () => {
        for (const id of goalsToDelete) {
          await db.goals.delete(id);
        }
      });

      // 更新本地状态
      set((state) => ({
        goals: state.goals.filter(g => !goalsToDelete.has(g.id)),
      }));

      console.log('[Store] Deleted goal and children:', goalId, 'Count:', goalsToDelete.size);
    } catch (error) {
      console.error('[Store] Failed to delete goal:', error);
      throw error;
    }
  },

  // 获取目标进度（已完成数/总数）
  getGoalProgress: (goalId: string) => {
    const { getChildGoals } = get();
    const childGoals = getChildGoals(goalId);

    if (childGoals.length === 0) {
      return { completed: 0, total: 0 };
    }

    const completed = childGoals.filter(g => g.isCompleted).length;
    return { completed, total: childGoals.length };
  },

  // 更新目标日期
  updateGoalDates: async (goalId: string, startDate: number | null, endDate: number | null) => {
    try {
      await db.goals.update(goalId, { 
        startDate, 
        endDate, 
        updatedAt: Date.now() 
      });
      set((state) => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, startDate, endDate } : g
        ),
      }));
      console.log('[Store] Updated goal dates:', goalId, { startDate, endDate });
    } catch (error) {
      console.error('[Store] Failed to update goal dates:', error);
      throw error;
    }
  },

  // 切换显示 deadline
  toggleShowDeadline: async (goalId: string) => {
    const goal = get().getGoalById(goalId);
    if (!goal) {
      console.error('[Store] Goal not found:', goalId);
      return;
    }

    const newStatus = !goal.showDeadline;

    try {
      await db.goals.update(goalId, { showDeadline: newStatus, updatedAt: Date.now() });
      set((state) => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, showDeadline: newStatus } : g
        ),
      }));
      console.log('[Store] Toggled show deadline:', goalId, newStatus);
    } catch (error) {
      console.error('[Store] Failed to toggle show deadline:', error);
      throw error;
    }
  },

  // 获取 deadline 状态
  getDeadlineStatus: (goalId: string) => {
    const goal = get().getGoalById(goalId);
    if (!goal || !goal.endDate || !goal.showDeadline) {
      return null;
    }

    const now = Date.now();
    const endDate = goal.endDate;
    const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      return { text: `剩 ${diffDays} 天`, isOverdue: false };
    } else {
      return { text: `超 ${Math.abs(diffDays)} 天`, isOverdue: true };
    }
  },
}));
