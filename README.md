# TravelCost PK - Travel Expense Calculator

A modern, futuristic web application for calculating and managing travel expenses in Pakistan. Built with Next.js, React, and Tailwind CSS, this application helps users track their vehicle fuel costs and optimize travel spending.

## Overview

TravelCost PK is a comprehensive trip expense calculator designed specifically for Pakistan's transportation ecosystem. It enables users to:
- Add and manage multiple vehicles with fuel efficiency data
- Calculate trip costs based on distance, fuel prices, and vehicle mileage
- Track trip history with detailed cost breakdowns
- Manage fuel prices (admin feature)
- Generate statistics and analytics for spending patterns

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Data Persistence**: localStorage (Client-side)
- **Icons**: Lucide React

### Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx               # App entry point
│   ├── globals.css            # Global styles and design tokens
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard with stats and recent trips
│   ├── calculator/
│   │   └── page.tsx           # Trip cost calculator
│   ├── cars/
│   │   └── page.tsx           # Vehicle management
│   ├── trips/
│   │   └── page.tsx           # Trip history and analytics
│   └── admin/
│       └── page.tsx           # Admin panel for fuel price management
├── components/
│   ├── app-layout.tsx         # Main app wrapper with navigation
│   ├── navigation.tsx         # Desktop sidebar + mobile bottom nav
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── context.tsx            # React Context for app state
│   ├── types.ts              # TypeScript type definitions
│   └── calculations.ts        # Utility functions for cost calculations
└── public/                    # Static assets
```

## Core Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}
```

### Car
```typescript
interface Car {
  id: string;
  name: string;
  model: string;
  year: number;
  fuelType: 'petrol' | 'diesel' | 'cng';
  mileage: number; // km/liter
}
```

### Trip
```typescript
interface Trip {
  id: string;
  carId: string;
  distance: number; // km
  date: string; // ISO 8601
  source: string;
  destination: string;
}
```

### FuelPrice
```typescript
interface FuelPrice {
  fuelType: 'petrol' | 'diesel' | 'cng';
  price: number; // PKR per liter
  lastUpdated: string;
}
```

## Cost Calculation Formula

The application uses the following formula to calculate trip costs:

```
Total Cost = (Distance ÷ Vehicle Mileage) × Fuel Price

Example:
- Distance: 100 km
- Vehicle Mileage: 10 km/liter
- Fuel Price: 300 PKR/liter
- Total Cost = (100 ÷ 10) × 300 = 3,000 PKR
```

## Key Features

### User Features
1. **Dashboard**
   - Summary statistics (total trips, distance, spending)
   - Current fuel prices display
   - Recent trips overview
   
2. **Trip Calculator**
   - Select vehicle and enter distance
   - Real-time cost calculation
   - Detailed cost breakdown
   - Save trips to history

3. **Vehicle Management**
   - Add new vehicles
   - Edit vehicle details
   - Delete vehicles
   - View vehicle-specific statistics

4. **Trip History**
   - View all saved trips
   - Filter by vehicle
   - Sort by date
   - Delete trips
   - Summary statistics

### Admin Features
1. **Fuel Price Management**
   - Update current fuel prices (petrol, diesel, CNG)
   - View price history
   - System information dashboard

## State Management

The application uses React Context API for global state management:

```typescript
// AppContext provides:
- user: Current logged-in user
- cars: Array of user's vehicles
- trips: Array of completed trips
- fuelPrices: Current fuel prices
- methods to manage all above data
```

Data is persisted to localStorage automatically, ensuring data survives page refreshes.

## Design System

### Color Palette
- **Primary**: Deep Purple (oklch(0.55 0.22 280))
- **Secondary**: Warm Orange (oklch(0.5 0.18 20))
- **Accent**: Vibrant Orange (oklch(0.65 0.25 35))
- **Background**: Light Neutral (oklch(0.98 0.01 0))
- **Foreground**: Dark Text (oklch(0.15 0.02 280))

### Typography
- **Sans-serif**: Geist (headings and body text)
- **Monospace**: Geist Mono (code and technical content)

### Layout Strategy
- Mobile-first responsive design
- Flexbox for layouts (primary method)
- CSS Grid for complex 2D layouts
- Tailwind CSS utility classes

## API Integration Points

For backend integration, the following endpoints would be needed:

### Cars Endpoints
```
GET    /api/cars              # Get user's vehicles
POST   /api/cars              # Create new vehicle
PUT    /api/cars/:id          # Update vehicle
DELETE /api/cars/:id          # Delete vehicle
```

### Trips Endpoints
```
GET    /api/trips             # Get user's trips
POST   /api/trips             # Create new trip
DELETE /api/trips/:id         # Delete trip
GET    /api/trips/analytics   # Get trip statistics
```

### Fuel Prices Endpoints (Admin only)
```
GET    /api/fuel-prices       # Get current fuel prices
PUT    /api/fuel-prices       # Update fuel prices
GET    /api/fuel-prices/history  # Get price history
```

### Authentication Endpoints
```
POST   /api/auth/login        # User login
POST   /api/auth/signup       # User registration
POST   /api/auth/logout       # User logout
GET    /api/auth/me           # Get current user
```

## Environment Variables

When integrating with a backend, add these variables to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=TravelCost PK
```

## Getting Started for Backend Developers

### Prerequisites
- Node.js 18+ and pnpm
- TypeScript knowledge
- Familiarity with REST APIs

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Current Data Persistence
Currently, all data is stored in browser localStorage. To integrate with a backend:

1. **Replace Context API calls** with API fetch calls in `lib/context.tsx`
2. **Create API route handlers** in `app/api/` directory
3. **Update TypeScript types** if your backend returns different data structures
4. **Add authentication** middleware for protected routes
5. **Implement error handling** for network failures
6. **Add loading states** during API calls

### Example: Converting a localStorage operation to API call

**Current (localStorage):**
```typescript
const saveCar = (car: Car) => {
  const newCars = [...cars, car];
  localStorage.setItem('cars', JSON.stringify(newCars));
  setCars(newCars);
};
```

**With Backend:**
```typescript
const saveCar = async (car: Car) => {
  try {
    const response = await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car)
    });
    const savedCar = await response.json();
    setCars([...cars, savedCar]);
  } catch (error) {
    console.error('Failed to save car:', error);
  }
};
```

## Database Schema (Recommended)

For backend implementation, consider this database structure:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cars table
CREATE TABLE cars (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  fuel_type ENUM('petrol', 'diesel', 'cng') NOT NULL,
  mileage DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  car_id UUID NOT NULL REFERENCES cars(id),
  distance DECIMAL(10, 2) NOT NULL,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fuel Prices table
CREATE TABLE fuel_prices (
  id UUID PRIMARY KEY,
  fuel_type ENUM('petrol', 'diesel', 'cng') UNIQUE NOT NULL,
  price DECIMAL(8, 2) NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
```

## Authentication Considerations

The current implementation has a simple in-memory user system. For production:

1. **Password Security**: Use bcrypt or Argon2 for hashing
2. **Session Management**: Implement JWT tokens or secure sessions
3. **Authorization**: Verify admin role for sensitive operations
4. **Rate Limiting**: Protect API endpoints from abuse
5. **Input Validation**: Sanitize and validate all inputs

## Performance Optimization Tips

1. **Implement pagination** for trips and cars lists
2. **Add search/filter** functionality on trips page
3. **Cache fuel prices** as they change infrequently
4. **Use database indexes** on frequently queried fields
5. **Implement lazy loading** for trip history

## Testing Recommendations

- **Unit tests** for calculation functions in `lib/calculations.ts`
- **Integration tests** for Context API state management
- **E2E tests** for user workflows (add car → calculate trip → save trip)
- **API tests** for backend endpoints

## Future Enhancements

- Real-time distance calculation using OpenRouteService API
- Multi-currency support
- Trip expense splitting among passengers
- Analytics and reporting dashboard
- Mobile app using React Native
- Integration with vehicle maintenance tracking
- Map visualization for routes
- ML-based fuel consumption predictions

## Support & Contribution

For backend integration questions or feature requests, refer to the API Integration Points section above.

## License

MIT

---

**Last Updated**: May 2026
**Version**: 1.0.0
