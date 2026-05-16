# Quick Deployment Guide

## Prerequisites
- Node.js v22.14.0 or higher
- MongoDB Atlas account with connection string
- Perplexity API key
- Email account (Gmail recommended)

## Environment Setup

### 1. Backend Configuration
Create `/server/.env`:
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=MERN
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CORS_ORIGIN=https://yourdomain.com
PERPLEXITY_API_KEY=your_api_key_here
```

### 2. Frontend Configuration
Create `.env`:
```
VITE_API_URL=https://api.yourdomain.com/api
```

## Installation & Running

### Backend
```bash
cd server
npm install
npm run dev    # Development
npm start      # Production
```

### Frontend
```bash
npm install
npm run dev    # Development (Vite port 5173)
npm run build  # Production build
npm run preview # Preview production build
```

## Deployment Options

### Option 1: Vercel (Frontend) + Heroku (Backend)
```bash
# Frontend
vercel deploy

# Backend
heroku create ngo-api
git push heroku main
```

### Option 2: Docker Deployment
See `Dockerfile` in root and `server/Dockerfile`

### Option 3: AWS/DigitalOcean/Azure
- Deploy frontend to S3/CloudFront
- Deploy backend to EC2/App Service
- Configure load balancer and CDN

## Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

2. **Database Connection**
   - Check MongoDB Atlas connection
   - Verify all collections are created

3. **AI Analysis Test**
   - Create test event
   - Run AI analysis
   - Verify Perplexity API integration

4. **Export Functionality**
   - Generate PDF/CSV/JSON exports
   - Verify file downloads

## Performance Monitoring

- Set up monitoring dashboard (New Relic, DataDog)
- Enable error tracking (Sentry)
- Configure alerts for critical errors
- Monitor database performance

## Maintenance Tasks

### Daily
- Monitor error logs
- Check application health
- Verify database backups

### Weekly
- Review performance metrics
- Check disk usage
- Update dependencies (security patches)

### Monthly
- Full security audit
- Database optimization
- Backup verification
- Performance optimization review

## Rollback Procedure

If issues occur:
1. Revert to previous commit: `git revert <commit_hash>`
2. Restore database from backup
3. Clear cache: `DELETE /api/ai/cache/:eventId`
4. Restart services

## Support & Troubleshooting

### Port Already in Use
```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string in `.env`
- Verify network connectivity

### Email Not Sending
- Enable "Less secure app access" (Gmail)
- Generate app-specific password
- Check email logs in console

### AI Analysis Timeout
- Increase timeout in `perplexityService.js` (line 27)
- Check API rate limits
- Verify Perplexity API key validity

## Scaling Considerations

1. **Database Scaling**
   - Enable MongoDB sharding for large datasets
   - Set up read replicas

2. **API Scaling**
   - Use load balancer (Nginx, HAProxy)
   - Set up multiple server instances
   - Implement caching layer (Redis)

3. **File Storage Scaling**
   - Move exports to S3/Cloud Storage
   - Implement CDN for file delivery

4. **AI Processing Scaling**
   - Queue long-running AI tasks (Bull, RabbitMQ)
   - Implement worker processes
   - Add request caching

## Monitoring Checklist

- [ ] Server uptime monitoring
- [ ] Database connection monitoring
- [ ] API response time monitoring
- [ ] Error rate monitoring
- [ ] Disk space monitoring
- [ ] Memory usage monitoring
- [ ] CPU usage monitoring
- [ ] Email delivery monitoring
- [ ] File upload/export monitoring
- [ ] AI analysis performance monitoring

## Security Checklist

- [ ] All environment variables are secure
- [ ] HTTPS/SSL enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation enforced
- [ ] Database encryption enabled
- [ ] Regular security updates applied
- [ ] Backup encryption enabled
- [ ] API keys rotated regularly
- [ ] Audit logs reviewed regularly
