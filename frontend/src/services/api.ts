const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';

function getToken(): string | null {
    return localStorage.getItem('token');
}

function getAuthHeaders(): HeadersInit {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

export const authAPI = {
    login: (email: string, password: string) =>
        apiCall<{ token: string; user: { id: number; email: string; role: string; tenantId: number | null } }>(
            '/auth/login',
            {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }
        ),
};

export interface DashboardOverviewResponse {
    totalEvents: number;
    uniqueIps: number;
    uniqueUsers: number;
    totalAlerts: number;
    eventsOverTime: { time: string; count: number }[];
    topIps: { ip: string; count: number }[];
    topUsers: { user: string; count: number }[];
    topEventTypes: { event_type: string; count: number }[];
}

export const dashboardAPI = {
    getData: (tenantId?: string | number, timeRange?: string): Promise<DashboardOverviewResponse> => {
        const params = new URLSearchParams();
        if (tenantId) params.append('tenantId', String(tenantId));
        if (timeRange) params.append('timeRange', timeRange);

        return apiCall<DashboardOverviewResponse>(`/dashboard?${params}`);
    },
};

export const alertsAPI = {
    getAlerts: (tenantId?: string | number, status?: string, timeRange?: string) => {
        const params = new URLSearchParams();
        if (tenantId) params.append('tenantId', String(tenantId));
        if (status) params.append('status', status);
        if (timeRange) params.append('timeRange', timeRange);

        return apiCall<any[]>(`/alerts?${params}`);
    },

    updateStatus: (id: number, status: string) =>
        apiCall(`/alerts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
};

export const usersAPI = {
    getUsers: (tenantId?: string | number) => {
        const params = new URLSearchParams();
        if (tenantId) params.append('tenantId', String(tenantId));

        return apiCall<string[]>(`/users?${params}`);
    },

    getUserActivity: (username: string, tenantId?: string | number, timeRange?: string) => {
        const params = new URLSearchParams();
        if (tenantId) params.append('tenantId', String(tenantId));
        if (timeRange) params.append('timeRange', timeRange);

        const encodedUsername = encodeURIComponent(username);
        return apiCall<any>(`/users/${encodedUsername}/activity?${params}`);
    },
};

export const tenantsAPI = {
    getTenants: () => apiCall<any[]>('/tenants'),
};
