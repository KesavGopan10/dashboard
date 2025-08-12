import { Product, ProductCategory, ProductsApiResponse, SortConfig, User } from '../types';

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