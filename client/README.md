# GearGuard Frontend

Production-grade maintenance tracking system built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **React Query** (@tanstack/react-query)
- **Zustand** (state management)
- **Axios** (HTTP client)
- **@dnd-kit** (drag-and-drop for Kanban)
- **date-fns** (date utilities)

## Getting Started

### Development with Mock Data (Default)

The frontend uses JSON mock data by default, so you can run it without a backend:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login Credentials (Mock Mode)

Use any of these test accounts:

- **Admin**: john.admin@gearguard.com (any password)
- **Manager**: sarah.manager@gearguard.com (any password)
- **Technician**: mike.technician@gearguard.com (any password)
- **User**: emily.user@gearguard.com (any password)

### Using Real Backend API

To connect to a real backend, create a `.env.local` file:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── equipment/       # Equipment management
│   │   ├── requests/        # Maintenance requests (Kanban, Calendar, Detail)
│   │   ├── teams/           # Team management
│   │   ├── technicians/     # Technician management
│   │   └── reports/         # Reports and analytics
│   └── api/                 # API routes
├── components/
│   └── layout/              # Layout components (Navbar, etc.)
├── lib/
│   ├── api.ts               # API client (switches between mock/real)
│   ├── mockApi.ts           # Mock API using JSON data
│   ├── auth.ts              # Authentication utilities
│   └── permissions.ts       # RBAC helpers
├── store/
│   └── authStore.ts         # Zustand auth store
├── types/
│   ├── users.ts             # User, Department, Team types
│   ├── equipment.ts         # Equipment types
│   ├── requests.ts          # MaintenanceRequest, TimeLog types
│   └── technicians.ts       # Technician types
└── middleware.ts            # Route protection

data/                        # Mock JSON data
├── users.json
├── equipment.json
├── maintenance_requests.json
├── technicians.json
├── time_logs.json
├── departments.json
└── maintenance_teams.json
```

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes via middleware
- Roles: `user`, `technician`, `manager`, `admin`

### Equipment Management
- Equipment list with maintenance count smart button
- Equipment detail view with linked maintenance requests
- Status tracking: operational, maintenance, out_of_service, scrapped

### Maintenance Requests
- **Kanban Board**: Drag-and-drop to update stages (new → in_progress → repaired → scrap)
- **Calendar View**: Schedule preventive maintenance
- **Detail View**: Request details with time logs and technician assignments
- Request types: corrective, preventive
- Priority levels: low, medium, high, critical

### Time Logging
- Technicians can log hours worked
- Time logs linked to maintenance requests

### Design System
- Dark-theme-only industrial SaaS design
- Deep charcoal backgrounds (#0f1419, #1a1f26)
- Functional color usage (red for critical, amber for warnings, green for completed)
- Calm, predictable, enterprise-grade UX

## Key Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Dashboard overview
- `/dashboard/equipment` - Equipment list
- `/dashboard/equipment/[id]` - Equipment detail
- `/dashboard/requests/kanban` - Kanban board
- `/dashboard/requests/calendar` - Preventive maintenance calendar
- `/dashboard/requests/[id]` - Request detail
- `/dashboard/teams` - Teams management
- `/dashboard/technicians` - Technicians management
- `/dashboard/reports` - Reports

## Environment Variables

Create a `.env.local` file:

```env
# Use mock data (true) or real backend API (false)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Backend API URL (when mock data is disabled)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## RBAC Permissions

- **User**: Create corrective requests
- **Technician**: Assign self, update stages, log time
- **Manager/Admin**: Preventive scheduling, reports, scrap equipment

## Notes

- All IDs are UUIDs
- Enums match backend exactly
- Optimistic updates on Kanban drag-and-drop
- TypeScript strict mode enabled
- Mock data simulates 300-500ms network delay
