# Deployment Guide

This guide covers deploying KCS Meet to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Alternative Deployment Options](#alternative-deployment-options)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Environment-Specific Settings](#environment-specific-settings)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Readiness
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] Build completes successfully (`npm run build`)
- [ ] TypeScript checks pass (`npm run lint`)
- [ ] All environment variables documented

### Service Configuration
- [ ] Clerk authentication configured for production domain
- [ ] Stream.io production keys obtained
- [ ] Supabase production database created
- [ ] Cashfree production credentials obtained
- [ ] Domain name purchased (if needed)
- [ ] SSL certificate ready (usually automatic with hosting)

### Security
- [ ] Production API keys secured
- [ ] `.env.local` not committed to repository
- [ ] Admin emails correctly configured
- [ ] CORS policies reviewed
- [ ] Webhook endpoints use HTTPS
- [ ] Rate limiting configured

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

### Step 1: Prepare Repository

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Ensure `.gitignore` includes**:
   ```
   .env.local
   .env*.local
   .vercel
   ```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click **Add New** → **Project**
2. Import your `KCS-App` repository
3. Vercel will automatically detect Next.js

### Step 4: Configure Build Settings

Vercel should auto-detect, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 5: Configure Environment Variables

Add all environment variables in Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable from your `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stream.io
NEXT_PUBLIC_STREAM_API_KEY=your_production_key
STREAM_SECRET_KEY=your_production_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key

# Cashfree
NEXT_PUBLIC_CASHFREE_APP_ID=your_prod_app_id
CASHFREE_SECRET_KEY=your_prod_secret_key
NEXT_PUBLIC_CASHFREE_MODE=PROD

# App Config
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Broadcasting (Optional)
NEXT_PUBLIC_YOUTUBE_STREAM_URL=rtmp://a.rtmp.youtube.com/live2
NEXT_PUBLIC_YOUTUBE_STREAM_KEY=your_stream_key
NEXT_PUBLIC_FACEBOOK_STREAM_URL=your_fb_rtmp_url
NEXT_PUBLIC_FACEBOOK_STREAM_KEY=your_fb_stream_key
```

**Important**: 
- Use **production** keys, not test/development keys
- Click **Add** after each variable
- Select environment: **Production** (and optionally Preview/Development)

### Step 6: Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-5 minutes)
3. Vercel will provide a deployment URL: `https://your-app.vercel.app`

### Step 7: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (~5-30 minutes)
5. SSL certificate auto-generates

### Step 8: Update Services with Production URL

Update these services with your production URL:

**Clerk Dashboard**:
- Go to your application settings
- Update allowed origins to include production domain
- Update redirect URLs to use production domain

**Cashfree Dashboard**:
- Update webhook URL to: `https://your-domain.vercel.app/api/cashfree-webhook`

**Stream.io Dashboard**:
- Add production domain to allowed origins (if required)

---

## Alternative Deployment Options

### Option 1: Self-Hosted (Docker)

**Prerequisites**:
- Docker installed
- Docker Compose installed

**Steps**:

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  kcs-meet:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

3. **Deploy**:
```bash
docker-compose up -d
```

### Option 2: AWS Amplify

1. Go to [AWS Amplify Console](https://aws.amazon.com/amplify/)
2. Connect your GitHub repository
3. Configure build settings (auto-detected for Next.js)
4. Add environment variables
5. Deploy

### Option 3: Netlify

1. Go to [Netlify](https://netlify.com)
2. Import repository from GitHub
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables
6. Deploy

**Note**: Netlify requires Next.js to run in SSG mode or use Netlify's Next.js plugin.

### Option 4: DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform/)
2. Create new app from GitHub
3. Select repository
4. Configure environment variables
5. Deploy

---

## Post-Deployment Configuration

### 1. Verify Deployment

Test critical features:
- [ ] Authentication (sign up, sign in, sign out)
- [ ] Create meeting
- [ ] Join meeting
- [ ] Video/audio works
- [ ] Chat functionality
- [ ] Super Chat payment flow
- [ ] Poll creation and voting
- [ ] Recording (if admin)
- [ ] Broadcasting (if configured)

### 2. Configure DNS and SSL

If using custom domain:
- Set up A/CNAME records
- Verify SSL certificate
- Force HTTPS redirect
- Test from multiple locations

### 3. Set Up Monitoring

**Vercel Analytics** (Built-in):
- Already enabled with Vercel deployment
- View in Vercel dashboard

**Error Tracking**:
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for APM

### 4. Performance Optimization

**Enable Vercel features**:
- Image optimization (automatic)
- Edge caching (automatic)
- Compression (automatic)

**Monitor**:
- Core Web Vitals
- API response times
- Database query performance

### 5. Backup Strategy

**Database Backups**:
- Supabase provides automatic backups
- Set up additional backup schedule
- Test restoration process

**Code Backups**:
- Git repository (already backed up)
- Consider multiple remotes

---

## Environment-Specific Settings

### Development
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_CASHFREE_MODE=TEST
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Staging (Optional)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_CASHFREE_MODE=TEST
NEXT_PUBLIC_BASE_URL=https://staging.your-domain.com
```

### Production
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_CASHFREE_MODE=PROD
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

---

## Monitoring and Maintenance

### Regular Checks

**Daily**:
- [ ] Check error logs
- [ ] Monitor payment transactions
- [ ] Verify uptime

**Weekly**:
- [ ] Review analytics
- [ ] Check database usage
- [ ] Monitor storage usage
- [ ] Review user feedback

**Monthly**:
- [ ] Update dependencies (`npm update`)
- [ ] Security audit (`npm audit`)
- [ ] Performance review
- [ ] Cost analysis

### Key Metrics to Monitor

1. **Performance**:
   - Page load time
   - API response time
   - Video connection latency
   - Database query time

2. **Usage**:
   - Active users
   - Meeting creation rate
   - Average meeting duration
   - Super Chat transactions

3. **Errors**:
   - Error rate
   - Failed payments
   - Connection failures
   - Database errors

4. **Resources**:
   - Bandwidth usage
   - Storage usage
   - API call limits
   - Database connections

### Maintenance Tasks

**Weekly**:
```bash
# Check for updates
npm outdated

# Security audit
npm audit

# Check build
npm run build
```

**Monthly**:
```bash
# Update dependencies (carefully)
npm update

# Run security fixes
npm audit fix

# Test thoroughly after updates
```

---

## Troubleshooting

### Issue: Build fails on Vercel

**Solutions**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility
- Test build locally: `npm run build`
- Check for TypeScript errors

### Issue: Environment variables not working

**Solutions**:
- Verify all variables are added in Vercel dashboard
- Check variable names (case-sensitive)
- Ensure `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding new variables
- Check variable scope (Production/Preview/Development)

### Issue: Authentication fails in production

**Solutions**:
- Update Clerk dashboard with production domain
- Verify redirect URLs in Clerk
- Check CORS settings
- Clear browser cache
- Check Clerk logs for errors

### Issue: Payments not working

**Solutions**:
- Verify `NEXT_PUBLIC_CASHFREE_MODE=PROD`
- Update webhook URL in Cashfree dashboard
- Check Cashfree logs
- Verify SSL is working (webhooks require HTTPS)
- Test with Cashfree test cards first

### Issue: Video not connecting

**Solutions**:
- Verify Stream.io production keys
- Check Stream.io dashboard for connection logs
- Verify browser permissions
- Check firewall/network restrictions
- Test from different networks

### Issue: Database connection errors

**Solutions**:
- Verify Supabase production URL and keys
- Check connection pooling limits
- Monitor Supabase dashboard for errors
- Verify database is not paused (free tier)
- Check API rate limits

---

## Security Best Practices

### 1. Environment Variables
- Never commit `.env.local` to Git
- Use different keys for dev/staging/prod
- Rotate keys periodically
- Limit key permissions

### 2. API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS only
- Verify webhook signatures

### 3. Database Security
- Use Row Level Security (RLS) in Supabase
- Limit service role key usage
- Regular security audits
- Monitor for suspicious activity

### 4. User Security
- Enforce strong passwords (via Clerk)
- Implement 2FA (optional, via Clerk)
- Monitor failed login attempts
- Session timeout configuration

---

## Scaling Considerations

### When to Scale

Monitor these indicators:
- Response times > 1 second
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 80%
- Database connections maxed out

### Scaling Strategy

**Vercel (Automatic)**:
- Scales automatically with traffic
- No configuration needed
- Monitor usage and costs

**Database Scaling**:
- Upgrade Supabase plan if needed
- Optimize queries
- Add indexes
- Implement caching

**CDN Optimization**:
- Vercel provides global CDN
- Optimize images
- Minimize bundle size
- Enable compression

---

## Cost Optimization

### Free Tier Limits

**Vercel**:
- Unlimited deployments
- 100 GB bandwidth/month
- 6,000 build minutes/month

**Supabase**:
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth

**Stream.io**:
- 10,000 minutes/month free

### Cost Reduction Tips

1. Optimize images (use Next.js Image component)
2. Implement caching where possible
3. Monitor and cap API usage
4. Clean up old data regularly
5. Use edge functions for static content

---

## Rollback Procedure

If issues occur after deployment:

### Quick Rollback (Vercel)

1. Go to Vercel dashboard
2. Navigate to **Deployments**
3. Find previous working deployment
4. Click **⋯** → **Promote to Production**
5. Confirm promotion

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

---

## Support and Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Stream.io Docs](https://getstream.io/video/docs/)
- [Supabase Docs](https://supabase.com/docs)

### Community
- GitHub Issues: Report bugs
- Email: divineconnectionkcs@gmail.com

---

**Deployment Complete!** 🚀

Your KCS Meet application is now live and ready to connect souls across the world!
