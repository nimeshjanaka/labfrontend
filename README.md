# FamilyCare Medical Laboratory – Frontend

## Tech Stack
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (custom FamilyCare brand theme)
- **React Router v6**
- **React Hook Form**
- **Zustand** (auth state)
- **Axios** (API calls)
- **Recharts** (charts)
- **React Hot Toast** (notifications)
- **Lucide React** (icons)

## Brand Colors (from letterhead)
| Token | Hex | Usage |
|---|---|---|
| `brand-navy` | `#1B4F9B` | Primary – buttons, headings, sidebar |
| `brand-navydark` | `#0F3270` | Hover states |
| `brand-red` | `#E53935` | Accent – danger, logo dot |
| `brand-sky` | `#4FC3F7` | Light accent |

## Setup

```bash
npm install
npm run dev
```

App runs on **http://localhost:5173**

Backend must be running on **http://localhost:5000**

## Pages

| Route | Page |
|---|---|
| `/login` | Login |
| `/forgot-password` | Forgot Password |
| `/reset-password` | Reset Password |
| `/dashboard` | Dashboard with stats + charts |
| `/patients` | Patient list with search |
| `/patients/:id` | Patient profile + session history |
| `/sessions` | All test sessions |
| `/sessions/:id` | Session detail + results entry |
| `/lab-tests` | Lab test catalogue (30 predefined) |
| `/history` | Patient history with date filters |
| `/reports` | Revenue + session charts |
| `/settings` | Change password + add staff |

## Key Features
- 🔐 JWT auth with auto-logout on 401
- 👤 Patient: Full Name, NIC, DOB, Gender (Male/Female/Other), Phone, Address
- 🧪 Test Session: Select tests from catalogue → Set facility + price per test → Auto total
- ➕ Add more tests to existing sessions
- 📋 Enter results per test (value, unit, normal range, remarks)
- 📄 Generate PDF report
- 📅 History with weekly/monthly/3-month/1-year/custom date filter
- 📊 Dashboard charts (Recharts)
- 🔒 Admin-only: seed tests, add staff users, deactivate tests
