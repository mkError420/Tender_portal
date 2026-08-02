# Deployment Fix Instructions - RCMC Tender Portal

## Issue Analysis

The login issue is likely caused by missing API routing configuration. The site cannot login because:
1. No API index.php router exists to handle API requests
2. No .htaccess files to properly route requests
3. API endpoints may not be accessible

## Files Created to Fix the Issue

I have created the following files to fix the login issue:

### 1. API Router (`api/index.php`)
- **Purpose**: Main entry point for all API requests
- **Location**: `api/index.php`
- **Function**: Routes API requests to appropriate endpoint files

### 2. API .htaccess (`api/.htaccess`)
- **Purpose**: Configure API directory routing
- **Location**: `api/.htaccess`
- **Function**: Enables URL rewriting and protects config files

### 3. Frontend .htaccess (`frontend/.htaccess`)
- **Purpose**: Configure React Router routing
- **Location**: `frontend/.htaccess`
- **Function**: Enables client-side routing for React app

### 4. Root .htaccess (`.htaccess`)
- **Purpose**: Configure site-wide routing
- **Location**: `.htaccess` (root directory)
- **Function**: Routes API requests to /api/ and frontend requests to index.html

### 5. API Test Script (`test-api.php`)
- **Purpose**: Test API endpoints without frontend
- **Location**: `test-api.php`
- **Function**: Tests login API and connectivity

### 6. Admin User Check Script (`check-admin-user.php`)
- **Purpose**: Verify admin user exists in database
- **Location**: `check-admin-user.php`
- **Function**: Checks and creates admin user if needed

## Updated Deployment Steps

### Step 1: Upload New Files to cPanel

Upload these newly created files to your hosting:

1. **API Router**: Upload `api/index.php` to `/htdocs/api/`
2. **API .htaccess**: Upload `api/.htaccess` to `/htdocs/api/`
3. **Frontend .htaccess**: Upload `frontend/.htaccess` to `/htdocs/`
4. **Root .htaccess**: Upload `.htaccess` to `/htdocs/`
5. **Test Scripts**: Upload `test-api.php` and `check-admin-user.php` to `/htdocs/`

### Step 2: Upload API Directory Structure

Ensure your API directory structure looks like this:

```
htdocs/
├── .htaccess                    (NEW - root .htaccess)
├── index.html                   (from frontend/dist)
├── assets/                      (from frontend/dist)
├── api/
│   ├── .htaccess                (NEW - api .htaccess)
│   ├── index.php                (NEW - api router)
│   ├── config/
│   │   ├── Cors.php
│   │   └── Database.php
│   ├── helpers/
│   │   ├── JWT.php
│   │   └── Response.php
│   ├── middleware/
│   │   └── AuthMiddleware.php
│   ├── auth/
│   │   ├── login.php
│   │   └── register.php
│   ├── tenders/
│   │   ├── index.php
│   │   ├── show.php
│   │   ├── create.php
│   │   └── update.php
│   ├── bids/
│   │   ├── submit.php
│   │   └── update-status.php
│   └── admin/
│       └── dashboard-stats.php
└── uploads/                     (create this directory)
```

### Step 3: Verify Database

1. Access `https://rcmctender.free.je/check-admin-user.php` in your browser
2. This will check if the admin user exists and create it if needed
3. **Default Admin Credentials**:
   - Email: `admin@rangpurgroup.com`
   - Password: `admin123`

### Step 4: Test API Endpoints

1. Access `https://rcmctender.free.je/test-api.php` in your browser
2. This will test the login API and show the response
3. If successful, you should see a successful login response with a token

### Step 5: Test Frontend Login

1. Access `https://rcmctender.free.je/login` in your browser
2. Try to login with:
   - Email: `admin@rangpurgroup.com`
   - Password: `admin123`
3. If successful, you should be redirected to the admin dashboard

## Troubleshooting

### Issue: Still cannot login after uploading files

**Solution 1**: Check if .htaccess is enabled
- Contact your hosting provider to ensure mod_rewrite is enabled
- Some free hosting providers disable .htaccess functionality

**Solution 2**: Try direct API access
- Access `https://rcmctender.free.je/api/auth/login.php` directly
- If this works but the frontend doesn't, the issue is with frontend routing

**Solution 3**: Check file permissions
- Ensure PHP files have 644 permissions
- Ensure directories have 755 permissions
- Ensure uploads directory has 755 or 777 permissions

### Issue: Database connection errors

**Solution 1**: Verify database credentials
- Run `https://rcmctender.free.je/test-db-connection.php`
- Check if database connection works from the server

**Solution 2**: Check if database was imported
- Access phpMyAdmin in cPanel
- Verify the database `if0_42423300_rcmc_tender` exists
- Verify all tables were created (users, tenders, bids, tender_documents)

### Issue: 404 errors on API endpoints

**Solution 1**: Check file paths
- Ensure all PHP files are in the correct directories
- Verify `api/index.php` exists and is readable

**Solution 2**: Check .htaccess syntax
- Ensure .htaccess files are properly formatted
- Some hosting providers require specific .htaccess formats

## Alternative Solution (If .htaccess doesn't work)

If your hosting provider doesn't support .htaccess or mod_rewrite, you can:

1. **Access API endpoints directly with .php extension**:
   - Change frontend API calls to include `.php` extension
   - Update `frontend/src/services/authService.js`:
     ```javascript
     login: (credentials) => api.post('/auth/login.php', credentials),
     ```

2. **Use full paths in API calls**:
   - Update `frontend/src/services/api.js` to ensure proper base URL
   - The base URL should be: `https://rcmctender.free.je/api`

## Security Notes

⚠️ **Important Security Reminders**:

1. **Change default admin password** immediately after first login
2. **Remove test scripts** after deployment:
   - Delete `test-api.php`
   - Delete `check-admin-user.php`
   - Delete `test-db-connection.php`
3. **Protect the uploads directory** - prevent PHP execution in uploads folder
4. **Update JWT secret key** in production:
   - Edit `api/helpers/JWT.php`
   - Change `$secret_key` to a strong random string

## Verification Checklist

After deployment, verify:

- [ ] Frontend loads at `https://rcmctender.free.je`
- [ ] API responds at `https://rcmctender.free.je/api/`
- [ ] Login works with admin credentials
- [ ] Admin dashboard accessible after login
- [ ] Database tables exist and have data
- [ ] File uploads work (if applicable)
- [ ] All API endpoints return proper responses

## Contact Support

If issues persist after following these steps:

1. Check browser console for JavaScript errors
2. Check network tab in browser developer tools for failed requests
3. Verify PHP error logs in cPanel
4. Contact hosting provider if server configuration issues are suspected

The main issue was likely missing API routing configuration. The new files I created should resolve the login problem by properly routing API requests to the correct PHP files.
