#!/bin/bash

# Script to set up Nginx directory structure for Employee Pulse Application

set -e

# Create Nginx directories
mkdir -p nginx/conf
mkdir -p nginx/ssl
mkdir -p nginx/www
mkdir -p nginx/logs

echo "Nginx directory structure created successfully!"
echo "Don't forget to place your SSL certificates in nginx/ssl:"
echo "  - fullchain.pem: Your certificate chain"
echo "  - privkey.pem: Your private key"
echo ""
echo "You can generate certificates using Let's Encrypt:"
echo "certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com"

# Make the script executable
chmod +x setup-nginx.sh 