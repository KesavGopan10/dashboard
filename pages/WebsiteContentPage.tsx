import React, { useState, useEffect, useCallback, useContext } from 'react';
import { PortfolioItem } from '../types';
import { getPortfolioItems, createPortfolioItem, deletePortfolioItem, updatePortfolioItem } from '../api/portfolioApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { AppContext } from '../contexts/AppContext';
import { DeleteIcon, EditIcon } from '../components/icons';
import ConfirmationModal from '../components/ConfirmationModal';

type Tab = 'hero' | 'gallery' | 'featured';

const WebsiteContentPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('hero');

    const TabButton: React.FC<{tabName: Tab, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-[#2D7A79] text-white'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-lg shadow-sm flex space-x-2">
                <TabButton tabName="hero" label="Hero Section" />
                <TabButton tabName="gallery" label="Gallery" />
                <TabButton tabName="featured" label="Popular Tours" />
            </div>

            <div>
                <PortfolioManager section={activeTab} />
            </div>
        </div>
    );
};

interface PortfolioManagerProps {
    section: Tab;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({ section }) => {
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<PortfolioItem | null>(null);
    const { showToast } = useContext(AppContext);

    const fetchPortfolioItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getPortfolioItems(section);
            setPortfolioItems(response.data);
        } catch (err) {
            setError(`Failed to fetch ${section} items.`);
        } finally {
            setIsLoading(false);
        }
    }, [section]);

    useEffect(() => {
        fetchPortfolioItems();
    }, [fetchPortfolioItems]);

    const handleSave = async (formData: FormData) => {
        try {
            if (itemToEdit) {
                await updatePortfolioItem(itemToEdit._id, formData);
                showToast(`${section} item updated successfully.`);
            } else {
                await createPortfolioItem(formData);
                showToast(`${section} item added successfully.`);
            }
            setIsModalOpen(false);
            setItemToEdit(null);
            fetchPortfolioItems();
        } catch (error) {
            showToast(`Failed to save ${section} item.`);
            throw error;
        }
    };
    
    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deletePortfolioItem(itemToDelete._id);
            showToast(`${section} item deleted successfully.`);
            setItemToDelete(null);
            fetchPortfolioItems();
        } catch (error) {
            showToast(`Failed to delete ${section} item.`);
        }
    };

    const handleEdit = (item: PortfolioItem) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <div className="flex justify-center p-10"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>;
    }

    const getSectionTitle = () => {
        switch(section) {
            case 'hero': return 'Hero Section';
            case 'gallery': return 'Gallery';
            case 'featured': return 'Popular Tours';
            default: return 'Portfolio Items';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Manage {getSectionTitle()}</h3>
                <button 
                    onClick={() => {
                        setItemToEdit(null);
                        setIsModalOpen(true);
                    }} 
                    className="px-5 py-2 bg-[#2D7A79] text-white rounded-lg font-semibold hover:bg-opacity-90 shadow-sm transition-all"
                >
                    Add {section === 'hero' ? 'Hero Image' : section === 'gallery' ? 'Gallery Item' : 'Popular Tours'}
                </button>
            </div>
            {portfolioItems.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolioItems.map(item => (
                        <div key={item._id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden group relative">
                             <div className="absolute top-2 right-2 z-10 flex space-x-2">
                                <button 
                                    onClick={() => handleEdit(item)}
                                    className="p-2 bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                                    aria-label={`Edit ${section} item`}
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setItemToDelete(item)}
                                    className="p-2 bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    aria-label={`Delete ${section} item`}
                                >
                                    <DeleteIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h4 className="font-bold text-gray-800">{item.title}</h4>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                {item.order && (
                                    <p className="text-xs text-gray-500 mt-2">Display Order: {item.order}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">No {section} items found. Add one to get started.</p>
            )}
           
            <PortfolioItemModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setItemToEdit(null);
                }}
                onSave={handleSave}
                section={section}
                itemToEdit={itemToEdit}
            />

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title={`Delete ${section === 'hero' ? 'Hero Image' : section === 'gallery' ? 'Gallery Item' : 'Popular Tours'}`}
                message={`Are you sure you want to delete "${itemToDelete?.title}"?`}
                variant="destructive"
            />
        </div>
    );
};

interface PortfolioItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => Promise<void>;
    section: Tab;
    itemToEdit: PortfolioItem | null;
}

const PortfolioItemModal: React.FC<PortfolioItemModalProps> = ({ isOpen, onClose, onSave, section, itemToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [order, setOrder] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setTitle(itemToEdit.title);
                setDescription(itemToEdit.description);
                setOrder(itemToEdit.order);
                setImagePreview(itemToEdit.imageUrl);
                setImage(null);
            } else {
                setTitle('');
                setDescription('');
                setImage(null);
                setOrder(0);
                setImagePreview(null);
            }
            setErrors({});
        }
    }, [isOpen, itemToEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, image: 'Only image files are allowed (JPG, JPEG, PNG, GIF)' }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(file);
            setErrors(prev => ({ ...prev, image: '' }));
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!description.trim()) {
            newErrors.description = 'Description is required';
        }
        
        if (!image && !itemToEdit) {
            newErrors.image = 'Please upload an image';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (image) formData.append('image', image);
            formData.append('section', section);
            formData.append('order', order.toString());
            
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                            {itemToEdit ? 'Edit' : 'Add'} {section === 'hero' ? 'Hero Image' : section === 'gallery' ? 'Gallery Item' : 'Popular Tours'}
                        </h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter title"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                rows={3}
                                placeholder="Enter description"
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                            <input
                                type="number"
                                id="order"
                                value={order}
                                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min="0"
                            />
                            <p className="text-gray-500 text-xs mt-1">Lower numbers appear first</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                            <div className="flex items-center justify-center w-full">
                                <label 
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
                                        errors.image ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-full object-contain"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                aria-label="Remove image"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500">JPG, JPEG, PNG or GIF (MAX. 5MB)</p>
                                        </div>
                                    )}
                                    <input 
                                        id="image" 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/jpeg,image/jpg,image/png,image/gif"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            {errors.image && (
                                <div className="mt-2">
                                    <p className="text-red-500 text-sm font-medium">{errors.image}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#2D7A79] text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WebsiteContentPage;