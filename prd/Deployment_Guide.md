# Employee Pulse Application - Deployment Guide

This guide provides instructions for deploying the Employee Pulse Application in various environments.

## Prerequisites

Before deploying the application, ensure you have the following:

- **For Local Development:**
  - Node.js (v18 or higher)
  - npm (v8 or higher) or yarn
  - MongoDB (v6 or higher)
  - Git

- **For Docker Deployment:**
  - Docker (v20 or higher)
  - Docker Compose (v2 or higher)
  - Git

- **For Production Deployment:**
  - Linux server (Ubuntu 20.04 LTS or higher recommended)
  - Docker and Docker Compose
  - Nginx or similar web server (for reverse proxy)
  - SSL certificate
  - Domain name (optional but recommended)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/employee-pulse-application.git
cd employee-pulse-application
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend and frontend dependencies
npm run install:all
```

### 3. Configure Environment Variables

Create `.env` files in both the backend and frontend directories:

**Backend (.env file in the /backend directory):**
```
MONGODB_URI=mongodb://localhost:27017/employee-pulse
JWT_SECRET=your_secret_key_here
PORT=3001
```

**Frontend (.env file in the /frontend directory):**
```
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Start MongoDB

If you don't have MongoDB running as a service:

```bash
# Create data directory if it doesn't exist
mkdir -p data/db

# Start MongoDB
npm run start:mongodb
```

### 5. Start the Application

For development with hot-reloading:

```bash
# Start both backend and frontend concurrently
npm run dev

# Or, if MongoDB is already running:
npm run dev:quick
```

### 6. Seed the Database

To populate the database with initial data:

```bash
npm run seed:db
```

This will create test users and sample surveys.

## Docker Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/employee-pulse-application.git
cd employee-pulse-application
```

### 2. Configure Environment Variables

No changes needed for the default configuration as the Docker Compose file includes the necessary environment variables.

### 3. Build and Start the Docker Containers

```bash
# Build and start all containers
npm run start:build

# Or, if you've built before:
npm start
```

This command will:
- Build the Docker images for frontend and backend
- Start MongoDB, backend, and frontend containers
- Set up networking between them

### 4. Seed the Database

After the containers are running:

```bash
npm run seed
```

### 5. Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Documentation: http://localhost:3001/api/docs

## Production Deployment

### 1. Server Setup

Set up a server with Docker and Docker Compose installed:

```bash
# Update package lists
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Update package lists again
sudo apt update

# Install Docker
sudo apt install -y docker-ce

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to the docker group
sudo usermod -aG docker ${USER}
```

### 2. Clone the Repository

```bash
git clone https://github.com/your-repo/employee-pulse-application.git
cd employee-pulse-application
```

### 3. Configure for Production

Create a `docker-compose.prod.yml` file:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    restart: always
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  backend:
    build: ./backend
    restart: always
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/employee-pulse
      - JWT_SECRET=your_secure_production_key_here
      - PORT=3001
      - NODE_ENV=production
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    build: 
      context: ./frontend
      args:
        - REACT_APP_API_URL=https://your-domain.com/api
    restart: always
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/www:/var/www/html
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
```

### 4. Create Nginx Configuration

Create a directory for Nginx configs:

```bash
mkdir -p nginx/conf
mkdir -p nginx/ssl
mkdir -p nginx/www
```

Create `nginx/conf/default.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    
    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API Documentation
    location /api/docs {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate

Place your SSL certificate files in the `nginx/ssl` directory:
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

If you don't have a certificate, you can use Let's Encrypt to generate one:

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chmod -R 755 nginx/ssl
```

### 6. Start the Production Stack

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 7. Seed the Database (Production)

```bash
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

### 8. Set Up Automatic Updates (Optional)

Create a script to pull the latest code and restart the services:

```bash
# Create update script
cat > update.sh << EOF
#!/bin/bash
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
EOF

# Make script executable
chmod +x update.sh
```

Set up a cron job to run updates weekly:

```bash
# Open crontab editor
crontab -e

# Add line to run update.sh every Sunday at 2 AM
0 2 * * 0 /path/to/employee-pulse-application/update.sh >> /path/to/employee-pulse-application/update.log 2>&1
```

## Maintenance Tasks

### Database Backups

Set up automatic MongoDB backups:

```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/path/to/backups
mkdir -p \$BACKUP_DIR
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump --out=/data/db/backup
docker cp \$(docker-compose -f docker-compose.prod.yml ps -q mongodb):/data/db/backup \$BACKUP_DIR/backup_\$TIMESTAMP
tar -czf \$BACKUP_DIR/mongodb_backup_\$TIMESTAMP.tar.gz \$BACKUP_DIR/backup_\$TIMESTAMP
rm -rf \$BACKUP_DIR/backup_\$TIMESTAMP
# Keep only the last 10 backups
ls -t \$BACKUP_DIR/mongodb_backup_*.tar.gz | tail -n +11 | xargs -r rm
EOF

# Make script executable
chmod +x backup.sh

# Add to crontab to run daily at 1 AM
crontab -e
0 1 * * * /path/to/employee-pulse-application/backup.sh >> /path/to/employee-pulse-application/backup.log 2>&1
```

### Monitoring

Set up basic monitoring with Docker stats:

```bash
# Create monitoring script
cat > monitor.sh << EOF
#!/bin/bash
LOG_DIR=/path/to/logs
mkdir -p \$LOG_DIR
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)

# Get container stats
docker stats --no-stream > \$LOG_DIR/docker_stats_\$TIMESTAMP.log

# Check disk space
df -h > \$LOG_DIR/disk_usage_\$TIMESTAMP.log

# Check memory usage
free -m > \$LOG_DIR/memory_usage_\$TIMESTAMP.log

# Keep only the last 100 logs
ls -t \$LOG_DIR/docker_stats_*.log | tail -n +101 | xargs -r rm
ls -t \$LOG_DIR/disk_usage_*.log | tail -n +101 | xargs -r rm
ls -t \$LOG_DIR/memory_usage_*.log | tail -n +101 | xargs -r rm
EOF

# Make script executable
chmod +x monitor.sh

# Add to crontab to run every hour
crontab -e
0 * * * * /path/to/employee-pulse-application/monitor.sh
```

## Troubleshooting

### Common Issues

1. **Container doesn't start**
   
   Check container logs:
   ```bash
   docker-compose logs -f [service_name]
   ```

2. **Database connection errors**
   
   Ensure MongoDB is running:
   ```bash
   docker-compose ps mongodb
   ```
   
   Check network connectivity:
   ```bash
   docker-compose exec backend ping mongodb
   ```

3. **Frontend can't connect to API**
   
   Verify the REACT_APP_API_URL is set correctly and the backend is accessible.

4. **Nginx returns 502 Bad Gateway**
   
   Check if backend and frontend services are running:
   ```bash
   docker-compose ps
   ```
   
   Check Nginx config:
   ```bash
   docker-compose exec nginx nginx -t
   ```

### Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs:
   ```bash
   docker-compose logs -f
   ```

2. Check the GitHub repository issues section for similar problems and solutions.

3. Contact the development team at support@your-company.com.

## Scaling Considerations

For higher traffic environments:

1. **Database Scaling**
   - Consider a MongoDB replica set for redundancy
   - Add MongoDB indexes for improved performance

2. **Application Scaling**
   - Use Docker Swarm or Kubernetes for container orchestration
   - Deploy multiple backend instances behind a load balancer
   - Set up a CDN for frontend static assets

3. **Performance Optimization**
   - Enable response compression
   - Implement proper caching strategies
   - Configure connection pooling for the database 