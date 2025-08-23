# Japan Direct Trucks - Deployment Guide

## Google Analytics Setup

### 1. Create Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property for "Japan Direct Trucks"
3. Set up GA4 (Google Analytics 4)
4. Get your Measurement ID (format: G-XXXXXXXXXX)

### 2. Configure Analytics in Your Site
1. Update `.env` file:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Replace with your actual ID
   NEXT_PUBLIC_GA_ENABLED=true  # Enable for production
   ```

### 3. Analytics Features Included
- **Page Views**: Automatically tracked on all pages
- **Search Tracking**: When users search for vehicles
- **Category Clicks**: When users click vehicle categories
- **Vehicle Views**: When users view individual vehicles
- **Lead Generation**: When users submit inquiries

## Cloudflare Deployment Options

### Option 1: Cloudflare Tunnel (Recommended - Free)
This creates a secure tunnel from your server to Cloudflare without opening ports.

1. **Install Cloudflare Tunnel**:
   ```bash
   # Download and install
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   cloudflared tunnel login
   ```
   This opens a browser to authenticate with your Cloudflare account.

3. **Create a Tunnel**:
   ```bash
   cloudflared tunnel create japandirecttrucks
   ```

4. **Configure DNS**:
   ```bash
   cloudflared tunnel route dns japandirecttrucks japandirecttrucks.com
   ```

5. **Create config file** (`~/.cloudflared/config.yml`):
   ```yaml
   tunnel: japandirecttrucks
   credentials-file: /home/gp/.cloudflared/[tunnel-id].json
   
   ingress:
     - hostname: japandirecttrucks.com
       service: http://localhost:3000
     - hostname: api.japandirecttrucks.com  
       service: http://localhost:3002
     - service: http_status:404
   ```

6. **Run the tunnel**:
   ```bash
   cloudflared tunnel run japandirecttrucks
   ```

### Option 2: Cloudflare Pages (Static Export)
If you want to use Cloudflare Pages for static hosting:

1. **Configure Next.js for static export** in `next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   module.exports = nextConfig
   ```

2. **Build and export**:
   ```bash
   npm run build
   ```

3. **Deploy to Cloudflare Pages**:
   - Connect your GitHub repo to Cloudflare Pages
   - Set build command: `npm run build`
   - Set output directory: `out`

### Option 3: VPS + Cloudflare Proxy
Deploy to a VPS and use Cloudflare as a proxy:

1. **Popular VPS Options**:
   - DigitalOcean Droplet ($4/month)
   - Linode ($5/month)
   - Vultr ($2.50/month)

2. **Setup Process**:
   - Deploy your app to VPS
   - Point your domain to Cloudflare nameservers
   - Configure Cloudflare DNS to proxy traffic

## Domain Configuration

1. **Purchase Domain**: You mentioned you have a Cloudflare account, you can buy domain through Cloudflare
2. **DNS Setup**: Point your domain to Cloudflare nameservers
3. **SSL**: Cloudflare provides free SSL certificates

## Production Environment Setup

### Backend Configuration
```bash
# Update .env for production
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret
```

### Frontend Configuration
```bash
# Update .env for production
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_ENABLED=true
NEXT_PUBLIC_API_URL=https://api.japandirecttrucks.com
```

## Security Considerations

1. **Environment Variables**: Never commit real credentials to Git
2. **Database**: Use strong passwords and limit access
3. **JWT Secrets**: Use long, random strings
4. **CORS**: Configure proper CORS origins
5. **Rate Limiting**: Already configured in your backend

## Monitoring & Analytics

### Google Analytics 4 Dashboard
- **Real-time users**
- **Popular vehicle searches** 
- **Category performance**
- **Geographic data** (which countries are interested)
- **Conversion tracking** (inquiries submitted)

### Cloudflare Analytics
- **Traffic patterns**
- **Performance metrics**
- **Security insights**
- **CDN cache performance**

## Next Steps

1. **Get Google Analytics ID** and update environment variables
2. **Choose deployment method** (Cloudflare Tunnel recommended)
3. **Purchase/configure domain**
4. **Set up monitoring and alerts**
5. **Test all functionality in production**

## Support

For any deployment issues:
- Check Cloudflare documentation
- Verify all environment variables are set
- Test database connectivity
- Monitor application logs