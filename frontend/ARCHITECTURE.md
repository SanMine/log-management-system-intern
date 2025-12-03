# Frontend Architecture Documentation

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Routing Architecture](#routing-architecture)
4. [Data Models & Interfaces](#data-models--interfaces)
5. [Component Architecture](#component-architecture)
6. [Page Components](#page-components)
7. [State Management](#state-management)
8. [Styling System](#styling-system)
9. [RBAC Implementation](#rbac-implementation)
10. [Mock Data Architecture](#mock-data-architecture)

---

## Technology Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Routing
- **React Router DOM** - Client-side routing

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Design System** - "Slate & Royal" palette

### UI Components
- **shadcn/ui** - Base component library (customized)
- **Lucide React** - Icon system
- **Recharts** - Data visualization

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── FilterBar.tsx
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── TimelineChart.tsx
│   │   │   ├── TopListWidget.tsx
│   │   │   ├── RecentAlerts.tsx
│   │   │   └── TenantFilterDropdown.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   └── ui/                 # Base UI components (shadcn)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       └── badge.tsx
│   ├── data/                   # Mock data files
│   │   ├── mockData.ts
│   │   ├── mockDashboardData.ts
│   │   ├── mockUsersActivity.ts
│   │   └── sampleEventTypes.ts
│   ├── pages/                  # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AlertsPage.tsx
│   │   └── UsersActivityPage.tsx
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn helper)
│   ├── App.tsx                 # Root component with routing
│   ├── index.css               # Global styles & design tokens
│   └── main.tsx                # Application entry point
├── tailwind.config.js          # Tailwind configuration
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies
```

---

## Routing Architecture

### Route Configuration
Location: `src/App.tsx`

```typescript
Route Structure:
/                       → Redirect to /login
/login                  → LoginPage
/dashboard              → DashboardPage (requires auth*)
/alerts                 → AlertsPage (requires auth*)
/users-activity         → UsersActivityPage (requires auth*)
```

*Auth not implemented yet (frontend-only)

### Navigation
Handled in `DashboardLayout.tsx`:
- Dashboard (BarChart3 icon)
- Alerts (Bell icon)
- Users Activity (Users icon)
- Logout (LogOut icon)

Active route detection using `useLocation()`:
```typescript
const isActive = (path: string) => location.pathname === path;
```

---

## Data Models & Interfaces

### Core Data Types

#### Dashboard Data (`mockDashboardData.ts`)

```typescript
interface DashboardData {
  totalEvents: number;              // Aggregate event count
  uniqueIps: number;                // Distinct IP addresses
  uniqueUsers: number;              // Distinct users
  totalAlerts: number;              // Alert count
  eventsOverTime: {                 // Timeline data for chart
    time: string;                   // Format: "HH:MM"
    events: number;
  }[];
  topIps: {                         // Top IP addresses by event count
    ip: string;                     // IP address (e.g., "192.168.1.1")
    count: number;
  }[];
  topUsers: {                       // Top users by event count
    user: string;                   // Username
    count: number;
  }[];
  topEventTypes: {                  // Top event types by occurrence
    event_type: string;             // Event type name
    count: number;
  }[];
  recentAlerts: {                   // Recent security alerts
    id: string;
    time: string;                   // Format: "YYYY-MM-DD HH:MM:SS"
    ruleName: string;               // Alert rule name
    ip: string;
    user: string;
    count: number;                  // Occurrence count
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  }[];
}

// Multi-tenant data structure
mockDashboardData: Record<string, DashboardData> = {
  'all': { ...data },               // Aggregated across all tenants
  'A.website.com': { ...data },     // Tenant A specific
  'B.website.com': { ...data },     // Tenant B specific
  'C.website.com': { ...data }      // Tenant C specific
}
```

**Usage:**
- DashboardPage selects data based on `selectedTenant` state
- All dashboard widgets consume this data
- Example: `const data = mockDashboardData[selectedTenant]`

#### User Activity Data (`mockUsersActivity.ts`)

```typescript
interface UserActivitySummary {
  totalEvents: number;              // Total events for this user
  uniqueIps: number;                // Unique IPs used by user
  totalAlerts: number;              // Alerts involving this user
}

interface UserEventRow {
  time: string;                     // Event timestamp
  eventType: string;                // Type of event
  source: string;                   // Event source system
  ip: string;                       // Source IP
  tenantId: string;                 // Tenant identifier (A/B/C)
}

interface UserAlertRow {
  time: string;
  ruleName: string;                 // Alert rule triggered
  tenantId: string;
  ip: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

interface UserActivityData {
  summary: UserActivitySummary;
  eventsOverTime: {                 // Timeline for chart
    time: string;
    count: number;
  }[];
  recentEvents: UserEventRow[];     // Recent user events
  relatedAlerts: UserAlertRow[];    // Alerts for this user
}

// User to tenant mapping
mockUsersByTenant: Record<string, string[]> = {
  A: ['alice', 'charlie'],
  B: ['bob'],
  C: ['diana']
}

// Per-user activity data
mockUserActivity: Record<string, UserActivityData> = {
  'alice': { ...activityData },
  'bob': { ...activityData },
  'charlie': { ...activityData },
  'diana': { ...activityData }
}
```

**Usage:**
- UsersActivityPage filters users by tenant
- Displays activity for selected user
- Example: `const data = mockUserActivity[selectedUser]`

#### Alerts Data (`mockData.ts`)

```typescript
interface Alert {
  id: string;                       // Unique identifier
  time: string;                     // Alert timestamp
  ruleName: string;                 // Triggering rule
  tenant: string;                   // Tenant ID
  ip: string;                       // Source IP
  user: string;                     // Associated user
  count: number;                    // Event count
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

// Collections
recentAlerts: Alert[]               // For dashboard (3 items)
allAlerts: Alert[]                  // For alerts page (10+ items)
```

**Usage:**
- DashboardPage: Shows 3 recent alerts
- AlertsPage: Shows full alerts table with filters
- Status determines badge color (red/amber/green)

#### Static Reference Data

```typescript
// Time range options
timeRangeOptions = [
  { value: '15m', label: 'Last 15 minutes' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' }
]

// Source system options
sourceOptions = [
  { value: 'all', label: 'All' },
  { value: 'firewall', label: 'Firewall' },
  { value: 'api', label: 'API' },
  { value: 'aws', label: 'AWS' },
  { value: 'm365', label: 'M365' },
  { value: 'ad', label: 'AD' },
  { value: 'crowdstrike', label: 'CrowdStrike' },
  { value: 'network', label: 'Network' }
]

// Tenant options (for RBAC)
tenantOptions = [
  { value: 'all', label: 'All Tenants' },
  { value: 'A.website.com', label: 'A.website.com' },
  { value: 'B.website.com', label: 'B.website.com' },
  { value: 'C.website.com', label: 'C.website.com' }
]
```

---

## Component Architecture

### Layout Components

#### DashboardLayout
**Location:** `src/components/layout/DashboardLayout.tsx`

**Purpose:** Main application layout with navigation

**Props:**
```typescript
interface DashboardLayoutProps {
  children: ReactNode;              // Page content
}
```

**Features:**
- Sticky header with LogSentinel branding
- Navigation links (Dashboard, Alerts, Users Activity)
- Active route highlighting
- Logout button
- Clean white header on slate background

**Usage:**
```tsx
<DashboardLayout>
  <YourPageContent />
</DashboardLayout>
```

#### AuthLayout
**Location:** `src/components/layout/AuthLayout.tsx`

**Purpose:** Layout for authentication pages

**Props:**
```typescript
interface AuthLayoutProps {
  children: ReactNode;
}
```

**Features:**
- Centered content card
- Animated gradient background
- Responsive design

---

### Dashboard Components

#### FilterBar
**Location:** `src/components/dashboard/FilterBar.tsx`

**Purpose:** Filter controls for dashboard

**Props:**
```typescript
interface FilterBarProps {
  tenant: string;                   // Selected tenant
  onTenantChange: (tenant: string) => void;
}
```

**Internal State:**
- `timeRange`: Currently selected time range
- `source`: Currently selected source

**Features:**
- 3 dropdowns: Time Range, Source, Tenant
- Responsive layout (wraps on mobile)
- Solid white card with subtle shadow

**Usage:**
```tsx
<FilterBar 
  tenant={selectedTenant}
  onTenantChange={setSelectedTenant}
/>
```

#### SummaryCard
**Location:** `src/components/dashboard/SummaryCard.tsx`

**Purpose:** Display key metrics

**Props:**
```typescript
interface SummaryCardProps {
  title: string;                    // Card title (e.g., "Total Events")
  value: number;                    // Metric value
  icon: LucideIcon;                 // Icon component
}
```

**Features:**
- Premium white card design
- Animated hover effect (lift + shadow)
- Icon with colored background (brand-50)
- Hover changes icon background to brand-600
- Large, bold number display

**Usage:**
```tsx
<SummaryCard
  title="Total Events"
  value={45678}
  icon={Activity}
/>
```

#### TimelineChart
**Location:** `src/components/dashboard/TimelineChart.tsx`

**Purpose:** Area chart showing events over time

**Props:**
```typescript
interface TimelineChartProps {
  data: {                           // Chart data points
    time: string;                   // X-axis label
    events: number;                 // Y-axis value
  }[];
}
```

**Features:**
- Recharts area chart
- Royal blue gradient fill
- Smooth animations
- Clean tooltips
- Responsive container (300px height)

**Usage:**
```tsx
<TimelineChart data={dashboardData.eventsOverTime} />
```

#### TopListWidget
**Location:** `src/components/dashboard/TopListWidget.tsx`

**Purpose:** Reusable table widget for top items

**Props:**
```typescript
interface TopListWidgetProps {
  title: string;                    // Widget title
  items: {                          // Table rows
    label: string;                  // Left column (e.g., IP, username)
    value: number;                  // Right column (count)
  }[];
  labelHeader: string;              // Left column header
  valueHeader: string;              // Right column header
}
```

**Features:**
- Premium card design
- Clean table with hover states
- Right-aligned value column
- Brand-colored values

**Usage:**
```tsx
<TopListWidget
  title="Top IPs"
  items={topIPItems}
  labelHeader="IP Address"
  valueHeader="Events"
/>
```

#### RecentAlerts
**Location:** `src/components/dashboard/RecentAlerts.tsx`

**Purpose:** Display recent security alerts

**Props:**
```typescript
interface RecentAlertsProps {
  alerts: {
    id: string;
    time: string;
    ruleName: string;
    ip: string;
    user: string;
    count: number;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  }[];
}
```

**Features:**
- Status badges with icons and colors
  - OPEN: Red background, AlertCircle icon
  - INVESTIGATING: Amber background, Clock icon
  - RESOLVED: Green background, CheckCircle icon
- "View All" button to navigate to /alerts
- Clickable rows
- Clean table layout

**Usage:**
```tsx
<RecentAlerts alerts={dashboardData.recentAlerts} />
```

#### TenantFilterDropdown
**Location:** `src/components/dashboard/TenantFilterDropdown.tsx`

**Purpose:** Tenant selection dropdown

**Props:**
```typescript
interface TenantFilterDropdownProps {
  value: string;                    // Selected tenant
  onChange: (tenant: string) => void;
  options: {                        // Available options
    label: string;
    value: string;
  }[];
}
```

**Features:**
- Matches FilterBar styling
- Can be disabled (for Viewer role)
- Uppercase label

**Usage:**
```tsx
<TenantFilterDropdown
  value={selectedTenant}
  onChange={setSelectedTenant}
  options={tenantOptions}
/>
```

---

## Page Components

### DashboardPage
**Location:** `src/pages/DashboardPage.tsx`

**Purpose:** Main analytics dashboard

**State:**
```typescript
const [selectedTenant, setSelectedTenant] = useState('all');
```

**Data Flow:**
```typescript
// 1. Get data for selected tenant
const dashboardData = mockDashboardData[selectedTenant];

// 2. Transform data for components
const topIPItems = dashboardData.topIps.map(item => ({
  label: item.ip,
  value: item.count
}));

// 3. Pass to child components
<SummaryCard value={dashboardData.totalEvents} />
<TimelineChart data={dashboardData.eventsOverTime} />
<TopListWidget items={topIPItems} />
```

**Sections:**
1. **Page Title** - "Admin Dashboard"
2. **FilterBar** - Time Range, Source, Tenant selectors
3. **Summary Cards** (4 cards in grid)
   - Total Events
   - Unique IPs
   - Unique Users  
   - Total Alerts
4. **Timeline Chart** - Events over time
5. **Top Lists** (3 columns on large screens)
   - Top IPs
   - Top Users
   - Top Event Types
6. **Recent Alerts** - Latest 3 alerts

**Animations:**
- Staggered slide-up animations on mount
- Smooth transitions on data change

### AlertsPage
**Location:** `src/pages/AlertsPage.tsx`

**Purpose:** Full alerts management view

**State:**
```typescript
const [selectedStatus, setSelectedStatus] = useState('all');
const [selectedTenant, setSelectedTenant] = useState('all');
```

**Data Flow:**
```typescript
// Filter alerts by selections
const filteredAlerts = allAlerts.filter(alert => {
  if (selectedStatus !== 'all' && alert.status !== selectedStatus)
    return false;
  if (selectedTenant !== 'all' && alert.tenant !== selectedTenant)
    return false;
  return true;
});
```

**Features:**
- Status filter (All, Open, Investigating, Resolved)
- Tenant filter
- Full alerts table
- Clickable rows
- Status badges

### UsersActivityPage
**Location:** `src/pages/UsersActivityPage.tsx`

**Purpose:** Per-user activity analysis

**State:**
```typescript
const [selectedTenant, setSelectedTenant] = useState('all');
const [selectedUser, setSelectedUser] = useState('');
const [timeRange, setTimeRange] = useState('24h');
```

**RBAC Logic:**
```typescript
// Determine available tenants based on role
const availableTenants = mockCurrentUser.role === 'ADMIN'
  ? ['all', 'A', 'B', 'C']
  : [mockCurrentUser.tenantId];

// Lock tenant for Viewer role
const effectiveTenant = mockCurrentUser.role === 'VIEWER'
  ? mockCurrentUser.tenantId
  : selectedTenant;
```

**Data Flow:**
```typescript
// 1. Filter users by tenant
const availableUsers = getUsersForTenant(effectiveTenant);

// 2. Get activity data for selected user
const userActivityData = selectedUser
  ? mockUserActivity[selectedUser]
  : null;

// 3. Render sections conditionally
{!selectedUser ? (
  <EmptyState />
) : (
  <>
    <SummaryCards data={userActivityData.summary} />
    <ActivityChart data={userActivityData.eventsOverTime} />
    <EventsTable data={userActivityData.recentEvents} />
    <AlertsTable data={userActivityData.relatedAlerts} />
  </>
)}
```

**Sections:**
1. **Page Title** - "User Activity"
2. **Filter Bar**
   - Time Range dropdown
   - Tenant dropdown (RBAC-aware, can be disabled)
   - User selector (filtered by tenant)
3. **Empty State** (when no user selected)
   - Icon + message
4. **Summary Cards** (when user selected)
   - Total Events
   - Unique IPs
   - Total Alerts
5. **Activity Timeline** - Line chart
6. **Recent Events Table**
   - Time, Event Type, Source, IP, Tenant
7. **Related Alerts Table**
   - Time, Rule Name, Tenant, IP, Status

**User Filtering:**
- Tenant A: Shows alice, charlie
- Tenant B: Shows bob
- Tenant C: Shows diana
- All Tenants: Shows all users

---

## State Management

### Current Approach: Component State

**React useState** for local component state:

```typescript
// DashboardPage
const [selectedTenant, setSelectedTenant] = useState('all');

// UsersActivityPage
const [selectedTenant, setSelectedTenant] = useState('all');
const [selectedUser, setSelectedUser] = useState('');
const [timeRange, setTimeRange] = useState('24h');

// AlertsPage
const [selectedStatus, setSelectedStatus] = useState('all');
const [selectedTenant, setSelectedTenant] = useState('all');
```

### State Reset Pattern

When changing parent filters, reset dependent state:

```typescript
const handleTenantChange = (tenant: string) => {
  setSelectedTenant(tenant);
  setSelectedUser('');  // Reset user when tenant changes
};
```

### Future: Context API (Not Implemented)

For global state like authentication:

```typescript
// Proposed structure
interface AuthContext {
  user: {
    id: string;
    role: 'ADMIN' | 'VIEWER';
    tenantId: string;
  } | null;
  login: (credentials) => void;
  logout: () => void;
}
```

---

## Styling System

### Design Tokens
Location: `src/index.css` + `tailwind.config.js`

#### Color Palette: "Slate & Royal"

**CSS Variables** (`index.css`):
```css
:root {
  /* Background colors */
  --background: 210 40% 98%;        /* slate-50 */
  --foreground: 222 47% 11%;        /* slate-900 */
  
  /* Component colors */
  --card: 0 0% 100%;                /* white */
  --popover: 0 0% 100%;             /* white */
  
  /* Primary (Royal Blue) */
  --primary: 221 83% 53%;           /* brand-600 */
  --primary-foreground: 210 40% 98%;
  
  /* Borders */
  --border: 214.3 31.8% 91.4%;     /* slate-200 */
  --input: 214.3 31.8% 91.4%;
  --ring: 221 83% 53%;              /* brand-600 */
}
```

**Tailwind Extended Colors** (`tailwind.config.js`):
```javascript
colors: {
  // Brand (Royal Blue)
  brand: {
    50: '#eff6ff',   // Very light blue backgrounds
    600: '#2563eb',  // Primary action color
    700: '#1d4ed8',  // Hover states
  },
  
  // Slate (Neutral)
  slate: {
    50: '#f8fafc',   // Main app background
    100: '#f1f5f9',  // Secondary backgrounds
    200: '#e2e8f0',  // Borders
    500: '#64748b',  // Secondary text
    600: '#475569',  // Body text
    900: '#0f172a',  // Headings
  },
  
  // Semantic
  success: {
    light: '#dcfce7',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  danger: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#b91c1c',
  },
}
```

#### Custom Utility Classes

**Premium Card** (`index.css`):
```css
.card-premium {
  @apply bg-white border border-slate-200 shadow-sm rounded-xl 
         transition-all duration-200;
}

.card-premium:hover {
  @apply shadow-md border-slate-300 transform -translate-y-[2px];
}
```

**Glass Effect**:
```css
.glass-subtle {
  @apply bg-white/90 backdrop-blur-sm border-b border-slate-200;
}
```

**Typography**:
```css
h1, h2, h3, h4, h5, h6 {
  @apply text-slate-900 font-bold tracking-tight;
}
```

#### Animations

**Keyframes** (`tailwind.config.js`):
```javascript
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
}

animation: {
  'fade-in': 'fadeIn 0.3s ease-out',
  'slide-up': 'slideUp 0.4s ease-out',
}
```

**Usage**:
```tsx
<div className="animate-slide-up">
  <Card />
</div>

<div className="animate-slide-up delay-100">
  <Card />
</div>
```

**Animation Delays**:
```css
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
```

---

## RBAC Implementation

### Current User Mock
Location: `src/data/mockUsersActivity.ts`

```typescript
export const mockCurrentUser = {
  role: 'ADMIN' as 'ADMIN' | 'VIEWER',
  tenantId: 'A',  // Only used if role is VIEWER
};
```

### Role-Based Logic

#### Admin Role
- Can select **any tenant** (All, A, B, C)
- Can view **all users** within selected tenant
- Tenant dropdown is **enabled**

```typescript
const availableTenants = ['all', 'A', 'B', 'C'];
```

#### Viewer Role
- Tenant is **locked** to their assigned tenant
- Can only view **users from their tenant**
- Tenant dropdown is **disabled**

```typescript
const availableTenants = [mockCurrentUser.tenantId];  // e.g., ['A']
```

### Implementation in UsersActivityPage

```typescript
// Determine available tenants
const availableTenants = mockCurrentUser.role === 'ADMIN'
  ? ['all', 'A', 'B', 'C']
  : [mockCurrentUser.tenantId];

// Effective tenant (locks for Viewer)
const effectiveTenant = mockCurrentUser.role === 'VIEWER'
  ? mockCurrentUser.tenantId
  : selectedTenant;

// Filter users by effective tenant
const availableUsers = getUsersForTenant(effectiveTenant);

// Disable dropdown for Viewer
<Select 
  value={effectiveTenant}
  onValueChange={handleTenantChange}
  disabled={mockCurrentUser.role === 'VIEWER'}
>
```

### Helper Functions

```typescript
// Get all users across all tenants
export const getAllUsers = (): string[] => {
  return Object.values(mockUsersByTenant).flat();
  // Returns: ['alice', 'charlie', 'bob', 'diana']
};

// Get users for a specific tenant
export const getUsersForTenant = (tenantId: string): string[] => {
  if (tenantId === 'all') {
    return getAllUsers();
  }
  return mockUsersByTenant[tenantId] || [];
  // tenantId 'A' returns: ['alice', 'charlie']
  // tenantId 'B' returns: ['bob']
};
```

---

## Mock Data Architecture

### Data Organization

**Purpose:** Simulate backend API responses for frontend development

**Principles:**
1. **Realistic data** - Representative of production
2. **Multi-tenant** - Separate data per tenant
3. **Consistent relationships** - IPs, users, tenants align
4. **Typed interfaces** - Full TypeScript support

### Data Files

#### mockData.ts
**Purpose:** Legacy/shared data

**Exports:**
- `summaryStats` - Dashboard summary (unused after tenant filtering)
- `timelineData` - Chart data (unused)
- `topIPs` - Top IPs (unused)
- `topUsers` - Top users (unused)
- `recentAlerts` - Dashboard alerts (for non-tenant view)
- `allAlerts` - Full alerts list
- `timeRangeOptions` - Filter options
- `sourceOptions` - Source filter
- `tenantOptions` - Tenant filter

#### mockDashboardData.ts
**Purpose:** Tenant-specific dashboard data

**Structure:**
```typescript
mockDashboardData = {
  'all': {
    totalEvents: 45678,
    // ... complete data
  },
  'A.website.com': {
    totalEvents: 18542,
    // ... tenant A data
  },
  'B.website.com': { ... },
  'C.website.com': { ... }
}
```

**Usage Pattern:**
```typescript
const data = mockDashboardData[selectedTenant];
```

#### mockUsersActivity.ts
**Purpose:** User activity data with RBAC

**Structure:**
```typescript
// User to tenant mapping
mockUsersByTenant = {
  A: ['alice', 'charlie'],
  B: ['bob'],
  C: ['diana']
}

// Per-user activity
mockUserActivity = {
  'alice': {
    summary: { totalEvents: 1245, ... },
    eventsOverTime: [...],
    recentEvents: [...],
    relatedAlerts: [...]
  },
  // ... other users
}

// Current user (for RBAC)
mockCurrentUser = {
  role: 'ADMIN',
  tenantId: 'A'
}
```

**Helper Functions:**
- `getAllUsers()` - Returns all usernames
- `getUsersForTenant(tenantId)` - Returns users for specific tenant

#### sampleEventTypes.ts
**Purpose:** Event type samples (legacy)

**Data:**
```typescript
sampleEventTypes = [
  { event_type: 'login_failed', count: 120 },
  { event_type: 'UserLoggedIn', count: 95 },
  // ...
]
```

---

## Component Props Reference

### Quick Reference Table

| Component | Required Props | Optional Props | State |
|-----------|---------------|----------------|-------|
| DashboardLayout | children | - | location |
| FilterBar | tenant, onTenantChange | - | timeRange, source |
| SummaryCard | title, value, icon | - | - |
| TimelineChart | data | - | - |
| TopListWidget | title, items, labelHeader, valueHeader | - | - |
| RecentAlerts | alerts | - | - |
| TenantFilterDropdown | value, onChange, options | - | - |

---

## Build & Development

### Scripts
```json
{
  "dev": "vite",              // Development server
  "build": "tsc && vite build", // Production build
  "preview": "vite preview",  // Preview production build
  "lint": "eslint ."          // Run linter
}
```

### Environment
- Dev Server: `http://localhost:5174`
- Hot Module Replacement (HMR) enabled
- TypeScript strict mode

### Dependencies

**Core:**
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^7.1.1

**UI & Styling:**
- tailwindcss: ^3.4.17
- lucide-react: ^0.469.0
- recharts: ^2.15.0

**Build:**
- vite: ^6.0.5
- typescript: ^5.6.2

---

## Future Enhancements

### Planned Features
1. **Authentication Context**
   - Real login/logout
   - JWT token management
   - Protected routes

2. **API Integration**
   - Replace mock data with API calls
   - Error handling
   - Loading states

3. **Real-time Updates**
   - WebSocket connection
   - Live dashboard updates

4. **Advanced Filtering**
   - Date range picker
   - Multi-select filters
   - Saved filter presets

5. **Export Functionality**
   - CSV export
   - PDF reports

6. **User Management**
   - User profile page
   - Settings page
   - Notification preferences

---

## Summary

This frontend is a **React + TypeScript** application built with **Vite**, using **Tailwind CSS** for styling and **shadcn/ui** for component primitives. The architecture follows a **component-based** design with **mock data** simulating a multi-tenant security log management system.

**Key architectural decisions:**
- **No global state management** - Using component state for simplicity
- **Mock data driven** - All data from static files for frontend-only development
- **RBAC ready** - Infrastructure for role-based access control in place
- **Tenant-aware** - All data structures support multi-tenancy
- **Type-safe** - Full TypeScript coverage with explicit interfaces
- **Premium design** - Professional "Slate & Royal" color system with subtle animations

The system is ready for backend integration while providing a fully functional frontend experience for development and demonstration purposes.
