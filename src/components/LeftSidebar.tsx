import { useGoalStore } from '../store/goalStore';

export function LeftSidebar() {
  const { addGoal, selectGoal, loadGoals } = useGoalStore();

  const handleNewGoal = async () => {
    const goalId = await addGoal('新目标');
    selectGoal(goalId);
  };

  return (
    <div className="w-[220px] h-full bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col">
      {/* Top Bar - 为 macOS 红绿灯按钮留出空间 */}
      <div className="h-10 flex items-center px-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        {/* 空白区域，用于拖拽 */}
      </div>

      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">默认名称</div>
            <div className="text-xs text-gray-500">本地</div>
          </div>
        </div>
      </div>

      {/* New Goal Button */}
      <div className="p-3">
        <button
          onClick={handleNewGoal}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-gray-900/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新目标
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        <NavItem icon="timeline" label="时间线" />
        <NavItem icon="draft" label="草稿箱" />
        <NavItem icon="all" label="全部目标" />
        
        <div className="pt-4 pb-2 px-3">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">收藏</div>
        </div>
        
        <NavItem icon="short" label="短期" hasSubmenu />
        <NavItem icon="medium" label="中期" hasSubmenu />
        <NavItem icon="long" label="长期" hasSubmenu />
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200/50">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          搜索
          <span className="ml-auto text-xs text-gray-400">⌘K</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, hasSubmenu }: { icon: string; label: string; hasSubmenu?: boolean }) {
  const icons: Record<string, JSX.Element> = {
    timeline: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    draft: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    all: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    short: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    medium: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    long: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 rounded-lg transition-all duration-200 text-sm">
      {icons[icon]}
      <span className="flex-1 text-left">{label}</span>
      {hasSubmenu && (
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}
