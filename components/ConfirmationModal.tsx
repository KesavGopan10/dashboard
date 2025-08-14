import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'destructive';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, children, variant = 'destructive' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) { // Shift+Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    firstElement?.focus();
    modalRef.current.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
        modalRef.current?.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmButtonClass = variant === 'destructive' 
    ? "bg-red-600 hover:bg-red-700" 
    : "bg-[#2D7A79] hover:bg-opacity-90";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 id="confirmation-title" className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {children && <div className="mb-6">{children}</div>}
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-6 py-2 rounded-lg text-white font-semibold ${confirmButtonClass}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;