import { FC, ReactNode, useState } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-xs">
            {content}
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface HelpButtonProps {
  content: string | ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const HelpButton: FC<HelpButtonProps> = ({ content, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  return (
    <Tooltip content={content}>
      <button
        type="button"
        className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors cursor-help`}
      >
        ?
      </button>
    </Tooltip>
  );
};

