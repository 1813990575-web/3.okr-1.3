import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: number | null;
  endDate: number | null;
  showDeadline: boolean;
  onSave: (startDate: number | null, endDate: number | null, showDeadline: boolean) => void;
}

export function DatePicker({ isOpen, onClose, startDate, endDate, showDeadline, onSave }: DatePickerProps) {
  const [localStartDate, setLocalStartDate] = useState<string>(startDate ? dayjs(startDate).format('YYYY-MM-DD') : '');
  const [localEndDate, setLocalEndDate] = useState<string>(endDate ? dayjs(endDate).format('YYYY-MM-DD') : '');
  const [localShowDeadline, setLocalShowDeadline] = useState(showDeadline);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 同步外部状态
  useEffect(() => {
    setLocalStartDate(startDate ? dayjs(startDate).format('YYYY-MM-DD') : '');
    setLocalEndDate(endDate ? dayjs(endDate).format('YYYY-MM-DD') : '');
    setLocalShowDeadline(showDeadline);
  }, [startDate, endDate, showDeadline, isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    const start = localStartDate ? dayjs(localStartDate).startOf('day').valueOf() : null;
    const end = localEndDate ? dayjs(localEndDate).endOf('day').valueOf() : null;
    onSave(start, end, localShowDeadline);
    onClose();
  };

  // 计算天数
  const getDaysText = () => {
    if (!localStartDate || !localEndDate) return '';
    const start = dayjs(localStartDate);
    const end = dayjs(localEndDate);
    const days = end.diff(start, 'day') + 1;
    return `${days} 天`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div 
        ref={popoverRef}
        className="bg-white rounded-2xl shadow-2xl p-6 w-[360px] border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">设置执行时间</h3>

        {/* 开始日期 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">开始日期</label>
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 截止日期 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">截止日期</label>
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {localStartDate && localEndDate && (
            <p className="text-xs text-gray-500 mt-1">共 {getDaysText()}</p>
          )}
        </div>

        {/* 显示 Deadline 开关 */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <span className="text-sm text-gray-700">显示 Deadline</span>
          <button
            onClick={() => setLocalShowDeadline(!localShowDeadline)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              localShowDeadline ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                localShowDeadline ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
