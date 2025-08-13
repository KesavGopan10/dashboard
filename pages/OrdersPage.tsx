import React, { useContext } from 'react';
import OrderTable from '../components/OrderTable';
import { AppContext } from '../contexts/AppContext';

const OrdersPage: React.FC = () => {
    const { searchQuery } = useContext(AppContext);
    return (
        <div>
            <OrderTable searchQuery={searchQuery} />
        </div>
    );
}

export default OrdersPage;
