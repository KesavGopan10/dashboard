import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../types';
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
  onSave: (product: Omit<Product, '_id'> | Product) => Promise<void>;
  product: Product | null;
  categories: Category[];
}

type FormErrors = {
  name?: string;
  categoryId?: string;
  price?: string;
  stock?: string;
  imageUrls?: string;
  specifications?: string;
  description?: string;
  subHeading?: string;
};

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, categories }) => {
    const newProductInitialState = { name: '', categoryId: '', price: '', stock: '', imageUrls: [] as string[], specifications: [] as { key: string; value: string; }[], description: '', subHeading: '' };
  
  const getInitialState = () => product 
    ? { name: product.name, categoryId: String(product.categoryId), price: String(product.price), stock: String(product.stock), imageUrls: product.imageUrls || [], specifications: product.specifications || [], description: product.description || '', subHeading: product.subHeading || '' }
    : newProductInitialState;

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [specError, setSpecError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setErrors({});
      setIsSubmitting(false);
      setCurrentImageUrl('');
      setImageUrlError(null);
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

  const handleAddImage = () => {
    if (!currentImageUrl.trim()) {
        setImageUrlError('URL cannot be empty.');
        return;
    }
    try {
        new URL(currentImageUrl);
    } catch (_) {
        setImageUrlError('Please enter a valid URL.');
        return;
    }
    if (formData.imageUrls.includes(currentImageUrl)) {
        setImageUrlError('This image URL has already been added.');
        return;
    }

    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, currentImageUrl.trim()] }));
    setCurrentImageUrl('');
    setImageUrlError(null);
};

const handleRemoveImage = (urlToRemove: string) => {
    setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
    }));
};

const handleAddSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
        setSpecError('Key and Value cannot be empty.');
        return;
    }
    setFormData(prev => ({
        ...prev,
        specifications: [...prev.specifications, { key: newSpecKey.trim(), value: newSpecValue.trim() }]
    }));
    setNewSpecKey('');
    setNewSpecValue('');
    setSpecError(null);
};

const handleRemoveSpecification = (indexToRemove: number) => {
    setFormData(prev => ({
        ...prev,
        specifications: prev.specifications.filter((_, index) => index !== indexToRemove)
    }));
};

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required.';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required.';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = 'Please enter a valid price.';
    if (!formData.stock || isNaN(Number(formData.stock)) || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) newErrors.stock = 'Please enter a valid stock amount.';
    if (formData.specifications.length === 0) newErrors.specifications = 'At least one specification is required.';
    if (!formData.description.trim()) newErrors.description = 'Product description is required.';
    if (!formData.subHeading.trim()) newErrors.subHeading = 'Product sub heading is required.';
    
    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    const isValid = validate();
    console.log('Validation result:', isValid);
    if (!isValid) return;
    
    console.log('formData before saving:', formData);
    setIsSubmitting(true);
    const productToSave = {
      ...(product ? { _id: product._id } : {}),
      name: formData.name,
      categoryId: formData.categoryId,
      price: Number(formData.price),
      stock: Number(formData.stock),
      imageUrls: formData.imageUrls,
      specifications: formData.specifications,
      description: formData.description,
      subHeading: formData.subHeading,
    };
    
    try {
        console.log('Calling onSave with product:', productToSave);
        await onSave(productToSave as Product);
        setIsSubmitting(false);
    } catch(e) {
        console.error('Error during onSave:', e);
        setIsSubmitting(false);
    }
  };

  const InputField: React.FC<{name: 'name' | 'price' | 'stock', label: string, type?: string}> = ({name, label, type='text'}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={name} type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} min="0" step={type === 'number' ? "0.01" : undefined} className={`w-full p-3 border rounded-lg focus:ring-2 ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!errors[name]} />
      {errors[name] && <p className="text-red-600 text-sm mt-1">{errors[name]}</p>}
    </div>
  );

  const TextareaField: React.FC<{name: 'description' | 'subHeading', label: string, rows?: number}> = ({name, label, rows=3}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea id={name} name={name} value={formData[name]} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} rows={rows} className={`w-full p-3 border rounded-lg focus:ring-2 ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!errors[name]}></textarea>
      {errors[name] && <p className="text-red-600 text-sm mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 id="modal-title" className="text-2xl font-bold mb-6 text-gray-800">{product ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField name="name" label="Product Name" />
          <TextareaField name="subHeading" label="Sub Heading" rows={2} />
          <TextareaField name="description" label="Description" />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
            <div className="flex items-start gap-2 mb-2">
                <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => { setNewSpecKey(e.target.value); setSpecError(null); }}
                    placeholder="Key (e.g., Color)"
                    className={`w-1/2 p-3 border rounded-lg focus:ring-2 ${specError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`}
                />
                <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => { setNewSpecValue(e.target.value); setSpecError(null); }}
                    placeholder="Value (e.g., Red)"
                    className={`w-1/2 p-3 border rounded-lg focus:ring-2 ${specError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`}
                />
                <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="px-5 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 shadow-sm transition-colors flex-shrink-0"
                >
                    Add
                </button>
            </div>
            {specError && <p className="text-red-600 text-sm mt-1">{specError}</p>}
            {formData.specifications.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Specifications:</h4>
                    <ul className="max-h-32 overflow-y-auto space-y-2 rounded-lg border bg-gray-50 p-2">
                        {formData.specifications.map((spec, index) => (
                            <li key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded shadow-sm border">
                                <span className="truncate text-gray-600 flex-1 mr-2">{spec.key}: {spec.value}</span>
                                <button type="button" onClick={() => handleRemoveSpecification(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100" aria-label={`Remove ${spec.key}`}>
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
          
          <div>
            <label htmlFor="imageUrlInput" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <div className="flex items-start gap-2">
                <div className="flex-grow">
                    <input
                        id="imageUrlInput"
                        type="url"
                        value={currentImageUrl}
                        onChange={(e) => { setCurrentImageUrl(e.target.value); setImageUrlError(null); }}
                        placeholder="https://example.com/image.png"
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${imageUrlError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`}
                        aria-invalid={!!imageUrlError}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); }}}
                    />
                    {imageUrlError && <p className="text-red-600 text-sm mt-1">{imageUrlError}</p>}
                </div>
                <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-5 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 shadow-sm transition-colors flex-shrink-0"
                >
                    Add
                </button>
            </div>
            {formData.imageUrls.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Images: ({formData.imageUrls.length})</h4>
                    <ul className="max-h-32 overflow-y-auto space-y-2 rounded-lg border bg-gray-50 p-2">
                        {formData.imageUrls.map((url, index) => (
                            <li key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded shadow-sm border">
                                <span className="truncate text-gray-600 flex-1 mr-2" title={url}>{url}</span>
                                <button type="button" onClick={() => handleRemoveImage(url)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100" aria-label={`Remove ${url}`}>
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.categoryId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`}
              aria-invalid={!!errors.categoryId}
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-600 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField name="price" label="Price" type="number" />
              <InputField name="stock" label="Stock" type="number" />
          </div>

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