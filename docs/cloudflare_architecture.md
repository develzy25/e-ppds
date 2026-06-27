# Cloudflare Architecture - PPDS ERP

## Overview
This document outlines the architecture for the PPDS ERP application when deployed natively on Cloudflare.

## Core Infrastructure
1. **Compute**: Cloudflare Workers via OpenNext. OpenNext adapts Next.js to run seamlessly on Workers edge environment.
2. **Database**: Cloudflare D1. A serverless SQL database natively supported by Workers.
3. **Storage (Static Assets/Files)**: Cloudflare R2 (S3-compatible storage). Used for user-uploaded documents and large media.
4. **Caching**: Cloudflare CDN & Workers KV/Cache API. Next.js App Router cache is adapted by OpenNext to use Cloudflare's caching layers.
5. **Background Jobs (Async)**: Cloudflare Queues for processing email delivery and heavy background tasks.
6. **Analytics**: Cloudflare Analytics Engine to track events directly from Workers.

## Deployment Flow
1. **GitHub Actions** builds the OpenNext project.
2. **Wrangler** deploys the generated output to Cloudflare Workers.
3. Next.js assets are served directly from `.open-next/assets` via Workers.

## Security Boundaries
- The application uses Cloudflare's Web Application Firewall (WAF) as the first line of defense.
- Edge Middleware implements strict security headers and rate-limiting to protect API routes.
- D1 queries are bound internally, no exposed external database endpoints.
