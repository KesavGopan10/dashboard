import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full animate-pulse bg-[#2D7A79]"></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-[#2D7A79]" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-[#2D7A79]" style={{ animationDelay: '0.4s' }}></div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
