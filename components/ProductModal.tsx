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
  category?: string;
  price?: string;
  stock?: string;
  imageUrls?: string;
  specifications?: string;
  description?: string;
  subHeading?: string;
};

// Define InputField and TextareaField outside of the ProductModal component
const InputField: React.FC<{name: 'name' | 'price' | 'stock', label: string, type?: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string}> = ({name, label, type='text', value, onChange, error}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={`Enter ${label.toLowerCase()}`} min="0" step={type === 'number' ? "0.01" : undefined} className={`w-full p-3 border rounded-lg focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!error} />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
);

const TextareaField: React.FC<{name: 'description' | 'subHeading', label: string, rows?: number, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, error?: string}> = ({name, label, rows=3, value, onChange, error}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={`Enter ${label.toLowerCase()}`} rows={rows} className={`w-full p-3 border rounded-lg focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D7A79]'}`} aria-invalid={!!error}></textarea>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
);


const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, categories }) => {
    const newProductInitialState = { name: '', category: '', price: '', stock: '', imageUrls: [] as string[], specifications: [] as { key: string; value: string; }[], description: '', subHeading: '' };

  const getInitialState = () => product
    ? { name: product.name, category: product.category, price: String(product.price), stock: String(product.stock), imageUrls: product.imageUrls || [], specifications: product.specifications || [], description: product.description || '', subHeading: product.subHeading || '' }
    : newProductInitialState;

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [specError, setSpecError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setErrors({});
      setIsSubmitting(false);
      setNewSpecKey('');
      setNewSpecValue('');
      setSpecError(null);
      setImageUrlError(null);
      setSubmissionError(null);
    }
  }, [isOpen, product?._id]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setImageUrlError(null);

    Array.from(fileList).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        setImageUrlError('Only image files are allowed.');
        return;
      }

      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result) return;

        const base64String = event.target.result as string;

        if (!formData.imageUrls.includes(base64String)) {
          setFormData(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, base64String]
          }));
        } else {
          setImageUrlError('This image has already been added.');
        }
      };

      reader.onerror = () => {
        setImageUrlError('Failed to read the image file.');
      };

      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = '';
    }
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
    if (!formData.category) newErrors.category = 'Category is required.';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = 'Please enter a valid price.';
    if (!formData.stock || isNaN(Number(formData.stock)) || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) newErrors.stock = 'Please enter a valid stock amount.';
    if (formData.specifications.length === 0) newErrors.specifications = 'At least one specification is required.';
    if (!formData.description.trim()) newErrors.description = 'Product description is required.';
    if (!formData.subHeading.trim()) newErrors.subHeading = 'Product sub heading is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const isValid = validate();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productToSave = {
        ...(product ? { _id: product._id } : {}),
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrls: formData.imageUrls,
        specifications: formData.specifications,
        description: formData.description.trim(),
        subHeading: formData.subHeading.trim(),
      };

      await onSave(productToSave as Product);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmissionError('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 id="modal-title" className="text-2xl font-bold mb-6 text-gray-800">{product ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField name="name" label="Product Name" value={formData.name} onChange={handleChange} error={errors.name} />
          <TextareaField name="subHeading" label="Sub Heading" rows={2} value={formData.subHeading} onChange={handleChange} error={errors.subHeading} />
          <TextareaField name="description" label="Description" value={formData.description} onChange={handleChange} error={errors.description}/>

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
            {errors.specifications && <p className="text-red-600 text-sm mt-1">{errors.specifications}</p>}
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
            <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <input
                id="imageUpload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFileChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#2D7A79] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2D7A79] file:text-white hover:file:bg-opacity-90"
            />
            {imageUrlError && <p className="text-red-600 text-sm mt-1">{imageUrlError}</p>}

            {formData.imageUrls.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Images: ({formData.imageUrls.length})</h4>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                        {formData.imageUrls.map((imageUrl, index) => (
                            <div key={index} className="relative group w-full h-24 bg-gray-200 rounded-md overflow-hidden">
                                <img src={imageUrl} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(imageUrl)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove image"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

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
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField name="price" label="Price" type="number" value={formData.price} onChange={handleChange} error={errors.price} />
              <InputField name="stock" label="Stock" type="number" value={formData.stock} onChange={handleChange} error={errors.stock} />
          </div>
            {submissionError && <p className="text-red-600 text-sm mt-2 text-center">{submissionError}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 ${isSubmitting ? 'bg-gray-400' : 'bg-[#2D7A79] hover:bg-opacity-90'} text-white font-semibold rounded-lg transition-colors`}
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;