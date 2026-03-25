import { useState } from 'react';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    if (window.electron) {
      window.electron.send('window-minimize');
    }
  };

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.send('window-maximize');
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (window.electron) {
      window.electron.send('window-close');
    }
  };

  return (
    <div 
      className="h-10 bg-gray-100/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: Traffic Lights */}
      <div 
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group"
          title="关闭"
        >
          <svg 
            className="w-2 h-2 text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" 
            fill="currentColor" 
            viewBox="0 0 8 8"
          >
            <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center group"
          title="最小化"
        >
          <svg 
            className="w-2 h-2 text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity" 
            fill="currentColor" 
            viewBox="0 0 8 8"
          >
            <path d="M1 4h6" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center group"
          title="最大化"
        >
          <svg 
            className="w-2 h-2 text-green-800 opacity-0 group-hover:opacity-100 transition-opacity" 
            fill="currentColor" 
            viewBox="0 0 8 8"
          >
            <path d={isMaximized ? "M1 3h4v4H1z M3 1h4v4H3z" : "M1 1h6v6H1z"} stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </button>
      </div>

      {/* Center: Title (draggable area) */}
      <div className="flex-1 text-center">
        <span className="text-sm text-gray-500 font-medium">Aha OKR</span>
      </div>

      {/* Right: Empty space for balance */}
      <div className="w-16" />
    </div>
  );
}
