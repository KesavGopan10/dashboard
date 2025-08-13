export type ProductCategory = 'Electronics' | 'Furniture' | 'Kitchenware' | 'Accessories' | 'Cosmetics' | 'Apparel' | 'Books' | 'General';

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  sold: number;
}

export interface ProductsApiResponse {
  products: Product[];
  totalCount: number;
}

export type SortConfig = {
  key: keyof Product | null;
  direction: 'ascending' | 'descending';
}

export type Page = 'dashboard' | 'products' | 'offers' | 'reports' | 'settings';

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