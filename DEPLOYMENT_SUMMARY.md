# Deployment checklist

This repository supports a Vite frontend on Vercel and a Spring Boot API on
Render. Do not place credentials, access tokens, connection strings, or real
email addresses in this file, in source code, or in Git.

## Vercel frontend

- Set the Vercel project **Root Directory** to `frontend`.
- Vercel detects Vite and runs `npm run build`, publishing `dist`.
- Set `VITE_API_BASE` to the final Render HTTPS URL, without a trailing slash.
- Redeploy after changing `VITE_API_BASE`, because Vite reads it at build time.
- `frontend/vercel.json` provides SPA deep-link routing.

## Render API

- Create a Blueprint from the root `render.yaml`.
- Set every `sync: false` variable in the Render dashboard.
- Set `CORS_ALLOWED_ORIGINS` to the exact Vercel production origin. Add only
  deliberately supported preview origins.
- Set `MAIL_RESET_LINK_BASE` to the Vercel production origin.
- Verify MongoDB Atlas network access permits the Render service and that the
  target MongoDB deployment supports replica-set transactions.
- Confirm `https://<render-service>/api/health` returns HTTP 200 after deploy.

## Before committing

- Use `backend/.env.example` and `frontend/.env.example` as templates only.
- Keep local `.env` files and Vercel CLI-generated `.env.local` files ignored.
- Rotate any credential that was ever committed, pasted into documentation, or
  shared in an insecure location.
