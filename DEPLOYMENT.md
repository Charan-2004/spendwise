/**
 * Production Deployment Guide
 * Follow these steps to deploy securely
 */

# Deployment Guide

## Prerequisites
- [ ] Supabase project created
- [ ] GitHub repository set up
- [ ] Vercel/Netlify account ready

## Step 1: Database Security (CRITICAL)

### Apply RLS Policies

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `add_rls_policies.sql`
3. Click "Run"
4. Verify output shows no errors

**Verification**:
```sql
-- Should show rowsecurity = true
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'expenses');
```

### Test RLS

1. Create test user account
2. Add some expenses
3. Try to query database directly:
   ```sql
   -- Should only return your data
   SELECT * FROM expenses;
   ```

## Step 2: Environment Setup

### Create `.env.production`

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GOOGLE_AI_API_KEY=your_google_ai_key
```

**Important**:
- Use production Supabase keys
- Never commit this file
- Add to `.gitignore`

### Verify Locally

```bash
# Test production build
npm run build
npm run preview

# Check browser console for validation
```

## Step 3: Deploy to Vercel

### Option A: GitHub Integration (Recommended)

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_AI_API_KEY`

7. Click "Deploy"

### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to configure
```

## Step 4: Post-Deployment Verification

### Test Critical Flows

- [ ] User signup works
- [ ] User login works
- [ ] Profile update saves
- [ ] Add expense works
- [ ] Delete expense works
- [ ] Dashboard loads
- [ ] Charts render
- [ ] Currency changes work
- [ ] AI advisor works (if configured)

### Check Security

- [ ] RLS prevents cross-user data access
- [ ] API calls go through service layer
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] CORS configured correctly

### Performance Check

- [ ] Page load < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No JavaScript errors
- [ ] Charts render smoothly

## Step 5: Monitoring Setup

### Add Sentry (Error Tracking)

```bash
npm install @sentry/react
```

### Configure Sentry

Add to Vercel environment variables:
```bash
VITE_SENTRY_DSN=your_sentry_dsn
```

### Add Vercel Analytics

```bash
npm install @vercel/analytics
```

## Step 6: Domain Configuration

### Custom Domain (Optional)

1. Go to Vercel dashboard
2. Project → Settings → Domains
3. Add your domain
4. Update DNS records as shown
5. Wait for SSL certificate (auto)

## Step 7: Continuous Deployment

### Auto-Deploy Setup

Already configured if using GitHub integration:
- Push to `main` → auto-deploy to production
- Pull requests → preview deployments
- Automatic SSL renewal

### Manual Deploy

```bash
git push origin main
# Vercel auto-deploys
```

## Troubleshooting

### Environment Variables Not Working

```bash
# Verify in Vercel dashboard
Project → Settings → Environment Variables

# Redeploy after changes
Deployments → Latest → Redeploy
```

### RLS Blocking Queries

```sql
-- Check policies are correct
SELECT * FROM pg_policies 
WHERE tablename IN ('profiles', 'expenses');

-- Disable temporarily to debug (NEVER in production)
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
```

### Build Fails

```bash
# Check locally first
npm run build

# Common issues:
- Missing dependencies
- Environment variables
- TypeScript errors
```

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Environment variables in hosting platform
- [ ] No secrets in code
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting enabled (Supabase)
- [ ] Error tracking configured
- [ ] Regular backups enabled

## Performance Checklist

- [ ] Database indexed
- [ ] Code splitting enabled
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN enabled (automatic with Vercel)

## Legal Checklist

- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Cookie consent (if EU users)
- [ ] Contact information

## Production URLs

```
Production: https://your-app.vercel.app
Preview: https://your-app-git-branch.vercel.app
```

## Rollback Procedure

If something goes wrong:

```bash
# Via Vercel dashboard
Deployments → Previous deployment → Promote to Production

# Or redeploy previous commit
git revert HEAD
git push origin main
```

## Success Criteria

Your app is production-ready when:
- ✅ All checklist items complete
- ✅ No errors in production
- ✅ Load time < 3s
- ✅ RLS working
- ✅ Monitoring active
- ✅ DNS configured
- ✅ SSL active

## Support

If issues arise:
1. Check Vercel logs
2. Check Supabase logs
3. Check browser console
4. Review deployment guide
5. Check Sentry errors

---

**Estimated deployment time**: 30-60 minutes (first time)
**Estimated deployment time**: 5-10 minutes (subsequent)
