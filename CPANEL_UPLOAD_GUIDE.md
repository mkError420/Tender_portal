# cPanel Upload Guide - RCMC Tender Portal

## Upload Structure for cPanel

Upload files to your hosting's `public_html` or `htdocs` directory as follows:

```
public_html/ (or htdocs/)
│
├── .htaccess                          # MODIFIED - Root .htaccess file
├── test-direct-api.php                # NEW - API routing test script
├── check-admin-user.php               # Existing - Admin user verification
├── reset-admin-password.php           # Existing - Password reset script
├── test-api.php                       # Existing - API test script
│
├── index.html                         # FROM: frontend/dist/index.html
├── assets/                            # FROM: frontend/dist/assets/
│   ├── index-0aea4b3f.css             # FROM: frontend/dist/assets/
│   └── index-1156a559.js              # FROM: frontend/dist/assets/
│
├── api/                               # API Directory
│   ├── .htaccess                      # MODIFIED - API .htaccess file
│   ├── index.php                      # Existing - API router
│   │
│   ├── config/                        # Configuration files
│   │   ├── Cors.php                   # Existing
│   │   └── Database.php               # Existing
│   │
│   ├── helpers/                       # Helper classes
│   │   ├── JWT.php                    # Existing
│   │   └── Response.php               # Existing
│   │
│   ├── middleware/                    # Middleware files
│   │   └── AuthMiddleware.php         # Existing
│   │
│   ├── auth/                          # Authentication endpoints
│   │   ├── login.php                  # Existing
│   │   └── register.php               # Existing
│   │
│   ├── tenders/                       # Tender management endpoints
│   │   ├── index.php                  # Existing
│   │   ├── show.php                   # Existing
│   │   ├── create.php                 # Existing
│   │   └── update.php                 # Existing
│   │
│   ├── bids/                          # Bid management endpoints
│   │   ├── submit.php                 # Existing
│   │   └── update-status.php         # Existing
│   │
│   └── admin/                         # Admin endpoints
│       └── dashboard-stats.php        # Existing
│
└── uploads/                           # CREATE THIS DIRECTORY
    └── (leave empty - for file uploads)
```

## Upload Instructions

### Step 1: Root Directory Files
Upload these files to `public_html/` (or `htdocs/`):

1. **Modified Files:**
   - `.htaccess` (from project root - this is the modified version)
   
2. **New Files:**
   - `test-direct-api.php` (from project root)

3. **Existing Test Scripts:**
   - `check-admin-user.php` (from project root)
   - `reset-admin-password.php` (from project root)
   - `test-api.php` (from project root)

### Step 2: Frontend Build Files
Upload these files/folders to `public_html/`:

1. **From `frontend/dist/`:**
   - `index.html` → `public_html/index.html`
   - `assets/` folder → `public_html/assets/`

### Step 3: API Directory
Upload these to `public_html/api/`:

1. **Modified Files:**
   - `.htaccess` (from `api/` folder - this is the modified version)
   - `index.php` (from `api/` folder)

2. **Upload entire directory structure:**
   - `config/` folder (with all contents)
   - `helpers/` folder (with all contents)
   - `middleware/` folder (with all contents)
   - `auth/` folder (with all contents)
   - `tenders/` folder (with all contents)
   - `bids/` folder (with all contents)
   - `admin/` folder (with all contents)

### Step 4: Create Uploads Directory
1. Create a new directory called `uploads/` in `public_html/`
2. Set permissions to 755 or 777 (if needed for file uploads)

## File Permissions

After uploading, set the following permissions:

- **PHP files**: 644
- **Directories**: 755
- **.htaccess files**: 644
- **uploads directory**: 755 (or 777 if uploads fail)

## Verification Steps

### 1. Check File Structure
Verify the following files exist on your server:
- `public_html/.htaccess`
- `public_html/api/.htaccess`
- `public_html/api/index.php`
- `public_html/index.html`
- `public_html/assets/index-1156a559.js`

### 2. Test API Routing
Access: `https://rcmctender.free.je/test-direct-api.php`
- Should show JSON responses instead of 302 redirects

### 3. Test Admin Login
Access: `https://rcmctender.free.je/login`
- Email: `admin@rangpurgroup.com`
- Password: `admin123`

### 4. Verify Database Connection
Access: `https://rcmctender.free.je/check-admin-user.php`
- Should show admin user exists and password is valid

## Important Notes

⚠️ **CRITICAL:**
- **OVERWRITE** existing `.htaccess` files with the modified versions
- **OVERWRITE** existing frontend files with the new build
- **DO NOT** modify database credentials in `Database.php`
- **REMOVE** test scripts after successful deployment

🔒 **Security:**
- Delete test scripts after verification:
  - `test-direct-api.php`
  - `test-api.php`
  - `check-admin-user.php`
  - `reset-admin-password.php`
- Change admin password immediately after first login
- Update JWT secret key in production

## Troubleshooting

### If 302 redirects persist:
1. Clear browser cache
2. Check that `.htaccess` files were uploaded correctly
3. Verify mod_rewrite is enabled on your hosting
4. Contact hosting provider if issue persists

### If frontend doesn't load:
1. Verify `index.html` exists in root directory
2. Check that `assets/` folder was uploaded
3. Verify file permissions are correct

### If API returns 500 errors:
1. Check PHP error logs in cPanel
2. Verify database credentials in `api/config/Database.php`
3. Ensure all PHP files have correct permissions

## Upload Checklist

Before proceeding, verify you have:

- [ ] Modified `.htaccess` (root)
- [ ] Modified `api/.htaccess`
- [ ] New `test-direct-api.php`
- [ ] Frontend build files (`index.html` + `assets/`)
- [ ] Complete `api/` directory structure
- [ ] Created `uploads/` directory
- [ ] Set correct file permissions
- [ ] Tested API routing
- [ ] Tested admin login
- [ ] Removed test scripts (after verification)