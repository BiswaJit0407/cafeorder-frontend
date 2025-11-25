# Frontend - Restaurant Order System

React.js client application for the Restaurant Order System.

## 📁 Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── UserMenuPage.jsx
│   │   └── AdminDashboard.jsx
│   └── App.jsx          # Main app component with routing
├── public/              # Static assets
└── package.json         # Dependencies
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint:**
   The API is proxied through Vite (configured in `vite.config.js`). Backend should run at `http://localhost:5000`

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🎨 Features

### User Features
- User registration and login
- Browse menu items
- Add items to cart
- Place orders
- View order history
- Track order status

### Admin Features
- Admin dashboard
- Menu management (CRUD operations)
- Order management
- Update order status
- View all orders

## 🔐 Authentication

The app uses JWT tokens stored in localStorage:
- `token` - JWT authentication token
- `user` - User information (role, email, etc.)

Protected routes redirect to login if not authenticated.

## 🧩 Components

- **LoginPage** - User authentication
- **RegisterPage** - New user registration
- **UserMenuPage** - Menu browsing and ordering (User role)
- **AdminDashboard** - Admin panel for management (Admin role)

## 🛠️ Technologies

- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **localStorage** - Token and user data persistence

## 🔄 API Integration

The frontend connects to the backend API at `http://localhost:5000/api`

Make sure the backend server is running before starting the frontend.

## 📝 Available Scripts

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
