# Flat Reality web prototype

Static Vite site for `flatreality.eu`, the Partners experience and the privacy/cookie layer.

## Local development

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Routes:

- `/` — Studio
- `/partners` — FR Partners
- `/privacy` — Privacy Policy and cookie settings

The app also renders the Partners page automatically when the hostname begins with `partners.`.

## Supabase

Copy `.env.example` to `.env` and add the project URL and public anonymous key. The shared client is exported from `src/lib/supabase.js`; when variables are absent it safely exports `null`.

## GitHub Pages

Pushes to `main` run `.github/workflows/deploy.yml`. The build generates `404.html` for client-side routes, `.nojekyll`, and the apex-domain `CNAME`. Configure Pages to use GitHub Actions and point the domain's DNS records at GitHub Pages.

`partners.flatreality.eu` needs its own Pages custom-domain binding (or a proxy/second Pages project) for a valid HTTPS certificate. The frontend hostname routing is already implemented.
