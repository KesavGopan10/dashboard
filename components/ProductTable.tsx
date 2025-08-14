import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Product, SortConfig } from '../types';
import { EditIcon, DeleteIcon, ProductsIcon, StarIcon } from './icons';
import { getProducts, addProduct, updateProduct, deleteProduct, toggleProductFeaturedStatus } from '../api/mockApi';
import { AppContext } from '../contexts/AppContext';
import ConfirmationModal from './ConfirmationModal';
import ProductModal from './ProductModal';
import Pagination from './Pagination';
import SortableTableHeader from './SortableTableHeader';
import LoadingSpinner from './LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

const PRODUCTS_PER_PAGE = 5;

const ProductTable: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig<Product>>({ key: 'id', direction: 'descending' });

  const { showToast } = useContext(AppContext);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const prevFiltersRef = useRef({ search: debouncedSearchQuery, sort: sortConfig });
  
  const fetchAndSetProducts = useCallback(async () => {
    const filtersChanged = 
      prevFiltersRef.current.search !== debouncedSearchQuery ||
      prevFiltersRef.current.sort.key !== sortConfig.key ||
      prevFiltersRef.current.sort.direction !== sortConfig.direction;

    const pageToFetch = filtersChanged ? 1 : currentPage;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getProducts({
        page: pageToFetch,
        limit: PRODUCTS_PER_PAGE,
        search: debouncedSearchQuery,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });
      setProducts(data.products);
      setTotalProducts(data.totalCount);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      showToast("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
    prevFiltersRef.current = { search: debouncedSearchQuery, sort: sortConfig };
  }, [currentPage, debouncedSearchQuery, sortConfig, showToast]);

  useEffect(() => {
    fetchAndSetProducts();
  }, [fetchAndSetProducts]);

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
        await deleteProduct(productToDelete.id);
        showToast("Product deleted successfully.");
        if (products.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else {
             fetchAndSetProducts();
        }
    } catch (error) {
        showToast("Failed to delete product. Please try again.");
    } finally {
        setProductToDelete(null); 
    }
  };
  
  const handleToggleFeatured = async (productId: number) => {
    // Optimistic UI update
    setProducts(prevProducts => prevProducts.map(p => p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p));
    try {
      await toggleProductFeaturedStatus(productId);
      showToast('Featured status updated.');
      // Optional: refetch to ensure consistency, though optimistic update is usually enough
      // fetchAndSetProducts(); 
    } catch (error) {
      showToast('Failed to update featured status.');
      // Revert UI on error
      setProducts(prevProducts => prevProducts.map(p => p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p));
    }
  }

  const handleSave = async (productData: Omit<Product, 'id'> | Product) => {
    try {
        if ('id' in productData && productData.id) {
            await updateProduct(productData.id, productData as Product);
            showToast("Product updated successfully.");
        } else {
            await addProduct(productData);
            showToast("Product added successfully.");
        }
        handleCloseModal();
        fetchAndSetProducts();
    } catch (error) {
        showToast("Failed to save product.");
        throw error;
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }

  const handleSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const renderTableContent = () => {
    if (isLoading) {
      return <tr><td colSpan={8} className="text-center py-16"><LoadingSpinner /></td></tr>;
    }
    if (error) {
      return <tr><td colSpan={8} className="text-center py-16 text-red-500">{error}</td></tr>;
    }
    if (products.length === 0) {
      return <tr><td colSpan={8} className="text-center py-16 text-gray-500">No products found.</td></tr>;
    }
    return products.map((product) => (
      <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
         <td data-label="Featured" className="px-6 py-4">
          <button onClick={() => handleToggleFeatured(product.id)} className={`p-2 rounded-full transition-colors ${product.isFeatured ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} aria-label={`Mark ${product.name} as featured`}>
            <StarIcon className="w-6 h-6" />
          </button>
        </td>
        <td data-label="Image" className="px-6 py-4">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
              <ProductsIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </td>
        <td data-label="Product Name" className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
        <td data-label="Category" className="px-6 py-4">{product.categoryName}</td>
        <td data-label="Price" className="px-6 py-4">${product.price.toFixed(2)}</td>
        <td data-label="Stock" className="px-6 py-4">{product.stock}</td>
        <td data-label="Sold" className="px-6 py-4">{product.sold}</td>
        <td data-label="Actions" className="px-6 py-4 text-right space-x-2">
          <button onClick={() => handleEditClick(product)} className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition-colors" aria-label={`Edit ${product.name}`}>
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setProductToDelete(product)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition-colors" aria-label={`Delete ${product.name}`}>
            <DeleteIcon className="w-5 h-5" />
          </button>
        </td>
      </tr>
    ));
  };


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Product Sales</h3>
        <button onClick={handleAddClick} className="px-5 py-2 bg-[#2D7A79] text-white rounded-lg font-semibold hover:bg-opacity-90 shadow-sm transition-all">
          Add Product
        </button>
      </div>
      <div className="overflow-x-auto responsive-table">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Featured</th>
              <th scope="col" className="px-6 py-3">Image</th>
              <SortableTableHeader<Product> label="Product Name" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Product> label="Category" sortKey="categoryName" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Product> label="Price" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Product> label="Stock" sortKey="stock" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Product> label="Sold" sortKey="sold" sortConfig={sortConfig} onSort={handleSort} />
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderTableContent()}
          </tbody>
        </table>
      </div>

      {!isLoading && !error && products.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalCount={totalProducts}
          pageSize={PRODUCTS_PER_PAGE}
          onPageChange={page => setCurrentPage(page)}
        />
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        product={editingProduct}
      />
      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        variant="destructive"
      />
    </div>
  );
};

export default ProductTable;