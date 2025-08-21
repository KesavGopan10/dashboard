export interface Address {
  name: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName?: string; 
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';


export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'card' | 'paypal' | 'cod' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  shippingAddress: Address;
  date: string; // maps from placedAt
  customerName: string; // derived from shippingAddress
  customerEmail: string; // derived from shippingAddress
}


export interface OrdersApiResponse {
  orders: Order[];
  totalCount: number;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl: string; // maps from 'image'
  productCount?: number;
}

export interface Product {
  description: string;
  subHeading: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  specifications: { key: string; value: string; }[];
}

export interface ProductsApiResponse {
  products: Product[];
  totalCount: number;
}

export type SortConfig<T> = {
  key: keyof T | null;
  direction: 'ascending' | 'descending';
}

export type Page = 'dashboard' | 'products' | 'categories' | 'orders' | 'reports' | 'offers' | 'websiteContent' | 'settings';

export interface User {
  token: 'Admin' | 'Editor';
}

export type DashboardStats = {
    totalSales: { value: number };
    totalOrders: { value: number };
    totalProducts: { value: number };
    totalCategories: { value: number };
};

export interface Offer {
  id: string;
  title: string;
  description: string;
  promoCode: string;
}

export interface BannerImage {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export interface WebsiteContent {
  key: string;
  label: string;
  value: string;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  section: 'hero' | 'gallery' | 'featured';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppContextType {
  activePage: Page;
  setActivePage: (page: Page) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toastMessage: string;
  showToast: (message: string) => void;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}