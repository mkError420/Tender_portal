# Rangpur Group Tender Management Portal

A complete, modular, and responsive tender management system built with React.js (frontend), PHP (backend), and MySQL (database).

## Features

### For Vendors
- Browse and search active tenders
- View detailed tender information and download documents
- Submit bids with proposals and attachments
- Track bid status in real-time
- Personal dashboard with bid history

### For Administrators
- Create and manage tenders
- Upload tender documents
- Review vendor bids
- Accept/reject/shortlist bids
- Dashboard with statistics and analytics
- Role-based access control

## Tech Stack

### Frontend
- React.js 18
- React Router v6
- Axios (HTTP client)
- Tailwind CSS (styling)
- Vite (build tool)

### Backend
- PHP 7.4+
- RESTful API architecture
- PDO (database access)
- JWT authentication
- Prepared statements (SQL injection prevention)

### Database
- MySQL
- Foreign key constraints
- Indexed tables for performance

## Project Structure

```
tender-portal/
├── backend/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── tenders/       # Tender management endpoints
│   │   ├── bids/          # Bid management endpoints
│   │   └── admin/         # Admin dashboard endpoints
│   ├── config/            # Configuration files
│   ├── uploads/           # File upload directory
│   └── .env.production    # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   │   ├── public/    # Public pages
│   │   │   ├── vendor/    # Vendor dashboard
│   │   │   └── admin/     # Admin dashboard
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
└── database/
    └── schema.sql         # Database schema
```

## Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Node.js 16 or higher
- Composer (optional)

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE rangpur_tender_portal;
```

2. Import the schema:
```bash
mysql -u root -p rangpur_tender_portal < database/schema.sql
```

3. Update database credentials in `backend/config/database.php`:
```php
private $host = 'localhost';
private $db_name = 'rangpur_tender_portal';
private $username = 'your_username';
private $password = 'your_password';
```

### Backend Setup

1. Configure the web server to point to the `backend` directory
2. Ensure the `uploads` directory has write permissions
3. Update JWT secret in `backend/config/config.php`:
```php
define('JWT_SECRET', 'your-secret-key-here');
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Default Credentials

### Admin User
- Email: admin@rangpurgroup.com
- Password: admin123

**Important:** Change the default admin password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/register.php` - Register new user
- `POST /api/auth/login.php` - Login user

### Tenders
- `GET /api/tenders/index.php` - List all tenders (with filters)
- `GET /api/tenders/show.php?id={id}` - Get single tender
- `POST /api/tenders/create.php` - Create tender (admin only)
- `PUT /api/tenders/update.php` - Update tender (admin only)
- `POST /api/tenders/upload-document.php` - Upload document (admin only)

### Bids
- `GET /api/bids/index.php` - List bids (filtered by role)
- `POST /api/bids/submit.php` - Submit bid (vendor only)
- `PUT /api/bids/update-status.php` - Update bid status (admin only)

### Admin
- `GET /api/admin/dashboard-stats.php` - Get dashboard statistics (admin only)

## Security Features

- SQL Injection prevention using PDO prepared statements
- Password hashing using `password_hash()`
- JWT-based authentication
- Role-based access control (RBAC)
- CORS handling
- File upload validation (type, size, name sanitization)
- Input validation on both frontend and backend

## Color Scheme

- Primary: `#0f2a4a` (Deep Navy Blue)
- Accent: `#008080` (Teal)
- Gold: `#d4af37` (Accent Gold)
- Background: `#f9fafb` (Off-white)

## Usage

### For Vendors
1. Register an account on the registration page
2. Browse available tenders
3. View tender details and download documents
4. Submit bids with proposals and attachments
5. Track bid status in the vendor dashboard

### For Administrators
1. Login with admin credentials
2. Create new tenders with details and documents
3. Publish tenders to make them visible to vendors
4. Review incoming bids
5. Accept, reject, or shortlist bids
6. Monitor dashboard statistics

## Development

### Running the PHP Backend
You'll need a PHP server with MySQL support. Options:
- XAMPP/WAMP (Windows)
- MAMP (Mac)
- Linux built-in PHP server: `php -S localhost:8000`

### Running the React Frontend
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## File Upload Configuration

Allowed file types: PDF, DOC, DOCX, ZIP
Maximum file size: 5MB

Configure in `backend/config/config.php`:
```php
define('MAX_FILE_SIZE', 5 * 1024 * 1024);
define('ALLOWED_EXTENSIONS', ['pdf', 'doc', 'docx', 'zip']);
```

## License

This project is proprietary to Rangpur Group.

## Support

For support and issues, contact the development team.
