# ArabDg Finance - Ubuntu Server Deployment Guide

## System Overview
- **Web App**: React Router + Hono server (Node.js)
- **Mobile App**: React Native/Expo 
- **Database**: PostgreSQL (Neon)
- **Authentication**: Custom auth with credentials

## Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

## Environment Setup

### 1. Clone and Build
```bash
# Clone your repository
git clone <your-repo-url>
cd arabdg-finance

# Install dependencies
cd apps/web
npm install

# Build the application
npm run build
```

### 2. Environment Configuration
Create `.env` file in `apps/web/`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_xDHUja1XV4Po@ep-broad-sky-ag579c4z-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NODE_ENV="production"
PORT=4000
```

### 3. Database Setup
```bash
# Setup database schema
npm run db:setup
```

## PM2 Configuration

Create `ecosystem.config.js` in root:
```javascript
module.exports = {
  apps: [{
    name: 'arabdg-finance',
    script: './apps/web/build/server/index.js',
    cwd: './apps/web',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    instances: 'max',
    exec_mode: 'cluster',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start the application:
```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## Nginx Configuration

Create `/etc/nginx/sites-available/arabdg-finance`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/arabdg-finance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## First Time Setup

1. **Access your application**: `https://your-domain.com`
2. **Create first user**: Go to `/account/signup`
3. **Make user admin**: Go to `/setup-admin` (delete this after use)
4. **Complete onboarding**: Go to `/onboarding`

## Mobile App Deployment

For mobile app, use Expo's build service:

```bash
cd apps/mobile
npm install

# Build for Android
expo build:android

# Build for iOS  
expo build:ios

# Or use EAS Build
eas build --platform all
```

## Monitoring and Maintenance

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart arabdg-finance

# Update app
git pull
npm run build
pm2 restart arabdg-finance
```

### Backup Database
The database is on Neon (cloud), which handles backups automatically.

## Security Notes

1. **Delete admin setup files after first use**:
   - `/apps/web/src/app/setup-admin/page.jsx`
   - `/apps/web/src/app/api/user/make-admin/route.js`

2. **Firewall**:
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

3. **Regular updates**:
```bash
sudo apt update && sudo apt upgrade -y
```

## Domain Configuration

Point your domain A record to your server's IP address:
- Type: A
- Name: @
- Value: YOUR_SERVER_IP
- TTL: 300

## Troubleshooting

### Common Issues
1. **Database connection**: Check DATABASE_URL in .env
2. **Port conflicts**: Ensure port 4000 is free
3. **Nginx errors**: `sudo nginx -t` to test config
4. **PM2 issues**: `pm2 logs` for error details

### Log Locations
- App logs: `./logs/combined.log`
- Nginx logs: `/var/log/nginx/`
- PM2 logs: `pm2 logs`

## Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Configure caching headers**
3. **Monitor server resources**
4. **Consider CDN for static assets**

Your finance app should now be running perfectly on Ubuntu!