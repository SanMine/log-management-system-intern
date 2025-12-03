// Mock data for user activity page with RBAC support

export interface UserActivitySummary {
    totalEvents: number;
    uniqueIps: number;
    totalAlerts: number;
}

export interface UserEventRow {
    time: string;
    eventType: string;
    source: string;
    ip: string;
    tenantId: string;
}

export interface UserAlertRow {
    time: string;
    ruleName: string;
    tenantId: string;
    ip: string;
    status: "OPEN" | "INVESTIGATING" | "RESOLVED";
}

export interface UserActivityData {
    summary: UserActivitySummary;
    eventsOverTime: { time: string; count: number }[];
    recentEvents: UserEventRow[];
    relatedAlerts: UserAlertRow[];
}

// Map users to their tenants
export const mockUsersByTenant: Record<string, string[]> = {
    A: ["alice", "charlie"],
    B: ["bob"],
    C: ["diana"],
};

// Complete activity data for each user
export const mockUserActivity: Record<string, UserActivityData> = {
    alice: {
        summary: {
            totalEvents: 1245,
            uniqueIps: 3,
            totalAlerts: 2,
        },
        eventsOverTime: [
            { time: '09:00', count: 45 },
            { time: '09:30', count: 52 },
            { time: '10:00', count: 68 },
            { time: '10:30', count: 71 },
            { time: '11:00', count: 63 },
            { time: '11:30', count: 58 },
            { time: '12:00', count: 49 },
            { time: '12:30', count: 41 },
        ],
        recentEvents: [
            {
                time: '2025-12-02 12:34:15',
                eventType: 'UserLoggedIn',
                source: 'AWS',
                ip: '192.168.1.55',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 12:28:03',
                eventType: 'FileAccess',
                source: 'API',
                ip: '192.168.1.55',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 11:45:22',
                eventType: 'CreateUser',
                source: 'AD',
                ip: '10.0.1.15',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 11:12:08',
                eventType: 'UserLoggedIn',
                source: 'M365',
                ip: '192.168.1.55',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 10:55:31',
                eventType: 'login_failed',
                source: 'API',
                ip: '203.0.113.7',
                tenantId: 'A',
            },
        ],
        relatedAlerts: [
            {
                time: '2025-12-02 21:30:01',
                ruleName: 'Failed Login Burst',
                tenantId: 'A',
                ip: '203.0.113.7',
                status: 'OPEN',
            },
            {
                time: '2025-12-02 21:20:43',
                ruleName: 'Multiple Source Login',
                tenantId: 'A',
                ip: '192.168.1.55',
                status: 'INVESTIGATING',
            },
        ],
    },
    bob: {
        summary: {
            totalEvents: 892,
            uniqueIps: 2,
            totalAlerts: 3,
        },
        eventsOverTime: [
            { time: '09:00', count: 32 },
            { time: '09:30', count: 38 },
            { time: '10:00', count: 51 },
            { time: '10:30', count: 59 },
            { time: '11:00', count: 48 },
            { time: '11:30', count: 44 },
            { time: '12:00', count: 37 },
            { time: '12:30', count: 29 },
        ],
        recentEvents: [
            {
                time: '2025-12-02 12:41:22',
                eventType: 'UserLoggedIn',
                source: 'API',
                ip: '10.0.1.10',
                tenantId: 'B',
            },
            {
                time: '2025-12-02 12:15:18',
                eventType: 'malware_detected',
                source: 'CrowdStrike',
                ip: '10.0.1.10',
                tenantId: 'B',
            },
            {
                time: '2025-12-02 11:52:45',
                eventType: 'login_failed',
                source: 'Firewall',
                ip: '172.16.0.23',
                tenantId: 'B',
            },
            {
                time: '2025-12-02 11:28:09',
                eventType: 'FileAccess',
                source: 'API',
                ip: '10.0.1.10',
                tenantId: 'B',
            },
            {
                time: '2025-12-02 10:45:33',
                eventType: 'UserLoggedIn',
                source: 'M365',
                ip: '10.0.1.10',
                tenantId: 'B',
            },
        ],
        relatedAlerts: [
            {
                time: '2025-12-02 21:25:15',
                ruleName: 'Suspicious API Access',
                tenantId: 'B',
                ip: '10.0.1.10',
                status: 'INVESTIGATING',
            },
            {
                time: '2025-12-02 21:10:05',
                ruleName: 'Malware Detected',
                tenantId: 'B',
                ip: '10.0.1.10',
                status: 'OPEN',
            },
            {
                time: '2025-12-02 20:50:12',
                ruleName: 'Failed Login Attempts',
                tenantId: 'B',
                ip: '172.16.0.23',
                status: 'RESOLVED',
            },
        ],
    },
    charlie: {
        summary: {
            totalEvents: 567,
            uniqueIps: 2,
            totalAlerts: 1,
        },
        eventsOverTime: [
            { time: '09:00', count: 22 },
            { time: '09:30', count: 28 },
            { time: '10:00', count: 35 },
            { time: '10:30', count: 41 },
            { time: '11:00', count: 38 },
            { time: '11:30', count: 33 },
            { time: '12:00', count: 27 },
            { time: '12:30', count: 21 },
        ],
        recentEvents: [
            {
                time: '2025-12-02 12:38:50',
                eventType: 'UserLoggedIn',
                source: 'AD',
                ip: '192.168.2.100',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 12:05:12',
                eventType: 'FileAccess',
                source: 'API',
                ip: '192.168.2.100',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 11:42:37',
                eventType: 'UserLoggedIn',
                source: 'AWS',
                ip: '10.5.5.20',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 11:15:28',
                eventType: 'PasswordChange',
                source: 'AD',
                ip: '192.168.2.100',
                tenantId: 'A',
            },
            {
                time: '2025-12-02 10:52:14',
                eventType: 'UserLoggedIn',
                source: 'M365',
                ip: '192.168.2.100',
                tenantId: 'A',
            },
        ],
        relatedAlerts: [
            {
                time: '2025-12-02 20:45:33',
                ruleName: 'Unusual Data Transfer',
                tenantId: 'A',
                ip: '192.168.2.100',
                status: 'RESOLVED',
            },
        ],
    },
    diana: {
        summary: {
            totalEvents: 734,
            uniqueIps: 4,
            totalAlerts: 2,
        },
        eventsOverTime: [
            { time: '09:00', count: 28 },
            { time: '09:30', count: 34 },
            { time: '10:00', count: 43 },
            { time: '10:30', count: 49 },
            { time: '11:00', count: 45 },
            { time: '11:30', count: 39 },
            { time: '12:00', count: 32 },
            { time: '12:30', count: 26 },
        ],
        recentEvents: [
            {
                time: '2025-12-02 12:44:18',
                eventType: 'UserLoggedIn',
                source: 'API',
                ip: '10.10.10.45',
                tenantId: 'C',
            },
            {
                time: '2025-12-02 12:22:35',
                eventType: 'malware_detected',
                source: 'CrowdStrike',
                ip: '172.16.0.88',
                tenantId: 'C',
            },
            {
                time: '2025-12-02 11:58:47',
                eventType: 'FileAccess',
                source: 'AWS',
                ip: '10.10.10.45',
                tenantId: 'C',
            },
            {
                time: '2025-12-02 11:33:52',
                eventType: 'login_failed',
                source: 'Firewall',
                ip: '203.0.113.7',
                tenantId: 'C',
            },
            {
                time: '2025-12-02 10:48:19',
                eventType: 'UserLoggedIn',
                source: 'M365',
                ip: '10.10.10.45',
                tenantId: 'C',
            },
        ],
        relatedAlerts: [
            {
                time: '2025-12-02 21:05:30',
                ruleName: 'Malware Scan Alert',
                tenantId: 'C',
                ip: '172.16.0.88',
                status: 'INVESTIGATING',
            },
            {
                time: '2025-12-02 20:55:47',
                ruleName: 'Failed MFA Attempts',
                tenantId: 'C',
                ip: '203.0.113.7',
                status: 'OPEN',
            },
        ],
    },
};

// Get all users across all tenants
export const getAllUsers = (): string[] => {
    return Object.values(mockUsersByTenant).flat();
};

// Get users for a specific tenant
export const getUsersForTenant = (tenantId: string): string[] => {
    if (tenantId === 'all') {
        return getAllUsers();
    }
    return mockUsersByTenant[tenantId] || [];
};

// Mock current user for RBAC (can be changed for testing)
export const mockCurrentUser = {
    role: 'ADMIN' as 'ADMIN' | 'VIEWER',
    tenantId: 'A', // Only used if role is VIEWER
};
