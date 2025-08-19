import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import { XIcon } from './icons';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, '_id'> | Category) => Promise<void>;
  category: Category | null;
}

type FormErrors = {
  [key in keyof Omit<Category, '_id' | 'productCount'>]?: string;
};

const useFocusTrap = (ref: React.RefObject<HTMLElement>, isOpen: boolean) => {
    useEffect(() => {
        if (!isOpen || !ref.current) return;

        const focusableElements = ref.current.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !document.activeElement) return;

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
        firstElement?.focus();
        ref.current.addEventListener('keydown', handleKeyDown);

        return () => { ref.current?.removeEventListener('keydown', handleKeyDown); };
    }, [isOpen, ref]);
};

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const initialState = { name: '', description: '', imageUrl: '' };
  
  const getInitialState = () => category ? { name: category.name, description: category.description, imageUrl: category.imageUrl } : initialState;

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.imageUrl.trim()) {
        newErrors.imageUrl = 'Image URL is required.';
    } else {
        try { new URL(formData.imageUrl); } catch (_) { newErrors.imageUrl = 'Please enter a valid URL.'; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    const categoryToSave = {
      ...(category ? { _id: category._id } : {}),
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
    };
    
    try {
        await onSave(categoryToSave as Category);
    } catch (e) {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 id="modal-title" className="text-2xl font-bold mb-6 text-gray-800">{category ? 'Edit Category' : 'Add Category'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Lifestyle Accessories" className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Enter a short description for the category" className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!errors.description} />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input id="imageUrl" type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.png" className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.imageUrl ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!errors.imageUrl} />
            {errors.imageUrl && <p className="text-red-600 text-sm mt-1">{errors.imageUrl}</p>}
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-white bg-[#2D7A79] hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;