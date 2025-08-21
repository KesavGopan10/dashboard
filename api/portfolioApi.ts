import { PortfolioItem } from '../types';

const BASE_URL = 'http://localhost:5000/api/portfolio';

// Helper function for API requests
const apiRequest = async (endpoint: string = '', options: RequestInit = {}) => {
    // Get token from storage
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    
    // Set up headers
    const headers: Record<string, string> = {};
    
    // Don't set content-type for multipart/form-data (file uploads)
    if (!options.body || !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge headers with any provided in options
    const mergedHeaders = { ...headers, ...options.headers };
    
    // Make the request
    const response = await fetch(`${BASE_URL}${endpoint}`, { 
        ...options, 
        headers: mergedHeaders 
    });
    
    // Handle non-OK responses
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
            message: 'An unknown error occurred' 
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }
    
    // Parse and return JSON response
    return response.json();
};

/**
 * Get all portfolio items with optional section filter
 */
export const getPortfolioItems = async (section?: 'hero' | 'gallery' | 'featured'): Promise<{
    success: boolean;
    count: number;
    data: PortfolioItem[];
}> => {
    const query = section ? `?section=${section}` : '';
    const response = await apiRequest(query);
    response.data.forEach((item: PortfolioItem) => {
        item.imageUrl = `http://localhost:5000${item.imageUrl}`;
    });
    return response;
};

/**
 * Create a new portfolio item
 */
export const createPortfolioItem = async (formData: FormData): Promise<{
    success: boolean;
    data: PortfolioItem;
}> => {
    return apiRequest('', {
        method: 'POST',
        body: formData,
    });
};

/**
 * Delete a portfolio item by ID
 */
export const deletePortfolioItem = async (id: string): Promise<{
    success: boolean;
    data: {};
}> => {
    return apiRequest(`/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Update a portfolio item by ID
 */
export const updatePortfolioItem = async (id: string, formData: FormData): Promise<{
    success: boolean;
    data: PortfolioItem;
}> => {
    return apiRequest(`/${id}`, {
        method: 'PUT',
        body: formData,
    });
};