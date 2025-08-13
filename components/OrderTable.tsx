import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Order, SortConfig, OrderStatus } from '../types';
import { getOrders, updateOrderStatus } from '../api/mockApi';
import { AppContext } from '../contexts/AppContext';
import Pagination from './Pagination';
import SortableTableHeader from './SortableTableHeader';
import LoadingSpinner from './LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

const ORDERS_PER_PAGE = 8;
const ALL_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusBadgeStyles: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-500',
  Processing: 'bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-500',
  Shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200 focus:ring-indigo-500',
  Delivered: 'bg-green-100 text-green-800 border-green-200 focus:ring-green-500',
  Cancelled: 'bg-red-100 text-red-800 border-red-200 focus:ring-red-500',
};


const OrderTable: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig<Order>>({ key: 'date', direction: 'descending' });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { showToast } = useContext(AppContext);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const prevFiltersRef = useRef({ search: debouncedSearchQuery, sort: sortConfig });

  const fetchAndSetOrders = useCallback(async (pageToFetch: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrders({
          page: pageToFetch,
          limit: ORDERS_PER_PAGE,
          search: debouncedSearchQuery,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        });
        setOrders(data.orders);
        setTotalOrders(data.totalCount);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        showToast("Failed to fetch orders");
      } finally {
        setIsLoading(false);
      }
  }, [debouncedSearchQuery, sortConfig, showToast]);

  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.search !== debouncedSearchQuery ||
      prevFiltersRef.current.sort.key !== sortConfig.key ||
      prevFiltersRef.current.sort.direction !== sortConfig.direction;

    const pageToFetch = filtersChanged ? 1 : currentPage;
    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }
    
    fetchAndSetOrders(pageToFetch);
    prevFiltersRef.current = { search: debouncedSearchQuery, sort: sortConfig };
  }, [currentPage, debouncedSearchQuery, sortConfig, fetchAndSetOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId.substring(0,6)} status updated.`);
      fetchAndSetOrders(currentPage);
    } catch (err) {
      showToast('Failed to update order status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSort = (key: keyof Order) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const renderTableContent = () => {
    if (isLoading && orders.length === 0) {
      return <tr><td colSpan={6} className="text-center py-16"><LoadingSpinner /></td></tr>;
    }
    if (error) {
      return <tr><td colSpan={6} className="text-center py-16 text-red-500">{error}</td></tr>;
    }
    if (orders.length === 0) {
      return <tr><td colSpan={6} className="text-center py-16 text-gray-500">No orders found.</td></tr>;
    }
    return orders.map((order) => (
      <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
        <td data-label="Order ID" className="px-6 py-4 font-medium text-[#2D7A79] hover:underline font-mono text-sm">#{order.id.substring(4)}</td>
        <td data-label="Customer" className="px-6 py-4">
            <div className="font-medium text-gray-900">{order.customerName}</div>
            <div className="text-xs text-gray-500">{order.customerEmail}</div>
        </td>
        <td data-label="Date" className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
        <td data-label="Total" className="px-6 py-4 font-medium">${order.totalAmount.toFixed(2)}</td>
        <td data-label="Status" className="px-6 py-4">
            <div className="flex items-center">
              <select 
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                disabled={updatingStatus === order.id}
                className={`w-32 p-1.5 border rounded-lg text-xs font-medium focus:ring-2 focus:outline-none transition-colors ${statusBadgeStyles[order.status]}`}
              >
                {ALL_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {updatingStatus === order.id && <div className="ml-2 w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
            </div>
        </td>
        <td data-label="Items" className="px-6 py-4 text-center">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
      </tr>
    ));
  };


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">Customer Orders</h3>
      </div>
      <div className="overflow-x-auto responsive-table">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <SortableTableHeader<Order> label="Order ID" sortKey="id" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Order> label="Customer" sortKey="customerName" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Order> label="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Order> label="Total" sortKey="totalAmount" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHeader<Order> label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <th scope="col" className="px-6 py-3 text-center">Items</th>
            </tr>
          </thead>
          <tbody>
            {renderTableContent()}
          </tbody>
        </table>
      </div>

      {!isLoading && !error && orders.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalCount={totalOrders}
          pageSize={ORDERS_PER_PAGE}
          onPageChange={page => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default OrderTable;
