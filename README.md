# Smart Canteen System - Complete Full-Stack Application

## 🚀 Features
A comprehensive canteen management system built with React.js frontend and Node.js backend, featuring user authentication, QR code login, order management, wallet system, and real-time analytics.
### Frontend Features
- **Modern React.js Application** with JSX components and hooks
- **Responsive Design** optimized for mobile and desktop
- **User Authentication** with QR code and PIN-based login
- **Role-based Dashboards** (User, Staff, Admin)
- **Real-time Order Management** with live status updates
- **Digital Wallet System** with UPI integration
- **Interactive Menu** with categories and item management
- **Analytics Dashboard** with charts and reports
- **Theme Support** with light/dark mode
- **Error Boundaries** and comprehensive error handling
- **Loading States** and user feedback systems
### Backend Features
- **RESTful API** built with Express.js
- **JWT Authentication** with secure token management
- **Database Integration** using Prisma ORM with PostgreSQL
- **QR Code Generation** and authentication
- **Real-time Analytics** and reporting
- **Notification System** with user preferences
- **Rate Limiting** and security middleware
- **Input Validation** and sanitization
- **Error Handling** with detailed logging
- **CORS Configuration** for cross-origin requests
## 🛠️ Technology Stack
### Frontend
- **React.js 18** - Modern React with hooks and context
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **HTML5 QR Code** - QR code scanning functionality
### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma ORM** - Database toolkit and ORM
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **QRCode** - QR code generation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Express Rate Limit** - Rate limiting middleware
## 📁 Project Structure
```
smart-canteen-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── user/           # User dashboard components
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   ├── staff/          # Staff dashboard components
│   │   │   ├── demo/           # Demo authentication system
│   │   │   └── common/         # Shared components
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utility functions
│   │   └── App.jsx             # Main application component
│   ├── public/                 # Static assets
│   └── package.json
├── backend/
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── controllers/            # Route controllers
│   ├── utils/                  # Utility functions
│   ├── prisma/                 # Database schema and migrations
│   └── server.js               # Express server setup
├── server/                     # Legacy server files
└── README.md
```
## 🚀 Getting Started
### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager
### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-canteen-system
   ```
2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```
3. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/smartcanteen"
   
   # JWT Secrets
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Email Configuration (optional)
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   
   # UPI Configuration (for wallet)
   UPI_ID="canteen@paytm"
   UPI_NAME="Smart Canteen"
   ```
4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed  # Optional: seed with demo data
   ```
5. **Start the Application**
   
   **Development Mode:**
   ```bash
   # Start backend server (from backend directory)
   cd backend
   npm run dev
   
   # Start frontend development server (from root directory)
   npm run dev
   ```
   
   **Production Mode:**
   ```bash
   # Build frontend
   npm run build
   
   # Start backend server
   cd backend
   npm start
   ```
## 📚 API Documentation
### Authentication Endpoints
- `POST /api/auth/scan-qr` - Scan QR code for login
- `POST /api/auth/verify-pin` - Verify PIN after QR scan
- `POST /api/auth/generate-qr/:userId` - Generate QR code for user
- `POST /api/demo-auth/login` - Demo login with credentials
- `POST /api/demo-auth/qr-login` - Demo QR code login
### User Management
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
### Menu & Items
- `GET /api/items/categories` - Get all categories with items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item (Admin only)
- `PUT /api/items/:id` - Update item (Admin only)
- `DELETE /api/items/:id` - Delete item (Admin only)
### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (Staff/Admin)
- `PUT /api/orders/:id/status` - Update order status
### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/recharge` - Admin wallet recharge
- `POST /api/wallet/generate-upi-qr` - Generate UPI QR for recharge
### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/realtime` - Get real-time metrics
- `GET /api/analytics/user-behavior` - Get user behavior data
### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/send` - Send notification (Admin only)
## 🔐 Security Features
- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** and sanitization
- **SQL Injection Protection** via Prisma ORM
- **XSS Protection** through proper data handling
## 🎨 UI/UX Features
- **Responsive Design** that works on all devices
- **Modern UI Components** with Tailwind CSS
- **Loading States** and skeleton screens
- **Error Boundaries** for graceful error handling
- **Toast Notifications** for user feedback
- **Dark/Light Theme** support
- **Accessibility** features and ARIA labels
- **Progressive Web App** capabilities
## 🧪 Testing
```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test

# Run e2e tests
npm run test:e2e
```
## 📦 Deployment
### Frontend Deployment (Netlify/Vercel)
```bash
npm run build
# Deploy the 'dist' folder
```
### Backend Deployment (Railway/Heroku)
```bash
cd backend
npm run build
npm start
```
### Docker Deployment
```bash
docker-compose up -d
```
## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## 🙏 Acknowledgments
- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Prisma team for the excellent ORM
- All contributors and testers
## 📞 Support
For support, email support@smartcanteen.com or join our Slack channel.
---
**Built with ❤️ by the Smart Canteen Team**