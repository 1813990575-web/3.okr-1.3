import Dexie from 'dexie';
import type { Table } from 'dexie';

// 目标数据接口
export interface Goal {
  id: string;
  title: string;
  parentId: string | null;
  isSplit: boolean;
  isCompleted: boolean;
  // 时间字段
  startDate: number | null;  // 开始日期 (timestamp)
  endDate: number | null;    // 截止日期 (timestamp)
  showDeadline: boolean;     // 是否显示 deadline
  createdAt: number;
  updatedAt: number;
}

// 数据库类
export class AhaOKRDatabase extends Dexie {
  goals!: Table<Goal>;

  constructor() {
    super('AhaOKRDatabase');
    
    // 版本 3：添加时间字段
    this.version(3).stores({
      goals: 'id, parentId, isSplit, isCompleted, startDate, endDate, showDeadline, createdAt, updatedAt'
    }).upgrade(tx => {
      // 升级时，为现有目标设置默认值
      return tx.table('goals').toCollection().modify(goal => {
        goal.startDate = goal.startDate || null;
        goal.endDate = goal.endDate || null;
        goal.showDeadline = goal.showDeadline || false;
      });
    });
  }
}

// 数据库实例
export const db = new AhaOKRDatabase();

// 数据库初始化函数
export async function initDatabase(): Promise<void> {
  try {
    // 检查数据库是否可访问
    await db.open();
    
    // 验证表是否存在
    if (!db.goals) {
      throw new Error('Goals table not found');
    }
    
    console.log('[Database] 数据库连接成功');
  } catch (error) {
    console.error('[Database] 数据库连接失败:', error);
    throw error;
  }
}

// 检查数据库状态
export function isDatabaseReady(): boolean {
  return db.isOpen();
}
