# Personal Finance Manager

A modern, full-featured personal financial management web application to track income and expenses with detailed categorization, analytics, and beautiful visualizations.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## 📋 Features

### Dashboard Analytics

- **Financial Overview**: View total income, expenses, net balance, and transaction count
- **Interactive Charts**:
  - Pie chart for expense breakdown by category
  - Line chart showing income vs expense trends
  - Monthly trend analysis
- **Recent Transactions**: Quick access to your latest 10 transactions
- **Month Selector**: Navigate through historical data

### Transaction Management

- **CRUD Operations**: Create, read, update, and delete transactions
- **Categories**:
  - **Income**: Salary, Freelance, Investment, Gift, Other Income
  - **Expenses**: Shopee Spend, Badminton, Tech Stuff, Rackets, Food & Dining, Transportation, Bills & Utilities, Entertainment, Healthcare, Other Expenses
- **Smart Filtering**: Filter by type, category, and date range
- **Advanced Search**: Debounced search by description
- **Sorting**: Sort by date, amount, or category
- **Bulk Actions**: Delete multiple transactions at once
- **Pagination**: 20 items per page for optimal performance

### User Experience

- **Responsive Design**: Mobile-first approach, works on all devices
- **Real-time Updates**: Dashboard refreshes automatically after changes
- **Form Validation**: Client and server-side validation
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error messages
- **Clean UI**: Modern, accessible interface using shadcn/ui

## 🛠️ Technology Stack

### Core

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Prisma**: Modern ORM for database management
- **SQLite**: Lightweight, file-based database

### UI & Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Beautiful icon library

### Data Visualization

- **Recharts**: Composable charting library
- **date-fns**: Modern JavaScript date utility library

### Development

- **Playwright**: End-to-end testing framework
- **ESLint**: Code linting
- **pnpm**: Fast, disk space efficient package manager

## 📁 Project Structure

```
temp-fm-app/
├── app/
│   ├── api/
│   │   └── transactions/
│   │       ├── route.ts              # GET, POST transactions
│   │       ├── [id]/route.ts         # GET, PUT, DELETE by ID
│   │       └── stats/route.ts        # GET statistics
│   ├── transactions/
│   │   ├── add/page.tsx              # Add transaction page
│   │   ├── edit/[id]/page.tsx        # Edit transaction page
│   │   └── page.tsx                  # Transaction list page
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Dashboard page
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx              # Statistic display card
│   │   ├── CategoryChart.tsx         # Pie chart component
│   │   ├── TrendChart.tsx            # Line chart component
│   │   └── RecentTransactions.tsx    # Recent transactions table
│   ├── transactions/
│   │   ├── TransactionForm.tsx       # Transaction form
│   │   └── TransactionList.tsx       # Transaction list with filters
│   ├── ui/                           # shadcn/ui components
│   └── Navigation.tsx                # Main navigation
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── types.ts                      # TypeScript type definitions
│   └── utils.ts                      # Utility functions
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Database seeding
│   └── dev.db                        # SQLite database
└── requirements/
    └── requirements.md               # Detailed requirements

```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Version 8 or higher ([Install pnpm](https://pnpm.io/installation))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd temp-fm-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up the database**

   ```bash
   # Generate Prisma Client
   pnpm db:generate

   # Create database tables
   pnpm db:push

   # (Optional) Seed with sample data
   pnpm db:seed
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma Client after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Seed database with sample data
pnpm db:seed
```

### View Database Data

```bash
# Open Prisma Studio (GUI database browser)
npx prisma studio
```

Studio will open at [http://localhost:5555](http://localhost:5555)

## 🎯 Key Features Implementation

### Dashboard

The dashboard provides a comprehensive view of your finances:

- **Financial Cards**: Total income, expenses, net balance, and transaction count
- **Category Breakdown**: Pie chart showing expense distribution
- **Trend Analysis**: Line chart comparing income vs expenses over time
- **Recent Activity**: Latest 10 transactions with quick actions
- **Month Navigation**: Easy switching between months for historical analysis

### Transaction List

Powerful transaction management with:

- **Filtering**: By type (Income/Expense), category, and date range
- **Search**: Instant search across transaction descriptions
- **Sorting**: By date, amount, or category (ascending/descending)
- **Bulk Operations**: Select and delete multiple transactions
- **Pagination**: Efficient handling of large datasets
- **Quick Actions**: Edit or delete with one click

### Transaction Forms

Intuitive forms for adding and editing transactions:

- **Type Selection**: Income or Expense
- **Category Dropdown**: Auto-filtered based on transaction type
- **Validation**: Real-time validation with helpful error messages
- **Date Picker**: Easy date selection (no future dates)
- **Amount Input**: Number input with step validation

## 🧪 Testing

### Playwright Setup

Tests are configured with Playwright for end-to-end testing:

```bash
# Run tests in headless mode
pnpm exec playwright test

# Run tests in UI mode
pnpm exec playwright test --ui

# Run tests in a specific browser
pnpm exec playwright test --project=chromium
```

## 📝 API Endpoints

### Transactions

- `GET /api/transactions` - List transactions (with filters, pagination, sorting)
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/[id]` - Get a specific transaction
- `PUT /api/transactions/[id]` - Update a transaction
- `DELETE /api/transactions/[id]` - Delete a transaction

### Statistics

- `GET /api/transactions/stats` - Get dashboard statistics and analytics

## 🔧 Development

### Available Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Database commands
pnpm db:generate  # Generate Prisma Client
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed database
```

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured with Next.js recommended rules
- **Prisma**: Type-safe database queries
- **Error Handling**: Comprehensive error boundaries

## 🌟 Best Practices

- **Prisma Singleton**: Always use the singleton client from `lib/prisma.ts`
- **Server Components**: Used where possible for optimal performance
- **Client Components**: Only for interactive features requiring state
- **Type Safety**: Full TypeScript coverage, no `any` types
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliant

## 📦 Dependencies

### Production

- **next**: 16.0.1 - React framework
- **react**: 19.2.0 - UI library
- **@prisma/client**: 6.18.0 - Database ORM
- **recharts**: 3.3.0 - Chart library
- **date-fns**: 4.1.0 - Date utilities
- **lucide-react**: Icon library
- **tailwindcss**: 4 - CSS framework

### Development

- **typescript**: 5 - Type safety
- **prisma**: 6.18.0 - Database toolkit
- **@playwright/test**: 1.56.1 - E2E testing
- **eslint**: Code linting
- **tsx**: TypeScript execution

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Prisma](https://www.prisma.io) - The database toolkit
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Recharts](https://recharts.org) - Chart library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Note**: This application is built for personal use and educational purposes. For production deployments, consider adding authentication, data encryption, and additional security measures.
