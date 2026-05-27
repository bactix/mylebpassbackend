# Railway Deployment Guide

This project is configured to deploy on Railway.com with MongoDB.

## Prerequisites

1. Railway.com account
2. MongoDB plugin from Railway marketplace
3. GitHub repository (for deployment)

## Setup Steps

### 1. Create Railway Project

- Go to [Railway.com](https://railway.app)
- Create new project
- Click "Add Service" and select "MongoDB"
- Railway will automatically provision MongoDB and set environment variables

### 2. Environment Variables

Railway automatically sets these variables when MongoDB is added:

```
MONGOUSER          # MongoDB username
MONGOPASSWORD      # MongoDB password
RAILWAY_PRIVATE_DOMAIN    # Private MongoDB domain
RAILWAY_TCP_PROXY_DOMAIN  # Public MongoDB domain
RAILWAY_TCP_PROXY_PORT    # Public MongoDB port
```

The app automatically detects Railway environment and connects using `RAILWAY_PRIVATE_DOMAIN`.

### 3. Deploy Node.js App

1. Connect your GitHub repository
2. Railway will auto-detect Node.js project
3. Set environment variables in Railway dashboard (if needed):
   - `NODE_ENV=production`
   - `PORT=3000`
   - `LOG_LEVEL=info`

### 4. Build & Deploy

Railway will automatically:
- Install dependencies: `npm install`
- Build: `npm run build`
- Start: `npm start`

## Environment Variables on Railway

These are automatically set by Railway and used by the app:

```
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
MONGOUSER=<generated>
MONGOPASSWORD=<generated>
RAILWAY_PRIVATE_DOMAIN=<generated>
RAILWAY_TCP_PROXY_DOMAIN=<generated>
RAILWAY_TCP_PROXY_PORT=<generated>
```

## Local Development

For local development without MongoDB:
- Server runs fine and warns about MongoDB connection
- Data operations will use MongoDB when available
- Perfect for testing API endpoints

To use local MongoDB:
1. Install MongoDB locally
2. Update `MONGO_URL` in `.env`
3. Run `npm run dev`

## API Endpoints

After deployment, your API will be available at:
```
https://<your-railway-domain>/api/users
```

## Database Connection Details

The app automatically:
1. Checks for `RAILWAY_PRIVATE_DOMAIN` (when on Railway)
2. Falls back to `MONGO_URL` environment variable
3. Falls back to local localhost (for development)

This ensures seamless deployment from local to Railway without code changes!

## Troubleshooting

### MongoDB not connecting
- Ensure MongoDB plugin is added to your Railway project
- Check Railway dashboard for environment variables
- Restart the service

### Port already in use
- Railway automatically assigns an available port
- Check Railway logs for assigned port

### Build fails
- Check `npm run build` locally
- Ensure all TypeScript compiles without errors
- Check `package.json` dependencies

## Monitoring

Check logs in Railway dashboard:
- Look for "Server running on port" message
- Check for MongoDB connection confirmation
- Monitor API requests in real-time
