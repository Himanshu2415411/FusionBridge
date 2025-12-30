# 🚀 FusionBridge Deployment Guide

This guide covers deploying both the frontend and backend to production.

## 📋 Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose (for backend)
- Vercel account (for frontend)
- Railway/Render account (for backend)
- MongoDB Atlas account (recommended for production)
- Domain name (optional but recommended)

## 🎯 Quick Deployment

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/fusionbridge)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/your-template-id)

### Option 2: Manual Deployment

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/fusionbridge.git
cd fusionbridge

# Deploy frontend
npm run deploy

# Deploy backend
cd server
docker-compose up -d
\`\`\`

## 🌐 Frontend Deployment (Vercel)

### 1. Install Vercel CLI
\`\`\`bash
npm i -g vercel
\`\`\`

### 2. Login to Vercel
\`\`\`bash
vercel login
\`\`\`

### 3. Configure Environment Variables
Set these in your Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID

### 4. Deploy
\`\`\`bash
vercel --prod
\`\`\`

## 🖥️ Backend Deployment

### Option A: Railway (Recommended)

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment Variables**
   - Add all variables from `.env.production`
   - Railway will auto-deploy on git push

3. **Add Database**
   - Add MongoDB plugin
   - Add Redis plugin
   - Update `MONGODB_URI` and `REDIS_URL`

### Option B: Docker + VPS

1. **Prepare Server**
\`\`\`bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
\`\`\`

2. **Deploy Application**
\`\`\`bash
# Clone repository
git clone https://github.com/your-username/fusionbridge.git
cd fusionbridge/server

# Copy environment file
cp .env.example .env.production
# Edit .env.production with your values

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
\`\`\`

### Option C: Render

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node

3. **Add Environment Variables**
   - Add all variables from `.env.production`

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Choose your preferred region

2. **Configure Access**
   - Add IP addresses (0.0.0.0/0 for all IPs)
   - Create database user
   - Get connection string

3. **Update Environment**
   \`\`\`
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fusionbridge
   \`\`\`

### Redis (Optional but Recommended)

1. **Redis Cloud**
   - Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
   - Create free database
   - Get connection URL

2. **Update Environment**
   \`\`\`
   REDIS_URL=redis://username:password@host:port
   \`\`\`

## 🔒 SSL Certificate

### Option A: Cloudflare (Free)
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"

### Option B: Let's Encrypt
\`\`\`bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

## 📊 Monitoring & Analytics

### 1. Error Tracking (Sentry)
\`\`\`bash
npm install @sentry/nextjs @sentry/node
\`\`\`

### 2. Performance Monitoring
- Add Google Analytics
- Set up Vercel Analytics
- Configure Uptime monitoring

### 3. Logs
\`\`\`bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f mongodb
\`\`\`

## 🔧 Environment Variables

### Frontend (.env.production)
\`\`\`env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GA_ID=G-...
\`\`\`

### Backend (.env.production)
\`\`\`env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secure-secret
CORS_ORIGIN=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=...
\`\`\`

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGIN` in backend
   - Verify API URL in frontend

2. **Database Connection**
   - Check MongoDB URI
   - Verify network access

3. **Build Failures**
   - Check Node.js version
   - Clear npm cache: `npm cache clean --force`

### Health Checks

\`\`\`bash
# Frontend
curl https://your-domain.com

# Backend
curl https://api.your-domain.com/api/health

# Database
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"
\`\`\`

## 📈 Performance Optimization

### Frontend
- Enable Vercel Analytics
- Configure CDN caching
- Optimize images with Next.js Image

### Backend
- Enable Redis caching
- Configure database indexes
- Use compression middleware

## 🔄 CI/CD Pipeline

The included GitHub Actions workflow automatically:
1. Runs tests on every push
2. Deploys to staging on PR
3. Deploys to production on main branch merge

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Review environment variables
3. Test API endpoints manually
4. Check database connectivity

---

🎉 **Congratulations!** Your FusionBridge application is now live in production!
