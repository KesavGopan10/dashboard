import React, { useContext } from 'react';
import ProductTable from '../components/ProductTable';
import { AppContext } from '../contexts/AppContext';

const ProductsPage: React.FC = () => {
    const { searchQuery } = useContext(AppContext);
    return (
        <div>
            <ProductTable searchQuery={searchQuery} />
        </div>
    );
}

export default ProductsPage;