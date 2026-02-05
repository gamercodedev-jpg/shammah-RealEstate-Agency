# LINUX SERVER DEPLOYMENT GUIDE
## Shamah Horizon PWA - Quick Deployment Checklist

### 📋 Pre-Deployment Setup

1. **Upload files to server** via FTP/SFTP or git clone
2. **Navigate to project directory**
   ```bash
   cd /path/to/shamah-horizon-main
   ```

### 🔧 Installation & Configuration

3. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

4. **Create/Update .env.local file on the server**
   ```bash
   nano .env.local
   ```
   
   Add the following:
   ```env
   VITE_API_BASE_URL=https://your-live-domain.com
   
   CLOUDINARY_CLOUD_NAME=dceddcvra
   CLOUDINARY_API_KEY=844152666715645
   CLOUDINARY_API_SECRET=L7b9oLrfuTvrgNSqAumpDyxv6Qg
   
   PORT=4000
   NODE_ENV=production
   ```

5. **Set proper file permissions**
   ```bash
   # Make sure the app can create and write to the database
   chmod 755 .
   chmod 644 .env.local
   
   # If database already exists
   chmod 666 shammah.db
   ```

### ✅ System Validation

6. **Run the system check**
   ```bash
   node check-system.js
   ```
   
   This will verify:
   - ✓ Environment variables loaded correctly
   - ✓ Cloudinary API connection working
   - ✓ SQLite database is writable
   - ✓ PWA manifest is valid
   - ✓ All icons and assets exist

### 🚀 Starting the Server

7. **Build the frontend**
   ```bash
   npm run build
   ```

8. **Start the backend server** (choose one method)

   **Option A: Direct Node (for testing)**
   ```bash
   node server.js
   ```

   **Option B: PM2 (recommended for production)**
   ```bash
   # Install PM2 globally if not already installed
   npm install -g pm2
   
   # Start the server
   pm2 start server.js --name shamah-api
   
   # Save PM2 config
   pm2 save
   
   # Setup auto-restart on server reboot
   pm2 startup
   ```

   **Option C: Using systemd service**
   Create `/etc/systemd/system/shamah.service`:
   ```ini
   [Unit]
   Description=Shamah Horizon API Server
   After=network.target

   [Service]
   Type=simple
   User=your-username
   WorkingDirectory=/path/to/shamah-horizon-main
   ExecStart=/usr/bin/node server.js
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```
   
   Then:
   ```bash
   sudo systemctl enable shamah
   sudo systemctl start shamah
   sudo systemctl status shamah
   ```

### 🌐 Nginx Configuration (if using reverse proxy)

9. **Configure Nginx** (optional but recommended)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Serve built frontend
       root /path/to/shamah-horizon-main/dist;
       index index.html;
       
       # API proxy
       location /api/ {
           proxy_pass http://localhost:4000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # PWA files
       location /sw.js {
           root /path/to/shamah-horizon-main/dist;
           add_header Cache-Control "no-cache";
       }
       
       location /manifest.json {
           root /path/to/shamah-horizon-main/dist;
       }
       
       # SPA fallback
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### 🔍 Post-Deployment Verification

10. **Check server logs**
    ```bash
    # If using PM2
    pm2 logs shamah-api
    
    # If using systemd
    sudo journalctl -u shamah -f
    ```

11. **Test the API endpoints**
    ```bash
    curl http://localhost:4000/api/plots
    curl http://localhost:4000/api/news
    ```

12. **Run system check again from live URL** (if accessible)
    ```bash
    curl https://your-domain.com/api/health
    ```

### 🐛 Troubleshooting

**Database Permission Issues:**
```bash
# Check current permissions
ls -la shammah.db

# Fix permissions
chmod 666 shammah.db
chown your-user:your-user shammah.db
```

**Port Already in Use:**
```bash
# Find process using port 4000
lsof -i :4000
# or
netstat -tlnp | grep 4000

# Kill the process
kill -9 PID
```

**Cloudinary Connection Issues:**
```bash
# Test Cloudinary from command line
node -e "import('./check-system.js')"
```

### 📊 Monitoring

**Check server status:**
```bash
# PM2
pm2 status
pm2 monit

# System resources
top
df -h
free -m
```

### 🔄 Updates & Maintenance

**Updating the app:**
```bash
git pull origin main
npm install
npm run build
pm2 restart shamah-api
```

**Database backup:**
```bash
cp shammah.db shammah.db.backup-$(date +%Y%m%d)
```

### 📞 Emergency Contacts

- **Config file:** `config.js` - centralized configuration
- **System check:** `node check-system.js` - run anytime
- **Database location:** `./shammah.db` (in project root)
- **Logs location:** Check PM2 logs or systemd journal

---

## ✨ Key Changes Made

1. **Database Path:** Now uses `path.resolve(process.cwd(), "shammah.db")` for absolute path
2. **Config System:** Centralized in `config.js` with automatic .env.local fallback
3. **System Validation:** `check-system.js` validates all critical components before deployment

Run `node check-system.js` before going live! 🚀
