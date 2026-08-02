# Deployment Guide - RCMC Tender Portal

## Database Configuration (COMPLETED)

The following files have been updated with production database credentials:

### Database Credentials
- **Host:** sql200.infinityfree.com
- **Database Name:** if0_42423300_rcmc_tender
- **Username:** if0_42423300
- **Password:** rcmc123456789

### Updated Files
1. **Database Schema:** `database/schema.sql`
   - Updated to use production database name
   - Removed CREATE DATABASE statement (database already exists)

2. **Backend Database Config:** `backend/config/database.php`
   - Updated with production credentials

3. **API Database Config:** `api/config/Database.php`
   - Updated with production credentials

4. **Frontend API Config:** `frontend/src/services/api.js`
   - Updated API base URL to: `https://rcmctender.free.je/api`

## cPanel Upload Instructions

### Step 1: Import Database Schema

1. Log in to your InfinityFree cPanel
2. Navigate to **phpMyAdmin** (in the Databases section)
3. Select the database: `if0_42423300_rcmc_tender`
4. Click on the **Import** tab
5. Choose the file: `database/schema.sql`
6. Click **Go** to import the schema
7. Verify that all tables were created successfully:
   - users
   - tenders
   - bids
   - tender_documents

### Step 2: Upload Backend Files

1. Navigate to **File Manager** in cPanel
2. Go to the `htdocs` directory (or your public web directory)
3. Create the following directory structure:
   ```
   /htdocs
     /api
       /auth
       /bids
       /tenders
     /uploads
   ```

4. Upload the following files:
   - **Backend API files:** Upload all files from `backend/api/` to `/htdocs/api/`
   - **Backend config:** Upload `backend/config/` files to `/htdocs/api/config/`
   - **Uploads directory:** Create `/htdocs/uploads/` directory and ensure it has write permissions (755 or 777)

### Step 3: Upload Frontend Files

1. Build the frontend for production:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Upload the contents of `frontend/dist/` to `/htdocs/`
   - This includes:
     - index.html
     - assets/ directory
     - All other generated files

### Step 4: Verify Permissions

Ensure the following directories have proper write permissions:
- `/htdocs/uploads/` - 755 or 777 (for file uploads)
- `/htdocs/api/config/` - 644 (read-only for security)

### Step 5: Test the Application

1. Visit your site: `https://rcmctender.free.je`
2. Test the following:
   - Registration page
   - Login page (use default admin: admin@rangpurgroup.com / admin123)
   - Tender listing
   - Dashboard access

## Important Notes

### Security Considerations
- The JWT secret in `backend/config/config.php` should be changed to a strong random string in production
- Ensure the uploads directory is protected from direct execution of PHP files
- Consider implementing HTTPS (already enabled with your domain)

### Default Admin Credentials
- **Email:** admin@rangpurgroup.com
- **Password:** admin123
- **Role:** Admin

*Note: Change this password immediately after first login*

### Troubleshooting

#### Database Connection Issues
- Run the test script: `php test-db-connection.php`
- Check if your local IP is allowed to connect to the remote database
- Verify credentials in both database config files

#### File Upload Issues
- Ensure the uploads directory has proper write permissions
- Check PHP upload limits in cPanel (default may be 2MB, need 5MB+)

#### API 404 Errors
- Verify the API directory structure matches the upload instructions
- Check that the .htaccess (if used) is properly configured

## File Structure After Upload

```
htdocs/
├── index.html              (from frontend/dist)
├── assets/                 (from frontend/dist)
├── api/
│   ├── config/
│   │   ├── config.php
│   │   ├── database.php
│   │   ├── jwt.php
│   │   └── middleware.php
│   ├── auth/
│   │   ├── login.php
│   │   └── register.php
│   ├── tenders/
│   │   ├── index.php
│   │   ├── show.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── upload-document.php
│   └── bids/
│       ├── index.php
│       ├── submit.php
│       └── update-status.php
└── uploads/                (for uploaded files)
```

## Testing Database Connection

A test script has been provided: `test-db-connection.php`

You can run this on your local machine to verify the database credentials are correct:
```bash
php test-db-connection.php
```

Note: This may fail from your local machine if the database server doesn't allow remote connections. This is normal for security reasons - the connection will work from the hosting server itself.
