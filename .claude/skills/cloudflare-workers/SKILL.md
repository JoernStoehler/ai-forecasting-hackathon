# Cloudflare Workers Deployment

Quick reference for deploying Cloudflare Workers in this project.

## Project Structure

- Worker code: `packages/share-worker/`
- Config: `packages/share-worker/wrangler.toml`
- Uses wrangler v4 (NOT v3)

## Key Commands

```bash
# Login to Cloudflare (interactive, opens browser)
npm run worker:login

# Local development
npm run worker:dev

# Deploy to production
npm run worker:deploy
```

## First-Time Setup

1. **Login**: `npm run worker:login` - opens browser for OAuth
2. **Register workers.dev subdomain**: Visit https://dash.cloudflare.com/?to=/:account/workers-and-pages and click "Change" next to "Your subdomain"
3. **Create KV namespace** (if needed):
   ```bash
   npx wrangler kv namespace create NAMESPACE_NAME
   npx wrangler kv namespace create NAMESPACE_NAME --preview
   ```
4. **Update wrangler.toml** with the returned KV IDs
5. **Deploy**: `npm run worker:deploy`

## Official Documentation

Essential pages (always check these for current info):

- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **Wrangler Commands**: https://developers.cloudflare.com/workers/wrangler/commands/
- **Configuration (wrangler.toml)**: https://developers.cloudflare.com/workers/wrangler/configuration/
- **workers.dev Routing**: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- **KV Storage**: https://developers.cloudflare.com/kv/
- **Environment Variables**: https://developers.cloudflare.com/workers/configuration/environment-variables/

## Common Issues

### "You need to register a workers.dev subdomain"
Visit https://dash.cloudflare.com/?to=/:account/workers-and-pages and register your subdomain first.

### KV namespace not found
Create namespaces with `npx wrangler kv namespace create` and update wrangler.toml with the IDs.

### CORS errors
Update `ALLOWED_ORIGINS` in wrangler.toml `[vars]` section to include your production domain.

## Updating CORS for Production

Edit `packages/share-worker/wrangler.toml`:
```toml
[vars]
ALLOWED_ORIGINS = "https://your-production-domain.com,http://localhost:3000"
```

Then redeploy: `npm run worker:deploy`
