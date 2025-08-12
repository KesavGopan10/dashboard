import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCategory } from '../types';
import { XIcon } from './icons';

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

        return () => {
            ref.current?.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, ref]);
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => Promise<void>;
  product: Product | null;
}

type FormErrors = {
  [key in keyof Omit<Product, 'id' | 'category'>]?: string;
} & { category?: string };

const categories: ProductCategory[] = ['Electronics', 'Furniture', 'Kitchenware', 'Accessories', 'Cosmetics', 'Apparel', 'Books', 'General'];


const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const newProductInitialState = { name: '', category: '', price: '', stock: '', sold: '' };
  
  const getInitialState = () => product 
    ? { name: product.name, category: product.category, price: String(product.price), stock: String(product.stock), sold: String(product.sold) }
    : newProductInitialState;

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
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required.';
    if (!formData.category) newErrors.category = 'Category is required.';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = 'Please enter a valid price.';
    if (!formData.stock || isNaN(Number(formData.stock)) || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) newErrors.stock = 'Please enter a valid stock amount.';
    if (formData.sold === '' || isNaN(Number(formData.sold)) || !Number.isInteger(Number(formData.sold)) || Number(formData.sold) < 0) newErrors.sold = 'Please enter a valid sold amount.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    const productToSave = {
      ...(product ? { id: product.id } : {}),
      name: formData.name,
      category: formData.category as ProductCategory,
      price: Number(formData.price),
      stock: Number(formData.stock),
      sold: Number(formData.sold),
    };
    
    await onSave(productToSave as Product);
    // The parent will handle closing the modal on successful save.
    // We set isSubmitting to false in the useEffect cleanup when isOpen changes.
  };

  const InputField: React.FC<{name: keyof FormErrors, label: string, type?: string, required?: boolean}> = ({name, label, type='text'}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={name} type={type} name={name} value={formData[name as 'name' | 'price' | 'stock' | 'sold']} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} min="0" step={type === 'number' ? "0.01" : undefined} className={`w-full p-3 border rounded-lg focus:ring-2 ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!errors[name]} />
      {errors[name] && <p className="text-red-600 text-sm mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 id="modal-title" className="text-2xl font-bold mb-6 text-gray-800">{product ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField name="name" label="Product Name" />
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`}
              aria-invalid={!!errors.category}
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          <InputField name="price" label="Price" type="number" />
          <InputField name="stock" label="Stock" type="number" />
          <InputField name="sold" label="Sold" type="number" />

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-white bg-[#2D7A79] hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;