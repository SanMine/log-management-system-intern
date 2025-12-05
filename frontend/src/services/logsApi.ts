// API helper for log search
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004/api';

// Get auth token from localStorage
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export interface LogSearchParams {
    tenant: string;
    user?: string;
    from: string;  // ISO datetime
    to: string;    // ISO datetime
    q?: string;    // Search query
    page?: number;
    limit?: number;
}

export interface LogSearchResponse {
    data: any[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

/**
 * Search logs with filters and pagination
 */
export async function searchLogs(params: LogSearchParams): Promise<LogSearchResponse> {
    const queryParams = new URLSearchParams();

    // Required params
    queryParams.append('tenant', params.tenant);
    queryParams.append('from', params.from);
    queryParams.append('to', params.to);

    // Optional params
    if (params.user && params.user !== 'ALL') {
        queryParams.append('user', params.user);
    }
    if (params.q && params.q.trim()) {
        queryParams.append('q', params.q.trim());
    }
    if (params.page) {
        queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
        queryParams.append('limit', params.limit.toString());
    }

    const response = await fetch(
        `${API_BASE_URL}/logs/search?${queryParams.toString()}`,
        {
            method: 'GET',
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Search failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}
