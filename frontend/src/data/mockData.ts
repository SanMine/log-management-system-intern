// Mock data for the log management system

export interface SummaryStats {
    totalEvents: number;
    uniqueIPs: number;
    uniqueUsers: number;
    totalAlerts: number;
}

export interface TimelineDataPoint {
    time: string;
    events: number;
}

export interface TopIP {
    ip: string;
    events: number;
}

export interface TopUser {
    user: string;
    events: number;
}

export interface Alert {
    id: string;
    time: string;
    ruleName: string;
    tenant: string;
    ip: string;
    user: string;
    count: number;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

// Summary statistics
export const summaryStats: SummaryStats = {
    totalEvents: 45678,
    uniqueIPs: 1234,
    uniqueUsers: 567,
    totalAlerts: 23,
};

// Timeline data (events over time)
export const timelineData: TimelineDataPoint[] = [
    { time: '09:00', events: 245 },
    { time: '09:15', events: 312 },
    { time: '09:30', events: 289 },
    { time: '09:45', events: 356 },
    { time: '10:00', events: 423 },
    { time: '10:15', events: 398 },
    { time: '10:30', events: 445 },
    { time: '10:45', events: 512 },
    { time: '11:00', events: 478 },
    { time: '11:15', events: 534 },
    { time: '11:30', events: 489 },
    { time: '11:45', events: 456 },
    { time: '12:00', events: 423 },
    { time: '12:15', events: 367 },
    { time: '12:30', events: 334 },
];

// Top IPs
export const topIPs: TopIP[] = [
    { ip: '203.0.113.7', events: 158 },
    { ip: '10.0.1.10', events: 142 },
    { ip: '192.168.1.55', events: 128 },
    { ip: '172.16.0.23', events: 115 },
    { ip: '10.10.10.45', events: 98 },
];

// Top Users
export const topUsers: TopUser[] = [
    { user: 'alice', events: 130 },
    { user: 'bob', events: 120 },
    { user: 'charlie', events: 98 },
    { user: 'diana', events: 87 },
    { user: 'eve', events: 65 },
];

// Recent alerts for dashboard
export const recentAlerts: Alert[] = [
    {
        id: '1',
        time: '2025-12-02 21:30:01',
        ruleName: 'Failed Login Burst',
        tenant: 'demoA',
        ip: '203.0.113.7',
        user: 'eve',
        count: 6,
        status: 'OPEN',
    },
    {
        id: '2',
        time: '2025-12-02 21:25:15',
        ruleName: 'Suspicious API Access',
        tenant: 'demoB',
        ip: '10.0.1.10',
        user: 'bob',
        count: 12,
        status: 'INVESTIGATING',
    },
    {
        id: '3',
        time: '2025-12-02 21:20:43',
        ruleName: 'Multiple Source Login',
        tenant: 'demoA',
        ip: '192.168.1.55',
        user: 'alice',
        count: 4,
        status: 'OPEN',
    },
];

// Full alerts for alerts page
export const allAlerts: Alert[] = [
    {
        id: '1',
        time: '2025-12-02 21:30:01',
        ruleName: 'Failed Login Burst',
        tenant: 'demoA',
        ip: '203.0.113.7',
        user: 'eve',
        count: 6,
        status: 'OPEN',
    },
    {
        id: '2',
        time: '2025-12-02 21:25:15',
        ruleName: 'Suspicious API Access',
        tenant: 'demoB',
        ip: '10.0.1.10',
        user: 'bob',
        count: 12,
        status: 'INVESTIGATING',
    },
    {
        id: '3',
        time: '2025-12-02 21:20:43',
        ruleName: 'Multiple Source Login',
        tenant: 'demoA',
        ip: '192.168.1.55',
        user: 'alice',
        count: 4,
        status: 'OPEN',
    },
    {
        id: '4',
        time: '2025-12-02 21:15:22',
        ruleName: 'Port Scan Detected',
        tenant: 'demoC',
        ip: '172.16.0.23',
        user: 'system',
        count: 25,
        status: 'RESOLVED',
    },
    {
        id: '5',
        time: '2025-12-02 21:10:05',
        ruleName: 'Brute Force Attack',
        tenant: 'demoA',
        ip: '10.10.10.45',
        user: 'admin',
        count: 15,
        status: 'INVESTIGATING',
    },
    {
        id: '6',
        time: '2025-12-02 21:05:30',
        ruleName: 'Unusual Data Transfer',
        tenant: 'demoB',
        ip: '203.0.113.7',
        user: 'charlie',
        count: 8,
        status: 'OPEN',
    },
    {
        id: '7',
        time: '2025-12-02 21:00:18',
        ruleName: 'Privilege Escalation Attempt',
        tenant: 'demoA',
        ip: '10.0.1.10',
        user: 'diana',
        count: 3,
        status: 'RESOLVED',
    },
    {
        id: '8',
        time: '2025-12-02 20:55:47',
        ruleName: 'Failed MFA Attempts',
        tenant: 'demoC',
        ip: '192.168.1.55',
        user: 'eve',
        count: 9,
        status: 'OPEN',
    },
    {
        id: '9',
        time: '2025-12-02 20:50:12',
        ruleName: 'SQL Injection Attempt',
        tenant: 'demoB',
        ip: '172.16.0.23',
        user: 'bob',
        count: 7,
        status: 'INVESTIGATING',
    },
    {
        id: '10',
        time: '2025-12-02 20:45:33',
        ruleName: 'Unauthorized Access',
        tenant: 'demoA',
        ip: '10.10.10.45',
        user: 'alice',
        count: 5,
        status: 'RESOLVED',
    },
];

export const timeRangeOptions = [
    { value: 'last_15m', label: 'Last 15 minutes' },
    { value: 'last_1h', label: 'Last 1 hour' },
    { value: 'last_24h', label: 'Last 24 hours' },
    { value: 'last_7d', label: 'Last 7 days' },
];

export const sourceOptions = [
    { value: 'all', label: 'All' },
    { value: 'firewall', label: 'Firewall' },
    { value: 'api', label: 'API' },
    { value: 'aws', label: 'AWS' },
    { value: 'm365', label: 'M365' },
    { value: 'ad', label: 'AD' },
    { value: 'crowdstrike', label: 'CrowdStrike' },
    { value: 'network', label: 'Network' },
];

export const tenantOptions = [
    { value: 'all', label: 'All Tenants' },
    { value: '1', label: 'Tenant 1' },
    { value: '2', label: 'Tenant 2' },
    { value: '3', label: 'Tenant 3' },
];
