# Upload Checklist for cPanel

## Files to Upload to Root Directory (public_html/)

### Modified Files (CRITICAL - Overwrite Existing)
- [ ] `.htaccess` (from project root - MODIFIED VERSION)

### New Files
- [ ] `test-direct-api.php` (from project root)

### Existing Test Scripts
- [ ] `check-admin-user.php` (from project root)
- [ ] `reset-admin-password.php` (from project root)
- [ ] `test-api.php` (from project root)
- [ ] `test-db-connection.php` (from project root - optional)

## Frontend Build Files (from frontend/dist/)

### Root Level
- [ ] `index.html` → upload to `public_html/`

### Assets Folder
- [ ] `assets/` folder → upload to `public_html/`
  - [ ] `assets/index-0aea4b3f.css`
  - [ ] `assets/index-1156a559.js`

## API Directory (upload to public_html/api/)

### Modified Files (CRITICAL - Overwrite Existing)
- [ ] `.htaccess` (from api/ folder - MODIFIED VERSION)
- [ ] `index.php` (from api/ folder)

### Config Directory
- [ ] `config/` folder → upload to `public_html/api/`
  - [ ] `config/Cors.php`
  - [ ] `config/Database.php`

### Helpers Directory
- [ ] `helpers/` folder → upload to `public_html/api/`
  - [ ] `helpers/JWT.php`
  - [ ] `helpers/Response.php`

### Middleware Directory
- [ ] `middleware/` folder → upload to `public_html/api/`
  - [ ] `middleware/AuthMiddleware.php`

### Auth Directory
- [ ] `auth/` folder → upload to `public_html/api/`
  - [ ] `auth/login.php`
  - [ ] `auth/register.php`

### Tenders Directory
- [ ] `tenders/` folder → upload to `public_html/api/`
  - [ ] `tenders/index.php`
  - [ ] `tenders/show.php`
  - [ ] `tenders/create.php`
  - [ ] `tenders/update.php`
  - [ ] `tenders/upload-document.php` (NEW - Document upload endpoint)

### Bids Directory
- [ ] `bids/` folder → upload to `public_html/api/`
  - [ ] `bids/submit.php`
  - [ ] `bids/update-status.php`

### Admin Directory
- [ ] `admin/` folder → upload to `public_html/api/`
  - [ ] `admin/dashboard-stats.php`

## Additional Directories

### Uploads Directory
- [ ] Create `uploads/` directory in `public_html/`
- [ ] Set permissions to 755 (or 777 if needed)

## Post-Upload Configuration

### File Permissions
- [ ] Set all PHP files to 644
- [ ] Set all directories to 755
- [ ] Set .htaccess files to 644
- [ ] Set uploads directory to 755 (or 777)

## Verification Steps

### 1. Test API Routing
- [ ] Access `https://rcmctender.free.je/test-direct-api.php`
- [ ] Verify JSON responses (not 302 redirects)

### 2. Test Database Connection
- [ ] Access `https://rcmctender.free.je/check-admin-user.php`
- [ ] Verify admin user exists and password is valid

### 3. Test Admin Login
- [ ] Access `https://rcmctender.free.je/login`
- [ ] Login with: admin@rangpurgroup.com / admin123
- [ ] Verify redirect to admin dashboard

### 4. Test Frontend Loading
- [ ] Access `https://rcmctender.free.je/`
- [ ] Verify homepage loads correctly
- [ ] Check browser console for errors

## Security Cleanup (After Successful Deployment)

### Remove Test Scripts
- [ ] Delete `test-direct-api.php`
- [ ] Delete `test-api.php`
- [ ] Delete `check-admin-user.php`
- [ ] Delete `reset-admin-password.php`
- [ ] Delete `test-db-connection.php`

### Security Updates
- [ ] Change admin password immediately after first login
- [ ] Update JWT secret key in `api/helpers/JWT.php`
- [ ] Remove or protect `api/.htaccess.backup`

## Summary

**Total Files to Upload:**
- Root: 5 files (2 modified .htaccess, 1 new, 2 existing test scripts)
- Frontend: 3 files (1 html, 2 assets)
- API: 15 files across 7 directories (2 modified .htaccess + index.php, 13 existing PHP files)
- Create: 1 uploads directory

**Critical Files to Overwrite:**
- Root `.htaccess` (MODIFIED)
- API `.htaccess` (MODIFIED)
- Frontend build files (NEW BUILD)

**Files That Must Work After Upload:**
- API routing (test with test-direct-api.php)
- Admin login (test with admin credentials)
- Frontend loading (test homepage)