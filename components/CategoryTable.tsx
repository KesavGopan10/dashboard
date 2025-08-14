import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Category } from '../types';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../api/mockApi';
import LoadingSpinner from './LoadingSpinner';
import { EditIcon, DeleteIcon, Squares2X2Icon } from './icons';
import { AppContext } from '../contexts/AppContext';
import ConfirmationModal from './ConfirmationModal';
import CategoryModal from './CategoryModal';

const CategoryTable: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [deleteProducts, setDeleteProducts] = useState(false);

    const { showToast } = useContext(AppContext);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError("Failed to fetch categories.");
            showToast("Failed to fetch categories");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddClick = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteProducts(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSave = async (categoryData: Omit<Category, 'id'> | Category) => {
        try {
            if ('id' in categoryData && categoryData.id) {
                await updateCategory(categoryData.id, categoryData);
                showToast("Category updated successfully.");
            } else {
                await addCategory(categoryData as Omit<Category, 'id'>);
                showToast("Category added successfully.");
            }
            handleCloseModal();
            fetchCategories();
        } catch (error: any) {
            showToast(error.message || "Failed to save category.");
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await deleteCategory(categoryToDelete.id, { deleteProducts });
            showToast("Category deleted successfully.");
            fetchCategories();
        } catch (error: any) {
            showToast(error.message || "Failed to delete category.");
        } finally {
            setCategoryToDelete(null);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        }

        if (error) {
            return <div className="text-center py-16 text-red-500">{error}</div>;
        }

        if (categories.length === 0) {
            return <div className="text-center py-16 text-gray-500">No categories found. Start by adding one!</div>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden group flex flex-col">
                        <img src={category.imageUrl} alt={category.name} className="w-full h-40 object-cover"/>
                        <div className="p-5 flex-grow flex flex-col">
                            <h4 className="text-lg font-bold text-gray-800">{category.name}</h4>
                            <p className="text-sm font-medium text-gray-500 mt-1">{category.productCount} Product{category.productCount !== 1 ? 's' : ''}</p>
                            <p className="text-sm text-gray-600 mt-2 flex-grow">{category.description}</p>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => handleEditClick(category)} className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition-colors" aria-label={`Edit ${category.name}`}>
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDeleteClick(category)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition-colors" aria-label={`Delete ${category.name}`}>
                                    <DeleteIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Manage Categories</h3>
                    <button onClick={handleAddClick} className="px-5 py-2 bg-[#2D7A79] text-white rounded-lg font-semibold hover:bg-opacity-90 shadow-sm transition-all flex items-center gap-2">
                        <Squares2X2Icon className="w-5 h-5" />
                        Add Category
                    </button>
                </div>
                {renderContent()}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                category={editingCategory}
            />

            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Category"
                message={
                    deleteProducts
                      ? `Are you sure you want to delete "${categoryToDelete?.name}" and all of its ${categoryToDelete?.productCount} associated products? This action cannot be undone.`
                      : `Are you sure you want to delete "${categoryToDelete?.name}"? Its products will be moved to the 'General' category.`
                }
                variant="destructive"
            >
              {categoryToDelete?.productCount > 0 && (
                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-red-50 border border-red-200 rounded-lg">
                    <input 
                        type="checkbox"
                        checked={deleteProducts}
                        onChange={(e) => setDeleteProducts(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-red-800 font-medium">Delete all {categoryToDelete?.productCount} products in this category</span>
                </label>
              )}
            </ConfirmationModal>
        </>
    );
};

export default CategoryTable;