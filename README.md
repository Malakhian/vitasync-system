# VitaSync System

Monorepo containing desktop and mobile versions of VitaSync.

## Structure

- **Desktop App** (root directory)
  - Built with Vite + React
  - Deployed to: `https://vitasync-system.vercel.app`
  
- **Mobile App** (VitaSync-mobile/)
  - Built with Vite + React
  - Deployed to: `https://vitasync-mobile.vercel.app`

## Local Development

Build desktop version:
```bash
npm install
npm run build
npm run preview
```

Build mobile version:
```bash
cd VitaSync-mobile
npm install
npm run build
npm run preview
```

## Deployment

### Both to Vercel (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `vitasync-system` GitHub repo
3. Create first project for desktop (auto-detects root `vercel.json`)
   - URL: `vitasync-system.vercel.app`

4. Create second project for mobile:
   - Select same repo
   - Set **Root Directory** to `VitaSync-mobile/`
   - Set **Framework** to `Vite`
   - URL: `vitasync-mobile.vercel.app`

Both apps will auto-deploy on every push to `main`.

### Docker (Desktop only)

```bash
docker build -t vitasync-desktop .
docker run -p 8080:80 vitasync-desktop
```
