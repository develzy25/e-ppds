# Deployment Report

## Pre-requisites
1. A Cloudflare Account.
2. `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` added to GitHub repository secrets.
3. Provisioned D1 database (`wrangler d1 create e-ppds-db`) and updated `database_id` in `wrangler.jsonc`.

## Build Process
- The application uses OpenNext (`@opennextjs/cloudflare`) to adapt the Next.js build for Cloudflare Workers.
- The build script (`npm run build` or `npx @opennextjs/cloudflare`) generates the `.open-next` directory containing the Worker script and assets.

## CI/CD Pipeline
- Handled by GitHub Actions (`.github/workflows/deploy.yml`).
- Automatically triggers on push to the `main` branch.
- Steps include setting up Node 20, installing dependencies, type checking, and deploying using `cloudflare/wrangler-action@v3`.

## Manual Deployment
If you need to deploy manually from your local machine:
```bash
# 1. Build the OpenNext project
npx @opennextjs/cloudflare

# 2. Deploy using Wrangler
npx wrangler deploy
```

## Validation
After deployment, monitor the Cloudflare dashboard for:
- Worker CPU usage and memory footprint.
- D1 read/write query latency.
- Any unhandled exceptions via Cloudflare Analytics.
