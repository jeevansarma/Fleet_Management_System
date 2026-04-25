# Fleet Management System

A comprehensive full-stack fleet management system built with React, Node.js, Express, and MongoDB. Designed for small transporters to manage vehicles, drivers, trips, maintenance, and generate detailed reports.

## Features

### 🚛 Vehicle Management
- Add, edit, and remove vehicles
- Track vehicle status, fuel levels, and maintenance schedules
- Monitor vehicle utilization and performance

### 👥 Driver Management
- Manage driver information and assignments
- Track driver performance and ratings
- Assign drivers to vehicles and trips

### 📍 Trip Management
- Schedule and track trips
- Monitor trip status and delivery progress
- Record fuel consumption and trip details

### 🔧 Maintenance Tracking
- Schedule and track vehicle maintenance
- Record maintenance costs and service history
- Monitor maintenance schedules and alerts

### 📊 Dashboard & Reports
- Real-time dashboard with key metrics
- Interactive charts for fuel expenses, maintenance costs
- Vehicle utilization and driver performance reports
- Export reports in CSV/JSON format

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control
- Secure API endpoints with validation

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization library
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Request validation

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fleet-management
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   - Copy `server/.env` and update the values:
     ```env
     MONGODB_URI=mongodb://localhost:27017/fleet-management
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     PORT=5000
     ```

5. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or update `MONGODB_URI` to point to your MongoDB Atlas cluster

## Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data

### Reports
- `GET /api/reports/fuel-expenses` - Fuel expense report
- `GET /api/reports/maintenance-costs` - Maintenance cost report
- `GET /api/reports/vehicle-utilization` - Vehicle utilization report
- `GET /api/reports/driver-performance` - Driver performance report
- `GET /api/reports/delivery-status` - Delivery status distribution
- `GET /api/reports/export` - Export reports (CSV/JSON)

## Project Structure

```
fleet-management/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env                # Environment variables
└── README.md
```

## Features Overview

### Dashboard
- Real-time statistics cards
- Fuel expense trends chart
- Delivery status distribution
- Recent activities feed

### Responsive Design
- Mobile-first approach
- Dark/Light theme toggle
- Smooth animations and transitions
- Glassmorphism UI effects

### Data Visualization
- Interactive charts using Recharts
- Fuel consumption tracking
- Maintenance cost analysis
- Performance metrics

### Security
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
