# Deployment Fix Instructions - RCMC Tender Portal

## Issue Analysis

The login issue is caused by HTTP 302 redirects on API endpoints. The site cannot login because:
1. Hosting provider is redirecting API requests instead of processing them
2. API endpoints return 302 "Found" responses instead of JSON
3. Frontend cannot receive proper API responses for authentication

## Files Modified to Fix the Issue

The following files were modified to fix the 302 redirect issue:

### 1. Root .htaccess (`.htaccess`)
- **Purpose**: Prevent hosting redirects for API routes
- **Location**: `.htaccess` (root directory)
- **Changes**: Added rules to prevent API redirects and disable automatic redirects

### 2. API .htaccess (`api/.htaccess`)
- **Purpose**: Configure API directory routing without redirects
- **Location**: `api/.htaccess`
- **Changes**: Added rules to prevent redirects for existing PHP files

### 3. Frontend Service Files
- **Purpose**: Route API calls through index.php to bypass redirects
- **Files Modified**:
  - `frontend/src/services/authService.js`
  - `frontend/src/services/tenderService.js`
  - `frontend/src/services/bidService.js`
  - `frontend/src/services/adminService.js`
- **Changes**: All API calls now use `/index.php/` prefix to route through the API router

### 4. New Test Script (`test-direct-api.php`)
- **Purpose**: Test direct API access to diagnose redirect issues
- **Location**: `test-direct-api.php`
- **Function**: Tests both direct file access and routed access

## Updated Deployment Steps

### Step 1: Upload Modified Files to cPanel

Upload these modified files to your hosting:

1. **Root .htaccess**: Upload `.htaccess` to `/htdocs/` (replaces existing)
2. **API .htaccess**: Upload `api/.htaccess` to `/htdocs/api/` (replaces existing)
3. **Frontend Build**: Rebuild and upload the frontend with modified service files
4. **New Test Script**: Upload `test-direct-api.php` to `/htdocs/`

### Step 2: Rebuild Frontend

Since the API service files were modified, you need to rebuild the frontend:

1. Navigate to the frontend directory
2. Run `npm run build` to create a new production build
3. Upload the contents of `frontend/dist/` to `/htdocs/`

### Step 3: Verify API Routing

Test the new routing approach:

1. Access `https://rcmctender.free.je/test-direct-api.php` in your browser
2. This will test both direct file access and routed access
3. If successful, you should see proper JSON responses instead of 302 redirects

### Step 4: Test Frontend Login

1. Access `https://rcmctender.free.je/login` in your browser
2. Try to login with:
   - Email: `admin@rangpurgroup.com`
   - Password: `admin123`
3. If successful, you should be redirected to the admin dashboard

## How the Fix Works

### The Problem
Your hosting provider was returning HTTP 302 redirects for API requests instead of processing them. This prevented the frontend from receiving JSON responses needed for authentication.

### The Solution
1. **Modified .htaccess files**: Added rules to prevent automatic redirects for API routes
2. **Updated API calls**: Changed all frontend API calls to route through `/index.php/` to ensure they go through the API router
3. **Direct file access**: The new routing ensures API requests are processed by PHP instead of being redirected

### Technical Details
- **Old approach**: `/api/auth/login.php` → 302 redirect → failure
- **New approach**: `/api/index.php/auth/login.php` → processed by API router → success

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

### Issue: Password verification fails

**Solution 1**: Reset admin password
- Run `https://rcmctender.free.je/reset-admin-password.php`
- This will reset the admin password to 'admin123'
- Try logging in again with the default credentials

**Solution 2**: Manually update password in phpMyAdmin
- Access phpMyAdmin in cPanel
- Go to the `users` table
- Find the admin user (email: admin@rangpurgroup.com)
- Generate a new password hash using: `password_hash('admin123', PASSWORD_DEFAULT)`
- Update the `password_hash` field with the new hash

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
   - Delete `reset-admin-password.php`
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
