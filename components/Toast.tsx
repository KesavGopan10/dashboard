import React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-[#2D7A79] text-white py-3 px-6 rounded-lg shadow-lg z-50 animate-fade-in-out">
      {message}
    </div>
  );
};

const styles = `
  @keyframes fade-in-out {
    0% { opacity: 0; transform: translateY(20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(20px); }
  }
  .animate-fade-in-out {
    animation: fade-in-out 3s ease-in-out forwards;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default Toast;
