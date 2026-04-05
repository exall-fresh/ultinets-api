# Ultinets CMS Backend

A complete Express.js API for the Ultinets Content Management System (CMS) with MySQL/MariaDB database via Prisma ORM.

## Features

- **Authentication**: JWT-based auth with access tokens (15min) and refresh tokens (7 days)
- **Role-Based Access Control (RBAC)**: Admin, Editor, and Viewer roles
- **Data Management**: Services, Team Members, Partners
- **Contact Form**: Public submissions with admin management
- **Media Management**: File uploads with multer
- **Activity Logging**: Track all admin actions
- **Site Settings**: Dynamic configuration

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/ultinets_cms"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this"
PORT=4000
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=public/uploads
```

### 3. Database Setup

#### Prerequisites

You need **MySQL 8.0+** or **MariaDB 10.5+** installed on your system.

**Windows Options:**
- [XAMPP](https://www.apachefriends.org/) (Recommended - includes MySQL + phpMyAdmin)
- [WAMP](https://www.wampserver.com/)
- MySQL Community Server

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

#### Step 3.1: Create the Database

**Option A: Using phpMyAdmin (XAMPP/WAMP)**
1. Start Apache and MySQL from the XAMPP Control Panel
2. Open browser: `http://localhost/phpmyadmin`
3. Click "New" to create a database
4. Enter database name: `ultinets_cms`
5. Select collation: `utf8mb4_unicode_ci`
6. Click "Create"

**Option B: Using MySQL Command Line**
```bash
# Open MySQL terminal (Windows: use XAMPP Shell or MySQL Command Line Client)
mysql -u root -p

# Create database with UTF-8 support
CREATE DATABASE ultinets_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create a dedicated user (recommended for production)
CREATE USER 'ultinets_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON ultinets_cms.* TO 'ultinets_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

**Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Click "Create a new schema" (database icon)
4. Enter name: `ultinets_cms`
5. Charset: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. Click "Apply"

#### Step 3.2: Configure Database Connection

Edit the `.env` file with your database credentials:

```env
# For XAMPP (default root, no password)
DATABASE_URL="mysql://root:@localhost:3306/ultinets_cms"

# For custom user
DATABASE_URL="mysql://ultinets_user:your_password@localhost:3306/ultinets_cms"

# For production with SSL
DATABASE_URL="mysql://user:password@host:3306/ultinets_cms?sslaccept=strict"
```

**Connection string format:**
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE?options
```

#### Step 3.3: Run Prisma Setup

```bash
# Generate Prisma client (creates TypeScript types from schema)
npx prisma generate

# Run migrations (creates database tables)
npx prisma migrate dev --name init
```

**What this does:**
- Creates all tables (users, services, team, partners, contacts, media, etc.)
- Sets up foreign key relationships
- Creates indexes for performance

**Troubleshooting:**
- If you get `P1001: Can't reach database server` → MySQL is not running
- If you get `P3005: Database already exists` → Database already created, skip to migrations
- If you get authentication errors → Check username/password in DATABASE_URL

#### Step 3.4: Seed Database (Optional)

```bash
# Populate database with sample data
npm run db:seed
```

**This creates:**
- Admin user: `admin@ultinets.com` / `admin123`
- Editor user: `editor@ultinets.com` / `editor123`
- Sample services (Web Development, Cloud Solutions)
- Sample team members
- Sample partners
- Default site settings

#### Step 3.5: Verify Database Setup

```bash
# View database in Prisma Studio (GUI)
npx prisma studio
```

Opens at `http://localhost:5555` - you can browse and edit data.

**Or test via API:**
```bash
# Should return empty array [] initially
curl http://localhost:4000/api/services
```

### 4. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server runs at: `http://localhost:4000`

---

# 🐧 Linux Server Deployment Guide

This section provides comprehensive instructions for deploying the Ultinets CMS Backend on a Linux server (Ubuntu/Debian based systems).

## 📋 Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ / Debian 10+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Network**: Stable internet connection with SSH access

### Required Software

- **Node.js**: v18.0+ (LTS recommended)
- **npm**: v8.0+ or **yarn**: v1.22+
- **MySQL**: v8.0+ or **MariaDB**: v10.5+
- **Nginx**: v1.18+ (for reverse proxy)
- **PM2**: Latest version (process manager)
- **Git**: v2.25+

---

## 🚀 Step-by-Step Deployment

### Step 1: Server Setup and Initial Configuration

#### 1.1 Update System Packages

```bash
# Update package lists and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common \
    build-essential apt-transport-https ca-certificates gnupg \
    lsb-release ufw
```

#### 1.2 Create Application User

```bash
# Create a dedicated user for the application
sudo adduser ultinets
sudo usermod -aG sudo ultinets

# Switch to the application user
sudo su - ultinets
```

#### 1.3 Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MySQL (if remote access needed)
sudo ufw allow 3306/tcp

# Check firewall status
sudo ufw status
```

### Step 2: Install Node.js

#### 2.1 Install Node.js via NodeSource (Recommended)

```bash
# Add NodeSource repository for Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

#### 2.2 Alternative: Install Node.js via NVM

```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install and use Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version
npm --version
```

### Step 3: Install and Configure MySQL/MariaDB

#### 3.1 Install MySQL Server

```bash
# Install MySQL server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Start and enable MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Check MySQL status
sudo systemctl status mysql
```

#### 3.2 Configure MySQL for Production

```bash
# Log into MySQL as root
sudo mysql

# Create application database
CREATE DATABASE ultinets_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create dedicated database user
CREATE USER 'ultinets_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON ultinets_cms.* TO 'ultinets_user'@'localhost';

# Create remote user if needed (optional)
CREATE USER 'ultinets_user'@'%' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON ultinets_cms.* TO 'ultinets_user'@'%';

# Apply changes and exit
FLUSH PRIVILEGES;
EXIT;
```

#### 3.3 Optimize MySQL Configuration

Edit MySQL configuration:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add/modify these settings:
```ini
[mysqld]
# General Settings
bind-address = 127.0.0.1
port = 3306

# Performance Settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Connection Settings
max_connections = 200
max_connect_errors = 1000
wait_timeout = 300
interactive_timeout = 300

# Query Cache (MySQL 5.7 and below)
query_cache_type = 1
query_cache_size = 64M
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

### Step 4: Install and Configure Nginx

#### 4.1 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

#### 4.2 Configure Nginx Reverse Proxy

Create Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/ultinets-api
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Logging
    access_log /var/log/nginx/ultinets-api.access.log;
    error_log /var/log/nginx/ultinets-api.error.log;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # API proxy configuration
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File uploads
    location /uploads/ {
        alias /home/ultinets/ultinets-backend/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:4000/health;
        access_log off;
    }

    # Block common attacks
    location ~* \.(aspx|php|jsp|cgi)$ {
        deny all;
    }

    # Hide Nginx version
    server_tokens off;
}

# HTTPS configuration (after SSL setup)
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (replace with your certificates)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Include the same location blocks as HTTP server
    include /etc/nginx/sites-available/ultinets-api-common;
}
```

Enable the site:
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/ultinets-api /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: Deploy Application Code

#### 5.1 Clone Repository

```bash
# Navigate to user home directory
cd ~

# Clone the repository (replace with your repository URL)
git clone https://github.com/your-username/ultinets.git ultinets-backend

# Navigate to backend directory
cd ultinets-backend
```

#### 5.2 Install Dependencies

```bash
# Install production dependencies
npm ci --production

# Or if you prefer yarn
# yarn install --production
```

#### 5.3 Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

Configure your production environment:
```env
# Database Configuration
DATABASE_URL="mysql://ultinets_user:your_strong_password_here@localhost:3306/ultinets_cms"

# JWT Configuration (generate strong secrets)
JWT_SECRET="your_super_long_random_jwt_secret_key_minimum_32_characters"
JWT_REFRESH_SECRET="your_super_long_random_refresh_secret_key_minimum_32_characters"

# Server Configuration
PORT=4000
NODE_ENV=production

# CORS Configuration (update with your frontend domain)
CORS_ORIGIN=https://your-domain.com

# File Upload Configuration
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=10485760

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=another_long_random_secret_for_sessions
```

**Generate secure secrets:**
```bash
# Generate JWT secrets
openssl rand -base64 32

# Generate session secret
openssl rand -hex 64
```

### Step 6: Database Setup

#### 6.1 Generate Prisma Client

```bash
# Generate Prisma client
npx prisma generate
```

#### 6.2 Run Database Migrations

```bash
# Run database migrations
npx prisma migrate deploy

# Or for development (first time only)
npx prisma migrate dev --name init
```

#### 6.3 Seed Database (Optional)

```bash
# Seed database with initial data
npm run db:seed
```

#### 6.4 Verify Database Connection

```bash
# Test database connection
npx prisma db pull
```

### Step 7: Install and Configure PM2

#### 7.1 Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Or using yarn
# sudo yarn global add pm2
```

#### 7.2 Create PM2 Configuration File

Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

Add the following configuration:
```javascript
module.exports = {
  apps: [{
    name: 'ultinets-api',
    script: 'dist/index.js',
    cwd: '/home/ultinets/ultinets-backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    // Log configuration
    log_file: '/home/ultinets/.pm2/logs/ultinets-api.log',
    out_file: '/home/ultinets/.pm2/logs/ultinets-api-out.log',
    error_file: '/home/ultinets/.pm2/logs/ultinets-api-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Performance settings
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'public/uploads'],
    
    // Process management
    kill_timeout: 5000,
    restart_delay: 4000,
    
    // Health check
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};
```

#### 7.3 Build and Start Application

```bash
# Build TypeScript to JavaScript
npm run build

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions to enable PM2 startup
```

#### 7.4 Monitor Application

```bash
# Check application status
pm2 status

# View logs
pm2 logs ultinets-api

# Monitor application
pm2 monit

# Restart application
pm2 restart ultinets-api

# Stop application
pm2 stop ultinets-api
```

### Step 8: SSL Certificate Setup (Optional but Recommended)

#### 8.1 Install Certbot

```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Or using snap
# sudo snap install --classic certbot
# sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

#### 8.2 Obtain SSL Certificate

```bash
# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts to configure SSL
```

#### 8.3 Auto-renew SSL Certificate

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Auto-renewal is automatically configured via cron
# Verify cron job:
sudo crontab -l
```

### Step 9: Backup and Monitoring Setup

#### 9.1 Database Backup Script

Create backup script:
```bash
nano ~/backup-database.sh
```

Add the following:
```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/home/ultinets/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ultinets_cms"
DB_USER="ultinets_user"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: backup_$DATE.sql.gz"
```

Make script executable:
```bash
chmod +x ~/backup-database.sh
```

Setup automated backups:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/ultinets/backup-database.sh >> /home/ultinets/backup.log 2>&1
```

#### 9.2 Application Backup Script

Create application backup script:
```bash
nano ~/backup-application.sh
```

Add the following:
```bash
#!/bin/bash

# Application backup script
BACKUP_DIR="/home/ultinets/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/ultinets/ultinets-backend"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup application code (excluding node_modules)
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR --exclude=node_modules --exclude=dist --exclude=public/uploads .

# Backup uploads directory
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $APP_DIR public/uploads

echo "Application backup completed: app_backup_$DATE.tar.gz, uploads_backup_$DATE.tar.gz"
```

Make script executable:
```bash
chmod +x ~/backup-application.sh
```

#### 9.3 Monitoring Setup

Install monitoring tools:
```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install iotop for disk I/O monitoring
sudo apt install -y iotop

# Install net-tools for network monitoring
sudo apt install -y net-tools
```

Create monitoring script:
```bash
nano ~/monitor.sh
```

Add the following:
```bash
#!/bin/bash

echo "=== System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Disk Usage ==="
df -h
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== MySQL Status ==="
sudo systemctl is-active mysql
echo ""

echo "=== Nginx Status ==="
sudo systemctl is-active nginx
echo ""

echo "=== Recent Logs ==="
tail -10 /home/ultinets/.pm2/logs/ultinets-api-error.log
```

Make script executable:
```bash
chmod +x ~/monitor.sh
```

---

## 🔧 Maintenance and Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Errors

**Problem**: `ECONNREFUSED` connection to database
**Solution**:
```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log

# Test database connection
mysql -u ultinets_user -p ultinets_cms
```

#### 2. Application Not Starting

**Problem**: PM2 shows app as "errored"
**Solution**:
```bash
# Check PM2 logs
pm2 logs ultinets-api --lines 50

# Check if port is in use
sudo netstat -tlnp | grep :4000

# Kill process using port 4000
sudo kill -9 $(sudo lsof -t -i:4000)

# Restart application
pm2 restart ultinets-api
```

#### 3. High Memory Usage

**Problem**: Application consuming too much memory
**Solution**:
```bash
# Check memory usage
free -h
pm2 monit

# Restart application
pm2 restart ultinets-api

# Adjust PM2 memory limit in ecosystem.config.js
max_memory_restart: '512M'  # Reduce if needed
```

#### 4. File Upload Issues

**Problem**: File uploads failing
**Solution**:
```bash
# Check upload directory permissions
ls -la public/uploads/

# Fix permissions
chmod 755 public/uploads/
chown ultinets:ultinets public/uploads/

# Check disk space
df -h
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_services_published ON services(published);
CREATE INDEX idx_team_published ON team_members(published);
CREATE INDEX idx_partners_published ON partners(published);
CREATE INDEX idx_contacts_status ON contact_submissions(status);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(userId);
```

#### 2. Nginx Optimization

Add to Nginx configuration:
```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Client caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. PM2 Optimization

Update ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    // ... existing config ...
    
    // Performance optimizations
    node_args: '--max-old-space-size=1024',
    
    // Graceful reload
    listen_timeout: 10000,
    kill_timeout: 5000,
    
    // Environment-specific optimizations
    env_production: {
      NODE_ENV: 'production',
      UV_THREADPOOL_SIZE: 128
    }
  }]
};
```

### Security Hardening

#### 1. System Security

```bash
# Update system regularly
sudo apt update && sudo apt upgrade -y

# Install fail2ban for intrusion prevention
sudo apt install -y fail2ban

# Configure fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 2. Application Security

Update environment variables:
```env
# Security headers
HELMET_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Session security
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_MAX_AGE=86400000  # 24 hours
```

#### 3. Database Security

```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove remote root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Remove test database
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';

-- Flush privileges
FLUSH PRIVILEGES;
```

---

## 📊 Monitoring and Logging

### Application Monitoring

#### 1. PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Check application metrics
pm2 show ultinets-api

# View resource usage
pm2 status
```

#### 2. Log Management

```bash
# View application logs
pm2 logs ultinets-api

# Rotate logs
pm2 reloadLogs

# Log rotation configuration
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### 3. System Monitoring

```bash
# System resource usage
htop

# Disk I/O monitoring
sudo iotop

# Network connections
sudo netstat -tulpn

# System logs
sudo journalctl -f
```

### Health Checks

Create health check endpoint in your application:
```javascript
// Add to src/index.js or routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

Test health check:
```bash
curl http://localhost:4000/health
```

---

## 🔄 Deployment Automation

### CI/CD Pipeline Example

#### 1. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd ~/ultinets-backend
          git pull origin main
          npm ci --production
          npm run build
          npx prisma migrate deploy
          pm2 restart ultinets-api
```

#### 2. Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash

# Deployment script
set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Run database migrations
npx prisma migrate deploy

# Restart application
pm2 restart ultinets-api

echo "Deployment completed successfully!"
```

Make script executable:
```bash
chmod +x deploy.sh
```

---

## 📞 Support and Maintenance

### Regular Maintenance Tasks

#### Daily
- Check application logs for errors
- Monitor system resource usage
- Verify database backups

#### Weekly
- Update system packages
- Review security logs
- Check SSL certificate expiry

#### Monthly
- Update application dependencies
- Review and optimize database performance
- Clean up old logs and temporary files

### Emergency Procedures

#### 1. Application Down

```bash
# Check application status
pm2 status

# Restart application
pm2 restart ultinets-api

# Check logs
pm2 logs ultinets-api --lines 100

# If still down, check system resources
free -h
df -h
```

#### 2. Database Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check database integrity
mysqlcheck -u ultinets_user -p ultinets_cms

# Restore from backup if needed
mysql -u ultinets_user -p ultinets_cms < backup_file.sql
```

#### 3. Server Issues

```bash
# Check system status
sudo uptime
sudo df -h
sudo free -h

# Reboot if necessary
sudo reboot
```

---

## 📚 Additional Resources

### Documentation
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Security
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NodeJS_Security_Cheat_Sheet.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### Monitoring
- [PM2 Monitoring](https://pm2.keymetrics.io/docs/usage/monitoring/)
- [Linux Performance Monitoring](https://www.brendangregg.com/linuxperf.html)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Getting Help

If you encounter any issues during deployment:

1. Check the troubleshooting section above
2. Review the application logs: `pm2 logs ultinets-api`
3. Check system logs: `sudo journalctl -f`
4. Create an issue in the repository with:
   - Server OS and version
   - Node.js version
   - Error messages and logs
   - Steps to reproduce the issue

---

## 📈 Performance Benchmarks

### Expected Performance

- **Response Time**: < 200ms for API endpoints
- **Throughput**: 1000+ requests/minute
- **Memory Usage**: < 512MB per instance
- **CPU Usage**: < 50% under normal load

### Load Testing

Use tools like Apache Bench or Artillery to test performance:

```bash
# Apache Bench
ab -n 1000 -c 100 http://your-domain.com/api/services

# Artillery (install with npm install -g artillery)
artillery run load-test.yml
```

---

**Last Updated**: January 2024
**Version**: 1.0.0

---

## API Documentation

### Authentication

All admin routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin"  // admin, editor, or viewer
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/auth/logout
```

---

### Public API Endpoints (No Authentication Required)

These endpoints are for the frontend website to fetch content:

#### Services
```http
GET /api/services           # List all published services
GET /api/services/:slug     # Get single service by slug
```

#### Team Members
```http
GET /api/team               # List all published team members
```

#### Partners
```http
GET /api/partners           # List all published partners
```

#### Contact Form Submission
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry",
  "message": "I would like to know more about your services.",
  "service": "consulting",
  "captchaToken": "..."
}
```

#### Site Settings
```http
GET /api/settings           # Get all site settings as key-value object
```

---

### Admin API Endpoints (Authentication Required)

All admin endpoints require the `Authorization: Bearer <token>` header.

#### Services Management
```http
GET    /api/admin/services              # List all services
GET    /api/admin/services/:id          # Get service by ID
POST   /api/admin/services              # Create new service
PUT    /api/admin/services/:id          # Update service
DELETE /api/admin/services/:id          # Delete service (admin only)
PATCH  /api/admin/services/:id/publish   # Publish/unpublish service
POST   /api/admin/services/:id/upload-image  # Upload service image
```

**Service Create/Update Body:**
```json
{
  "slug": "web-development",
  "serviceName": "Web Development",
  "description": "We build modern websites",
  "fullDescription": "Detailed service description...",
  "icon": "code",
  "metaTitle": "Web Development Services",
  "metaDescription": "Professional web development",
  "published": true,
  "order": 1
}
```

**Upload Image:**
```http
POST /api/admin/services/:id/upload-image
Content-Type: multipart/form-data

image: <file>
```

#### Team Management
```http
GET    /api/admin/team                 # List all team members
POST   /api/admin/team                 # Create team member
PUT    /api/admin/team/:id             # Update team member
DELETE /api/admin/team/:id             # Delete team member (admin only)
POST   /api/admin/team/:id/upload-photo # Upload member photo
```

**Team Member Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "position": "CEO",
  "email": "john@company.com",
  "phone": "+1234567890",
  "bio": "John has 10 years of experience...",
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe"
  },
  "published": true,
  "order": 1
}
```

#### Partners Management
```http
GET    /api/admin/partners              # List all partners
POST   /api/admin/partners              # Create partner
PUT    /api/admin/partners/:id          # Update partner
DELETE /api/admin/partners/:id          # Delete partner (admin only)
POST   /api/admin/partners/:id/upload-logo  # Upload partner logo
```

**Partner Body:**
```json
{
  "name": "Tech Corp",
  "description": "Leading technology partner",
  "website": "https://techcorp.com",
  "category": "Technology",
  "published": true,
  "order": 1
}
```

#### Contact Submissions (Admin)
```http
GET    /api/admin/contacts              # List all submissions
GET    /api/admin/contacts/:id          # Get single submission
PATCH  /api/admin/contacts/:id/status    # Update status (new, read, responded, spam)
DELETE /api/admin/contacts/:id          # Delete submission (admin only)
```

**Status Update:**
```json
{
  "status": "responded"
}
```

#### Media Management
```http
GET    /api/admin/media                # List all uploaded media
POST   /api/admin/media/upload         # Upload new file
DELETE /api/admin/media/:id            # Delete media (admin only)
```

**Upload File:**
```http
POST /api/admin/media/upload
Content-Type: multipart/form-data

file: <file>
altText: "Description of image"
```

**Response:**
```json
{
  "id": 1,
  "filename": "image.jpg",
  "url": "/uploads/1234567890-image.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "altText": "Description",
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Settings Management
```http
GET    /api/admin/settings             # List all settings with metadata
PUT    /api/admin/settings/:key         # Create or update setting
```

**Update Setting:**
```http
PUT /api/admin/settings/siteName
Content-Type: application/json

{
  "value": "Ultinets CMS",
  "type": "string"  // string, text, number, boolean
}
```

#### Activity Logs
```http
GET /api/admin/logs                    # Get recent activity logs (admin only)
```

**Log Entry:**
```json
{
  "id": 1,
  "userId": 1,
  "action": "create",
  "entityType": "page",
  "entityId": 5,
  "changes": { "old": {}, "new": { "title": "About Us" } },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all endpoints |
| **editor** | Can create, update, publish content. Cannot delete or manage users. |
| **viewer** | Read-only access to admin endpoints |

---

## Database Schema

The API uses the following tables:

- **users** - Admin users with roles
- **pages** - Website pages (Home, About, etc.)
- **services** - Service offerings
- **serviceDetails** - Key features for each service
- **teamMembers** - Team/staff information
- **partners** - Partner/client logos
- **contactSubmissions** - Contact form entries
- **media** - Uploaded files
- **activityLogs** - Audit trail
- **settings** - Site configuration

See `prisma/schema.prisma` for full schema definition.

---

## File Uploads

Uploaded files are stored in `public/uploads/` and served statically at `/uploads/:filename`.

**Max file size:** 10MB

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## Frontend Integration

### Example: Fetching Public Data

```javascript
// Using fetch
const response = await fetch('http://localhost:4000/api/services');
const services = await response.json();

// Get single service
const serviceResponse = await fetch('http://localhost:4000/api/services/web-development');
const service = await serviceResponse.json();
```

### Example: Admin API with Auth

```javascript
// Login
const loginRes = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
});
const { accessToken } = await loginRes.json();

// Use token for admin requests
const servicesRes = await fetch('http://localhost:4000/api/admin/services', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const adminServices = await servicesRes.json();
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma studio` | Open Prisma database GUI |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `PORT` | Server port | 4000 |
| `CORS_ORIGIN` | Allowed frontend origin | http://localhost:3000 |
| `UPLOAD_DIR` | File upload directory | public/uploads |

---

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Role-based access control
- SQL injection prevention via Prisma ORM
- File upload size limits (10MB)

---

## Next Steps

1. Set up your MySQL/MariaDB database
2. Configure environment variables
3. Run migrations to create tables
4. Register your first admin user
5. Start building the frontend!

For frontend integration examples, see the `/frontend` folder.
"# ultinets-api" 
