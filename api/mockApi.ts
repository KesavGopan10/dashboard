import { Product, Category, ProductsApiResponse, User, Order, OrdersApiResponse, DashboardStats, OrderStatus, Offer, BannerImage, WebsiteContent } from '../types';

const BASE_URL = 'http://localhost:5000/api';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem('authToken');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

// Mock API request for non-backend features
const mockApiRequest = <T,>(data: T, shouldFail = false): Promise<T> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error("Mock API request failed."));
            } else {
                resolve(JSON.parse(JSON.stringify(data))); // Deep copy
            }
        }, 500);
    });
};

// --- AUTH ---
export const login = async (email: string, password: string): Promise<{user: User, token: string}> => {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return {
        user: data.user,
        token: data.token
    };
};


// --- DASHBOARD ---
export const getDashboardStats = async (): Promise<any> => {
    // Assuming /admin/metrics provides stats
    // The new spec is not clear on the structure. This is an assumed structure.
    const metrics = await apiRequest('/admin/metrics');
    return {
        totalSales: { value: metrics.totalRevenue || 0 },
        totalOrders: { value: metrics.totalOrders || 0 },
        totalProducts: { value: metrics.totalProducts || 0 },
        totalCategories: { value: metrics.totalCategories || 0 },
    };
};

export const getSalesData = async (range: 'Monthly' | 'Quarterly' | 'Yearly'): Promise<any[]> => {
    return apiRequest(`/admin/metrics/sales?range=${range.toLowerCase()}`);
}
export const getMostSalesData = async (period: 'Last 7 Days' | 'Last Month' | 'Last Year'): Promise<any[]> => {
    const periodMap = { 'Last 7 Days': 'weekly', 'Last Month': 'monthly', 'Last Year': 'yearly' };
    return apiRequest(`/admin/metrics/most-sales?period=${periodMap[period]}`);
}
export const getProductCategoryDistribution = async (): Promise<any[]> => {
    return apiRequest(`/admin/metrics/category-distribution`);
}


// --- PRODUCTS ---
export const getProducts = async (params: { page: number, limit: number, search?: string, sortBy?: keyof Product | null, sortOrder?: 'ascending' | 'descending' }): Promise<ProductsApiResponse> => {
    const query = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
    });
    if (params.search) query.set('q', params.search);
    if (params.sortBy) query.set('sort', String(params.sortBy));
    if (params.sortOrder) query.set('order', params.sortOrder === 'ascending' ? 'asc' : 'desc');

    const data = await apiRequest(`/admin/products?${query.toString()}`);

    // Accept either `[ {...}, ... ]` or `{ products: [...], totalCount: n }`
    const rawProducts = Array.isArray(data) ? data : (data.products || []);

    const mappedProducts = rawProducts.map((p: any) => ({
        ...p,
        _id: p._id,
        imageUrls: p.images || [],       // frontend expects `imageUrls`
        isFeatured: p.isFeatured ?? false,
        sold: p.sold ?? 0,
    }));

    const totalCount = typeof data?.totalCount === 'number' ? data.totalCount : mappedProducts.length;

    return { products: mappedProducts, totalCount };
};

export const addProduct = (productData: Omit<Product, '_id'>): Promise<Product> => {
    const { imageUrls, ...rest } = productData;
    const payload = { ...rest, images: imageUrls };
    return apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
};

export const updateProduct = (id: string, productData: Product): Promise<Product> => {
    const { imageUrls, ...rest } = productData;
    const payload = { ...rest, images: imageUrls };
    return apiRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
};

export const deleteProduct = (id: string): Promise<{ success: boolean }> => {
    return apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
};


// --- CATEGORIES ---
export const getCategories = async (): Promise<Category[]> => {
    const data = await apiRequest('/admin/categories');
    return data.map((c: any) => ({ ...c, _id: c._id, imageUrl: c.image, productCount: c.productCount || 0 }));
};

export const addCategory = (categoryData: Omit<Category, '_id'>): Promise<Category> => {
    const { imageUrl, ...rest } = categoryData;
    const payload = { ...rest, image: imageUrl };
    return apiRequest('/admin/categories', { method: 'POST', body: JSON.stringify(payload) });
};

export const updateCategory = (id: string, updatedData: Partial<Omit<Category, '_id'>>): Promise<Category> => {
    const { imageUrl, ...rest } = updatedData;
    const payload = { ...rest, image: imageUrl };
    return apiRequest(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
};

export const deleteCategory = (id: string): Promise<{ success: boolean }> => {
    return apiRequest(`/admin/categories/${id}`, { method: 'DELETE' });
};


// --- ORDERS ---
export const getOrders = async (params: { page: number, limit: number, search?: string, sortBy?: keyof Order | null, sortOrder?: 'ascending' | 'descending' }): Promise<OrdersApiResponse> => {
  const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
  });
  if (params.search) query.set('q', params.search);
  if (params.sortBy) query.set('sort', String(params.sortBy));
  if (params.sortOrder) query.set('order', params.sortOrder === 'ascending' ? 'asc' : 'desc');

  const data = await apiRequest(`/admin/orders?${query.toString()}`);

  const mappedOrders = data.map((o: any) => ({
      _id: o._id,
      date: o.placedAt,
      status: o.orderStatus,
      items: o.orderItems,
      totalAmount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      shippingAddress: {
        ...o.shippingAddress,
        name: o.customerName,
        email: o.customerEmail || 'N/A'
      },
      customerName: o.customerName,
      customerEmail: o.customerEmail || 'N/A'
  }));
  return { orders: mappedOrders, totalCount: data.length };
};

export const updateOrderStatus = async (id: string, status: OrderStatus, awbId?: string): Promise<Order> => {
    const payload: { orderStatus: OrderStatus; awbId?: string } = { orderStatus: status };
    if (awbId) {
        payload.awbId = awbId;
    }
    const data = await apiRequest(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return data;
};

// --- MOCK DATA ---
let mockOffers: Offer[] = [
    { id: '1', title: '10% Off Summer Sale', description: 'Get 10% off on all summer collection items.', promoCode: 'SUMMER10' },
    { id: '2', title: 'Free Shipping', description: 'Free shipping on orders over $50.', promoCode: 'FREESHIP' },
];

let mockBanners: BannerImage[] = [
    { id: 'b1', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop', title: 'New Arrivals', subtitle: 'Check out the latest fashion trends.' },
    { id: 'b2', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop', title: 'Season Sale', subtitle: 'Up to 50% off on selected items.' },
];

let mockWebsiteContent: WebsiteContent[] = [
    { key: 'homepage_title', label: 'Homepage Main Title', value: 'Discover Your Style' },
    { key: 'homepage_subtitle', label: 'Homepage Subtitle', value: 'Your one-stop shop for fashion.' },
    { key: 'about_us', label: 'About Us Page Content', value: 'We believe in fashion that is both stylish and sustainable.' },
];

// --- OFFERS ---
export const getOffers = (): Promise<Offer[]> => mockApiRequest(mockOffers);
export const addOffer = (offerData: Omit<Offer, 'id'>): Promise<Offer> => {
    const newOffer: Offer = { id: crypto.randomUUID(), ...offerData };
    mockOffers.push(newOffer);
    return mockApiRequest(newOffer);
};
export const updateOffer = (id: string, updatedData: Offer): Promise<Offer> => {
    mockOffers = mockOffers.map(o => o.id === id ? { ...o, ...updatedData } : o);
    return mockApiRequest(updatedData);
};
export const deleteOffer = (id: string): Promise<{ success: boolean }> => {
    mockOffers = mockOffers.filter(o => o.id !== id);
    return mockApiRequest({ success: true });
};


// --- BANNERS ---
export const getBanners = (): Promise<BannerImage[]> => mockApiRequest(mockBanners);
export const addBanner = (bannerData: Omit<BannerImage, 'id'>): Promise<BannerImage> => {
    const newBanner: BannerImage = { id: crypto.randomUUID(), ...bannerData };
    mockBanners.push(newBanner);
    return mockApiRequest(newBanner);
};
export const deleteBanner = (id: string): Promise<{ success: boolean }> => {
    mockBanners = mockBanners.filter(b => b.id !== id);
    return mockApiRequest({ success: true });
};

// --- WEBSITE CONTENT ---
export const getWebsiteContents = (): Promise<WebsiteContent[]> => mockApiRequest(mockWebsiteContent);
export const updateWebsiteContents = (contents: WebsiteContent[]): Promise<WebsiteContent[]> => {
    mockWebsiteContent = contents;
    return mockApiRequest(mockWebsiteContent);
};