import { Product, ProductCategory, ProductsApiResponse, SortConfig, User, Offer, Order, OrderStatus, OrdersApiResponse } from '../types';

// --- IN-MEMORY DATABASE ---
let products: Product[] = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 25.99, stock: 150, sold: 75 },
  { id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 120.00, stock: 80, sold: 40 },
  { id: 3, name: 'Desk Chair', category: 'Furniture', price: 199.50, stock: 50, sold: 15 },
  { id: 4, name: 'LED Monitor', category: 'Electronics', price: 350.00, stock: 100, sold: 60 },
  { id: 5, name: 'Coffee Mug', category: 'Kitchenware', price: 12.00, stock: 300, sold: 125 },
  { id: 6, name: 'Laptop Stand', category: 'Accessories', price: 45.00, stock: 200, sold: 90 },
  { id: 7, name: 'USB-C Hub', category: 'Accessories', price: 59.99, stock: 120, sold: 85 },
  { id: 8, name: 'Standing Desk', category: 'Furniture', price: 499.00, stock: 30, sold: 10 },
  { id: 9, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 249.99, stock: 70, sold: 55 },
  { id: 10, name: 'Ergonomic Footrest', category: 'Accessories', price: 35.50, stock: 150, sold: 30 },
  { id: 11, name: 'Lipstick', category: 'Cosmetics', price: 22.50, stock: 200, sold: 95 },
  { id: 12, name: 'Cotton T-Shirt', category: 'Apparel', price: 25.00, stock: 400, sold: 250 },
  { id: 13, name: 'Hardcover Novel', category: 'Books', price: 18.99, stock: 120, sold: 45 },
  { id: 14, name: 'Canvas Tote Bag', category: 'General', price: 15.00, stock: 300, sold: 180 },
  { id: 15, name: 'Blender', category: 'Kitchenware', price: 89.99, stock: 90, sold: 35 },
  { id: 16, name: 'Mascara', category: 'Cosmetics', price: 14.00, stock: 150, sold: 88 },
];

let offers: Offer[] = [
  { id: 1, title: 'Summer Kick-off Sale', description: 'Get 25% off on all apparel. Perfect for the sunny days ahead!', promoCode: 'SUNNY25' },
  { id: 2, title: 'Electronics Bonanza', description: 'Save $50 on any electronics purchase over $500. Upgrade your tech today.', promoCode: 'TECH50' },
  { id: 3, title: 'New User Welcome', description: 'First time here? Enjoy 15% off your entire first order as a welcome gift!', promoCode: 'WELCOME15' },
];

let orders: Order[] = [
    { id: 'ORD-10015', customerName: 'Liam Johnson', customerEmail: 'liam.j@example.com', date: '2023-10-28T14:48:00.000Z', totalAmount: 145.99, status: 'Delivered', items: [{ productId: 2, productName: 'Mechanical Keyboard', quantity: 1, price: 120.00}, { productId: 1, productName: 'Wireless Mouse', quantity: 1, price: 25.99 }] },
    { id: 'ORD-10014', customerName: 'Olivia Smith', customerEmail: 'olivia.s@example.com', date: '2023-10-27T11:23:00.000Z', totalAmount: 199.50, status: 'Delivered', items: [{ productId: 3, productName: 'Desk Chair', quantity: 1, price: 199.50}] },
    { id: 'ORD-10013', customerName: 'Noah Williams', customerEmail: 'noah.w@example.com', date: '2023-10-27T09:15:00.000Z', totalAmount: 350.00, status: 'Shipped', items: [{ productId: 4, productName: 'LED Monitor', quantity: 1, price: 350.00}] },
    { id: 'ORD-10012', customerName: 'Emma Brown', customerEmail: 'emma.b@example.com', date: '2023-10-26T18:02:00.000Z', totalAmount: 24.00, status: 'Shipped', items: [{ productId: 5, productName: 'Coffee Mug', quantity: 2, price: 12.00}] },
    { id: 'ORD-10011', customerName: 'Oliver Jones', customerEmail: 'oliver.j@example.com', date: '2023-10-25T13:45:00.000Z', totalAmount: 45.00, status: 'Processing', items: [{ productId: 6, productName: 'Laptop Stand', quantity: 1, price: 45.00}] },
    { id: 'ORD-10010', customerName: 'Ava Garcia', customerEmail: 'ava.g@example.com', date: '2023-10-25T10:10:00.000Z', totalAmount: 59.99, status: 'Processing', items: [{ productId: 7, productName: 'USB-C Hub', quantity: 1, price: 59.99}] },
    { id: 'ORD-10009', customerName: 'Elijah Miller', customerEmail: 'elijah.m@example.com', date: '2023-10-24T20:55:00.000Z', totalAmount: 499.00, status: 'Pending', items: [{ productId: 8, productName: 'Standing Desk', quantity: 1, price: 499.00}] },
    { id: 'ORD-10008', customerName: 'Charlotte Davis', customerEmail: 'charlotte.d@example.com', date: '2023-10-24T16:20:00.000Z', totalAmount: 249.99, status: 'Cancelled', items: [{ productId: 9, productName: 'Noise Cancelling Headphones', quantity: 1, price: 249.99}] },
    { id: 'ORD-10007', customerName: 'James Rodriguez', customerEmail: 'james.r@example.com', date: '2023-10-23T11:30:00.000Z', totalAmount: 71.00, status: 'Delivered', items: [{ productId: 10, productName: 'Ergonomic Footrest', quantity: 2, price: 35.50}] },
    { id: 'ORD-10006', customerName: 'Sophia Wilson', customerEmail: 'sophia.w@example.com', date: '2023-10-22T09:05:00.000Z', totalAmount: 22.50, status: 'Shipped', items: [{ productId: 11, productName: 'Lipstick', quantity: 1, price: 22.50}] },
    { id: 'ORD-10005', customerName: 'Benjamin Martinez', customerEmail: 'benjamin.m@example.com', date: '2023-10-21T17:40:00.000Z', totalAmount: 50.00, status: 'Delivered', items: [{ productId: 12, productName: 'Cotton T-Shirt', quantity: 2, price: 25.00}] },
    { id: 'ORD-10004', customerName: 'Isabella Anderson', customerEmail: 'isabella.a@example.com', date: '2023-10-20T12:00:00.000Z', totalAmount: 18.99, status: 'Delivered', items: [{ productId: 13, productName: 'Hardcover Novel', quantity: 1, price: 18.99}] },
    { id: 'ORD-10003', customerName: 'Lucas Taylor', customerEmail: 'lucas.t@example.com', date: '2023-10-19T15:18:00.000Z', totalAmount: 30.00, status: 'Processing', items: [{ productId: 14, productName: 'Canvas Tote Bag', quantity: 2, price: 15.00}] },
    { id: 'ORD-10002', customerName: 'Mia Thomas', customerEmail: 'mia.t@example.com', date: '2023-10-18T10:25:00.000Z', totalAmount: 179.98, status: 'Shipped', items: [{ productId: 15, productName: 'Blender', quantity: 2, price: 89.99}] },
    { id: 'ORD-10001', customerName: 'Henry Hernandez', customerEmail: 'henry.h@example.com', date: '2023-10-17T19:00:00.000Z', totalAmount: 42.00, status: 'Delivered', items: [{ productId: 16, productName: 'Mascara', quantity: 3, price: 14.00}] },
];


let users: User[] = [
    { id: 1, name: 'Marcus Robb', email: 'admin@example.com', role: 'Admin' }
]

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API REFERENCE: AUTHENTICATION ---

/**
 * Endpoint: POST /api/auth/login
 * Simulates user login. Checks credentials and returns a user object and a mock JWT.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password (in this mock, 'password' is always correct).
 * @returns {Promise<{user: User, token: string}>} - The user object and a token.
 */
export const login = async (email: string, password: string): Promise<{user: User, token: string}> => {
    await delay(700);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && password === 'password') {
        // In a real app, the token would be a signed JWT. Here we just create a mock string.
        const token = `mock-jwt-for-${user.id}-${Date.now()}`;
        return { user, token };
    }
    throw new Error("Invalid email or password");
};

/**
 * Endpoint: GET /api/auth/me
 * Simulates verifying a token to get the current user's data.
 * @param {string} token - The user's auth token.
 * @returns {Promise<User>} - The user object.
 */
export const getMe = async (token: string): Promise<User> => {
    await delay(300);
    // In a real app, you'd verify the JWT and get the user ID from its payload.
    if(token.startsWith('mock-jwt-for-')) {
        const userId = parseInt(token.split('-')[3], 10);
        const user = users.find(u => u.id === userId);
        if (user) {
            return user;
        }
    }
    throw new Error("Invalid or expired token");
};


/**
 * Endpoint: PATCH /api/users/:id
 * Updates a user's profile information.
 * @param {number} id - The ID of the user to update.
 * @param {Partial<User>} updatedData - An object with the user fields to update.
 * @returns {Promise<User>} - The fully updated user object.
 */
export const updateUser = async (id: number, updatedData: Partial<User>): Promise<User> => {
    await delay(600);
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        throw new Error("User not found");
    }
    users[userIndex] = { ...users[userIndex], ...updatedData };
    return users[userIndex];
};

// --- API REFERENCE: PRODUCTS ---

/**
 * Endpoint: GET /api/products
 * Fetches a paginated, sorted, and searchable list of products.
 * @param {{page: number, limit: number, search?: string, sortBy?: keyof Product, sortOrder?: 'ascending' | 'descending'}} params
 * @returns {Promise<ProductsApiResponse>} - An object containing the products for the page and the total count.
 */
export const getProducts = async (params: { page: number, limit: number, search?: string, sortBy?: keyof Product | null, sortOrder?: 'ascending' | 'descending' }): Promise<ProductsApiResponse> => {
  await delay(800);
  let filteredProducts = [...products];

  // 1. Search
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }

  // 2. Sort
  if (params.sortBy && params.sortOrder) {
    const { key, direction } = { key: params.sortBy, direction: params.sortOrder };
    filteredProducts.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }

  // 3. Paginate
  const totalCount = filteredProducts.length;
  const startIndex = (params.page - 1) * params.limit;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + params.limit);
  
  return { products: paginatedProducts, totalCount };
};


/**
 * Endpoint: POST /api/products
 * Adds a new product to the database.
 * @param {Omit<Product, 'id'>} productData - The new product's data.
 * @returns {Promise<Product>} - The newly created product with its ID.
 */
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await delay(500);
    const newProduct: Product = { id: Date.now(), ...productData };
    products = [newProduct, ...products]; // Add to the top
    return newProduct;
};

/**
 * Endpoint: PUT /api/products/:id
 * Updates an existing product.
 * @param {number} id - The ID of the product to update.
 * @param {Product} updatedData - The new data for the product.
 * @returns {Promise<Product>} - The updated product.
 */
export const updateProduct = async (id: number, updatedData: Product): Promise<Product> => {
    await delay(500);
    let productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) {
        throw new Error("Product not found");
    }
    Object.assign(productToUpdate, updatedData);
    return productToUpdate;
};

/**
 * Endpoint: DELETE /api/products/:id
 * Deletes a product.
 * @param {number} id - The ID of the product to delete.
 * @returns {Promise<{ success: boolean }>}
 */
export const deleteProduct = async (id: number): Promise<{ success: boolean }> => {
    await delay(500);
    const initialLength = products.length;
    products = products.filter(p => p.id !== id);
    if(products.length === initialLength) {
        throw new Error("Product not found");
    }
    return { success: true };
};

// --- API REFERENCE: OFFERS ---

/**
 * Endpoint: GET /api/offers
 * Fetches all offers.
 * @returns {Promise<Offer[]>}
 */
export const getOffers = async (): Promise<Offer[]> => {
    await delay(600);
    return [...offers].sort((a, b) => b.id - a.id); // Return newest first
};

/**
 * Endpoint: POST /api/offers
 * Adds a new offer.
 * @param {Omit<Offer, 'id'>} offerData
 * @returns {Promise<Offer>}
 */
export const addOffer = async (offerData: Omit<Offer, 'id'>): Promise<Offer> => {
    await delay(500);
    const newOffer: Offer = { id: Date.now(), ...offerData };
    offers = [newOffer, ...offers];
    return newOffer;
};

/**
 * Endpoint: PUT /api/offers/:id
 * Updates an existing offer.
 * @param {number} id
 * @param {Partial<Omit<Offer, 'id'>>} updatedData
 * @returns {Promise<Offer>}
 */
export const updateOffer = async (id: number, updatedData: Partial<Omit<Offer, 'id'>>): Promise<Offer> => {
    await delay(500);
    let offerToUpdate = offers.find(o => o.id === id);
    if (!offerToUpdate) {
        throw new Error("Offer not found");
    }
    Object.assign(offerToUpdate, updatedData);
    return offerToUpdate;
};

/**
 * Endpoint: DELETE /api/offers/:id
 * Deletes an offer.
 * @param {number} id
 * @returns {Promise<{ success: boolean }>}
 */
export const deleteOffer = async (id: number): Promise<{ success: boolean }> => {
    await delay(500);
    const initialLength = offers.length;
    offers = offers.filter(o => o.id !== id);
    if (offers.length === initialLength) {
        throw new Error("Offer not found");
    }
    return { success: true };
};


// --- API REFERENCE: ORDERS ---

/**
 * Endpoint: GET /api/orders
 * Fetches a paginated, sorted, and searchable list of orders.
 * @param {{page: number, limit: number, search?: string, sortBy?: keyof Order, sortOrder?: 'ascending' | 'descending'}} params
 * @returns {Promise<OrdersApiResponse>} - An object containing the orders for the page and the total count.
 */
export const getOrders = async (params: { page: number, limit: number, search?: string, sortBy?: keyof Order | null, sortOrder?: 'ascending' | 'descending' }): Promise<OrdersApiResponse> => {
  await delay(800);
  let filteredOrders = [...orders];

  // 1. Search
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredOrders = filteredOrders.filter(o =>
      o.id.toLowerCase().includes(searchTerm) ||
      o.customerName.toLowerCase().includes(searchTerm) ||
      o.customerEmail.toLowerCase().includes(searchTerm)
    );
  }

  // 2. Sort
  if (params.sortBy && params.sortOrder) {
    const { key, direction } = { key: params.sortBy, direction: params.sortOrder };
    filteredOrders.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      if (valA < valB) return direction === 'ascending' ? -1 : 1;
      if (valA > valB) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }

  // 3. Paginate
  const totalCount = filteredOrders.length;
  const startIndex = (params.page - 1) * params.limit;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + params.limit);
  
  return { orders: paginatedOrders, totalCount };
};

/**
 * Endpoint: PATCH /api/orders/:id
 * Updates an existing order's status.
 * @param {string} id - The ID of the order to update.
 * @param {OrderStatus} status - The new status for the order.
 * @returns {Promise<Order>} - The updated order.
 */
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
    await delay(600);
    let orderToUpdate = orders.find(o => o.id === id);
    if (!orderToUpdate) {
        throw new Error("Order not found");
    }
    orderToUpdate.status = status;
    return orderToUpdate;
};


// --- API REFERENCE: DASHBOARD & CHARTS ---

/**
 * Endpoint: GET /api/dashboard/stats
 * Fetches the main statistics for the dashboard homepage.
 * @returns {Promise<Array<{title: string, value: string, change: string, changeType: 'increase' | 'decrease'}>>}
 */
export const getDashboardStats = async () => {
    await delay(1200);
    return [
        { title: "Total Sales", value: "$120,435", change: "+12.5%", changeType: 'increase' as 'increase' | 'decrease' },
        { title: "Purchases", value: "$80,123", change: "-2.1%", changeType: 'decrease' as 'increase' | 'decrease' },
        { title: "Paid", value: "$35,678", change: "+5.8%", changeType: 'increase' as 'increase' | 'decrease' },
        { title: "Profits", value: "$4,285", change: "+15.3%", changeType: 'increase' as 'increase' | 'decrease' },
    ];
};

const baseSalesData = [
  { name: 'Jan', sales: 40000 }, { name: 'Feb', sales: 30000 }, { name: 'Mar', sales: 45000 },
  { name: 'Apr', sales: 48000 }, { name: 'May', sales: 52000 }, { name: 'Jun', sales: 60000 },
  { name: 'Jul', sales: 50640 }, { name: 'Aug', sales: 58000 }, { name: 'Sep', sales: 65000 },
  { name: 'Oct', sales: 70000 }, { name: 'Nov', sales: 68000 }, { name: 'Dec', sales: 75000 },
];

export const getSalesData = async (range: 'Monthly' | 'Quarterly' | 'Yearly') => {
    await delay(800);
    let multiplier = 1;
    if (range === 'Quarterly') multiplier = 0.6;
    if (range === 'Yearly') multiplier = 1.5;
    const dataSize = range === 'Monthly' ? 6 : range === 'Quarterly' ? 9 : 12;
    return baseSalesData
        .slice(0, dataSize)
        .map(d => ({ ...d, sales: Math.round(d.sales * multiplier * (0.85 + Math.random() * 0.3)) }));
}

const baseMostSalesData = [
  { name: 'Keyboards', value: 40 }, { name: 'Monitors', value: 25 },
  { name: 'Chairs', value: 20 }, { name: 'Mice', value: 15 },
];

export const getMostSalesData = async (period: 'Last 7 Days' | 'Last Month' | 'Last Year') => {
    await delay(1000);
    let multiplier = 1;
    if (period === 'Last 7 Days') multiplier = 0.5;
    if (period === 'Last Year') multiplier = 1.2;
    return baseMostSalesData.map(d => ({
        ...d,
        value: Math.round(d.value * multiplier * (0.9 + Math.random() * 0.2)),
    }));
};

/**
 * Endpoint: GET /api/reports/category-distribution
 * Calculates and returns the count of products per category.
 * @returns {Promise<Array<{name: string, value: number}>>}
 */
export const getProductCategoryDistribution = async () => {
    await delay(900);
    const distribution = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
    }, {} as Record<ProductCategory, number>);

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
};