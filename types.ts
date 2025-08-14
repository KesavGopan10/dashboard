export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Product {
  id: number;
  name: string;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string; // For display purposes, joined in API
  price: number;
  stock: number;
  sold: number;
  isFeatured: boolean;
}

export interface ProductsApiResponse {
  products: Product[];
  totalCount: number;
}

export type SortConfig<T> = {
  key: keyof T | null;
  direction: 'ascending' | 'descending';
}

export type Page = 'dashboard' | 'products' | 'categories' | 'orders' | 'offers' | 'reports' | 'settings' | 'websiteContent';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor';
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  promoCode: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string; // ISO string format
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
}

export interface OrdersApiResponse {
  orders: Order[];
  totalCount: number;
}

export interface BannerImage {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export interface WebsiteContent {
  key: string;
  label: string;
  value: string;
}


export interface AppContextType {
  activePage: Page;
  setActivePage: (page: Page) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toastMessage: string;
  showToast: (message: string) => void;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updatedProfile: Partial<Pick<User, 'name' | 'email'>>) => Promise<void>;
}